// src/lib/audio/transcribeSTT.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // fine for local testing
});

export async function transcribeSTT(blob: Blob): Promise<string> {
  const file = new File([blob], "speech.webm", {
    type: blob.type || "audio/webm",
  });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
    language: "fr",
    prompt:
      "Transcris exactement ce qui est dit en français. N’ajoute rien.",
  });

  return transcription.text?.trim() || "";
}
