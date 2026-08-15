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
        background: colors.paper,
        border: `1px solid ${colors.hairline}`,
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
          color: colors.navy,
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
            color: colors.textMuted,
            lineHeight: 1.4,
          }}
        >
          {conversation.summary}
        </span>
      )}

      <span style={{ fontFamily: typography.body.fontFamily, fontSize: 12, color: colors.textMuted }}>
        {conversation.messageCount} messages · {conversation.grammarCorrectionCount} corrections
      </span>
    </button>
  );
}
