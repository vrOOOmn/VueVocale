// src/App.tsx
import React from "react";
import { createBrowserRouter, RouterProvider, NavLink } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IoCamera, IoChatbubble } from "react-icons/io5";
import { colors } from "./theme";
import Scanner from "./routes/Scanner";
import Chat from "./routes/Chat";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100svh", display: "grid", gridTemplateRows: "1fr auto", background: "#fafafa" }}>
      <div>{children}</div>
      <TabBar />
    </div>
  );
}

function TabBar() {
  return (
    <nav
      aria-label="Bottom navigation"
      style={{
        background: colors.surface,
        paddingBottom: 12,
        paddingTop: 1,
        height: 73,
        borderTop: "1px solid #eee",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center"
      }}
    >
      <TabLink to="/scanner" label="Scanner" icon={<IoCamera />} />
      <TabLink to="/chat" label="Chat" icon={<IoChatbubble />} />
    </nav>
  );
}

function TabLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: "none",
        color: isActive ? colors.primary : colors.secondary,
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Sans, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        fontSize: 12,
        fontWeight: 500,
        padding: "10px 0",
      })}
    >
      <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Shell><Scanner /></Shell> },
  { path: "/scanner", element: <Shell><Scanner /></Shell> },
  { path: "/chat", element: <Shell><Chat /></Shell> },
]);

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
