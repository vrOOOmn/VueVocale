"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { colors, typography } from "../theme";

export type AuthedUser = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export default function UserMenu({ user }: { user: AuthedUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const label = user.name || user.email || "Account";
  const initial = label.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `1px solid ${colors.borderSubtle}`,
          background: user.avatarUrl ? "transparent" : colors.primary,
          padding: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            width={40}
            height={40}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            minWidth: 200,
            background: colors.surface,
            borderRadius: 16,
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: typography.body.fontFamily,
              fontSize: 13,
              color: colors.textSubtle,
              padding: "0 4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </span>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              fontFamily: typography.body.fontFamily,
              fontSize: 14,
              fontWeight: 600,
              color: colors.error,
              cursor: signingOut ? "wait" : "pointer",
            }}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
