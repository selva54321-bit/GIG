import React from "react";
import { useAppContext } from "../../context/AppContext";
import { COLORS, s } from "../../theme/theme";

export default function CorpusFund() {
  const { adminCorpusSummary } = useAppContext();

  const summary = adminCorpusSummary || {
    total_aum: 62000000,
    contributors: 9841,
    portfolio: [
      { name: "G-Secs", weight: 0.4, amount: 24800000 },
      { name: "RBI Bonds", weight: 0.25, amount: 15500000 },
      { name: "Liquid Funds", weight: 0.2, amount: 12400000 },
      { name: "Debt Funds", weight: 0.1, amount: 6200000 },
      { name: "Cash", weight: 0.05, amount: 3100000 },
    ],
  };

  const formatAsCr = (amount) => `Rs. ${(Number(amount || 0) / 10000000).toFixed(2)} Cr`;

  const portfolioRows = summary.portfolio.map((item) => ({
    name: item.name,
    alloc: `${Math.round(Number(item.weight || 0) * 100)}%`,
    value: formatAsCr(item.amount),
    ret: `${(6.8 + Number(item.weight || 0) * 2).toFixed(2)}%`,
  }));

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          ["Total AUM", formatAsCr(summary.total_aum), COLORS.gold],
          ["Active Corpus Holders", Number(summary.contributors || 0).toLocaleString("en-IN"), COLORS.blue],
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
          {portfolioRows.map((item, index) => {
            const colors = [COLORS.green, COLORS.blue, COLORS.purple, COLORS.gold, COLORS.muted];
            const color = colors[index % colors.length];

            return (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: COLORS.bg, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <div style={{ width: 8, height: 36, borderRadius: 4, background: color }} />
              <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</p></div>
              <span style={s.tag(color)}>{item.alloc}</span>
              <p style={{ fontWeight: 700, width: 90, textAlign: "right" }}>{item.value}</p>
              <p style={{ color: COLORS.green, fontWeight: 700, width: 60, textAlign: "right" }}>{item.ret}</p>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
