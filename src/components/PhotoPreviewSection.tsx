// src/components/PhotoPreviewSection.tsx
import React from "react";
import { IoTrash } from "react-icons/io5";
import { colors, spacing, borderRadius } from "../theme";

export default function PhotoPreviewSection({
  photoDataUrl,
  handleRetakePhoto,
}: {
  photoDataUrl: string; // data URL captured from canvas
  handleRetakePhoto: () => void;
}) {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <img
          src={photoDataUrl}
          alt="Camera preview"
          style={styles.preview}
        />
      </div>

      <div style={styles.buttonRow}>
        <button onClick={handleRetakePhoto} style={styles.roundBtn} aria-label="Discard photo">
          <IoTrash size={24} color={colors.error} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100svh - 73px)",
    background: colors.background,
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    padding: spacing.md,
    gap: spacing.lg,
  } as React.CSSProperties,
  box: {
    width: "100%",
    maxWidth: 480,
    aspectRatio: "3 / 4",
    borderRadius: borderRadius.lg,
    background: colors.surface,
    padding: spacing.sm,
    border: `1px solid ${colors.border}`,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    borderRadius: borderRadius.md,
    display: "block",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: spacing.md,
  },
  roundBtn: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.round,
    padding: spacing.md,
    cursor: "pointer",
  },
};
