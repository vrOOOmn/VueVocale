import React, { useLayoutEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { colors, spacing, borderRadius, typography } from "../theme";
import { supabase } from "../lib/supabaseClient";
import { geminiFlash } from "../lib/geminiClient";

type Message = { text?: string; image?: string; sender: "user" | "bot" };

const ERROR_TEXT = "Oops, error in generating response! Try Again";
let sessionMessages: Message[] = [];

export default function Chat({
  topic,
  photoDataUrl,
}: {
  topic?: string | null;
  photoDataUrl?: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>(sessionMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const lastPhotoRef = useRef<string | null>(null); // <-- new guard

  // --- Scroll to bottom ---
  const scrollToBottom = (smooth = false) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  useLayoutEffect(() => scrollToBottom(false), []);
  useLayoutEffect(() => scrollToBottom(true), [messages.length]);
  
  useLayoutEffect(() => {
    const handleNewPhoto = async () => {
      if (!photoDataUrl || !topic) return;
      if (lastPhotoRef.current === photoDataUrl) return; // prevents re-runs
      lastPhotoRef.current = photoDataUrl; // remember this photo

      const newMsg = { image: photoDataUrl, sender: "user" as const };
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      sessionMessages = updatedMessages;

      const prompt = `
        You're chatting as a friendly French friend with an intermediate (B1) learner.  
        They just sent you a photo of a ${topic}.  
        React naturally in French — show curiosity or interest, no greetings.  
        Keep it under three sentences, and ask only one simple question if it fits.  
        Stay in the flow of conversation and only talk about yourself if asked.  
      `;

      try {
        setLoading(true);
        const result = await geminiFlash.generateContent([{ text: prompt }]);
        const text = result.response.text()?.trim() || "";
        if (text) {
          const botMsg = { text, sender: "bot" as const };
          const newThread = [...updatedMessages, botMsg];
          setMessages(newThread);
          sessionMessages = newThread;
        }
      } catch (err) {
        console.error("Gemini image response error:", err);
      } finally {
        setLoading(false);
      }
    };

    handleNewPhoto();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDataUrl, topic]); // messages removed safely

  // --- Handle Enter key ---
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // --- Generate Gemini response ---
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const hasImage = messages.some(m => m.image);
      const prompt = `
        You're chatting as a friendly French friend helping an intermediate (B1) learner practice real-life French.  
        Keep it light, natural, and curious — talk about everyday things like food, travel, or hobbies.  
        Use only French. Correct serious mistakes gently with quick tips.  
        Never say "Prêt(e) à papoter un peu en français ?"
        Keep replies under three sentences and ask just one question at a time.  
        Keep the conversation flowing naturally and casually and refrain from talking too much about yourself

        ${hasImage ? "If the chat included images, refer casually to them when relevant." : ""}
        ${userMessage}
      `;
      const result = await geminiFlash.generateContent(prompt);
      return result.response.text()?.trimEnd() || ERROR_TEXT;
    } catch {
      return ERROR_TEXT;
    }
  };

  // --- Sending user messages ---
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { text, sender: "user" as const };
    const updated = [...messages, userMsg];
    setMessages(updated);
    sessionMessages = updated;

    setInput("");
    setLoading(true);

    try {
      const aiResponse = await generateAIResponse(text);
      const botMsg = { text: aiResponse, sender: "bot" as const };
      const newThread = [...updated, botMsg];
      setMessages(newThread);
      sessionMessages = newThread;

      await supabase.from("chat_messages").insert([userMsg, botMsg]);
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
              display: "flex",
              justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
              width: "100%",
            }}
          >
            <div
              style={{
                ...styles.message,
                ...(m.sender === "user" ? styles.userMessage : styles.botMessage),
                padding: m.image ? 0 : "10px 14px", // no padding for image messages
                background: m.image
                  ? "transparent" // 👈 remove blue fill for image bubble
                  : m.sender === "user"
                  ? colors.primary
                  : "#fff",
                borderRadius: borderRadius.lg,
                maxWidth: m.image ? "min(280px, 70%)" : "75%",
              }}
            >
              {m.image ? (
                <img
                  src={m.image}
                  alt="user upload"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: borderRadius.lg,
                    display: "block",
                  }}
                />
              ) : (
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
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.message, ...styles.botMessage, opacity: 0.7 }}>
            <div className="typing-dots" style={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
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
          placeholder="Type a message / Écris un message…"
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
    overflow: "hidden",
    background: "transparent",
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
    gap: spacing.md,
    scrollBehavior: "smooth",
  },
  message: {
    padding: "10px 14px",
    borderRadius: borderRadius.lg,
    maxWidth: "75%",
    animation: "fadeIn 0.3s ease-in",
  },
  userMessage: {
    background: colors.primary,
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
    bottom: 75,
    left: "50%",
    transform: "translateX(-50%)",
    width: "clamp(280px, 90%, 720px)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px 6px 16px",
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
    padding: "8px 4px",
    borderRadius: 20,
    border: "none",
    background: "transparent",
    fontSize: 15,
    fontFamily: typography.message.fontFamily,
    lineHeight: 1.4,
    textWrap: "nowrap" as const,
    overflowX: "auto",
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
  typingDots: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "6px 8px",
  },
};

// Add typing animation
const styleSheet = document.createElement("style");
styleSheet.innerHTML = `
@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
.typing-dots span {
  width: 10px;
  height: 10px;
  background: ${colors.primary === "#4A90E2" ? "#357ABD" : colors.primary};
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out both;
}
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
`;
document.head.appendChild(styleSheet);
