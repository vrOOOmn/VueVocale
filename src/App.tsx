import React, { useState } from "react";
import { IoCamera, IoChatbubble } from "react-icons/io5";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { colors, typography } from "./theme";
import Scanner from "./routes/Scanner";
import Chat from "./routes/Chat";

const qc = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState<"scanner" | "chat">("scanner");
  const [chatContext, setChatContext] = useState<{ image?: string; label?: string }>({});


  const handleSwitchToScanner = () => {
    setChatContext({});
    setActiveTab("scanner");
  };



  return (
    <QueryClientProvider client={qc}>
      <div
        style={{
          height: "100svh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(180deg, #F6F8FF 0%, #EEF2FF 50%, #F8FAFF 100%)",
          color: colors.text,
          overflow: "auto",
        }}
      >
        {/* --- Floating Overlay Hero (only for Scanner) --- */}
        {activeTab === "scanner" && (
          <div
            style={{
              position: "relative",
              width: "90%",
              textAlign: "center",
              paddingTop: 28,
              paddingBottom: 40,
              background:
                "linear-gradient(to bottom, rgba(246,248,255,0.95), rgba(246,248,255,0.6), rgba(246,248,255,0))",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10, // spacing between logo and text
                marginBottom: 4,
              }}
            >
              <img
                src="/vuevocale.svg"
                alt="VueVocale logo"
                style={{
                  width: 70,
                  height: 70,
                  padding: 10,
                  objectFit: "contain",
                }}
              />
              <h1
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: "#3B6BF3",
                  margin: 0,
                  fontFamily: typography.header.fontFamily,
                }}
              >
                VueVocale
              </h1>
            </div>
            <p
              style={{
                fontSize: 17,
                color: "#444",
                fontStyle: "italic",
                marginTop: 4,
              }}
            >
              A conversational French learning companion
            </p>
            <p
              style={{
                fontSize: 18,
                color: "#555",
                marginTop: 10,
                maxWidth: 600,
                lineHeight: 1.6,
                marginInline: "auto",
                backgroundColor: colors.surface,
                padding: 14,
                borderRadius: 16
              }}
            >
              VueVocale helps you learn intermediate French by engaging in real conversations about the
              world around you. Capture an object, and your AI partner will start chatting
              with you naturally!
            </p>
          </div>
        )}

        {/* --- Main View --- */}
        <main
          style={{
            position: "relative",
            overflow: "auto",
            height: "100%",
            width: "100%",
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
            <Chat
              topic={chatContext.label}
              photoDataUrl={chatContext.image}
            />
          )}
        </main>

        {/* --- Navigation --- */}
        <nav
          style={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(90%, 800px)",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(16px)",
            borderRadius: 28,
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            height: 68,
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
        background: active
          ? "linear-gradient(135deg, #4F8DFD, #3369D6)"
          : "transparent",
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
      <span style={{ fontSize: 22, lineHeight: 1, marginBottom: 3 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
