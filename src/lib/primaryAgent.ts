import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // local testing only
});

const BASE_AGENT_MESSAGE = (hasImage: boolean) => ({
  role: "developer" as const,
  content: `
    Keep it light, natural, and curious — talk about everyday things like food, travel, or hobbies.  
    Use only French. 
    Correct serious mistakes gently with quick tips.  
    Never say "Prêt(e) à papoter un peu en français ?"
    Keep replies under three sentences and ask only one question at a time.  
    Keep the conversation flowing naturally and casually and refrain from talking too much about yourself
    ${hasImage? "If the chat includes images, be curious and ask about them." : ""}

  `.trim(),
});

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
      BASE_AGENT_MESSAGE(hasImage),
      ...history,
      { role: "user", content: userMessage },
    ],
    store: false,
  });

  return response.output_text?.trim() || "";
}
