import { RateLimitError } from "openai";

export const RATE_LIMIT_MESSAGE = "OpenAI is receiving too many requests right now. Please try again in a moment.";

function isErrorWithStatus(value: unknown): value is { status?: number | string } {
  if (!value || typeof value !== "object") return false;
  return "status" in value;
}

export function openaiRateLimitResponse(error: unknown): Response | null {
  if (error instanceof RateLimitError) {
    return Response.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  if (isErrorWithStatus(error) && (error.status === 429 || error.status === "429")) {
    return Response.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  return null;
}
