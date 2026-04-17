import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileAppView from "../pages/MobileAppView";
import { Smartphone } from "lucide-react";
import { s, COLORS } from "../theme/theme";
import { useAppContext } from "../context/AppContext";

export default function Layout({ children }) {
  const { activeTab } = useAppContext();
  const [showMobile, setShowMobile] = useState(true);
  const [canShowMobile, setCanShowMobile] = useState(
    typeof window === "undefined" ? true : window.innerWidth >= 1280
  );
  const isSingleMobilePage = activeTab === "mobile_preview";

  useEffect(() => {
    const onResize = () => {
      const wideEnough = window.innerWidth >= 1280;
      setCanShowMobile(wideEnough);

      if (!wideEnough) {
        setShowMobile(false);
      }
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", position: "relative" }}>
        <Topbar />

        {!isSingleMobilePage && (
          <button
            onClick={() => setShowMobile((prev) => !prev)}
            disabled={!canShowMobile}
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              zIndex: 20,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              color: !canShowMobile ? COLORS.muted : showMobile ? COLORS.accent : COLORS.muted,
              opacity: canShowMobile ? 1 : 0.65,
              padding: "8px 12px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Sora', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              cursor: canShowMobile ? "pointer" : "not-allowed",
            }}
            title={canShowMobile ? "Show or hide mobile preview" : "Mobile preview is available on larger screens"}
          >
            <Smartphone size={16} />
            {!canShowMobile ? "Preview on desktop" : showMobile ? "Hide Mobile App" : "Show Mobile App"}
          </button>
        )}

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>
            {children}
          </div>

          {canShowMobile && showMobile && !isSingleMobilePage && (
            <div
              style={{
                width: 440,
                borderLeft: `1px solid ${COLORS.border}`,
                background: "#030810",
                display: "flex",
                justifyContent: "center",
                overflowY: "auto",
                paddingTop: 20,
                paddingBottom: 20,
                boxShadow: "-8px 0 24px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  transform: "scale(0.82)",
                  transformOrigin: "top center",
                  width: 420,
                }}
              >
                <MobileAppView />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
