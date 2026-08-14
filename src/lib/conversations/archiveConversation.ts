import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type SummaryResult = {
  summary: string;
  topics: string[];
};

const SUMMARY_INSTRUCTION =
  "You summarize a day of French-practice conversation for a language learner's " +
  "personal archive. Given a transcript of exchanges (and any scanned objects, " +
  "marked [Photo: ...]), write ONE or TWO short sentences in English describing " +
  "what was practiced/discussed. Then list 2-5 short topic/object tags. Do not " +
  "mention grammar corrections (those are tracked separately). Be concrete (name " +
  "real topics/objects), not generic.";

export async function archiveConversation(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("sender, text, object_label, grammar_status")
    .eq("conversation_id", conversationId)
    .order("seq", { ascending: true });

  if (messagesError) throw messagesError;

  const rows = messages ?? [];
  const grammarCorrectionCount = rows.filter((m) => m.grammar_status === "fixed").length;
  const messageCount = rows.length;

  const transcript = rows
    .map((m) => {
      if (m.object_label) return `user: [Photo: ${m.object_label}]`;
      return `${m.sender}: ${m.text ?? ""}`;
    })
    .join("\n");

  let summary = "A day of French practice.";
  let topics: string[] = [];

  if (transcript.trim()) {
    try {
      const schema = {
        type: "object",
        additionalProperties: false,
        required: ["summary", "topics"],
        properties: {
          summary: {
            type: "string",
            description: "1-2 short sentences, English, <=200 characters.",
          },
          topics: {
            type: "array",
            description: "2-5 short topic/object tags.",
            items: { type: "string" },
          },
        },
      } as const;

      const resp = await openai.responses.create({
        model: "gpt-4.1-nano",
        input: [
          { role: "developer", content: SUMMARY_INSTRUCTION },
          { role: "user", content: transcript },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "day_summary",
            strict: true,
            schema,
          },
        },
        store: false,
      });

      const raw = resp.output_text?.trim();
      if (raw) {
        const parsed = JSON.parse(raw) as SummaryResult;
        if (parsed.summary) summary = parsed.summary;
        if (Array.isArray(parsed.topics)) topics = parsed.topics;
      }
    } catch (err) {
      console.error("Conversation summary generation failed", err);
    }
  }

  const { error: updateError } = await supabase
    .from("conversations")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      summary,
      topics,
      grammar_correction_count: grammarCorrectionCount,
      message_count: messageCount,
    })
    .eq("id", conversationId);

  if (updateError) throw updateError;
}
