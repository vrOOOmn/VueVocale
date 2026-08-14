import { colors, borderRadius, typography } from "../theme";
import type { ArchivedConversation } from "../lib/data/conversations";

function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });
}

export default function ArchivedDayCard({
  conversation,
  onClick,
}: {
  conversation: ArchivedConversation;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: "100%",
        textAlign: "left",
        background: colors.surface,
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: borderRadius.lg,
        padding: "14px 16px",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontFamily: typography.header.fontFamily,
          fontWeight: 700,
          fontSize: 14,
          color: colors.secondary,
          textTransform: "capitalize",
        }}
      >
        {formatDate(conversation.conversationDate)}
      </span>

      {conversation.summary && (
        <span
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: 13.5,
            color: "#5A6472",
            lineHeight: 1.4,
          }}
        >
          {conversation.summary}
        </span>
      )}

      <span style={{ fontFamily: typography.body.fontFamily, fontSize: 12, color: "#9AA4B2" }}>
        {conversation.messageCount} messages · {conversation.grammarCorrectionCount} corrections
      </span>
    </button>
  );
}
