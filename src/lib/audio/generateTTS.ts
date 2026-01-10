// src/lib/audio/generateTTS.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const TTS_STYLE = `
Language: French.

Overall Style:
Casual everyday conversation, not a lesson or explanation.

Accent/Affect:
Neutral metropolitan French. Warm, relaxed, and natural, like a close friend chatting casually.

Tone:
Friendly and easygoing. Never instructional, dramatic, or exaggerated.

Pacing:
Moderate and consistent. Speak smoothly without rushing or slowing based on content.

Emotion:
Softly positive and calm. Avoid excitement, surprise, or strong emotional reactions.

Intonation:
Natural conversational intonation.
Statements end gently.
Questions have a light, subtle rise.

Pronunciation:
Clear but casual. Natural liaison, no over-articulation.

Personality Affect:
Approachable, relaxed, and supportive, like a French friend chatting one-on-one.
Maintain the same speaking style across all messages.
`.trim();


export async function generateTTS(text: string): Promise<string> {
  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "marin",
    input: text,
    instructions: TTS_STYLE,
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
