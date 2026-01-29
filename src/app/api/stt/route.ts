import OpenAI from "openai";
import { getAuthContext } from "../_lib/auth";
import { getClientId, rateLimit } from "../_lib/rateLimit";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (auth.role !== "admin") {
    const clientId = getClientId(request);
    const limit = rateLimit(`stt:${clientId}`, 12, 60_000);
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
    const formData = await request.formData();
    const blob = formData.get("audio") as Blob | null;

    if (!blob) {
      return new Response("Missing audio", { status: 400 });
    }

    const file = new File([blob], "speech.webm", {
      type: blob.type || "audio/webm",
    });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe",
      language: "fr",
      prompt: "Transcris exactement ce qui est dit en français. N’ajoute rien.",
    });

    return Response.json({
      text: transcription.text?.trim() || "",
    });
  } catch (err) {
    console.error(err);
    return new Response("STT failed", { status: 500 });
  }
}
