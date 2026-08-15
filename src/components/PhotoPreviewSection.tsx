import React from "react";
import { IoArrowUndoOutline } from "react-icons/io5";
import { colors, spacing, borderRadius, typography } from "../theme";

type Props = {
  photoDataUrl: string;
  handleRetakePhoto: () => void;
  detectedLabel?: string | null;
  englishLabel?: string | null;
  onChat?: () => void;
};

export default function PhotoPreviewSection({
  photoDataUrl,
  handleRetakePhoto,
  detectedLabel,
  englishLabel,
  onChat,
}: Props) {
  return (
    <div style={styles.container}>
      <img src={photoDataUrl} alt="Camera preview" style={styles.preview} />

      {/* Detected-object chip, overlaid on the photo like the landing page's
          "une orange" chip — matches the app-wide dark-chip convention. */}
      {detectedLabel && (
        <div style={styles.chip}>
          {detectedLabel} / {englishLabel}
        </div>
      )}

      {/* Confirm/retake — two buttons, no question. */}
      {detectedLabel && (
        <div style={styles.dialogOverlay}>
          <button className="photo-preview-btn" onClick={onChat} style={styles.primaryBtn}>
            Oui, parlons-en / Yes, let&apos;s talk
          </button>
          <button
            className="photo-preview-btn round-btn"
            onClick={handleRetakePhoto}
            aria-label="Reprendre la photo / Retake photo"
            title="Reprendre la photo / Retake photo"
            style={styles.retakeBtn}
          >
            <IoArrowUndoOutline size={22} color={colors.textLight} />
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "clamp(15rem, 70vw, 23rem)",
    position: "relative" as const,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    aspectRatio: "3 / 4",
    marginBottom: "min(8rem, 100px)",
    border: "1px solid #BDEBFF",
    flexShrink: 0,
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
    background: "#000",
  },
  chip: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    background: colors.navy,
    color: colors.textLight,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    fontWeight: 600,
    borderRadius: borderRadius.round,
    padding: "8px 14px",
    boxShadow: "0 4px 14px rgba(17, 27, 63, 0.25)",
  },
  dialogOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    animation: "fadeIn 0.3s ease-out",
  },
  primaryBtn: {
    flex: 1,
    background: colors.electric,
    color: colors.textLight,
    border: "none",
    borderRadius: borderRadius.lg,
    padding: "16px 16px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(49, 104, 255, 0.3)",
  },
  retakeBtn: {
    flexShrink: 0,
    width: 52,
    height: 52,
    borderRadius: borderRadius.round,
    background: colors.navy,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(17, 27, 63, 0.3)",
  },
};
