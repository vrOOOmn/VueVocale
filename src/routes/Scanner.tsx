// src/routes/Scanner.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { IoCamera, IoRepeat, IoWarningOutline } from "react-icons/io5";
import PhotoPreviewSection from "../components/PhotoPreviewSection";
import { colors, spacing, borderRadius, typography } from "../theme";

type Facing = "environment" | "user";

export default function Scanner() {
  const [facing, setFacing] = useState<Facing>("environment");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleStreamError = useCallback((err: unknown) => {
    let msg = "We need your permission to show the camera";
    if (err && typeof err === "object" && "name" in err) {
      switch ((err as DOMException).name) {
        case "NotFoundError":
          msg = "No camera found on this device.";
          break;
        case "NotReadableError":
          msg = "The camera is in use by another app.";
          break;
      }
    }
    setStreamError(msg);
  }, []);

  const startStream = useCallback(
    async (requestFacing: Facing = facing) => {
      cleanupStream();
      setStreamError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: requestFacing } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        handleStreamError(err);
      }
    },
    [cleanupStream, facing, handleStreamError]
  );

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStreamError("Camera API not supported in this browser.");
      return;
    }
    startStream();
    return cleanupStream;
  }, [startStream, cleanupStream]);

  const toggleCameraFacing = async () => {
    const nextFacing = facing === "environment" ? "user" : "environment";
    setFacing(nextFacing);
    await startStream(nextFacing);
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1440;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.95));
    video.pause();
    cleanupStream();
  };

  const handleRetakePhoto = () => {
    setPhotoDataUrl(null);
    startStream();
  };

  if (photoDataUrl) {
    return (
      <PhotoPreviewSection
        photoDataUrl={photoDataUrl}
        handleRetakePhoto={handleRetakePhoto}
      />
    );
  }

  if (streamError) {
    return (
      <div style={styles.permissionContainer}>
        <IoWarningOutline size={32} color={colors.secondary} />
        <p style={styles.permissionText}>{streamError}</p>
        <button style={styles.permissionButton} onClick={() => startStream()}>
          Grant Permission
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.cameraBox}>
        <video ref={videoRef} style={styles.video} playsInline muted autoPlay />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div style={styles.controls}>
          <button
            style={styles.roundBtnSecondary}
            onClick={toggleCameraFacing}
            aria-label="Switch camera"
          >
            <IoRepeat size={24} color={colors.textLight} />
          </button>
          <button
            style={styles.roundBtnPrimary}
            onClick={handleTakePhoto}
            aria-label="Take photo"
          >
            <IoCamera size={28} color={colors.textLight} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100svh - 73px)",
    background: colors.background,
    padding: spacing.md,
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
  } as React.CSSProperties,
  cameraBox: {
    width: "100%",
    maxWidth: 480,
    aspectRatio: "3 / 4",
    position: "relative" as const,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    display: "block",
    background: "#000",
  },
  controls: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: spacing.md,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingInline: spacing.lg,
  },
  roundBtnSecondary: {
    padding: spacing.md,
    borderRadius: borderRadius.round,
    background: colors.secondary,
    border: "none",
  },
  roundBtnPrimary: {
    padding: spacing.lg,
    borderRadius: borderRadius.round,
    background: colors.primary,
    border: "none",
  },
  permissionContainer: {
    minHeight: "calc(100svh - 73px)",
    background: colors.background,
    display: "grid",
    placeItems: "center",
    padding: spacing.xl,
    textAlign: "center" as const,
    gap: spacing.md,
  },
  permissionText: {
    ...typography.body,
    color: colors.text,
    margin: 0,
  },
  permissionButton: {
    background: colors.primary,
    color: colors.textLight,
    border: "none",
    borderRadius: borderRadius.md,
    padding: "10px 16px",
    cursor: "pointer",
  },
};
