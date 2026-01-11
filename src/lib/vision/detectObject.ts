// src/lib/vision/detectObject.ts

export type ScanResult = {
  english: string;
  french: string;
};

export async function detectAndTranslateFR(
  base64Jpeg: string
): Promise<ScanResult> {
  const res = await fetch("/api/vision", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64Jpeg }),
  });

  if (!res.ok) {
    throw new Error("Vision request failed");
  }

  const data = (await res.json()) as ScanResult;

  // Defensive check in case the server ever changes
  if (
    typeof data?.english !== "string" ||
    typeof data?.french !== "string"
  ) {
    throw new Error("Invalid vision response");
  }

  // Server already normalizes, but keep UI safe if this ever shifts
  return {
    english: data.english.trim().toLowerCase(),
    french: data.french.trim().toLowerCase(),
  };
}
