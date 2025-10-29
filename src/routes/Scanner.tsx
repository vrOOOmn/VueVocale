import { useEffect, useRef, useState, useCallback } from "react";
import { IoCamera, IoRepeat, IoWarningOutline } from "react-icons/io5";
import PhotoPreviewSection from "../components/PhotoPreviewSection";
import { colors, spacing, borderRadius, typography } from "../theme";
import { supabase } from "../lib/supabaseClient";

type Facing = "environment" | "user";

export default function Scanner() {
  const [facing, setFacing] = useState<Facing>("environment");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }, []);

  const getCameraPermissionState = useCallback(async (): Promise<PermissionState | "prompt"> => {
    try {
      const result = await navigator.permissions.query({ name: "camera" as PermissionName });
      return result.state;
    } catch {
      // Safari and some mobile browsers don’t support the Permissions API
      return "prompt";
    }
  }, []);

  const startStream = useCallback(async (requestFacing: Facing = facing) => {
    cleanupStream();
    setStreamError(null);

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(d => d.kind === "videoinput");
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
          msg = "Camera permission denied. Please enable it in browser settings.";
        } else if (err.name === "NotFoundError") {
          msg = "No camera found on this device.";
        } else if (err.name === "NotReadableError") {
          msg = "Camera is currently in use by another app.";
        }
      }
      setStreamError(msg);
    }
  }, [cleanupStream, facing]);

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
        setStreamError("Camera permission denied. Please enable it in browser settings.");
        setPermissionGranted(false);
      }
    };

    initCamera();

    const handleVisibility = () => {
      if (document.hidden) {
        cleanupStream(); // stop the stream when leaving
      } else {
        // restart the camera when coming back, only if user hasn't taken a photo yet
        setTimeout(() => startStream(), 300);
      }
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

const handleTakePhoto = async () => {
  const v = videoRef.current;
  const c = canvasRef.current;
  if (!v || !c) return;

  // 1. Draw the frame
  c.width = v.videoWidth || 1080;
  c.height = v.videoHeight || 1440;
  const ctx = c.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(v, 0, 0, c.width, c.height);

  // 2. Convert to dataURL first (to test)
  const dataUrl = c.toDataURL("image/jpeg", 0.9);
  setPhotoDataUrl(dataUrl);

  // 3. Optional: Upload asynchronously (non-blocking)
  c.toBlob(async (blob) => {
    if (!blob) return;

    try {
      const fileName = `photo-${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("photos")
        .upload(fileName, blob);

      if (error) {
        console.error("Upload failed:", error.message);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      await supabase
        .from("photos")
        .insert([{ photo_url: publicData.publicUrl }]);
    } catch (err) {
      console.error("Upload error:", err);
    }
  }, "image/jpeg", 0.9);

  // 4. Stop the camera
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

  if (streamError && !permissionGranted) {
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
        <video ref={videoRef} style={styles.video} playsInline muted autoPlay controls={false}/>
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
  },
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
