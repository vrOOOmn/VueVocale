import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GRAMMAR_FIX_INSTRUCTION = {
  role: "developer" as const,
  content: `
You are a French grammar validator for a French learner.

The input is SPOKEN French that has been transcribed to text.

You must decide ONE thing only:
Does the input contain any real linguistic error?

Definition of a linguistic error:
- grammar errors
- incorrect verb conjugation
- incorrect agreement
- incorrect word choice
- non-idiomatic phrasing

The following are NOT linguistic errors:
- punctuation
- capitalization
- tone
- formality
- sentence fragments that are internally grammatical

Decision rule:
- If there are ZERO real linguistic errors → the input is valid.
- If there is AT LEAST ONE real linguistic error → the input is invalid.

Output rules:
- If the input is valid, return exactly: OK
- If the input is invalid, return fully corrected text.

Strict constraints:
- Do NOT add explanations.
- Do NOT edit punctuation.
- NEVER return the original input.
- Return only ONE of the two allowed outputs.
  `.trim(),
};

function normalizeForGrammarCheck(text: string): string {
  return text
    // capitalize first letter
    .replace(/^\s*[a-zà-ÿ]/, c => c.toUpperCase())
    // capitalize letter after . ? !
    .replace(/([.!?]\s*)([a-zà-ÿ])/g, (_, sep, char) => sep + char.toUpperCase());
}

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { text } = await request.json();

      const response = await openai.responses.create({
        model: "gpt-4.1-nano",
        input: [
          GRAMMAR_FIX_INSTRUCTION,
          { role: "user", content: normalizeForGrammarCheck(text)},
        ],
        store: false,
      });

      const out = response.output_text?.trim() || "";

      return Response.json({
        result: out === "OK" ? "OK" : out,
      });
    } catch (err) {
      console.error(err);
      return new Response("Server error", { status: 500 });
    }
  },
};

