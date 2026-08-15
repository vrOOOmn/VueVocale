import React from "react";
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

      {/* Confirm/retake card */}
      {detectedLabel && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogCard}>
            <p style={styles.subtitle}>
              Souhaitez-vous en parler en français ? / Do you want to talk about
              it in French?
            </p>
            <div style={styles.buttonRow}>
              <button className="photo-preview-btn" onClick={onChat} style={styles.primaryBtn}>
                Oui, parlons-en / Yes, let&apos;s talk
              </button>
              <button
                className="photo-preview-btn"
                onClick={handleRetakePhoto}
                style={styles.secondaryBtn}
              >
                Reprendre la photo / Retake Photo
              </button>
            </div>
          </div>
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
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: spacing.lg,
    background: "rgba(0,0,0,0.0)", // no dark overlay
  },
  dialogCard: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(8px)",
    borderRadius: borderRadius.lg,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    padding: spacing.lg,
    textAlign: "center",
    width: "90%",
    maxWidth: 400,
    animation: "fadeIn 0.3s ease-out",
  },
  subtitle: {
    ...typography.message,
    color: colors.navy,
    margin: 0,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    display: "flex",
    gap: spacing.sm,
    justifyContent: "center",
  },
  primaryBtn: {
    flex: 1,
    background: colors.electric,
    color: colors.textLight,
    border: "none",
    borderRadius: borderRadius.lg,
    padding: "14px 16px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(49, 104, 255, 0.3)",
  },
  secondaryBtn: {
    flex: 1,
    background: colors.paper,
    color: colors.navy,
    border: `1px solid ${colors.hairline}`,
    borderRadius: borderRadius.lg,
    padding: "14px 16px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
