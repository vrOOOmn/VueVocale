import { useEffect, useRef, useState } from "react";

type AudioInput = {
  deviceId: string;
  groupId: string;
  label: string;
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function pickMimeType() {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }

  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }

  return "";
}

function formatAudioInputs(devices: MediaDeviceInfo[]) {
  return devices
    .filter((device) => device.kind === "audioinput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      groupId: device.groupId,
      label:
        device.label ||
        (device.deviceId === "default"
          ? "Default microphone"
          : device.deviceId === "communications"
          ? "Communications microphone"
          : `Microphone ${index + 1}`),
    }));
}

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioInputs, setAudioInputs] = useState<AudioInput[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshAudioInputs = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setAudioInputs(formatAudioInputs(devices));
  };

  async function start(deviceId?: string | null) {
    let stream: MediaStream;

    if (deviceId) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } else {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    const mimeType = pickMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    streamRef.current = stream;
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
    recorder.start();
    setRecording(true);

    void refreshAudioInputs();
  }

  function stop(): Promise<Blob> {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder) {
        stopStream(streamRef.current);
        streamRef.current = null;
        mediaRecorderRef.current = null;
        setRecording(false);
        return resolve(new Blob());
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType,
        });

        stopStream(streamRef.current);
        streamRef.current = null;
        mediaRecorderRef.current = null;

        resolve(blob);
      };

      recorder.stop();
      setRecording(false);
    });
  }

  useEffect(() => {
    void refreshAudioInputs();

    const handleDeviceChange = () => {
      void refreshAudioInputs();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      stopStream(streamRef.current);
      streamRef.current = null;
      mediaRecorderRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) return;

      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current?.stop();
      }

      stopStream(streamRef.current);
      streamRef.current = null;
      mediaRecorderRef.current = null;
      setRecording(false);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return { recording, start, stop, audioInputs, refreshAudioInputs };
}
