"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Move focus into the panel on open, and restore it to whatever triggered
  // the panel on close — standard dialog focus-management behavior.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      previouslyFocused.current?.focus();
      previouslyFocused.current = null;
    }
  }, [open]);

  // Escape backs out one level (transcript -> list -> close); Tab is
  // trapped inside the panel while it's open.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (selectedId) setSelectedId(null);
        else onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const list = Array.from(focusable);
        const first = list[0];
        const last = list[list.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedId, onClose]);

  const { data: archived = [], isPending: archivedPending } = useQuery({
    queryKey: ["archivedConversations"],
    queryFn: fetchArchivedConversations,
    enabled: open,
  });

  const { data: transcript = [], isPending: transcriptPending } = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => fetchMessages(selectedId!),
    enabled: !!selectedId,
  });

  const { playingId, togglePlay, mergeAudioState } = useMessageAudioPlayback(userId);

  if (!open || !mounted) return null;

  const selectedConversation = archived.find((c) => c.id === selectedId);

  // Portalled to <body> rather than rendered in place: as a modal it has to
  // out-paint the fixed chrome around it (account avatar, tab bar, input
  // bar), and nesting it inside the app shell left its stacking order at the
  // mercy of whatever context an ancestor happened to create.
  return createPortal(
    <div
      className="archived-panel-backdrop"
      onClick={() => (selectedId ? setSelectedId(null) : onClose())}
    >
      <div
        ref={panelRef}
        className="archived-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Historique des conversations / Conversation history"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedId ? (
          <>
            <div className="archived-panel-head" style={{ gap: 8 }}>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Retour / Back"
                className="archived-panel-iconbtn"
              >
                <IoChevronBack size={20} color={colors.navy} />
              </button>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
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

            <div className="archived-panel-body" style={{ gap: spacing.md }}>
              {transcriptPending ? (
                <>
                  <div
                    className="skeleton"
                    style={{ height: 44, width: "62%", borderRadius: "18px 18px 18px 4px", alignSelf: "flex-start" }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 36, width: "42%", borderRadius: "18px 18px 4px 18px", alignSelf: "flex-end" }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 50, width: "58%", borderRadius: "18px 18px 18px 4px", alignSelf: "flex-start" }}
                  />
                </>
              ) : (
                mergeAudioState(transcript).map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    mode="readonly"
                    isPlaying={playingId === m.id}
                    onTogglePlay={togglePlay}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="archived-panel-head" style={{ justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: typography.header.fontFamily,
                  fontWeight: 700,
                  fontSize: 17,
                  color: colors.navy,
                }}
              >
                Historique
              </span>
              <button
                onClick={onClose}
                aria-label="Fermer / Close"
                className="archived-panel-iconbtn archived-panel-close"
              >
                <IoClose size={20} color={colors.navy} />
              </button>
            </div>

            <div className="archived-panel-body" style={{ gap: spacing.sm }}>
              {archivedPending ? (
                <>
                  <div className="skeleton" style={{ height: 78, borderRadius: borderRadius.lg }} />
                  <div className="skeleton" style={{ height: 78, borderRadius: borderRadius.lg }} />
                  <div className="skeleton" style={{ height: 78, borderRadius: borderRadius.lg }} />
                </>
              ) : archived.length === 0 ? (
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
    </div>,
    document.body,
  );
}
