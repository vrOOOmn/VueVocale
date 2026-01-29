import { getAuthHeaders } from "./supabaseSession";

export async function generateTextResponse(params: {
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  hasImage: boolean;
}) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Chat request failed");
  }

  const data = await res.json();

  if (typeof data?.text !== "string") {
    throw new Error("Invalid chat response");
  }

  return data.text;
}


export async function fixGrammar(text: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch("/api/grammar", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Grammar request failed");
  }

  const data = await res.json();

  if (typeof data?.result !== "string") {
    throw new Error("Invalid grammar response");
  }

  return data.result as string | "OK";
}
