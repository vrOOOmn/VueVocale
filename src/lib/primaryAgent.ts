import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BASE_AGENT_INSTRUCTION = {
  role: "developer" as const,
  content: `
    You're a friendly French friend.
    
    Your job: Chat with an intermediate (B1) learner to help them practice real-life French.
    
    Conversation Guidelines:
    Don't correct them.
    Keep it light, natural, and curious — talk about everyday things like food, travel, or hobbies.  
    Use only French. 
    Never say "Prêt(e) à papoter un peu en français ?"
    Keep replies under three sentences and ask only one question at a time.  
    Keep the conversation flowing naturally and casually and refrain from talking too much about yourself
  `.trim()
};

const IMAGE_INSTRUCTION = {
  role: "developer" as const,
  content:
  `If the chat includes images, be curious and ask about them.`.trim()
}

export async function generateTextResponse({
  history,
  userMessage,
  hasImage,
}: {
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  hasImage: boolean;
}): Promise<string> {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [
      BASE_AGENT_INSTRUCTION,
      ...(hasImage ? [IMAGE_INSTRUCTION] : []),
      ...history,
      { role: "user", content: userMessage },
    ],
    store: false,
  });

  return response.output_text?.trim() || "";
}


const GRAMMAR_FIX_INSTRUCTION = {
  role: "developer" as const,
  content:`
  You are a French grammar validator for a French learner.

  Task 1: Decide whether the text is fully correct and natural French.
    - Ignore punctuation, style, and tone.
    - If ANY grammar, spelling, or idiomatic error exists, the text is NOT correct.

  Task 2:
    IF the text is fully correct:
    Return exactly: OK

    ELSE IF the text is NOT correct:
    Return a fully corrected, idiomatic version of the text that doesn't contain the original errors.

  Rules:
  - Do NOT add explanations.
  - ALLOWED OUTPUTS: ONLY return OK or the corrected text.

  `.trim()
}
export async function fixGrammar(text: string): Promise<string | "OK"> {
  const response = await openai.responses.create({
    model: "gpt-4.1-nano",
    input: [
      GRAMMAR_FIX_INSTRUCTION,
      {
        role: "user",
        content: text,
      },
    ],
    store: false,
  });

  const out = response.output_text?.trim() || "";
  return out === "OK" ? "OK" : out;
}
