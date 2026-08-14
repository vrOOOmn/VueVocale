// src/lib/audio/generateTTS.ts
export async function generateTTS(text: string): Promise<{ url: string; blob: Blob }> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("TTS request failed");
  }

  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), blob };
}
