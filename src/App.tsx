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
    <div style={styles.shellContainer}>
      <div>{children}</div>
      <TabBar />
    </div>
  );
}

function TabBar() {
  return (
    <nav aria-label="Bottom navigation" style={styles.tabBar}>
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
        ...styles.tabLink,
        color: isActive ? colors.primary : colors.secondary,
      })}
    >
      <span style={styles.tabIcon}>{icon}</span>
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

const styles = {
  shellContainer: {
    minHeight: "100svh",
    display: "grid",
    gridTemplateRows: "1fr auto",
    background: "#fafafa",
  },
  tabBar: {
    background: colors.surface,
    paddingBottom: 12,
    paddingTop: 1,
    height: 73,
    borderTop: "1px solid #eee",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
  },
  tabLink: {
    textDecoration: "none",
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "DM Sans, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontSize: 12,
    fontWeight: 500,
    padding: "10px 0",
  },
  tabIcon: {
    fontSize: 20,
    lineHeight: 1,
  },
};
