import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { COLORS, s } from "../../theme/theme";
import { lossRatioData } from "../../data/mockData";

export default function Analytics() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Active Policies", value: "10,247", change: "+823 this week", color: COLORS.green, up: true },
          { label: "Weekly Inflow", value: "Rs. 39.7L", change: "+8.3% vs last week", color: COLORS.blue, up: true },
          { label: "Corpus Fund AUM", value: "Rs. 6.2 Cr", change: "7.2% avg return", color: COLORS.gold, up: true },
          { label: "Loss Ratio (Mar)", value: "52%", change: "+17% vs Feb — Monsoon", color: COLORS.red, up: false },
        ].map(st => (
          <div key={st.label} style={s.stat}>
            <p style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600 }}>{st.label.toUpperCase()}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: st.color, margin: "4px 0" }}>{st.value}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {st.up ? <ArrowUpRight size={13} color={COLORS.green} /> : <ArrowDownRight size={13} color={COLORS.red} />}
              <p style={{ color: st.up ? COLORS.green : COLORS.red, fontSize: 11 }}>{st.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Monthly Loss Ratio & Claim Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={lossRatioData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" stroke={COLORS.muted} fontSize={10} />
              <YAxis yAxisId="left" stroke={COLORS.muted} fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke={COLORS.muted} fontSize={10} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="ratio" fill={COLORS.accent} radius={[4,4,0,0]} name="Loss Ratio %" />
              <Bar yAxisId="right" dataKey="claims" fill={COLORS.blue} radius={[4,4,0,0]} name="Claims" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Tier Distribution</h3>
          <PieChart width={180} height={160}>
            <Pie data={[{name:"Bronze",v:42},{name:"Silver",v:35},{name:"Gold",v:18},{name:"Platinum",v:5}]} dataKey="v" cx={85} cy={75} innerRadius={40} outerRadius={75} label={({name,v}) => `${name} ${v}%`} labelLine={false} fontSize={9}>
              {["#CD7F32","#94A3B8","#F5A623","#A855F7"].map((c,i) => <Cell key={i} fill={c} />)}
            </Pie>
          </PieChart>
        </div>
      </div>

      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Predictive Claims Forecast (Next 7 Days)</h3>
          <span style={{ ...s.tag(COLORS.gold) }}>🤖 ML Forecast</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
            const risk = [0.2, 0.35, 0.7, 0.85, 0.6, 0.4, 0.25][i];
            const color = risk > 0.7 ? COLORS.red : risk > 0.4 ? COLORS.gold : COLORS.green;
            return (
              <div key={day} style={{ textAlign: "center", background: "#0A1628", borderRadius: 10, padding: "12px 6px", border: `1px solid ${color}44` }}>
                <p style={{ color: COLORS.muted, fontSize: 10, marginBottom: 6 }}>{day}</p>
                <div style={{ height: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
                  <div style={{ width: 20, height: `${risk * 100}%`, background: color, borderRadius: 4, opacity: 0.8 }} />
                </div>
                <p style={{ color, fontSize: 10, fontWeight: 700 }}>{Math.round(risk * 100)}%</p>
              </div>
            );
          })}
        </div>
        <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 10 }}>⚠️ Thu–Fri: High rainfall probability (72% forecast confidence). Pre-alert 847 workers.</p>
      </div>
    </div>
  );
}
