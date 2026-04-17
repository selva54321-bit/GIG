import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle, X } from "lucide-react";
import { COLORS, s } from "../../theme/theme";
import { premiumData } from "../../data/mockData";

export default function Policy() {
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...s.card, background: `linear-gradient(135deg, ${COLORS.purple}14, ${COLORS.bg})`, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: COLORS.muted, fontSize: 12, letterSpacing: 1, fontWeight: 700 }}>ACTIVE POLICY</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: COLORS.text }}>Silver Protection Plan</h2>
            <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>Policy ID: GS-KA-2026-9876 · Renews every Monday 00:00</p>
          </div>
          <span style={{ ...s.tag(COLORS.green), fontSize: 12, padding: "6px 16px" }}>● ACTIVE</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 20 }}>
          {[["Weekly Premium", "Rs. 39"], ["Max Payout", "Rs. 750/week"], ["Claim Speed", "8 hours"], ["Coverage Since", "Week 1, 2026"]].map(([k, v]) => (
            <div key={k} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12 }}>
              <p style={{ color: COLORS.muted, fontSize: 10, fontWeight: 700 }}>{k}</p>
              <p style={{ fontWeight: 700, fontSize: 15, marginTop: 4, color: COLORS.text }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Premium Breakdown</h3>
          {[
            ["Claim Reserve (45%)", `Rs. 17.55`, COLORS.green],
            ["GigCorpus Pool (30%)", `Rs. 11.70`, COLORS.gold],
            ["Fraud Reserve (10%)", `Rs. 3.90`, COLORS.purple],
            ["Platform Ops (10%)", `Rs. 3.90`, COLORS.blue],
            ["Reinsurance (5%)", `Rs. 1.95`, COLORS.muted],
          ].map(([k, v, c]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ color: COLORS.muted, fontSize: 13 }}>{k}</span>
              <span style={{ fontWeight: 700, color: c, fontSize: 13 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: 4 }}>
            <span style={{ fontWeight: 700 }}>Total Weekly Premium</span>
            <span style={{ fontWeight: 800, color: COLORS.accent, fontSize: 16 }}>Rs. 39.00</span>
          </div>
        </div>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Premium History</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={premiumData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="week" stroke={COLORS.muted} fontSize={10} />
              <YAxis stroke={COLORS.muted} fontSize={10} domain={[0, 60]} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 11 }} formatter={(v) => [`Rs. ${v}`, "Premium"]} />
              <Bar dataKey="premium" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ color: COLORS.green, fontSize: 12, marginTop: 8 }}>✅ Moved to Silver in Week 8 — saved Rs. 10/week</p>
        </div>
      </div>

      <div style={s.card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>What's Covered & Excluded</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <p style={{ color: COLORS.green, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>✅ Covered (Income Loss from)</p>
            {["Heavy Rain (>64.5mm/24h)", "Extreme Heat (>45°C)", "Severe AQI (>400)", "Curfew / Zone Lockdown", "Flash Flood (NDMA Level 3+)"].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <CheckCircle size={13} color={COLORS.green} />
                <span style={{ fontSize: 13 }}>{i}</span>
              </div>
            ))}
          </div>
          <div>
            <p style={{ color: COLORS.red, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>❌ Excluded</p>
            {["Health / Medical expenses", "Life or accident insurance", "Vehicle repair costs", "Personal injuries", "Platform rating loss"].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <X size={13} color={COLORS.red} />
                <span style={{ fontSize: 13, color: COLORS.muted }}>{i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
