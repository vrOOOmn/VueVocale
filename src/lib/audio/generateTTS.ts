// src/lib/audio/generateTTS.ts
import { supabase } from "../supabaseClient";
import { getAuthHeaders } from "../supabaseSession";

const SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function generateTTS(
  text: string,
  userId: string | null,
  messageId: string
): Promise<{ url: string; path: string | null }> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("TTS request failed");
  }

  const blob = await res.blob();
  if (!userId) {
    return { url: URL.createObjectURL(blob), path: null };
  }

  const path = `${userId}/${messageId}.mp3`;
  const { error } = await supabase.storage
    .from("chat-audio")
    .upload(path, blob, { contentType: "audio/mpeg", upsert: true });

  if (error) {
    return { url: URL.createObjectURL(blob), path: null };
  }

  const { data } = await supabase.storage
    .from("chat-audio")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  return { url: data?.signedUrl || URL.createObjectURL(blob), path };
}
