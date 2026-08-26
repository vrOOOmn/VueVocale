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

// "default" and "communications" are aliases the spec requires the browser to
// synthesise for the system-selected device — they are not extra hardware.
// Chrome duplicates every default input this way, which is why a Mac with
// AirPods connected listed "Default - AirPods (Bluetooth)" and "AirPods
// (Bluetooth)" as if they were two microphones.
const ALIAS_DEVICE_IDS = new Set(["default", "communications"]);

function formatAudioInputs(devices: MediaDeviceInfo[]): {
  inputs: AudioInput[];
  defaultLabel: string | null;
} {
  const audioInputs = devices.filter((device) => device.kind === "audioinput");

  const real = audioInputs.filter(
    (device) => !ALIAS_DEVICE_IDS.has(device.deviceId),
  );

  const inputs = real.map((device, index) => ({
    deviceId: device.deviceId,
    groupId: device.groupId,
    label: device.label || `Microphone ${index + 1}`,
  }));

  // Which real device the system default currently points at. Resolved
  // through groupId rather than by parsing the alias's label, because
  // groupId is the spec's own "these are the same physical device" signal.
  const defaultAlias = audioInputs.find((device) => device.deviceId === "default");
  const resolved = defaultAlias
    ? inputs.find((input) => input.groupId === defaultAlias.groupId)
    : undefined;

  return {
    inputs,
    defaultLabel:
      resolved?.label ??
      // Fall back to the alias's own label, minus the "Default - " prefix
      // the spec tells the browser to prepend.
      defaultAlias?.label.replace(/^Default\s*-\s*/i, "") ??
      null,
  };
}

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioInputs, setAudioInputs] = useState<AudioInput[]>([]);
  // Label of the microphone the system default currently resolves to, so the
  // "Browser default" row can say where it actually goes.
  const [defaultInputLabel, setDefaultInputLabel] = useState<string | null>(null);
  // The device that actually opened, per the track itself — not the one we
  // asked for. Chat reconciles its selection against this.
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  // Set when an explicitly chosen device could not be opened and the system
  // default was used instead.
  const [deviceFallback, setDeviceFallback] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const refreshAudioInputs = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const { inputs, defaultLabel } = formatAudioInputs(devices);
    setAudioInputs(inputs);
    setDefaultInputLabel(defaultLabel);
  };

  async function start(deviceId?: string | null) {
    let stream: MediaStream;

    if (deviceId) {
      try {
        // exact, deliberately: an explicit picker should fail loudly rather
        // than let the browser quietly substitute a different microphone,
        // which is what an `ideal` constraint would do.
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
        });
        setDeviceFallback(null);
      } catch (err) {
        // The previous version swallowed this and opened the system default
        // instead, so a selection that had silently failed looked identical
        // to one that worked. On a Mac with AirPods connected that is exactly
        // what happened: picking the built-in mic threw, and the recording
        // came off the AirPods while the menu still showed "MacBook Pro
        // Microphone" as chosen.
        setDeviceFallback(err instanceof Error ? err.name : "Error");
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } else {
      setDeviceFallback(null);
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    // getSettings() reports what the track is actually sourced from,
    // including platform defaults nobody asked for — getConstraints() would
    // only echo our own request back at us.
    setActiveDeviceId(stream.getAudioTracks()[0]?.getSettings().deviceId ?? null);

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

  return {
    recording,
    start,
    stop,
    audioInputs,
    defaultInputLabel,
    activeDeviceId,
    deviceFallback,
    refreshAudioInputs,
  };
}
