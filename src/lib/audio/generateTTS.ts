// src/lib/audio/generateTTS.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateTTS(text: string): Promise<string> {
  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "marin",
    input: text,
    instructions:
      "Speak naturally, friendly, and conversationally, like a helpful French friend.",
    response_format: "mp3",
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("TTS error:", err);
    throw new Error("TTS failed");
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}
