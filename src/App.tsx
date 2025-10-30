import React, { useEffect, useState } from "react";
import { IoCamera, IoChatbubble } from "react-icons/io5";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { colors, typography } from "./theme";
import Scanner from "./routes/Scanner";
import Chat from "./routes/Chat";

const qc = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState<"scanner" | "chat">("scanner");
  const [chatContext, setChatContext] = useState<{ image?: string; label?: string }>({});
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSwitchToScanner = () => {
    setChatContext({});
    setActiveTab("scanner");
  };

  // --- Intro splash screen ---
  if (showIntro) {
    return (
      <div
        style={{
          height: "100svh",
          display: "grid",
          placeItems: "center",
          background: colors.background,
          textAlign: "center",
          color: colors.text,
          fontFamily: typography.body.fontFamily,
        }}
      >
        <h1 style={{ color: colors.primary, fontSize: 36, marginBottom: 8 }}>
          VueVocale
        </h1>
        <p style={{ fontSize: 18, opacity: 0.7 }}>
          Talk about the world around you — <em>en français</em>.
        </p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={qc}>
      <div
        style={{
          height: "100svh",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "1fr auto",
          color: colors.text,
        }}
      >
        {/* --- Header --- */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            fontFamily: typography.header.fontFamily,
            fontWeight: 600,
            fontSize: 20,
            color: colors.primary,
            zIndex: 101,
          }}
        >
          <span>VueVocale</span>
        </header>

        {/* --- Main Area --- */}
        <main
          style={{
            position: "relative",
            overflow: "hidden",
            height: "100%",
            paddingTop: 56, // push below header
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

        {/* --- Bottom Nav --- */}
        <nav
          style={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(80%, 1000px)",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: 20,
            boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
            height: 64,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
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
    </QueryClientProvider>
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
        background: "none",
        border: "none",
        outline: "none",
        cursor: "pointer",
        color: active ? colors.primary : "#9ca3af",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        transform: active ? "scale(1.1)" : "scale(1)",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
