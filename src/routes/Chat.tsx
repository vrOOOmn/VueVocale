import React, { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { colors, spacing, borderRadius, typography } from "../theme";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Message = { text: string; sender: "user" | "bot" };

const ERROR_TEXT = "Oops, error in generating response! Try Again";
const genAI = new GoogleGenerativeAI(import.meta.env.local.VITE_GEMINI_API_KEY as string);

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const prompt = `
        You are a friendly, patient French friend for intermediate learners (B1). Your goal is to help them gain confidence speaking and understanding real‐life French, without sounding like a formal “coach.”

        You should:

        1. Chat naturally about everyday topics (travel, food, work, hobbies, culture). Don't stay on the same topic for too long. Generally, only talk about the same topic for a maximum of three responses.
        2. Use intermediate-level (B1) French.
        3. Gently correct mistakes only if they would severly impede comprehensibility with a native French, with a brief note on how to sound more natural or idiomatic.
        4. Share cultural tips (idioms, phrasing, register, customs) only when relevant and when the user is attempting to learn a new topic they aren't too knowledgable about.
        5. Keep each response to no more than three sentences so you don’t overwhelm them.
        6. Don't ask more than one question at a time.
        7. Never start with anything similar to "Prêt(e) à papoter un peu en français?". Get right into the conversation
        8. Listen to the user and generally keep the conversation flowing. Only talk about yourself when the user asks you a question about yourself
        ${userMessage}
      `;
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text()?.trimEnd() || ERROR_TEXT;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return ERROR_TEXT;
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setMessages((prev) => [...prev, { text, sender: "user" }]);
    setInput("");

    const aiResponse = await generateAIResponse(text);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: aiResponse ?? ERROR_TEXT, sender: "bot" },
      ]);
      setLoading(false);
      textRef.current?.focus();
    }, 500);
  };

  return (
    <main style={styles.container}>
      <div style={styles.messages} aria-live="polite">
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              ...(m.sender === "user" ? styles.userMessage : styles.botMessage),
            }}
          >
            <p
              style={{
                ...typography.message,
                margin: 0,
                color: m.sender === "user" ? colors.textLight : colors.text,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        style={styles.inputContainer}
      >
        <textarea
          ref={textRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a message…"
          rows={1}
          style={styles.textInput}
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            ...styles.sendButton,
            opacity: !input.trim() || loading ? 0.5 : 1,
          }}
          aria-label="Send"
          title="Send"
        >
          <IoSend size={24} color={input.trim() ? colors.primary : colors.border} />
        </button>
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "calc(100svh - 73px)",
    background: colors.background,
    display: "grid",
    gridTemplateRows: "1fr auto",
  },
  messages: {
    padding: spacing.md,
    overflowY: "auto",
    display: "grid",
    gap: spacing.xs,
  },
  message: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    maxWidth: "75%",
  },
  userMessage: {
    background: "#4A90E2",
    alignSelf: "end",
    justifySelf: "end",
  },
  botMessage: {
    background: "#ECF0F1",
    alignSelf: "start",
    justifySelf: "start",
  },
  inputContainer: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "end",
    gap: spacing.sm,
    padding: spacing.sm,
    background: colors.surface,
    borderTop: `1px solid ${colors.border}`,
  },
  textInput: {
    resize: "none",
    minHeight: 40,
    maxHeight: 100,
    padding: `${spacing.sm}px ${spacing.md}px`,
    background: colors.background,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    ...typography.body,
    outline: "none",
  },
  sendButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.round,
    justifySelf: "end",
    alignSelf: "end",
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    cursor: "pointer",
  },
};
