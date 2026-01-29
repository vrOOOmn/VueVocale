import OpenAI from "openai";
import { getAuthContext } from "../_lib/auth";
import { getClientId, rateLimit } from "../_lib/rateLimit";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (auth.role !== "admin") {
    const clientId = getClientId(request);
    const limit = rateLimit(`tts:${clientId}`, 20, 60_000);
    if (!limit.ok) {
      return new Response("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(limit.resetMs / 1000).toString(),
        },
      });
    }
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
}
