"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoClose, IoChevronBack } from "react-icons/io5";
import { colors, spacing, borderRadius, typography } from "../theme";
import { fetchArchivedConversations, fetchMessages } from "../lib/data/conversations";
import { useMessageAudioPlayback } from "../lib/audio/useMessageAudioPlayback";
import MessageBubble from "./MessageBubble";
import ArchivedDayCard from "./ArchivedDayCard";

function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default function ArchivedDaysPanel({
  open,
  onClose,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: archived = [] } = useQuery({
    queryKey: ["archivedConversations"],
    queryFn: fetchArchivedConversations,
    enabled: open,
  });

  const { data: transcript = [] } = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => fetchMessages(selectedId!),
    enabled: !!selectedId,
  });

  const { playingId, togglePlay, mergeAudioState } = useMessageAudioPlayback(userId);

  if (!open) return null;

  const selectedConversation = archived.find((c) => c.id === selectedId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(17, 27, 63, 0.4)",
        display: "flex",
        justifyContent: "center",
      }}
      onClick={() => (selectedId ? setSelectedId(null) : onClose())}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          background: colors.paper,
          borderRadius: "0 0 28px 28px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
        }}
      >
        {selectedId ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: `${spacing.md}px ${spacing.lg}px`,
                borderBottom: `1px solid ${colors.hairline}`,
              }}
            >
              <button
                onClick={() => setSelectedId(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
              >
                <IoChevronBack size={20} color={colors.navy} />
              </button>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontFamily: typography.header.fontFamily,
                    fontWeight: 700,
                    fontSize: 15,
                    color: colors.navy,
                    textTransform: "capitalize",
                  }}
                >
                  {selectedConversation ? formatDate(selectedConversation.conversationDate) : ""}
                </span>
                <span style={{ fontFamily: typography.body.fontFamily, fontSize: 12, color: colors.textMuted }}>
                  Lecture seule
                </span>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: spacing.md,
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
              }}
            >
              {mergeAudioState(transcript).map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  mode="readonly"
                  isPlaying={playingId === m.id}
                  onTogglePlay={togglePlay}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `${spacing.md}px ${spacing.lg}px`,
                borderBottom: `1px solid ${colors.hairline}`,
              }}
            >
              <span
                style={{
                  fontFamily: typography.header.fontFamily,
                  fontWeight: 700,
                  fontSize: 16,
                  color: colors.navy,
                }}
              >
                Historique
              </span>
              <button
                onClick={onClose}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
              >
                <IoClose size={20} color={colors.navy} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: spacing.lg,
                display: "flex",
                flexDirection: "column",
                gap: spacing.sm,
              }}
            >
              {archived.length === 0 ? (
                <p
                  style={{
                    fontFamily: typography.body.fontFamily,
                    fontSize: 14,
                    color: colors.textMuted,
                    textAlign: "center",
                    marginTop: spacing.xl,
                  }}
                >
                  Aucun jour archivé pour l&apos;instant.
                </p>
              ) : (
                archived.map((conversation) => (
                  <ArchivedDayCard
                    key={conversation.id}
                    conversation={conversation}
                    onClick={() => setSelectedId(conversation.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
