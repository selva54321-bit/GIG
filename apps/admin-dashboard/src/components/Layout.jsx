import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { s } from "../theme/theme";

export default function Layout({ children }) {
  return (
    <div style={s.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #060D1F; } ::-webkit-scrollbar-thumb { background: #1E3A6E; border-radius: 4px; }
      button:hover { opacity: 0.9; } input:focus { border-color: #FF6B35 !important; }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
      <Sidebar />
      <div style={s.main}>
        <Topbar />
        {children}
      </div>
    </div>
  );
}
