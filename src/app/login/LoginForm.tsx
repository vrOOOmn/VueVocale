"use client";

import { useState } from "react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { createClient } from "../../lib/supabase/client";
import { colors, typography } from "../../theme";

export default function LoginForm({
  next,
  error,
}: {
  next?: string;
  error?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (signInError) {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: colors.ivory,
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(400px, 100%)",
          background: colors.paper,
          borderRadius: 32,
          padding: "40px 32px",
          boxShadow: "0 20px 50px rgba(17, 27, 63, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Image src="/vuevocale.svg" alt="" width={44} height={44} />
        <h1
          style={{
            fontFamily: typography.header.fontFamily,
            fontWeight: 700,
            fontSize: 24,
            color: colors.navy,
            margin: "18px 0 6px",
          }}
        >
          Welcome to VueVocale
        </h1>
        <p
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: 15,
            color: colors.textMuted,
            margin: "0 0 28px",
            lineHeight: 1.5,
          }}
        >
          Sign in to start practicing spoken French.
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            padding: "13px 16px",
            borderRadius: 14,
            border: `1px solid ${colors.hairline}`,
            background: "#fff",
            fontFamily: typography.button.fontFamily,
            fontSize: 15,
            fontWeight: 600,
            color: colors.navy,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          <FcGoogle size={20} />
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        {error && (
          <p
            style={{
              marginTop: 16,
              fontSize: 13.5,
              color: colors.rouge,
              fontFamily: typography.body.fontFamily,
            }}
          >
            Something went wrong signing you in. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
