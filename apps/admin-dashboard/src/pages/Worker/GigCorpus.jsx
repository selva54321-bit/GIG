import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAppContext } from "../../context/AppContext";
import { COLORS, s } from "../../theme/theme";

export default function GigCorpus() {
  const { workerProfile, corpusGrowthData, adminCorpusSummary } = useAppContext();
  const gigWorker = workerProfile;
  const [withdrawOption, setWithdrawOption] = useState(null);

  const portfolioRows = Array.isArray(adminCorpusSummary?.portfolio)
    ? adminCorpusSummary.portfolio
    : [
      { name: "G-Secs", weight: 0.4 },
      { name: "RBI Bonds", weight: 0.25 },
      { name: "Liquid Funds", weight: 0.2 },
      { name: "Debt Funds", weight: 0.1 },
      { name: "Cash", weight: 0.05 },
    ];

  const portfolioColors = ["#10B981", "#3B82F6", "#8B5CF6", "#F5A623", "#6B8CC7"];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero */}
      <div style={{ ...s.card, background: `linear-gradient(135deg, ${COLORS.purple}14 0%, ${COLORS.bg} 100%)`, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>GIGCORPUS FUND</p>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: COLORS.gold, margin: "6px 0" }}>Rs. {gigWorker.corpusInvested.toFixed(2)}</h2>
            <p style={{ color: COLORS.muted, fontSize: 14 }}>Invested · Projected return: <strong style={{ color: COLORS.green }}>Rs. {gigWorker.corpusReturn.toFixed(2)}</strong></p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: COLORS.muted, fontSize: 12 }}>Year-end maturity in</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: COLORS.accent }}>{gigWorker.weeksToMaturity}</p>
            <p style={{ color: COLORS.muted, fontSize: 12 }}>weeks</p>
          </div>
        </div>
        <div style={{ marginTop: 18, height: 6, borderRadius: 6, background: COLORS.border, overflow: "hidden" }}>
          <div style={{ width: `${(52 - gigWorker.weeksToMaturity) / 52 * 100}%`, height: "100%", background: "linear-gradient(90deg, #F5A623, #FF6B35)", borderRadius: 6, transition: "width 0.5s" }} />
        </div>
        <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 6 }}>{52 - gigWorker.weeksToMaturity} of 52 weeks completed</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Corpus Growth */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Corpus Growth</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={corpusGrowthData}>
              <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.4}/><stop offset="95%" stopColor={COLORS.gold} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="week" stroke={COLORS.muted} fontSize={10} />
              <YAxis stroke={COLORS.muted} fontSize={10} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 11 }} formatter={(v) => [`Rs. ${v.toFixed(2)}`, "Corpus"]} />
              <Area type="monotone" dataKey="cumulative" stroke={COLORS.gold} strokeWidth={2.5} fill="url(#cg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Allocation */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Portfolio Allocation</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <PieChart width={130} height={130}>
              <Pie data={portfolioRows.map((item) => ({ v: Number((item.weight || 0) * 100) }))} dataKey="v" cx={60} cy={60} innerRadius={35} outerRadius={60}>
                {portfolioColors.map((c,i) => <Cell key={i} fill={c} />)}
              </Pie>
            </PieChart>
            <div style={{ flex: 1 }}>
              {portfolioRows.map((item, index) => {
                const color = portfolioColors[index % portfolioColors.length];
                return (
                <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 11, color: COLORS.muted }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{Math.round(Number(item.weight || 0) * 100)}%</span>
                </div>
              );})}
              <p style={{ color: COLORS.green, fontSize: 11, fontWeight: 700, marginTop: 6 }}>Avg. 7.2% p.a. return</p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Options */}
      <div style={s.card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Withdrawal Options at Maturity</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { id: "cash", icon: "💸", title: "Full Cash", desc: `Rs. ${gigWorker.corpusReturn.toFixed(0)} to UPI`, sub: "Immediate liquidity" },
            { id: "rollover", icon: "🔄", title: "Roll Over", desc: "Compound to Year 2", sub: "~Rs. 2,100+ projected" },
            { id: "partial", icon: "⚖️", title: "50/50 Split", desc: "Withdraw half, compound half", sub: "Best of both" },
          ].map(opt => (
            <div key={opt.id} onClick={() => setWithdrawOption(opt.id)} style={{ border: `2px solid ${withdrawOption === opt.id ? COLORS.gold : COLORS.border}`, borderRadius: 14, padding: 16, cursor: "pointer", background: withdrawOption === opt.id ? COLORS.gold + "11" : "transparent", transition: "all 0.2s" }}>
              <span style={{ fontSize: 28 }}>{opt.icon}</span>
              <p style={{ fontWeight: 700, fontSize: 14, marginTop: 8 }}>{opt.title}</p>
              <p style={{ color: COLORS.gold, fontSize: 13, fontWeight: 700 }}>{opt.desc}</p>
              <p style={{ color: COLORS.muted, fontSize: 11 }}>{opt.sub}</p>
            </div>
          ))}
        </div>
        {withdrawOption && <button style={{ ...s.btn, marginTop: 14, width: "100%", padding: 14 }}>Confirm {["cash","rollover","partial"].includes(withdrawOption) ? ["Full Cash Withdrawal", "Rollover to Year 2", "50/50 Split"][["cash","rollover","partial"].indexOf(withdrawOption)] : ""} →</button>}
      </div>
    </div>
  );
}
