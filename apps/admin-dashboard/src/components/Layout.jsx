import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { s, COLORS } from "../theme/theme";

export default function Layout({ children }) {
  return (
    <div style={s.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 6px; } ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      button:hover { opacity: 0.9; transform: translateY(-1px); } input:focus { border-color: ${COLORS.accent} !important; box-shadow: 0 0 0 3px ${COLORS.accent}20; }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <Topbar />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
