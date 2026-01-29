// src/lib/audio/transcribeSTT.ts
import { getAuthHeaders } from "../supabaseSession";

export async function transcribeSTT(blob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append("audio", blob);

  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/stt", {
    method: "POST",
    headers: { ...authHeaders },
    body: fd,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Speech-to-text request failed");
  }

  const data = await res.json();

  if (typeof data?.text !== "string") {
    throw new Error("Invalid STT response");
  }

  return data.text;
}
