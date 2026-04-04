import React from "react";
import { useAppContext } from "../context/AppContext";
import { 
  BarChart2, Radio, AlertCircle, TrendingUp, Home, Star, FileText, CheckCircle, LogOut, Shield, Smartphone
} from "lucide-react";
import { COLORS, s, tierColors } from "../theme/theme";
import { gigWorker } from "../data/mockData";

export default function Sidebar() {
  const { role, activeTab, setActiveTab, sidebarOpen, setScreen } = useAppContext();

  const navItems = role === "admin"
    ? [
        { id: "admin", icon: <BarChart2 size={18} />, label: "Analytics" },
        { id: "triggers_admin", icon: <Radio size={18} />, label: "Live Triggers" },
        { id: "fraud", icon: <AlertCircle size={18} />, label: "Fraud Queue" },
        { id: "corpus_admin", icon: <TrendingUp size={18} />, label: "Corpus Fund" },
        { id: "mobile_preview", icon: <Smartphone size={18} />, label: "Mobile Preview" },
      ]
    : [
        { id: "dashboard", icon: <Home size={18} />, label: "Dashboard" },
        { id: "mobile_preview", icon: <Smartphone size={18} />, label: "Mobile App" },
        { id: "gigscore", icon: <Star size={18} />, label: "GigScore" },
        { id: "policy", icon: <FileText size={18} />, label: "My Policy" },
        { id: "triggers", icon: <Radio size={18} />, label: "Live Triggers" },
        { id: "claims", icon: <CheckCircle size={18} />, label: "Claims" },
        { id: "corpus", icon: <TrendingUp size={18} />, label: "GigCorpus" },
      ];

  return (
    <div style={{ ...s.sidebar, width: sidebarOpen ? 240 : 64 }}>
      <div style={{ padding: "20px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #FF6B35, #FF9B35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Shield size={18} color="#fff" />
        </div>
        {sidebarOpen && <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: "nowrap" }}>GigGuard</span>}
      </div>

      {sidebarOpen && role === "worker" && (
        <div style={{ padding: "16px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${tierColors[gigWorker.tier]}33`, border: `2px solid ${tierColors[gigWorker.tier]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👷</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13 }}>{gigWorker.name}</p>
              <p style={{ color: tierColors[gigWorker.tier], fontSize: 11, fontWeight: 600 }}>● {gigWorker.tier} · {gigWorker.platform}</p>
            </div>
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", background: activeTab === item.id ? COLORS.accent + "22" : "transparent", color: activeTab === item.id ? COLORS.accent : COLORS.muted, fontFamily: "'Sora', sans-serif", fontWeight: activeTab === item.id ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all 0.2s", textAlign: "left", width: "100%" }}>
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div style={{ padding: "12px 8px", borderTop: `1px solid ${COLORS.border}` }}>
        <button onClick={() => setScreen("login")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", background: "transparent", color: COLORS.muted, fontFamily: "'Sora', sans-serif", fontSize: 13, cursor: "pointer", width: "100%" }}>
          <LogOut size={18} />{sidebarOpen && "Sign Out"}
        </button>
      </div>
    </div>
  );
}
