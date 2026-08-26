"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import { colors, typography, shadows } from "../theme";

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

  const rootRef = useRef<HTMLDivElement | null>(null);
  // Google's avatar CDN does not always serve these — it 403s often enough
  // that the button was rendering a broken-image glyph where the account
  // picture should be. Falling back to the initial makes a failed load
  // indistinguishable from having no picture at all.
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = !!user.avatarUrl && !avatarFailed;

  const label = user.name || user.email || "Account";
  const initial = label.charAt(0).toUpperCase();

  // Without these the only way out of the menu is the avatar button itself —
  // every other dismissal gesture a dropdown is expected to honour (tapping
  // the page behind it, Escape) did nothing. pointerdown, not click, so the
  // menu is gone before whatever was tapped behind it reacts.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => setAvatarFailed(false), [user.avatarUrl]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    // zIndex above the chat header (100): the header now paints a background
    // scrim across its full width, including the strip this avatar sits in.
    <div ref={rootRef} style={{ position: "fixed", top: 16, right: 16, zIndex: 110 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `1px solid ${colors.hairline}`,
          background: showAvatar ? "transparent" : colors.electric,
          padding: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        {showAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl!}
            alt=""
            width={40}
            height={40}
            style={{ objectFit: "cover" }}
            // Google's avatar host 403s requests that carry a Referer, which
            // is the usual reason these fail in the first place.
            referrerPolicy="no-referrer"
            onError={() => setAvatarFailed(true)}
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
            background: colors.paper,
            border: `1px solid ${colors.hairline}`,
            borderRadius: 16,
            boxShadow: shadows.overlay,
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
              color: colors.textMuted,
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
              color: colors.rouge,
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
