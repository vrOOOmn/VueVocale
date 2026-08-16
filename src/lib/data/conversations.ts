import { createClient } from "../supabase/client";

export type Message = {
  id: string;
  text?: string;
  image?: string;
  sender: "user" | "bot";
  audioUrl?: string;
  audioState?: "ready" | "error" | "idle" | "loading";
  grammarFix?: string;
  grammarStatus?: "idle" | "loading" | "ok" | "fixed" | "error";
};

export type ArchivedConversation = {
  id: string;
  conversationDate: string;
  summary: string | null;
  topics: string[] | null;
  messageCount: number;
  grammarCorrectionCount: number;
};

type MessageRow = {
  id: string;
  sender: "user" | "bot";
  text: string | null;
  image_path: string | null;
  audio_path: string | null;
  grammar_status: "idle" | "ok" | "fixed" | "error";
  grammar_fix: string | null;
};

const SIGNED_URL_TTL_SECONDS = 3600;

export async function ensureActiveConversation(localDate: string) {
  const res = await fetch("/api/conversations/ensure-active", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ localDate }),
  });

  if (!res.ok) {
    throw new Error("Failed to start today's conversation");
  }

  return (await res.json()) as { id: string; conversationDate: string };
}

async function resolveSignedUrls(
  bucket: string,
  paths: string[],
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    console.error(`Failed to sign URLs for bucket ${bucket}`, error);
    return {};
  }

  const map: Record<string, string> = {};
  data.forEach((entry, i) => {
    if (entry.signedUrl) map[paths[i]] = entry.signedUrl;
  });
  return map;
}

function mapRow(
  row: MessageRow,
  imageUrls: Record<string, string>,
  audioUrls: Record<string, string>,
  rawImagePath: string | null,
  rawAudioPath: string | null,
): Message {
  const audioUrl = rawAudioPath ? audioUrls[rawAudioPath] : undefined;
  return {
    id: row.id,
    text: row.text ?? undefined,
    image: rawImagePath ? imageUrls[rawImagePath] : undefined,
    sender: row.sender,
    audioUrl,
    audioState: audioUrl ? "ready" : "idle",
    grammarFix: row.grammar_fix ?? undefined,
    grammarStatus: row.grammar_status,
  };
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender, text, image_path, audio_path, grammar_status, grammar_fix")
    .eq("conversation_id", conversationId)
    .order("seq", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as (MessageRow & { image_path: string | null; audio_path: string | null })[];

  const imagePaths = [...new Set(rows.map((r) => r.image_path).filter((p): p is string => !!p))];
  const audioPaths = [...new Set(rows.map((r) => r.audio_path).filter((p): p is string => !!p))];

  const [imageUrls, audioUrls] = await Promise.all([
    resolveSignedUrls("scan-photos", imagePaths),
    resolveSignedUrls("chat-audio", audioPaths),
  ]);

  return rows.map((row) => mapRow(row, imageUrls, audioUrls, row.image_path, row.audio_path));
}

export async function insertMessage(row: {
  conversation_id: string;
  user_id: string;
  sender: "user" | "bot";
  text?: string | null;
  image_path?: string | null;
  object_label?: string | null;
}): Promise<Message> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert(row)
    .select("id, sender, text, image_path, audio_path, grammar_status, grammar_fix")
    .single();

  if (error || !data) throw error ?? new Error("Insert returned no row");

  const imagePath = data.image_path as string | null;
  const imageUrls = imagePath ? await resolveSignedUrls("scan-photos", [imagePath]) : {};

  return mapRow(data as MessageRow, imageUrls, {}, imagePath, null);
}

export async function clearConversationMessages(conversationId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("messages").delete().eq("conversation_id", conversationId);
  if (error) throw error;
}

export async function updateMessage(
  id: string,
  patch: Partial<{
    grammar_status: "idle" | "ok" | "fixed" | "error";
    grammar_fix: string | null;
    audio_path: string;
  }>,
) {
  const supabase = createClient();
  const { error } = await supabase.from("messages").update(patch).eq("id", id);
  if (error) throw error;
}

export async function uploadChatAudio(userId: string, messageId: string, blob: Blob) {
  const supabase = createClient();
  const path = `${userId}/${messageId}.mp3`;
  const { error } = await supabase.storage
    .from("chat-audio")
    .upload(path, blob, { contentType: "audio/mpeg", upsert: true });

  if (error) throw error;
  return path;
}

export async function fetchArchivedConversations(): Promise<ArchivedConversation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, conversation_date, summary, topics, message_count, grammar_correction_count")
    .eq("status", "archived")
    .order("conversation_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    conversationDate: row.conversation_date,
    summary: row.summary,
    topics: row.topics,
    messageCount: row.message_count,
    grammarCorrectionCount: row.grammar_correction_count,
  }));
}

// Distinct local dates the user actually sent/received at least one message
// on — the basis for streak calculation. has_activity is set once (by a DB
// trigger on the first message insert) and never cleared by later deleting
// messages, so clearing today's chat doesn't make today stop counting.
export async function fetchActiveDates(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("conversation_date")
    .eq("has_activity", true)
    .order("conversation_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => row.conversation_date);
}
