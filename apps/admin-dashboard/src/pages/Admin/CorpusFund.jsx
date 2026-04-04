import React from "react";
import { COLORS, s } from "../../theme/theme";

export default function CorpusFund() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          ["Total AUM", "Rs. 6.2 Cr", COLORS.gold],
          ["Active Corpus Holders", "9,841", COLORS.blue],
          ["Avg Return (YTD)", "7.2% p.a.", COLORS.green],
          ["Maturity Payouts (Q1)", "Rs. 12.4L", COLORS.accent],
        ].map(([l,v,c]) => (
          <div key={l} style={s.stat}>
            <p style={{ color: COLORS.muted, fontSize: 11 }}>{l.toUpperCase()}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: c, marginTop: 4 }}>{v}</p>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Portfolio Allocation & Performance</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["Government Securities (G-Secs)", "40%", "Rs. 2.48 Cr", "7.35%", COLORS.green],
            ["RBI Floating Rate Bonds", "25%", "Rs. 1.55 Cr", "7.65%", COLORS.blue],
            ["Liquid Mutual Funds (AAA)", "20%", "Rs. 1.24 Cr", "6.90%", COLORS.purple],
            ["Short-Duration Debt Funds", "10%", "Rs. 0.62 Cr", "7.45%", COLORS.gold],
            ["Overnight / Cash Buffer", "5%", "Rs. 0.31 Cr", "5.80%", COLORS.muted],
          ].map(([name, alloc, value, ret, color]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: COLORS.bg, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <div style={{ width: 8, height: 36, borderRadius: 4, background: color }} />
              <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 13 }}>{name}</p></div>
              <span style={s.tag(color)}>{alloc}</span>
              <p style={{ fontWeight: 700, width: 90, textAlign: "right" }}>{value}</p>
              <p style={{ color: COLORS.green, fontWeight: 700, width: 60, textAlign: "right" }}>{ret}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
