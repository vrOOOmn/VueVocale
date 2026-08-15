"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoSend, IoMic, IoStopSharp, IoTrashOutline } from "react-icons/io5";
import { colors, spacing, borderRadius, typography } from "../theme";
import { generateTextResponse, fixGrammar } from "../lib/primaryAgent";
import { useRecorder } from "../lib/audio/useRecorder";
import { transcribeSTT } from "../lib/audio/transcribeSTT";
import { useMessageAudioPlayback } from "../lib/audio/useMessageAudioPlayback";
import { getLocalDateString, computeStreak } from "../lib/dates";
import {
  clearConversationMessages,
  ensureActiveConversation,
  fetchActiveDates,
  fetchMessages,
  insertMessage,
  updateMessage,
  type Message,
} from "../lib/data/conversations";
import MessageBubble from "../components/MessageBubble";
import ArchivedDaysPanel from "../components/ArchivedDaysPanel";
import type { AuthedUser } from "../components/UserMenu";

const ERROR_TEXT = "Oops, error in generating response! Try Again";

export default function Chat({
  topic,
  photoDataUrl,
  photoStoragePath,
  user,
}: {
  topic?: string | null;
  photoDataUrl?: string | null;
  photoStoragePath?: string | null;
  user: AuthedUser;
}) {
  const queryClient = useQueryClient();

  const [input, setInput] = useState("");
  const { recording, start, stop, audioInputs } = useRecorder();
  const [micMenuOpen, setMicMenuOpen] = useState(false);
  const [selectedMicId, setSelectedMicId] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [photoReplyPending, setPhotoReplyPending] = useState(false);
  const micMenuRef = useRef<HTMLDivElement | null>(null);

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const lastPhotoRef = useRef<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { playingId, togglePlay, mergeAudioState } = useMessageAudioPlayback(user.id);

  useEffect(() => {
    const savedMicId = window.localStorage.getItem("vuelocale.selectedMicId");
    if (savedMicId) {
      setSelectedMicId(savedMicId);
    }
  }, []);

  useEffect(() => {
    if (!selectedMicId) {
      window.localStorage.removeItem("vuelocale.selectedMicId");
      return;
    }

    window.localStorage.setItem("vuelocale.selectedMicId", selectedMicId);
  }, [selectedMicId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        micMenuRef.current &&
        !micMenuRef.current.contains(event.target as Node)
      ) {
        setMicMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: activeConversation } = useQuery({
    queryKey: ["activeConversation"],
    queryFn: () => ensureActiveConversation(getLocalDateString()),
    staleTime: Infinity,
  });
  const conversationId = activeConversation?.id;

  const {
    data: messages = [],
    isPending: messagesPending,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
    // We're the sole writer of this cache (every insert/update goes through
    // appendMessage/patchMessage) — never background-refetch it. Without
    // this, remounting Chat (e.g. switching back from the Scanner tab)
    // triggers a stale-data refetch that can resolve after a fresh insert
    // and silently overwrite it with a pre-insert snapshot.
    staleTime: Infinity,
  });

  const displayMessages = mergeAudioState(messages);

  // `topic` only reflects a fresh scan→chat handoff this session — it's
  // empty after a reload even though the conversation still has a subject.
  // Fall back to the most recent persisted object_label so the context pill
  // survives a refresh.
  const persistedTopic = [...messages].reverse().find((m) => m.objectLabel)?.objectLabel;
  const contextLabel = topic || persistedTopic;

  const { data: streak = 0 } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => computeStreak(await fetchActiveDates()),
  });

  const appendMessage = (msg: Message) => {
    queryClient.setQueryData<Message[]>(["messages", conversationId], (prev) => [
      ...(prev ?? []),
      msg,
    ]);
  };

  const patchMessage = (id: string, patch: Partial<Message>) => {
    queryClient.setQueryData<Message[]>(["messages", conversationId], (prev) =>
      (prev ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  };

  const buildAgentHistory = (
    msgs: Message[],
  ): { role: "user" | "assistant"; content: string }[] =>
    msgs
      .filter((m) => m.text && !m.image)
      .map((m) => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.text!,
      }));

  const generateAIResponse = async (userMessage: string, historyMsgs: Message[]): Promise<string> => {
    try {
      const hasImage = historyMsgs.some((m) => m.image);

      return await generateTextResponse({
        history: buildAgentHistory(historyMsgs),
        userMessage,
        hasImage,
      });
    } catch (e) {
      console.error(e);

      if (e instanceof Error && e.message) {
        return e.message;
      }

      return ERROR_TEXT;
    }
  };

  const sendTextMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!conversationId) throw new Error("No active conversation yet");

      const historyBefore =
        queryClient.getQueryData<Message[]>(["messages", conversationId]) ?? [];

      const userMsg = await insertMessage({
        conversation_id: conversationId,
        user_id: user.id,
        sender: "user",
        text,
      });
      appendMessage(userMsg);
      queryClient.invalidateQueries({ queryKey: ["streak"] });

      const aiResponse = await generateAIResponse(text, historyBefore);
      const botMsg = await insertMessage({
        conversation_id: conversationId,
        user_id: user.id,
        sender: "bot",
        text: aiResponse,
      });
      appendMessage(botMsg);
    },
  });

  // --- Scroll to bottom ---
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length, sendTextMutation.isPending, photoReplyPending]);

  useLayoutEffect(() => {
    const handleNewPhoto = async () => {
      if (!photoDataUrl || !topic || !conversationId) return;
      // Wait for the initial messages read to land before writing anything —
      // otherwise that read can resolve after our insert and overwrite the
      // cache with the pre-insert (empty) snapshot, silently dropping it.
      if (messagesPending) return;
      if (lastPhotoRef.current === photoDataUrl) return;
      lastPhotoRef.current = photoDataUrl;

      try {
        const userMsg = await insertMessage({
          conversation_id: conversationId,
          user_id: user.id,
          sender: "user",
          image_path: photoStoragePath ?? null,
          object_label: topic,
        });
        appendMessage({ ...userMsg, image: userMsg.image ?? photoDataUrl });
        queryClient.invalidateQueries({ queryKey: ["streak"] });

        setPhotoReplyPending(true);

        const historyBefore =
          queryClient.getQueryData<Message[]>(["messages", conversationId]) ?? [];

        const text = await generateTextResponse({
          history: buildAgentHistory(historyBefore),
          userMessage: `L'utilisateur a envoyé une image de ${topic}.`,
          hasImage: true,
        });
        if (!text) return;

        const botMsg = await insertMessage({
          conversation_id: conversationId,
          user_id: user.id,
          sender: "bot",
          text,
        });
        appendMessage(botMsg);
      } catch (err) {
        console.error("Photo handoff error", err);
      } finally {
        setPhotoReplyPending(false);
      }
    };

    handleNewPhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDataUrl, topic, conversationId, messagesPending]);

  // --- Handle Enter key ---
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAudioMessage = async (audioBlob: Blob) => {
    try {
      const transcription = await transcribeSTT(audioBlob);
      if (!transcription) return;
      await sendTextMutation.mutateAsync(transcription);
    } catch (error) {
      console.error("Audio message error", error);
    }
  };

  const handleFixGrammar = async (msg: Message) => {
    if (
      !msg.text ||
      msg.grammarStatus === "loading" ||
      msg.grammarStatus === "fixed" ||
      msg.grammarStatus === "ok"
    ) {
      return;
    }

    patchMessage(msg.id, { grammarStatus: "loading" });

    try {
      const result = await fixGrammar(msg.text);

      if (result === "OK") {
        patchMessage(msg.id, { grammarStatus: "ok" });
        await updateMessage(msg.id, { grammar_status: "ok" });
      } else {
        patchMessage(msg.id, { grammarFix: result, grammarStatus: "fixed" });
        await updateMessage(msg.id, { grammar_status: "fixed", grammar_fix: result });
      }
    } catch {
      patchMessage(msg.id, { grammarStatus: "error" });
    }
  };

  const handleMic = async () => {
    try {
      if (!recording) {
        setMicMenuOpen(false);
        await start(selectedMicId || null);
        return;
      }

      const blob = await stop();
      handleAudioMessage(blob);
    } catch (error) {
      console.error("Microphone error", error);
    }
  };

  const selectedMicLabel =
    selectedMicId === ""
      ? "Browser default"
      : audioInputs.find((device) => device.deviceId === selectedMicId)?.label ||
        "Saved mic unavailable";

  const chooseMic = (deviceId: string) => {
    setSelectedMicId(deviceId);
    setMicMenuOpen(false);
  };

  // --- Sending user messages ---
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");

    try {
      await sendTextMutation.mutateAsync(text);
    } catch (err) {
      console.error("send error", err);
    }

    textRef.current?.focus();
  };

  const clearChat = async () => {
    if (!conversationId || messages.length === 0) return;
    const confirmed = window.confirm(
      "Effacer la conversation d'aujourd'hui ? Cette action est irréversible. / Clear today's chat? This can't be undone.",
    );
    if (!confirmed) return;

    try {
      await clearConversationMessages(conversationId);
      queryClient.setQueryData<Message[]>(["messages", conversationId], []);
      lastPhotoRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    } catch (err) {
      console.error("Clear chat error", err);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {contextLabel && <span style={styles.contextPill}>Contexte · {contextLabel}</span>}
        </div>
        <div style={styles.headerCenter}>
          <button
            type="button"
            onClick={clearChat}
            disabled={messages.length === 0}
            title="Effacer la conversation"
            style={{
              ...styles.clearButton,
              opacity: messages.length === 0 ? 0.4 : 1,
              cursor: messages.length === 0 ? "default" : "pointer",
            }}
          >
            <IoTrashOutline size={16} />
          </button>
          <button type="button" onClick={() => setHistoryOpen(true)} style={styles.historyButton}>
            🕘 Historique
          </button>
        </div>
        <div style={styles.headerRight}>
          {streak > 0 && <span style={styles.streakBadge}>🔥 {streak}</span>}
        </div>
      </div>

      <div style={styles.messages}>
        {displayMessages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            mode="live"
            isPlaying={playingId === m.id}
            onTogglePlay={togglePlay}
            onFixGrammar={handleFixGrammar}
          />
        ))}

        {(sendTextMutation.isPending || photoReplyPending) && (
          <div style={{ ...styles.message, ...styles.botMessage, opacity: 0.7 }}>
            <div className="typing-dots" style={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
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
        <div ref={micMenuRef} style={styles.micControlGroup}>
          <button
            type="button"
            onClick={() => setMicMenuOpen((open) => !open)}
            disabled={recording}
            title={`Selected mic: ${selectedMicLabel}`}
            style={styles.micPickerButton}
          >
            <span style={styles.micPickerLabel}>{selectedMicLabel}</span>
            <span style={styles.micPickerCaret}>▾</span>
          </button>

          {micMenuOpen && (
            <div style={styles.micDropdown}>
              <button
                type="button"
                onClick={() => chooseMic("")}
                style={{
                  ...styles.micDropdownItem,
                  fontWeight: selectedMicId === "" ? 700 : 500,
                }}
              >
                Browser default
              </button>
              {audioInputs.map((device) => (
                <button
                  type="button"
                  key={device.deviceId}
                  onClick={() => chooseMic(device.deviceId)}
                  style={{
                    ...styles.micDropdownItem,
                    fontWeight:
                      selectedMicId === device.deviceId ? 700 : 500,
                  }}
                >
                  {device.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleMic}
          disabled={!conversationId || messagesPending}
          style={{
            ...styles.micButton,
            // "Blue means action or listening" — an active recording is
            // listening, so it takes electric, not rouge (rouge is reserved
            // for corrections/destructive actions only).
            background: recording ? colors.electric : colors.brass,
          }}
        >
          <div
            style={{
              width: 23,
              height: 23,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {recording ? (
              <IoStopSharp style={{ fontSize: 20 }} color="white" />
            ) : (
              <IoMic style={{ fontSize: 28 }} color="white" />
            )}
          </div>
        </button>

        <button
          type="submit"
          disabled={
            !input.trim() || sendTextMutation.isPending || !conversationId || messagesPending
          }
          style={{
            ...styles.sendButton,
            opacity:
              !input.trim() || sendTextMutation.isPending || !conversationId || messagesPending
                ? 0.6
                : 1,
          }}
        >
          <div
            style={{
              width: 23,
              height: 23,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IoSend style={{ fontSize: 18 }} color="white" />
          </div>
        </button>
      </form>

      <ArchivedDaysPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        userId={user.id}
      />
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
  header: {
    // Fixed like the input bar below — a normal in-flow header can end up
    // scrolling away with the message list on mobile browsers where the
    // 100%-height flex containment doesn't reliably hold (100svh/inner-scroll
    // quirks), even though it looks contained in desktop devtools.
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 8,
    // Right padding clears the fixed account icon (40px circle at
    // top:16/right:16) so header buttons never sit underneath it.
    padding: `${spacing.md}px 64px ${spacing.sm}px ${spacing.md}px`,
    zIndex: 100,
  },
  headerLeft: {
    display: "flex",
    justifySelf: "start",
    minWidth: 0,
  },
  headerCenter: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifySelf: "center",
  },
  headerRight: {
    display: "flex",
    justifySelf: "end",
  },
  contextPill: {
    fontSize: 13.5,
    fontWeight: 600,
    color: colors.navy,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: borderRadius.round,
    padding: "10px 18px",
    boxShadow: "0 8px 20px rgba(17, 27, 63, 0.08)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "45vw",
  },
  streakBadge: {
    display: "flex",
    alignItems: "center",
    fontSize: 13.5,
    fontWeight: 800,
    color: "#fff",
    background: colors.brass,
    borderRadius: borderRadius.round,
    padding: "10px 16px",
    boxShadow: "0 8px 20px rgba(184, 134, 58, 0.35)",
  },
  historyButton: {
    fontSize: 13.5,
    fontWeight: 600,
    color: colors.navy,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: borderRadius.round,
    padding: "10px 18px",
    boxShadow: "0 8px 20px rgba(17, 27, 63, 0.08)",
    cursor: "pointer",
  },
  clearButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    color: colors.rouge,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: borderRadius.round,
    boxShadow: "0 8px 20px rgba(17, 27, 63, 0.08)",
    padding: 0,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: spacing.md,
    paddingTop: 88,
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
  botMessage: {
    background: "#F4F0FF",
    border: "1px solid #D8D0FF",
    alignSelf: "flex-start",
    borderRadius: "18px 18px 18px 4px",
  },
  inputContainer: {
    position: "fixed",
    bottom: 85,
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
    color: colors.navy,
  },
  micControlGroup: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  micPickerButton: {
    height: 44,
    minWidth: 116,
    borderRadius: 20,
    border: "1px solid rgba(59,107,243,0.16)",
    background: "rgba(255,255,255,0.92)",
    color: colors.navy,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "0 12px",
    marginRight: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  },
  micPickerLabel: {
    maxWidth: 76,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  micPickerCaret: {
    fontSize: 11,
    opacity: 0.7,
    lineHeight: 1,
  },
  micDropdown: {
    position: "absolute",
    left: 0,
    bottom: "calc(100% + 8px)",
    minWidth: 220,
    maxWidth: 280,
    maxHeight: 240,
    overflowY: "auto",
    padding: 6,
    borderRadius: 16,
    background: "rgba(255,255,255,0.98)",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
    zIndex: 120,
  },
  micDropdownItem: {
    width: "100%",
    border: "none",
    borderRadius: 12,
    padding: "9px 10px",
    background: "transparent",
    color: colors.navy,
    textAlign: "left",
    fontSize: 13,
    cursor: "pointer",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "none",
    background: colors.electric,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(49, 104, 255, 0.3)",
  },
  typingDots: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "6px 8px",
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(17, 27, 63, 0.18)",
  },
};
