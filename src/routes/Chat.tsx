import React, { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { colors, spacing, borderRadius, typography } from "../theme";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Message = { text: string; sender: "user" | "bot" };

const ERROR_TEXT = "Oops, error in generating response! Try Again";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  // --- Persist chat messages across tab switches ---
  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);
  // -------------------------------------------------

  useEffect(() => {
  if (endRef.current) {
    endRef.current.scrollIntoView({ behavior: "auto" });
  }
  }, []); // scroll to bottom on initial mount

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // scroll smoothly when messages update

  useEffect(() => textRef.current?.focus(), []);

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
        1. Chat naturally about everyday topics.
        2. Use intermediate-level (B1) French.
        3. Gently correct mistakes only if they impede comprehension.
        4. Keep responses under three sentences.
        5. Never start with “Prêt(e) à papoter un peu en français?”
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
          <IoSend size={24} color={"#fff"} />
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
    paddingBottom: 80,
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
    background: "linear-gradient(135deg, #4A90E2, #357ABD)",
    color: "white",
    alignSelf: "end",
    justifySelf: "end",
    padding: "10px 14px",
    borderRadius: "18px 18px 4px 18px",
    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
  },
  botMessage: {
    background: "#fff",
    border: "1px solid #e6e6e6",
    alignSelf: "start",
    justifySelf: "start",
    padding: "10px 14px",
    borderRadius: "18px 18px 18px 4px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },

  inputContainer: {
    position: "fixed",
    bottom: 84, // sits *above* nav bar height (around 64px + margin)
    left: "50%",
    transform: "translateX(-50%)",
    width: "clamp(280px, 90%, 720px)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px 8px 16px",
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: 28,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    zIndex: 100,
  },


  textInput: {
    flex: 1,
    resize: "none",
    minHeight: 36,
    maxHeight: 120,
    padding: "8px 14px",
    borderRadius: 20,
    border: "none",
    background: "transparent",
    fontSize: 15,
    lineHeight: 1.4,
    outline: "none",
    color: colors.text,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: colors.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.15s ease, background 0.2s ease",
  },


};
