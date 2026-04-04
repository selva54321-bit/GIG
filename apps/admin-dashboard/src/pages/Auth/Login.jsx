import React from "react";
import { useAppContext } from "../../context/AppContext";
import { COLORS, s } from "../../theme/theme";
import { Shield } from "lucide-react";

export default function Login() {
  const { setScreen, setRole, role } = useAppContext();

  return (
    <div style={{ ...s.app, justifyContent: "center", alignItems: "center", background: "radial-gradient(ellipse at 30% 40%, #0D2B5E 0%, #060D1F 60%)" }}>
      <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #FF6B35, #FF9B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={28} color="#fff" />
            </div>
            <span style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>GigShield</span>
          </div>
          <p style={{ color: COLORS.muted, fontSize: 14, margin: 0 }}>Income protection for India's delivery workers</p>
        </div>

        {/* Login Card */}
        <div style={{ ...s.card, padding: 32, borderRadius: 24 }}>
          <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>Choose your role to continue</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {["Worker", "Admin"].map(r => (
              <button key={r} onClick={() => setRole(r.toLowerCase())} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `2px solid ${role === r.toLowerCase() ? COLORS.accent : COLORS.border}`, background: role === r.toLowerCase() ? COLORS.accent + "22" : "transparent", color: role === r.toLowerCase() ? COLORS.accent : COLORS.muted, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                {r === "Worker" ? "👷 Worker" : "📊 Admin"}
              </button>
            ))}
          </div>

          <label style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>MOBILE NUMBER</label>
          <input style={{ ...s.input, marginTop: 8, marginBottom: 16 }} placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />

          <button style={{ ...s.btn, width: "100%", padding: "15px", fontSize: 15 }} onClick={() => setScreen("otp")}>
            Get OTP →
          </button>
        </div>

        <p style={{ textAlign: "center", color: COLORS.muted, fontSize: 12 }}>
          Also available on <span style={{ color: COLORS.accent }}>WhatsApp</span> for low-data access
        </p>
      </div>
    </div>
  );
}
