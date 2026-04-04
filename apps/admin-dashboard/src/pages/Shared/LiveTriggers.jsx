import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { COLORS, s } from "../../theme/theme";

export default function LiveTriggers() {
  const { triggers } = useAppContext();
  const [claimInProgress, setClaimInProgress] = useState(false);
  const [claimStage, setClaimStage] = useState(0);

  const simulateClaim = () => {
    setClaimInProgress(true);
    setClaimStage(0);
    const stages = [0, 1, 2, 3, 4];
    stages.forEach((st, i) => setTimeout(() => setClaimStage(st), i * 900));
    setTimeout(() => { setClaimInProgress(false); setClaimStage(0); }, 5000);
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, animation: "pulse 1.5s infinite" }} />
        <span style={{ color: COLORS.green, fontSize: 12, fontWeight: 600 }}>LIVE MONITORING — Bengaluru, Koramangala Zone</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {triggers.map(tr => (
          <div key={tr.id} style={{ ...s.card, border: `1px solid ${tr.status === "triggered" ? COLORS.red : tr.status === "warning" ? COLORS.gold : COLORS.border}`, background: tr.status === "triggered" ? COLORS.red + "11" : tr.status === "warning" ? COLORS.gold + "11" : COLORS.card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{tr.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{tr.name}</p>
                  <p style={{ color: COLORS.muted, fontSize: 11 }}>{tr.api}</p>
                </div>
              </div>
              <span style={s.tag(tr.status === "triggered" ? COLORS.red : tr.status === "warning" ? COLORS.gold : COLORS.green)}>
                {tr.status === "triggered" ? "⚡ TRIGGERED" : tr.status === "warning" ? "⚠ WARNING" : "✓ SAFE"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: COLORS.bg, borderRadius: 8, padding: 10, border: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.muted, fontSize: 10, marginBottom: 2, fontWeight: 700 }}>THRESHOLD</p>
                <p style={{ fontSize: 12, fontWeight: 600 }}>{tr.threshold}</p>
              </div>
              <div style={{ background: COLORS.bg, borderRadius: 8, padding: 10, border: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.muted, fontSize: 10, marginBottom: 2, fontWeight: 700 }}>CURRENT READING</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: tr.status === "triggered" ? COLORS.red : tr.status === "warning" ? COLORS.gold : COLORS.green }}>{tr.current}</p>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: COLORS.muted, fontSize: 12 }}>Payout if triggered: <strong style={{ color: COLORS.text }}>{tr.payout} daily avg</strong></span>
              {tr.status === "triggered" && <button style={{ ...s.btn, padding: "6px 14px", fontSize: 12 }} onClick={simulateClaim}>Simulate Claim</button>}
            </div>

            {/* Claim Progress */}
            {claimInProgress && tr.status === "triggered" && (
              <div style={{ marginTop: 12, background: COLORS.bg, borderRadius: 10, padding: 14, border: `1px solid ${COLORS.border}` }}>
                {["📡 Detecting disruption zone...", "🔍 Cross-validating with secondary source...", "📍 Confirming worker GPS zone...", "🤖 Running fraud detection (5 layers)...", "✅ Claim approved! Payout initiated."].map((stage, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, opacity: i <= claimStage ? 1 : 0.3, transition: "opacity 0.3s" }}>
                    <span style={{ fontSize: 12 }}>{i < claimStage ? "✅" : i === claimStage ? "⏳" : "⬜"}</span>
                    <span style={{ fontSize: 12, color: i <= claimStage ? COLORS.text : COLORS.muted, fontWeight: 500 }}>{stage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={s.card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Zero-Touch Claim Flow</h3>
        <div style={{ display: "flex", gap: 0 }}>
          {["API Poll\n(15min)", "Threshold\nCrossed", "Zone\nMatch", "Fraud\nCheck", "Claim\nCreated", "UPI\nPayout"].map((step, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.accent + "22", border: `2px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 13, fontWeight: 700, color: COLORS.accent }}>{i + 1}</div>
              <p style={{ color: COLORS.muted, fontSize: 10, whiteSpace: "pre-line" }}>{step}</p>
              {i < 5 && <div style={{ position: "absolute", top: 18, left: "60%", width: "80%", height: 2, background: COLORS.border }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
