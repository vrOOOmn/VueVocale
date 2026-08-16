"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IoSend,
  IoMic,
  IoOptionsOutline,
  IoStopSharp,
  IoTrashOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { colors, spacing, borderRadius, typography, shadows } from "../theme";
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
  // Bridges the gap between tapping "talk about it" and that photo's
  // message actually landing in the cache. Cleared the moment it does (or
  // if the insert fails), so the message list — not this — is what the
  // header reads from for the rest of the session. See contextLabel below.
  const [scanTopic, setScanTopic] = useState<string | null>(null);
  const micMenuRef = useRef<HTMLDivElement | null>(null);

  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const lastPhotoRef = useRef<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

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

  // The header names the subject the conversation is actually on, so it
  // reads off the newest object-labelled message rather than the handoff
  // prop. `topic` is set once at scan→chat and then never changes for the
  // life of this mount, so letting it win outright pinned the pill to a
  // subject the conversation had moved past — most visibly after clearing
  // the chat, where every photo is gone but the pill kept naming one.
  // scanTopic covers only the brief pre-insert window (see above).
  const persistedTopic = [...messages].reverse().find((m) => m.objectLabel)?.objectLabel;
  const contextLabel = scanTopic ?? persistedTopic;

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

      // Deliberately not caught here — a failure surfaces as a distinct
      // error card (see retryReplyMutation) instead of being stringified
      // into a fake bot message. Persisting the error text as a real "bot"
      // message would also poison future AI context, since buildAgentHistory
      // feeds every past bot message back in as assistant turns.
      const aiResponse = await generateTextResponse({
        history: buildAgentHistory(historyBefore),
        userMessage: text,
        hasImage: historyBefore.some((m) => m.image),
      });
      const botMsg = await insertMessage({
        conversation_id: conversationId,
        user_id: user.id,
        sender: "bot",
        text: aiResponse,
      });
      appendMessage(botMsg);
    },
  });

  // Retries only the AI-reply half of a failed send — the user's message
  // already persisted successfully, so re-running the full send would
  // duplicate it. Reads the latest cached message list to find the most
  // recent user turn to reply to.
  const retryReplyMutation = useMutation({
    mutationFn: async () => {
      if (!conversationId) throw new Error("No active conversation yet");

      const currentMsgs =
        queryClient.getQueryData<Message[]>(["messages", conversationId]) ?? [];
      const lastUserMsg = [...currentMsgs].reverse().find((m) => m.sender === "user" && m.text);
      if (!lastUserMsg?.text) throw new Error("Nothing to retry");

      const historyBefore = currentMsgs.filter((m) => m.id !== lastUserMsg.id);

      const aiResponse = await generateTextResponse({
        history: buildAgentHistory(historyBefore),
        userMessage: lastUserMsg.text,
        hasImage: historyBefore.some((m) => m.image),
      });
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
  // Photo messages load their <img> asynchronously — scrollHeight measured
  // right when this effect runs doesn't yet include an image that hasn't
  // decoded, so a single scroll-then-done can land short with nothing to
  // correct it once the image actually finishes loading. Re-applying the
  // same instant scrollTop a few more times over the following second
  // catches that without needing to track every possible cause of a height
  // change individually (a ResizeObserver on the content wrapper was tried
  // here first — in practice its callback never fired for this skeleton-to-
  // real-content swap, for reasons not fully pinned down — so this simpler,
  // empirically-verified approach replaced it).
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight;
    };

    scrollToBottom();
    const timers = [50, 200, 600, 1500].map((delay) => setTimeout(scrollToBottom, delay));
    return () => timers.forEach(clearTimeout);
  }, [
    displayMessages.length,
    messagesPending,
    sendTextMutation.isPending,
    photoReplyPending,
    retryReplyMutation.isPending,
  ]);

  useLayoutEffect(() => {
    const handleNewPhoto = async () => {
      if (!photoDataUrl || !topic || !conversationId) return;
      // Name the new subject in the header straight away, before the insert
      // (or even the initial read) has resolved.
      setScanTopic(topic);
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
        // The message now carries object_label, so the list can take over.
        setScanTopic(null);
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
        // Nothing persisted, so don't leave the header naming a subject the
        // conversation has no record of.
        setScanTopic(null);
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
      setScanTopic(null);
      queryClient.invalidateQueries({ queryKey: ["streak"] });
    } catch (err) {
      console.error("Clear chat error", err);
    }
  };

  return (
    <main style={styles.container}>
      <div className="chat-header">
        <div style={{ ...styles.headerLeft, gridArea: "context" }}>
          {contextLabel && (
            <span style={styles.contextPill}>
              <span style={styles.liveDot} />
              Contexte · {contextLabel}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={clearChat}
          disabled={messages.length === 0}
          title="Effacer la conversation"
          aria-label="Effacer la conversation / Clear conversation"
          style={{
            ...styles.clearButton,
            gridArea: "delete",
            opacity: messages.length === 0 ? 0.4 : 1,
            cursor: messages.length === 0 ? "default" : "pointer",
          }}
        >
          <IoTrashOutline size={16} />
        </button>

        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          aria-label="Historique / History"
          style={{ ...styles.historyButton, gridArea: "historique" }}
        >
          🕘 <span>Historique</span>
        </button>

        <div style={{ ...styles.headerRight, gridArea: "streak" }}>
          {streak > 0 && <span style={styles.streakBadge}>🔥 {streak}</span>}
        </div>
      </div>

      <div ref={messagesContainerRef} className="chat-messages" style={styles.messages}>
        {messagesPending ? (
          <>
            <div className="skeleton" style={styles.skeletonBot} />
            <div className="skeleton" style={styles.skeletonUser} />
            <div className="skeleton" style={{ ...styles.skeletonBot, width: "50%" }} />
          </>
        ) : (
          displayMessages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              mode="live"
              isPlaying={playingId === m.id}
              onTogglePlay={togglePlay}
              onFixGrammar={handleFixGrammar}
            />
          ))
        )}

        {(sendTextMutation.isPending || photoReplyPending || retryReplyMutation.isPending) && (
          <div style={{ ...styles.message, ...styles.botMessage, opacity: 0.7 }}>
            <div className="typing-dots" style={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {(sendTextMutation.isError || retryReplyMutation.isError) &&
          !retryReplyMutation.isPending && (
            <div style={styles.errorCard} role="alert">
              <IoWarningOutline size={16} color={colors.rouge} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>
                {(() => {
                  const err = retryReplyMutation.isError
                    ? retryReplyMutation.error
                    : sendTextMutation.error;
                  return err instanceof Error && err.message ? err.message : ERROR_TEXT;
                })()}
              </span>
              <button
                type="button"
                onClick={() => retryReplyMutation.mutate()}
                style={styles.errorRetryButton}
              >
                Réessayer / Retry
              </button>
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
        <div ref={micMenuRef} style={styles.micControlGroup}>
          <button
            type="button"
            onClick={() => setMicMenuOpen((open) => !open)}
            disabled={recording}
            title={`Selected mic: ${selectedMicLabel}`}
            aria-label={`Choisir le micro / Choose microphone — ${selectedMicLabel}`}
            className="mic-picker-btn"
            style={styles.micPickerButton}
          >
            <IoOptionsOutline size={16} style={{ flexShrink: 0 }} />
            <span className="chat-header-label" style={styles.micPickerLabel}>
              {selectedMicLabel}
            </span>
            <span className="chat-header-label" style={styles.micPickerCaret}>
              ▾
            </span>
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
          aria-label={
            recording
              ? "Arrêter l'enregistrement / Stop recording"
              : "Démarrer l'enregistrement / Start recording"
          }
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
          aria-label="Envoyer / Send"
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
  headerLeft: {
    display: "flex",
    justifySelf: "start",
    minWidth: 0,
    // Deliberately no overflow:hidden here — box-shadow is part of the
    // pill's own rendered box, and clipping this wrapper clipped the
    // shadow too, leaving a hard rectangular seam around the pill instead
    // of a smooth fade. minWidth:0 alone is what the grid track needs to
    // shrink correctly; contextPill's own overflow:hidden handles ellipsis.
  },
  headerRight: {
    display: "flex",
    justifySelf: "end",
  },
  contextPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13.5,
    fontWeight: 600,
    color: colors.navy,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    border: `1px solid ${colors.hairlineTranslucent}`,
    borderRadius: borderRadius.round,
    padding: "10px 18px",
    boxShadow: shadows.card,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  liveDot: {
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: "50%",
    background: colors.mint,
    boxShadow: `0 0 0 3px rgba(30, 167, 131, 0.18)`,
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
    // Grid items stretch to fill their area by default — historique's area
    // spans the full row width on mobile (its own dedicated row), which
    // stretched the button edge-to-edge instead of hugging its content like
    // every other header pill. justifySelf:start opts back out of that.
    justifySelf: "start",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 13.5,
    fontWeight: 600,
    color: colors.navy,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    border: `1px solid ${colors.hairlineTranslucent}`,
    borderRadius: borderRadius.round,
    padding: "10px 18px",
    boxShadow: shadows.card,
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
    border: `1px solid ${colors.hairlineTranslucent}`,
    borderRadius: borderRadius.round,
    boxShadow: shadows.card,
    padding: 0,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: spacing.md,
    // paddingTop is set in CSS (.chat-messages) — it has to be taller on
    // mobile where the header wraps to two rows (Contexte/delete/streak,
    // then a full-width Historique row) versus desktop's single row.
    paddingBottom: 160,
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
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
  errorCard: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    maxWidth: "85%",
    padding: "10px 14px",
    borderRadius: borderRadius.lg,
    background: "rgba(185, 74, 72, 0.08)",
    border: `1px solid ${colors.rouge}`,
    color: colors.rouge,
    fontSize: 13,
    fontWeight: 600,
    animation: "fadeIn 0.3s ease-in",
  },
  errorRetryButton: {
    flexShrink: 0,
    background: "transparent",
    border: `1px solid ${colors.rouge}`,
    color: colors.rouge,
    borderRadius: borderRadius.round,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  skeletonBot: {
    height: 44,
    width: "62%",
    borderRadius: "18px 18px 18px 4px",
    alignSelf: "flex-start",
  },
  skeletonUser: {
    height: 36,
    width: "42%",
    borderRadius: "18px 18px 4px 18px",
    alignSelf: "flex-end",
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
    border: `1px solid ${colors.hairlineTranslucent}`,
    borderRadius: 28,
    boxShadow: shadows.card,
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
    borderRadius: 20,
    border: `1px solid ${colors.hairlineTranslucent}`,
    background: "rgba(255,255,255,0.92)",
    color: colors.navy,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "0 12px",
    marginRight: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: shadows.card,
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
    border: `1px solid ${colors.hairline}`,
    boxShadow: shadows.overlay,
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
