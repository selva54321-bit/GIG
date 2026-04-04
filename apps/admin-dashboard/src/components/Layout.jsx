import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileAppView from "../pages/MobileAppView";
import { Smartphone } from "lucide-react";
import { s, COLORS } from "../theme/theme";

export default function Layout({ children }) {
  const [showMobile, setShowMobile] = useState(true);

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
        
        {/* Toggle Mobile View Button */}
        <button 
          onClick={() => setShowMobile(!showMobile)}
          style={{
            position: "absolute", top: 16, right: 16, zIndex: 100,
            background: COLORS.card, border: `1px solid ${COLORS.border}`,
            color: showMobile ? COLORS.accent : COLORS.muted,
            padding: "8px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px",
            fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}
        >
          <Smartphone size={16} /> {showMobile ? "Hide Mobile App" : "Show Mobile App"}
        </button>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Main content area */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>
            {children}
          </div>

          {/* Mobile App Preview Pane */}
          {showMobile && (
            <div style={{ 
              width: "440px", 
              borderLeft: `1px solid ${COLORS.border}`, 
              background: "#030810", // dark background matching the mobile app bg
              display: "flex", 
              flexDirection: "column",
              alignItems: "center", 
              paddingTop: "40px",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
              zIndex: 10
            }}>
              <div style={{ 
                transform: "scale(0.85)", 
                transformOrigin: "top center", 
                height: "844px" // Give fixed height so it scales down uniformly
              }}>
                <MobileAppView />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
