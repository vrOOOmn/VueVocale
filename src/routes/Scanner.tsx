"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { IoCamera, IoLocateOutline, IoRepeat, IoWarningOutline } from "react-icons/io5";
import PhotoPreviewSection from "../components/PhotoPreviewSection";
import { colors, spacing, borderRadius, typography } from "../theme";
import { createClient } from "../lib/supabase/client";
import { detectAndTranslateFR } from "../lib/vision/detectObject";
import type { AuthedUser } from "../components/UserMenu";

type Facing = "environment" | "user";

export default function Scanner({
  user,
  onChat,
}: {
  user: AuthedUser;
  onChat?: (
    detectedWord: string,
    imageDataUrl: string,
    photoStoragePath: string | null,
  ) => void;
}) {
  const [facing, setFacing] = useState<Facing>("environment");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoStoragePath, setPhotoStoragePath] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [detectedObject, setDetectedObject] = useState<string | null>(null);
  const [englishObject, setEnglishObject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoUploadFailed, setPhotoUploadFailed] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }, []);

  // Camera permission
  const getCameraPermissionState = useCallback(async (): Promise<
    PermissionState | "prompt"
  > => {
    try {
      const result = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      return result.state;
    } catch {
      return "prompt";
    }
  }, []);

  // Start stream
  const startStream = useCallback(
    async (requestFacing: Facing = facing) => {
      cleanupStream();
      setStreamError(null);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((d) => d.kind === "videoinput");
        if (!hasCamera) {
          setStreamError("No camera found on this device.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: requestFacing } },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setPermissionGranted(true);
      } catch (err) {
        setPermissionGranted(false);
        let msg = "We need your permission to access the camera.";
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError" || err.name === "SecurityError") {
            msg =
              "Camera permission denied. Please enable it in browser settings.";
          } else if (err.name === "NotFoundError") {
            msg = "No camera found on this device.";
          } else if (err.name === "NotReadableError") {
            msg = "Camera is currently in use by another app.";
          }
        }
        setStreamError(msg);
      }
    },
    [cleanupStream, facing],
  );

  // Initialize on mount
  useEffect(() => {
    if (!("mediaDevices" in navigator)) {
      setStreamError("Camera API not supported in this browser.");
      return;
    }

    let mounted = true;

    const initCamera = async () => {
      const permission = await getCameraPermissionState();
      if (!mounted) return;

      if (permission === "granted" || permission === "prompt") {
        await startStream();
      } else {
        setStreamError(
          "Camera permission denied. Please enable it in browser settings.",
        );
        setPermissionGranted(false);
      }
    };

    initCamera();

    const handleVisibility = () => {
      if (document.hidden) cleanupStream();
      else setTimeout(() => startStream(), 300);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", cleanupStream);
    window.addEventListener("beforeunload", cleanupStream);

    return () => {
      mounted = false;
      cleanupStream();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", cleanupStream);
      window.removeEventListener("beforeunload", cleanupStream);
    };
  }, [startStream, cleanupStream, getCameraPermissionState]);

  // Flip camera
  const toggleCameraFacing = async () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: next } },
        audio: false,
      });

      cleanupStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error switching camera:", err);
    }
  };

  // Capture photo
  const handleTakePhoto = async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    setDetectedObject(null);
    setPhotoStoragePath(null);
    setPhotoUploadFailed(false);
    setIsLoading(true);

    c.width = v.videoWidth || 1080;
    c.height = v.videoHeight || 1440;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    let detected = false;
    try {
      const base64Image = dataUrl.split(",")[1];

      const { english, french } = await detectAndTranslateFR(base64Image);

      if (!french) {
        // Nothing recognizable in the frame — treat like any other
        // detection failure rather than showing a photo with no label and
        // no way to retake it.
        throw new Error("No object recognized in photo");
      }

      setEnglishObject(english);
      setDetectedObject(french);
      setPhotoDataUrl(dataUrl);
      detected = true;
    } catch (err) {
      console.error("Vision scan error:", err);
      setStreamError("Erreur: échec de la détection de l'objet.");
    } finally {
      setIsLoading(false);
      if (detected) {
        cleanupStream();
      } else {
        // Resume the live camera instead of leaving a stopped stream with
        // no photo and no controls to retry.
        await startStream();
      }
    }

    if (!detected) return;

    // Persist the captured photo to Storage so it survives reload and can be
    // referenced from the message that gets created once the user confirms.
    c.toBlob(
      async (blob) => {
        if (!blob) {
          setPhotoUploadFailed(true);
          return;
        }
        try {
          const path = `${user.id}/${crypto.randomUUID()}.jpg`;
          const supabase = createClient();
          const { error } = await supabase.storage
            .from("scan-photos")
            .upload(path, blob, { contentType: "image/jpeg" });
          if (error) {
            console.error("Photo upload failed:", error.message);
            setPhotoUploadFailed(true);
            return;
          }
          setPhotoStoragePath(path);
        } catch (err) {
          console.error("Photo upload error:", err);
          setPhotoUploadFailed(true);
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleRetakePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoStoragePath(null);
    setPhotoUploadFailed(false);
    startStream();
  };

  if (streamError && !permissionGranted) {
    return (
      <div style={styles.permissionContainer}>
        <IoWarningOutline size={32} color={colors.navy} />
        <p style={styles.permissionText}>{streamError}</p>
        <button style={styles.permissionButton} onClick={() => startStream()}>
          Grant Permission
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={styles.loadingScreen} role="status" aria-live="polite">
        <div className="spin-loader" style={{ marginBottom: spacing.md }} />
        <p style={{ ...typography.body, margin: 0, fontSize: "2.2rem" }}>
          <em>Analyse et traduction de l’image…</em>
        </p>
        <p style={{ opacity: 0.7, fontSize: "1.6rem" }}>
          <em>Analyzing and translating image…</em>
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Fixed like UserMenu's top-right avatar, so the brand mark stays
          put instead of scrolling away with the page on tall content. */}
      <div style={styles.brandMark}>
        <Image src="/vuevocale.svg" alt="VueVocale logo" width={32} height={32} style={styles.logo} />
        <span style={styles.brandTitle}>VueVocale</span>
      </div>

      <div className="scan-intro" style={styles.introCard}>
        <div style={styles.introIconChip}>
          <IoLocateOutline size={22} color={colors.electric} />
        </div>
        <div style={{ minWidth: 0 }}>
          <span style={styles.introEyebrow}>Mode scanner</span>
          <h2 style={styles.introTitle}>Find something to talk about.</h2>
          <p style={styles.introSubtitle}>
            Point your camera at an object. VueVocale finds the French word
            and starts a conversation about it.
          </p>
        </div>
      </div>

      {photoDataUrl ? (
        <PhotoPreviewSection
          photoDataUrl={photoDataUrl}
          handleRetakePhoto={handleRetakePhoto}
          detectedLabel={detectedObject}
          englishLabel={englishObject}
          uploadFailed={photoUploadFailed}
          onChat={() => {
            if (onChat && detectedObject && photoDataUrl) {
              onChat(detectedObject, photoDataUrl, photoStoragePath);
            }
          }}
        />
      ) : (
        <div className="scan-frame" style={styles.cameraBox}>
          <video
            ref={videoRef}
            style={styles.video}
            playsInline
            muted
            autoPlay
            controls={false}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={styles.controls}>
            <button
              className="round-btn"
              style={styles.roundBtnSecondary}
              onClick={toggleCameraFacing}
              aria-label="Changer de caméra"
            >
              <IoRepeat size={24} color={colors.textLight} />
            </button>
            <button
              className="round-btn"
              style={styles.roundBtnPrimary}
              onClick={handleTakePhoto}
              aria-label="Prendre une photo"
            >
              <IoCamera size={28} color={colors.textLight} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 16,
    paddingRight: 16,
    // Clears the fixed brandMark (top:16 + ~32px tall) above it, same idea
    // as Chat's header clearance on .chat-messages.
    paddingTop: 72,
    // The bottom nav is position:fixed (68px tall + 10px bottom margin) and
    // floats over whatever's scrolled beneath it — without this clearance
    // the camera box's bottom edge (and its capture button) ends up
    // permanently hidden under the nav once the camera is large enough to
    // reach the bottom of the viewport, which happens routinely on desktop.
    paddingBottom: 110,
    gap: "24px",
    background: "transparent",
  },
  brandMark: {
    position: "fixed" as const,
    top: 16,
    left: 16,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: 700,
    color: colors.navy,
  },
  introCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    background: colors.paper,
    border: `1px solid ${colors.hairline}`,
    borderRadius: borderRadius.xl,
    padding: "22px 22px",
  },
  introIconChip: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: borderRadius.md,
    background: "rgba(49, 104, 255, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  introEyebrow: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: colors.brass,
    marginBottom: 4,
  },
  introTitle: {
    fontSize: "clamp(1.15rem, 4.4vw, 1.4rem)",
    fontWeight: 700,
    color: colors.navy,
    margin: 0,
  },
  introSubtitle: {
    fontSize: "clamp(0.9rem, 3.6vw, 1rem)",
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 1.55,
  },
  cameraBox: {
    // Width comes from the .scan-frame class (shared with
    // PhotoPreviewSection, shrinks on desktop) — not set here, since an
    // inline style would silently win over the class's media query.
    position: "relative" as const,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    aspectRatio: "3 / 4",
    flexShrink: 0,
    marginBottom: spacing.xxl,
    background: "#EAF8FF",
    border: "1px solid #BDEBFF",
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
    bottom: spacing.md,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "calc(100% - 40px)",
    maxWidth: 360, // keeps button spacing tidy on large screens
    paddingInline: spacing.md,
    zIndex: 2,
  },

  roundBtnSecondary: {
    padding: "clamp(8px, 3vw, 12px)", // responsive size
    borderRadius: borderRadius.round,
    background: colors.navy,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease",
  },

  roundBtnPrimary: {
    padding: "clamp(14px, 4vw, 18px)",
    borderRadius: borderRadius.round,
    background: colors.electric,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease",
  },

  loadingScreen: {
    height: "100svh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: colors.navy,
    paddingRight: spacing.lg,
    paddingLeft: spacing.lg,
    textAlign: "center" as const,
    fontFamily: typography.body.fontFamily,
  },
  permissionContainer: {
    minHeight: "calc(100svh - 73px)",
    display: "grid",
    placeItems: "center",
    padding: spacing.xl,
    textAlign: "center" as const,
    gap: spacing.md,
  },
  permissionText: { ...typography.body, color: colors.navy, margin: 0 },
  permissionButton: {
    background: colors.electric,
    color: colors.textLight,
    border: "none",
    borderRadius: borderRadius.md,
    padding: "10px 16px",
    cursor: "pointer",
  },
};
