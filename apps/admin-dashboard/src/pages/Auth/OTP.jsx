import React, { useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { COLORS, s } from "../../theme/theme";
import { Shield } from "lucide-react";

export default function OTP() {
  const { setScreen, setLoggedIn, role, setActiveTab } = useAppContext();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleVerify = () => {
    if (role === "worker") {
      setScreen("onboard");
    } else {
      setLoggedIn(true);
      setScreen("app");
      setActiveTab("admin");
    }
  };

  return (
    <div style={{ ...s.app, justifyContent: "center", alignItems: "center", background: "radial-gradient(ellipse at 30% 40%, #0D2B5E 0%, #060D1F 60%)" }}>
      <div style={{ width: 400, ...s.card, padding: 36, borderRadius: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #FF9B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={22} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800 }}>GigShield</span>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Enter OTP</h2>
        <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 28 }}>Sent to +91 98765 43210</p>

        <div style={{ display: "flex", gap: 12, marginBottom: 28, justifyContent: "center" }}>
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              ref={otpRefs[i]}
              maxLength={1}
              style={{
                width: 60, height: 60, textAlign: "center", background: "#0A1628", border: `2px solid ${otp[i] ? COLORS.accent : COLORS.border}`,
                borderRadius: 14, color: COLORS.text, fontSize: 22, fontWeight: 700, fontFamily: "'Sora', sans-serif", outline: "none"
              }}
              value={otp[i]}
              onChange={(e) => {
                const v = otp.slice();
                v[i] = e.target.value;
                setOtp(v);
                if (e.target.value && i < 3) otpRefs[i + 1].current.focus();
              }}
            />
          ))}
        </div>

        <button style={{ ...s.btn, width: "100%", padding: 15, fontSize: 15 }} onClick={handleVerify}>
          Verify & Continue →
        </button>
        <button style={{ ...s.btnGhost, width: "100%", marginTop: 12 }} onClick={() => setScreen("login")}>
          ← Back
        </button>
      </div>
    </div>
  );
}
