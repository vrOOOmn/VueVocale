"use client";

import React, { useState } from "react";
import { IoCamera, IoChatbubble } from "react-icons/io5";
import { colors } from "./theme";
import Scanner from "./routes/Scanner";
import Chat from "./routes/Chat";
import UserMenu, { type AuthedUser } from "./components/UserMenu";

export default function App({ user }: { user: AuthedUser }) {
  const [activeTab, setActiveTab] = useState<"scanner" | "chat">("scanner");
  const [chatContext, setChatContext] = useState<{
    image?: string;
    label?: string;
    storagePath?: string | null;
  }>({});

  const handleSwitchToScanner = () => {
    setChatContext({});
    setActiveTab("scanner");
  };

  const handleTabListKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = activeTab === "scanner" ? "chat" : "scanner";
    if (next === "scanner") handleSwitchToScanner();
    else setActiveTab("chat");
    requestAnimationFrame(() => {
      document.getElementById(`tab-${next}`)?.focus();
    });
  };

  return (
    <>
      <UserMenu user={user} />
      <div
        style={{
          // height, not minHeight: Chat's internal .chat-messages scroll
          // container only actually scrolls if this ancestor's height is
          // capped rather than a floor — a minHeight lets the box keep
          // growing to fit content instead, which silently turns off every
          // percentage/flex height below it (including Chat's height:100%),
          // collapsing the "internal scroll" story into "nothing scrolls."
          // Scanner still gets the same visual result on its own overflow.
          height: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: colors.ivory,
          color: colors.navy,
          overflowY: activeTab === "scanner" ? "auto" : "hidden", // ✅ scroll only scanner
          WebkitOverflowScrolling: "touch",
        }}
      >
        <main
          style={{
            width: "100%",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "visible",
          }}
        >
          {/* These wrappers exist only for the ARIA tabpanel relationship —
              they must pass the parent's height straight through (flex:1,
              minHeight:0, full flex column) or Chat's internal height:100%
              scroll container collapses to content height instead of the
              viewport, breaking its fixed header/input positioning and
              auto-scroll. */}
          <div
            role="tabpanel"
            id="panel-scanner"
            aria-labelledby="tab-scanner"
            hidden={activeTab !== "scanner"}
            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
          >
            {activeTab === "scanner" && (
              <Scanner
                user={user}
                onChat={(detectedWord, imageDataUrl, storagePath) => {
                  setChatContext({ label: detectedWord, image: imageDataUrl, storagePath });
                  setActiveTab("chat");
                }}
              />
            )}
          </div>

          <div
            role="tabpanel"
            id="panel-chat"
            aria-labelledby="tab-chat"
            hidden={activeTab !== "chat"}
            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
          >
            {activeTab === "chat" && (
              <Chat
                topic={chatContext.label}
                photoDataUrl={chatContext.image}
                photoStoragePath={chatContext.storagePath}
                user={user}
              />
            )}
          </div>
        </main>

        {/* --- Bottom Navigation --- */}
        <nav
          role="tablist"
          aria-label="Navigation principale"
          onKeyDown={handleTabListKeyDown}
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(90vw, 50em)",
            background: "rgba(255, 253, 249, 0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: 28,
            boxShadow: "0 6px 20px rgba(17, 27, 63, 0.08)",
            height: 68,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: 10,
            zIndex: 99,
          }}
        >
          <TabButton
            id="tab-scanner"
            controls="panel-scanner"
            icon={<IoCamera size={22} />}
            label="Scanner"
            active={activeTab === "scanner"}
            onClick={handleSwitchToScanner}
          />
          <TabButton
            id="tab-chat"
            controls="panel-chat"
            icon={<IoChatbubble size={22} />}
            label="Chat"
            active={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
          />
        </nav>
      </div>
    </>
  );
}

function TabButton({
  id,
  controls,
  icon,
  label,
  active,
  onClick,
}: {
  id: string;
  controls: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      style={{
        background: active ? colors.electric : "transparent",
        color: active ? colors.textLight : colors.electric,
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
        boxShadow: active ? "0 4px 10px rgba(49, 104, 255, 0.3)" : "none",
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
