import React, { useState } from "react";
import { IoCamera, IoChatbubble } from "react-icons/io5";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { colors } from "./theme";
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
					minHeight: "100svh", // ✅ allow page to grow and scroll
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					background: "linear-gradient(180deg, #F6F8FF 0%, #EEF2FF 50%, #F8FAFF 100%)",
					color: colors.text,
					overflowY: activeTab === "scanner" ? "auto" : "hidden", // ✅ scroll only scanner
					WebkitOverflowScrolling: "touch",
				}}
			>
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

					{activeTab === "chat" && <Chat topic={chatContext.label} photoDataUrl={chatContext.image} />}
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
			<span style={{ fontSize: 22, lineHeight: 1, marginBottom: 3 }}>{icon}</span>
			<span>{label}</span>
		</button>
	);
}
