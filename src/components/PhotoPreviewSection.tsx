import React from "react";
import { IoArrowUndoOutline, IoWarningOutline } from "react-icons/io5";
import { colors, spacing, borderRadius, typography } from "../theme";

type Props = {
  photoDataUrl: string;
  handleRetakePhoto: () => void;
  detectedLabel?: string | null;
  englishLabel?: string | null;
  uploadFailed?: boolean;
  onChat?: () => void;
};

export default function PhotoPreviewSection({
  photoDataUrl,
  handleRetakePhoto,
  detectedLabel,
  englishLabel,
  uploadFailed,
  onChat,
}: Props) {
  return (
    <div style={styles.container}>
      {/* Plain <img>, deliberately not next/image: this is a client-generated
          data: URL from a canvas capture, not a fetchable asset — there's no
          network request for next/image to optimize away. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
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
          {uploadFailed && (
            <div style={styles.uploadWarning}>
              <IoWarningOutline size={14} color={colors.navy} />
              <span>
                Photo non enregistrée, mais vous pouvez continuer / Photo
                wasn&apos;t saved, but you can still continue
              </span>
            </div>
          )}
          <div style={styles.buttonRow}>
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
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    // Matches Scanner's cameraBox exactly so confirming a photo doesn't
    // visibly resize the frame it's sitting in.
    width: "clamp(18rem, 88vw, 30rem)",
    position: "relative" as const,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    aspectRatio: "3 / 4",
    marginBottom: spacing.xxl,
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
    flexDirection: "column" as const,
    gap: spacing.sm,
    padding: spacing.lg,
    animation: "fadeIn 0.3s ease-out",
  },
  uploadWarning: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.92)",
    color: colors.navy,
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    fontWeight: 600,
    borderRadius: borderRadius.md,
    padding: "6px 10px",
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
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
