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
  `.trim(),
};

const IMAGE_INSTRUCTION = {
  role: "developer" as const,
  content: `If the chat includes images, be curious and ask about them.`,
};

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { history, userMessage, hasImage } = await request.json();

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

      return Response.json({
        text: response.output_text?.trim() || "",
      });
    } catch (err) {
      console.error(err);
      return new Response("Server error", { status: 500 });
    }
  },
};
