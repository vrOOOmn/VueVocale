import React, { useState } from "react";
import { IoCamera, IoChatbubble } from "react-icons/io5";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { colors } from "./theme";
import Scanner from "./routes/Scanner";
import Chat from "./routes/Chat";

const qc = new QueryClient();

export default function App() {
  const [activeTab, setActiveTab] = useState<"scanner" | "chat">("scanner");

  return (
    <QueryClientProvider client={qc}>
      <div
        style={{
          minHeight: "100svh",
          display: "grid",
          gridTemplateRows: "1fr auto",
          color: colors.text,
          transition: "background 0.3s ease",
        }}
      >
        <main
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Keep both mounted */}
          <div
            style={{
              display: activeTab === "scanner" ? "block" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            <Scanner />
          </div>
          <div
            style={{
              display: activeTab === "chat" ? "block" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            <Chat />
          </div>
        </main>

        <nav
          style={{
            position: "sticky",
            bottom: 12,
            margin: "0 auto 12px auto",
            width: "90%",
            background: colors.background,
            backdropFilter: "blur(18px)",
            borderRadius: 18,
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.05)",
            height: 64,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            transition: "all 0.25s ease",
          }}
        >
          <TabButton
            icon={<IoCamera size={22} />}
            label="Scanner"
            active={activeTab === "scanner"}
            onClick={() => setActiveTab("scanner")}
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
