import { useRef, useState } from "react";
import { generateTTS } from "./generateTTS";
import { updateMessage, uploadChatAudio, type Message } from "../data/conversations";

type AudioLocalState = { url?: string; state: "idle" | "loading" | "ready" | "error" };

export function useMessageAudioPlayback(userId: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioById, setAudioById] = useState<Record<string, AudioLocalState>>({});

  const stopAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setPlayingId(null);
  };

  const playUrl = (id: string, url: string) => {
    const a = audioRef.current ?? new Audio();
    audioRef.current = a;
    a.pause();
    a.src = url;
    a.currentTime = 0;
    a.onended = () => setPlayingId(null);
    a.onerror = () => setPlayingId(null);
    a.play()
      .then(() => setPlayingId(id))
      .catch(() => setPlayingId(null));
  };

  const togglePlay = async (msg: Message) => {
    if (playingId && playingId !== msg.id) stopAudio();

    if (playingId === msg.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    const currentState = audioById[msg.id]?.state ?? msg.audioState ?? "idle";
    if (currentState === "loading") return;

    const existingUrl = audioById[msg.id]?.url ?? msg.audioUrl;
    if (existingUrl) {
      playUrl(msg.id, existingUrl);
      return;
    }

    if (!msg.text) return;

    setAudioById((prev) => ({ ...prev, [msg.id]: { state: "loading" } }));

    try {
      const { url, blob } = await generateTTS(msg.text);
      setAudioById((prev) => ({ ...prev, [msg.id]: { url, state: "ready" } }));
      playUrl(msg.id, url);

      // Fire-and-forget: cache the generated audio so it's never regenerated.
      uploadChatAudio(userId, msg.id, blob)
        .then((path) => updateMessage(msg.id, { audio_path: path }))
        .catch((err) => console.error("Failed to persist TTS audio", err));
    } catch {
      setAudioById((prev) => ({ ...prev, [msg.id]: { state: "error" } }));
    }
  };

  const mergeAudioState = (messages: Message[]): Message[] =>
    messages.map((m) => {
      const local = audioById[m.id];
      if (!local) return m;
      return { ...m, audioUrl: local.url ?? m.audioUrl, audioState: local.state };
    });

  return { playingId, togglePlay, mergeAudioState, stopAudio };
}
