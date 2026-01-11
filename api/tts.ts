import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TTS_STYLE = `
Speak like warm, curious, and enthusiastic French friend chatting casually during everday conversations.

Delivery:
Keep a smooth, moderate pace with natural French intonation. Don't be istructional or over-dramatic

Pronunciation:
Casual metropolitan French, like everyday speech.

Consistency:
Maintain this same speaking style across all messages.
`.trim();

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { text } = await request.json();

      const response = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "marin",
        input: text,
        instructions: TTS_STYLE,
        response_format: "mp3",
      });

      const arrayBuffer = await response.arrayBuffer();

      return new Response(arrayBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
        },
      });
    } catch (err) {
      console.error(err);
      return new Response("TTS failed", { status: 500 });
    }
  },
};
