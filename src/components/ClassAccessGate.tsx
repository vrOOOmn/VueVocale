"use client";

import React, { useEffect, useState } from "react";
import { colors, typography } from "../theme";
import {
  clearClassAccessGrant,
  markClassAccessGrant,
  readClassAccessGrant,
} from "../lib/classAccess";

const CLASS_ACCESS_ENDPOINT = "/api/class-access";

type GateStatus = "idle" | "checking" | "verifying" | "error";

export default function ClassAccessGate({
  onAuthorized,
}: {
  onAuthorized: () => void;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<GateStatus>("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (readClassAccessGrant()) {
      onAuthorized();
      return () => {
        cancelled = true;
      };
    }

    const verify = async () => {
      setStatus("checking");
      try {
        const res = await fetch(CLASS_ACCESS_ENDPOINT, {
          method: "GET",
          credentials: "include",
        });
        if (cancelled) return;
        if (res.ok) {
          markClassAccessGrant();
          onAuthorized();
          return;
        }

        if (res.status === 401) {
          clearClassAccessGrant();
        }

        setStatus("idle");
      } catch (error) {
        if (!cancelled) {
          setStatus("idle");
          setMessage("Unable to verify access right now. Please try again.");
        }
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [onAuthorized]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) {
      setMessage("Please enter the class code.");
      setStatus("error");
      return;
    }

    setMessage(null);
    setStatus("verifying");

    try {
      const res = await fetch(CLASS_ACCESS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      if (res.ok) {
        markClassAccessGrant();
        onAuthorized();
        return;
      }

      const errorMessage = (await res.text().catch(() => "")) || "Incorrect class code.";
      setMessage(errorMessage);
      setStatus("error");
      clearClassAccessGrant();
    } catch (error) {
      console.error("Class access error", error);
      setMessage("Unable to reach the server. Try again in a moment.");
      setStatus("error");
      clearClassAccessGrant();
    }
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.background,
        padding: 40,
      }}
    >
      <div
        style={{
          width: "min(540px, 90vw)",
          padding: 32,
          borderRadius: 32,
          background: colors.surface,
          display: "flex",
          flexDirection: "column",
        }}
      >

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <label
            style={{
              margin: 0,
              fontSize: typography.header.fontSize - 1,
              fontWeight: typography.header.fontWeight,
              fontFamily: typography.header.fontFamily,
              color: colors.text,
            }}
          >
            Class Code
          </label>
          <input
            aria-label="Class code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            style={{
              padding: "10px 10px",
              fontSize: typography.body.fontSize,
              fontFamily: typography.body.fontFamily,
              borderRadius: 12,
              border: `1px solid rgba(148, 163, 184, 0.6)`,
              width: "100%",
              outline: "none",
              transition: "border 0.2s ease, box-shadow 0.2s ease",
              background: colors.surface,
            }}
            disabled={status === "checking" || status === "verifying"}
            autoFocus
          />
          <button
            type="submit"
            disabled={status === "checking" || status === "verifying"}
            style={{
              padding: "10px 7px",
              fontSize: typography.button.fontSize,
              fontFamily: typography.button.fontFamily,
              fontWeight: 600,
              borderRadius: 15,
              border: "none",
              background: colors.primary,
              color: "#fff",
              cursor: status === "checking" || status === "verifying" ? "wait" : "pointer",
              boxShadow:
                status === "verifying"
                  ? "0 18px 36px rgba(74, 144, 226, 0.3)"
                  : "0 8px 24px rgba(74, 144, 226, 0.25)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {status === "verifying" ? "Verifying…" : "Submit"}
          </button>
        </form>

        <div style={{ minHeight: 0 }} aria-live="polite">
          {status === "checking" && (
            <p
              style={{
                margin: 0,
                fontSize: typography.body.fontSize,
                color: colors.textMuted,
                fontFamily: typography.body.fontFamily,
              }}
            >
              Checking existing access…
            </p>
          )}
          {message && (
            <p
              style={{
                margin: "10px 0px 0px 5px",
                fontSize: typography.body.fontSize,
                color: colors.error,
                fontFamily: typography.body.fontFamily,
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
