import React, { useState } from "react";
import { COLORS, s } from "../../theme/theme";
import { gigWorker } from "../../data/mockData";

export default function Claims() {
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Total Claimed", value: `Rs. ${gigWorker.claims.reduce((a, c) => a + c.amount, 0).toLocaleString()}`, icon: "💰", color: COLORS.green },
          { label: "Claims This Year", value: gigWorker.claims.length, icon: "📋", color: COLORS.blue },
          { label: "Income Protected", value: "Rs. 1,728", icon: "🛡️", color: COLORS.accent },
        ].map(st => (
          <div key={st.label} style={s.stat}>
            <p style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600 }}>{st.label.toUpperCase()}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: st.color }}>{st.icon} {st.value}</p>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>All Claims</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {gigWorker.claims.map(claim => (
            <div key={claim.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: COLORS.bg, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.green + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {claim.trigger.includes("Rain") ? "🌧️" : claim.trigger.includes("Heat") ? "🌡️" : claim.trigger.includes("AQI") ? "💨" : "🚫"}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{claim.trigger}</p>
                  <p style={{ color: COLORS.muted, fontSize: 12 }}>{claim.id} · {claim.date} · {claim.zone}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 800, fontSize: 18, color: COLORS.green }}>+Rs. {claim.amount}</p>
                <span style={s.tag(COLORS.green)}>{claim.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...s.card, background: `linear-gradient(135deg, ${COLORS.purple}15, ${COLORS.bg})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: COLORS.text }}>Simulate Auto-Claim</h3>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>Watch the zero-touch claim flow in real-time</p>
          </div>
          <button style={{ ...s.btn, display: "flex", alignItems: "center", gap: 8, padding: "12px 20px" }} onClick={simulateClaim}>▶ Run Simulation</button>
        </div>
        {claimInProgress && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            {["📡 Trigger threshold crossed — AQI 412 detected in Koramangala", "🔄 Cross-validating with NDMA secondary source...", "📍 Worker GPS confirmed within disrupted zone", "🤖 Fraud Score: 12/100 — Auto-approved", "💸 Rs. 216 payout sent to UPI — Claim CLM-2899 CLOSED"].map((str, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: i <= claimStage ? COLORS.green + "15" : COLORS.surface, border: `1px solid ${i <= claimStage ? COLORS.green + "33" : COLORS.border}`, transition: "all 0.3s ease-out", opacity: i <= claimStage ? 1 : 0.5, transform: i <= claimStage ? "translateX(0)" : "translateX(20px)" }}>
                <span style={{ fontSize: 14 }}>{i <= claimStage ? "✅" : "⏳"}</span>
                <span style={{ fontSize: 14, color: i <= claimStage ? COLORS.text : COLORS.muted, fontWeight: i <= claimStage ? 600 : 500 }}>{str}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
