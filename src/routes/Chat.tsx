import React, {useLayoutEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { colors, spacing, borderRadius, typography } from "../theme";
import { supabase } from "../lib/supabaseClient";
import { geminiFlash } from "../lib/geminiClient";

type Message = { text: string; sender: "user" | "bot" };

const ERROR_TEXT = "Oops, error in generating response! Try Again";

let sessionMessages: Message[] = [];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(sessionMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);


  // --- Scroll logic ---
  const scrollToBottom = (smooth = false) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({
      top: list.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useLayoutEffect(() => {
    scrollToBottom(false); // on mount
  }, []);

  useLayoutEffect(() => {
    scrollToBottom(true); // on new message
  }, [messages.length]);

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
      const result = await geminiFlash.generateContent(prompt);
      return result.response.text()?.trimEnd() || ERROR_TEXT;
    } catch {
      return ERROR_TEXT;
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    // update local + session cache
    const userMsg = { text, sender: "user" as const };
    setMessages((prev) => [...prev, userMsg]);
    sessionMessages = [...messages, userMsg];

    setInput("");
    setLoading(true);

    try {
      // your AI call
      const aiResponse = await generateAIResponse(text);

      const botMsg = { text: aiResponse, sender: "bot" as const };
      setMessages((prev) => [...prev, botMsg]);
      sessionMessages = [...sessionMessages, botMsg];

      // log both in Supabase
      await supabase.from("chat_messages").insert([
        userMsg,
        botMsg,
      ]);
    } catch (err) {
      console.error("send error", err);
    } finally {
      setLoading(false);
    }
    textRef.current?.focus();
  };

  return (
    <main style={styles.container}>
      <div ref={listRef} style={styles.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              ...(m.sender === "user"
                ? styles.userMessage
                : styles.botMessage),
            }}
          >
            <p
              style={{
                ...typography.message,
                margin: 0,
                color:
                  m.sender === "user" ? colors.textLight : colors.text,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </p>
          </div>
        ))}
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
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            ...styles.sendButton,
            opacity: !input.trim() || loading ? 0.6 : 1,
          }}
        >
          <IoSend size={22} color="#fff" />
        </button>
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    overflow: "hidden", // no page scroll
    background: colors.background,
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: spacing.md,
    paddingBottom: 160,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    scrollBehavior: "smooth",
  },
  message: {
    padding: "10px 14px",
    borderRadius: borderRadius.lg,
    maxWidth: "75%",
  },
  userMessage: {
    background: "linear-gradient(135deg, #4A90E2, #357ABD)",
    color: "white",
    alignSelf: "flex-end",
    borderRadius: "18px 18px 4px 18px",
  },
  botMessage: {
    background: "#fff",
    alignSelf: "flex-start",
    borderRadius: "18px 18px 18px 4px",
  },
  inputContainer: {
    position: "fixed",
    bottom: 84,
    left: "50%",
    transform: "translateX(-50%)",
    width: "clamp(280px, 90%, 720px)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px 8px 16px",
    background: "rgba(255,255,255,0.85)",
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
    fontFamily: typography.message.fontFamily,
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
  },
};
