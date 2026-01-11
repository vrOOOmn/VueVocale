import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
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
  },
};
