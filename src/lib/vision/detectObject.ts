// lib/visionScanner.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // or process.env if server-side
  dangerouslyAllowBrowser: true, // only if you accept browser-side calls (not ideal)
});

type ScanResult = {
  english: string;
  french: string;
};

export async function detectAndTranslateFR(base64Jpeg: string): Promise<ScanResult> {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["english", "french"],
    properties: {
      english: {
        type: "string",
        description: "An English noun, lowercase, no article. Example: 'bicycle'.",
        pattern: "^[a-z][a-z\\- ]*$",
      },
      french: {
        type: "string",
        description:
          "French word for the object (no article, no notes/expalations, no formatting lowercase). May include accents or hyphens. Example: 'vélo'.",
        pattern: "^[a-zà-ÿ][a-zà-ÿ\\-]*$",
      },
    },
  } as const;

  const resp = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              "Identify the main object in the image in English and translate it into French.\n" +
              "Follow the output schema exactly.\n"
          },
          {
            type: "input_image",
            image_url: `data:image/jpeg;base64,${base64Jpeg}`,
            detail: "low", // cheaper + faster; bump to "high" if you need finer recognition :contentReference[oaicite:3]{index=3}
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "scan_result",
        strict: true,
        schema,
      },
    },
  });

  // responses.create returns JSON as text; parse it
  const raw = resp.output_text?.trim();
  if (!raw) throw new Error("No output_text from model");

  const parsed = JSON.parse(raw) as ScanResult;

  // Small sanity cleanup (keeps UI safe even if patterns loosen later)
  parsed.english = parsed.english.trim().toLowerCase();
  parsed.french = parsed.french.trim().toLowerCase();

  return parsed;
}
