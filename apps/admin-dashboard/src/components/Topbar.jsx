import React from "react";
import { Menu, Zap, Bell } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { COLORS } from "../theme/theme";

export default function Topbar() {
  const { setSidebarOpen, activeTab, role, alertBanner } = useAppContext();

  const labels = {
    dashboard: "Dashboard", gigscore: "GigScore", policy: "My Policy",
    triggers: "Live Triggers", claims: "Claims", corpus: "GigCorpus",
    admin: "Analytics", triggers_admin: "Live Triggers", fraud: "Fraud Queue", corpus_admin: "Corpus Fund", mobile_preview: "Mobile Preview"
  };

  return (
    <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surface, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer" }}>
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 800 }}>{labels[activeTab]}</h1>
          <p style={{ color: COLORS.muted, fontSize: 11 }}>Live as of {new Date().toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {alertBanner && (
          <div style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, animation: "slideIn 0.4s ease" }}>
            <Zap size={14} color={COLORS.accent} />
            <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700 }}>Auto-claim {alertBanner.id} initiated! Rs. {alertBanner.amount} payout</span>
          </div>
        )}
        <div style={{ position: "relative" }}>
          <Bell size={20} color={COLORS.muted} />
          <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: COLORS.accent }} />
        </div>
      </div>
    </div>
  );
}
