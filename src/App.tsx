"use client";

import React, { useEffect, useState } from "react";
import { IoCamera, IoChatbubble, IoPersonCircle } from "react-icons/io5";
import { supabase } from "./lib/supabaseClient";
import { colors } from "./theme";
import Scanner from "./routes/Scanner";
import Chat from "./routes/Chat";

export default function App() {
  const [activeTab, setActiveTab] = useState<"scanner" | "chat">("scanner");
  const [chatContext, setChatContext] = useState<{
    image?: string;
    label?: string;
  }>({});
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [signOutHover, setSignOutHover] = useState(false);

  const handleSwitchToScanner = () => {
    setChatContext({});
    setActiveTab("scanner");
  };

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!isMounted) return;
      const user = data.user;
      setUserEmail(user?.email ?? null);
      if (user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (!isMounted) return;
        setUserRole(profile?.role ?? null);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  return (
    <div
      style={{
        minHeight: "100svh", // ✅ allow page to grow and scroll
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background:
          "linear-gradient(180deg, #F6F8FF 0%, #EEF2FF 50%, #F8FAFF 100%)",
        color: colors.text,
        overflowY: activeTab === "scanner" ? "auto" : "hidden", // ✅ scroll only scanner
        WebkitOverflowScrolling: "touch",
      }}
    >
      <header
        style={{
          position: "fixed",
          top: 12,
          right: 14,
          zIndex: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            background: "rgba(255,255,255,0.8)",
            borderRadius: 16,
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          }}
        >
          <IoPersonCircle size={28} color="#2F5BD1" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {userEmail ?? "Account"}
              </span>
              {userRole === "admin" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: "linear-gradient(90deg,#0EA5E9,#3B82F6)",
                    color: "white",
                  }}
                >
                  ADMIN
                </span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              onMouseEnter={() => setSignOutHover(true)}
              onMouseLeave={() => setSignOutHover(false)}
              style={{
                border: "none",
                background: signOutHover ? "rgba(47,91,209,0.12)" : "transparent",
                color: "#2F5BD1",
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 6px",
                cursor: "pointer",
                textAlign: "left",
                borderRadius: 8,
                transition: "all 0.2s ease",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main
        style={{
          width: "100%",
          flex: 1,
          overflow: "visible",
        }}
      >
        {activeTab === "scanner" && (
          <Scanner
            onChat={(detectedWord, imageDataUrl) => {
              setChatContext({ label: detectedWord, image: imageDataUrl });
              setActiveTab("chat");
            }}
          />
        )}

        {activeTab === "chat" && (
          <Chat topic={chatContext.label} photoDataUrl={chatContext.image} />
        )}
      </main>

      {/* --- Bottom Navigation --- */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(90vw, 50em)",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          borderRadius: 28,
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          height: 68,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: 10,
          zIndex: 99,
        }}
      >
        <TabButton
          icon={<IoCamera size={22} />}
          label="Scanner"
          active={activeTab === "scanner"}
          onClick={handleSwitchToScanner}
        />
        <TabButton
          icon={<IoChatbubble size={22} />}
          label="Chat"
          active={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        />
      </nav>
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? colors.primary : "transparent",
        color: active ? "#fff" : "#3B6BF3",
        border: "none",
        borderRadius: 16,
        padding: "10px 18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: active ? "0 4px 10px rgba(74,144,226,0.3)" : "none",
        transition: "all 0.25s ease",
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1, marginBottom: 3 }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
