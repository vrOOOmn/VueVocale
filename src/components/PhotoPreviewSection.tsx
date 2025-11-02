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
        <img
          src={photoDataUrl}
          alt="Camera preview"
          style={styles.preview}
        />

        {/* Detection Dialogue */}
        {detectedLabel && (
          <div style={styles.dialogOverlay}>
            <div style={styles.dialogCard}>
              <p style={styles.title}>
                Objet détecté: <strong>{detectedLabel} / {englishLabel} </strong> 
              </p>
              <p style={styles.subtitle}>
                Souhaitez-vous en parler en français ? / Do you want to talk about it in French?
              </p>
              <div style={styles.buttonRow}>
                <button onClick={onChat} style={styles.primaryBtn}>
                  Oui, parlons-en / Yes, let's talk
                </button>
                <button onClick={handleRetakePhoto} style={styles.secondaryBtn}>
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
    width: "min(85vw, 400px)",
    maxHeight: "70vh",
    position: "relative" as const,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    aspectRatio: "3 / 4",
    border: '4px solid ' + '#000',
    flexShrink: 0,
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
    background: "#000",
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
  title: {
    ...typography.body,
    color: colors.text,
    margin: 0,
  },
  subtitle: {
    ...typography.message,
    color: colors.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    display: "flex",
    gap: spacing.sm,
    justifyContent: "center",
  },
  primaryBtn: {
    flex: 1,
    background: colors.primary,
    color: colors.textLight,
    border: "none",
    borderRadius: borderRadius.md,
    padding: "12px 16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.3s ease",
  },
  secondaryBtn: {
    flex: 1,
    background: "transparent",
    color: colors.primary,
    border: `1.5px solid ${colors.primary}`,
    borderRadius: borderRadius.md,
    padding: "12px 16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.3s ease",
  },
};
