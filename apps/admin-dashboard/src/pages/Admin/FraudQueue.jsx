import React from "react";
import { COLORS, s } from "../../theme/theme";

export default function FraudQueue() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[["Pending Review", "23", COLORS.gold], ["Auto-Approved Today", "412", COLORS.green], ["Rejected This Week", "7", COLORS.red]].map(([l,v,c]) => (
          <div key={l} style={s.stat}><p style={{ color: COLORS.muted, fontSize: 11 }}>{l.toUpperCase()}</p><p style={{ fontSize: 30, fontWeight: 800, color: c }}>{v}</p></div>
        ))}
      </div>

      <div style={s.card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Fraud Review Queue</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: "CLM-2901", worker: "Suresh K.", trigger: "Heavy Rain", score: 71, flags: ["GPS spoof detected", "3rd claim in 2 weeks"], status: "review" },
            { id: "CLM-2888", worker: "Priya R.", trigger: "Curfew", score: 45, flags: ["New account <14 days"], status: "review" },
            { id: "CLM-2876", worker: "Amit S.", trigger: "Flash Flood", score: 82, flags: ["Network cluster fraud", "Same device as 4 others"], status: "reject" },
          ].map(item => (
            <div key={item.id} style={{ padding: "14px 16px", background: "#0A1628", borderRadius: 12, border: `1px solid ${item.score > 70 ? COLORS.red : COLORS.gold}44` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 700 }}>{item.worker} <span style={{ color: COLORS.muted, fontSize: 12 }}>· {item.id}</span></p>
                  <p style={{ color: COLORS.muted, fontSize: 12 }}>{item.trigger}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: item.score > 70 ? COLORS.red : COLORS.gold, fontWeight: 800, fontSize: 20 }}>{item.score}<span style={{ fontSize: 11, fontWeight: 400 }}>/100</span></p>
                  <p style={{ color: COLORS.muted, fontSize: 10 }}>Fraud Score</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {item.flags.map(f => <span key={f} style={s.tag(COLORS.red)}>{f}</span>)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...s.btnGhost, padding: "7px 16px", fontSize: 12, color: COLORS.green, borderColor: COLORS.green + "66" }}>✓ Approve</button>
                <button style={{ ...s.btnGhost, padding: "7px 16px", fontSize: 12, color: COLORS.red, borderColor: COLORS.red + "66" }}>✗ Reject</button>
                <button style={{ ...s.btnGhost, padding: "7px 16px", fontSize: 12 }}>👁 Investigate</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
