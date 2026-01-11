import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ScanResult = {
  english: string;
  french: string;
};

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { base64Jpeg } = await request.json();

      const schema = {
        type: "object",
        additionalProperties: false,
        required: ["english", "french"],
        properties: {
          english: {
            type: "string",
            description:
              "An English noun, lowercase, no article. Example: 'bicycle'.",
            pattern: "^[a-z][a-z\\- ]*$",
          },
          french: {
            type: "string",
            description:
              "French word for the object (no article, no notes/explanations, lowercase). Example: 'vélo'.",
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
                  "Follow the output schema exactly.\n",
              },
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${base64Jpeg}`,
                detail: "low",
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
        store: false,
      });

      const raw = resp.output_text?.trim();
      if (!raw) throw new Error("No output_text from model");

      const parsed = JSON.parse(raw) as ScanResult;

      // Small sanity cleanup (keeps UI safe even if patterns loosen later)
      parsed.english = (parsed.english ?? "").trim().toLowerCase();
      parsed.french = (parsed.french ?? "").trim().toLowerCase();

      if (!parsed.english || !parsed.french) {
        throw new Error("Invalid parsed output");
      }

      return Response.json(parsed);
    } catch (err) {
      console.error(err);
      return new Response("Vision failed", { status: 500 });
    }
  },
};
