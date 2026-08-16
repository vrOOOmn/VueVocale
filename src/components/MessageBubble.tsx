import React from "react";
import {
  IoVolumeHighSharp,
  IoVolumeMute,
  IoEllipsisHorizontal,
  IoWarningOutline,
} from "react-icons/io5";
import { colors, borderRadius, typography } from "../theme";
import type { Message } from "../lib/data/conversations";

type Props = {
  message: Message;
  mode: "live" | "readonly";
  isPlaying: boolean;
  onTogglePlay: (m: Message) => void;
  onFixGrammar?: (m: Message) => void;
};

export default function MessageBubble({
  message: m,
  mode,
  isPlaying,
  onTogglePlay,
  onFixGrammar,
}: Props) {
  const showGrammarTrigger =
    mode === "live" &&
    m.sender === "user" &&
    m.text &&
    (m.grammarStatus === "idle" || m.grammarStatus === "error");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: m.sender === "user" ? "flex-end" : "flex-start",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: m.image ? "min(280px, 70%)" : "75%",
          display: "flex",
          flexDirection: "column",
          alignItems: m.sender === "user" ? "flex-end" : "flex-start",
        }}
      >
      <div
        style={{
          padding: m.image ? 0 : "10px 14px",
          background: m.image
            ? "transparent"
            : m.sender === "user"
            ? colors.electric
            : "#F4F0FF",
          border: m.image || m.sender === "user" ? "none" : "1px solid #D8D0FF",
          borderRadius: borderRadius.lg,
          width: "100%",
        }}
      >
        {m.image ? (
          // Plain <img>, deliberately not next/image: this is either a
          // freshly-captured data: URL or a signed Supabase Storage URL, and
          // the storage host isn't in next.config's image remotePatterns, so
          // next/image would just fail to load it as-is.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.image}
            alt="user upload"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: borderRadius.lg,
              display: "block",
            }}
          />
        ) : (
          <>
            <p
              style={{
                ...typography.message,
                margin: 0,
                color: m.sender === "user" ? colors.textLight : colors.navy,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.text}
            </p>

            {m.sender === "user" && m.text && (
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                {showGrammarTrigger && (
                  <button
                    onClick={() => onFixGrammar?.(m)}
                    style={{
                      alignSelf: "flex-start",
                      fontSize: 12,
                      background: "transparent",
                      // Literal white, not a token — this sits on the electric
                      // user bubble, not the page background.
                      border: "1px solid rgba(255,255,255,0.4)",
                      color: "white",
                      borderRadius: 12,
                      padding: "2px 8px",
                      cursor: "pointer",
                    }}
                  >
                    {m.grammarStatus === "error" ? "Réessayer" : "Corriger la grammaire"}
                  </button>
                )}

                {mode === "live" && m.grammarStatus === "loading" && (
                  <span style={{ fontSize: 12, color: "white", opacity: 0.7 }}>
                    Vérification…
                  </span>
                )}

                {m.grammarStatus === "error" && (
                  // Rouge lightened for contrast on the electric bubble, not a
                  // missing token.
                  <span style={{ fontSize: 11.5, color: "#FFD9D6" }}>
                    Échec de la vérification.
                  </span>
                )}
              </div>
            )}

            {m.sender === "bot" && (
              <div style={{ marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => onTogglePlay(m)}
                  disabled={m.audioState === "loading"}
                  aria-label={
                    m.audioState === "loading"
                      ? "Chargement de l'audio / Loading audio"
                      : m.audioState === "error"
                      ? "Erreur audio / Audio error"
                      : isPlaying
                      ? "Mettre en pause / Pause"
                      : "Écouter / Listen"
                  }
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: "50%",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: m.audioState === "loading" ? "default" : "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    background:
                      m.audioState === "error"
                        ? colors.rouge
                        : isPlaying
                        ? colors.hairline
                        : colors.navy,
                    opacity: m.audioState === "loading" ? 0.8 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {m.audioState === "loading" ? (
                      <IoEllipsisHorizontal style={{ fontSize: 18 }} color="white" />
                    ) : m.audioState === "error" ? (
                      <IoWarningOutline style={{ fontSize: 18 }} color="white" />
                    ) : isPlaying ? (
                      <IoVolumeMute style={{ fontSize: 18 }} color="white" />
                    ) : (
                      <IoVolumeHighSharp style={{ fontSize: 18 }} color="white" />
                    )}
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {m.grammarStatus === "fixed" && m.grammarFix && (
        // Rouge only corrects — this is the one element on screen that
        // actually is a correction, so it's the one place rouge shows up.
        <div
          style={{
            marginTop: 6,
            padding: "10px 14px",
            borderRadius: borderRadius.md,
            background: "rgba(185, 74, 72, 0.08)",
            border: `1px solid ${colors.rouge}`,
            fontSize: 13,
            color: colors.rouge,
            fontWeight: 600,
          }}
        >
          ➡ {m.grammarFix}
        </div>
      )}

      {m.grammarStatus === "ok" && (
        // Same shape as the correction card above — green instead of rouge,
        // since nothing needed fixing.
        <div
          style={{
            marginTop: 6,
            padding: "10px 14px",
            borderRadius: borderRadius.md,
            background: "rgba(30, 167, 131, 0.08)",
            border: `1px solid ${colors.mint}`,
            fontSize: 13,
            color: colors.mint,
            fontWeight: 600,
          }}
        >
          ✓ Bien !
        </div>
      )}
      </div>
    </div>
  );
}
