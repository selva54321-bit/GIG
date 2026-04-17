import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, CreditCard, Star, TrendingUp, CheckCircle, Zap } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { COLORS, s, tierColors, tierNext, tierThreshold } from "../../theme/theme";

export default function WorkerDashboard() {
  const { alertBanner, triggers, workerProfile, scoreHistoryData, claimsData } = useAppContext();
  const gigWorker = workerProfile;
  const scoreProgress = Math.min(100, ((gigWorker.gigScore - (gigWorker.tier === "Silver" ? 100 : 0)) / (tierThreshold[gigWorker.tier] - (gigWorker.tier === "Silver" ? 100 : 0))) * 100);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Alert Banner */}
      {alertBanner && (
        <div style={{ background: "linear-gradient(135deg, #FF6B3522, #FF9B3522)", border: `1px solid ${COLORS.accent}`, borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, animation: "slideIn 0.4s ease" }}>
          <Zap size={22} color={COLORS.accent} />
          <div>
            <p style={{ fontWeight: 700, color: COLORS.accent }}>⚡ Auto-Claim Triggered: {alertBanner.trigger}</p>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>Rs. {alertBanner.amount} payout initiated to your UPI • ID: {alertBanner.id}</p>
          </div>
        </div>
      )}

      {/* Stat Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Weekly Premium", value: `Rs. ${gigWorker.policy.weeklyPremium}`, sub: "Silver tier", icon: <CreditCard size={18} color={COLORS.accent} />, color: COLORS.accent },
          { label: "Max Weekly Payout", value: `Rs. ${gigWorker.policy.maxPayout}`, sub: "Active coverage", icon: <Shield size={18} color={COLORS.green} />, color: COLORS.green },
          { label: "GigScore", value: gigWorker.gigScore, sub: `${gigWorker.tier} → ${tierNext[gigWorker.tier]}`, icon: <Star size={18} color={COLORS.gold} />, color: COLORS.gold },
          { label: "Corpus Invested", value: `Rs. ${gigWorker.corpusInvested}`, sub: `${gigWorker.weeksToMaturity}w to maturity`, icon: <TrendingUp size={18} color={COLORS.purple} />, color: COLORS.purple },
        ].map((st, i) => (
          <div key={i} style={s.stat}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>{st.label.toUpperCase()}</p>
              {st.icon}
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, color: st.color, margin: "4px 0" }}>{st.value}</p>
            <p style={{ color: COLORS.muted, fontSize: 12 }}>{st.sub}</p>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Coverage Status */}
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Coverage Status</h3>
            <span style={{ ...s.tag(COLORS.green), display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, animation: "pulse 2s infinite" }} />
              ACTIVE
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {triggers.map(tr => (
              <div key={tr.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{tr.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{tr.name}</span>
                </div>
                <span style={{ ...s.tag(tr.status === "triggered" ? COLORS.red : tr.status === "warning" ? COLORS.gold : COLORS.green), fontSize: 10 }}>
                  {tr.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* GigScore Progress */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>GigScore Progress</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `conic-gradient(${tierColors[gigWorker.tier]} ${scoreProgress * 3.6}deg, ${COLORS.border} 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 62, height: 62, borderRadius: "50%", background: COLORS.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: tierColors[gigWorker.tier] }}>{gigWorker.gigScore}</span>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 18, color: tierColors[gigWorker.tier] }}>{gigWorker.tier} Tier</p>
              <p style={{ color: COLORS.muted, fontSize: 12 }}>{tierThreshold[gigWorker.tier] - gigWorker.gigScore} pts to {tierNext[gigWorker.tier]}</p>
              <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>🔥 {gigWorker.streak}-week streak</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={90}>
            <AreaChart data={scoreHistoryData}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3}/><stop offset="95%" stopColor={COLORS.gold} stopOpacity={0}/></linearGradient></defs>
              <Area type="monotone" dataKey="score" stroke={COLORS.gold} strokeWidth={2} fill="url(#sg)" dot={false} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
{/* Recent Claims */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Recent Claims</h3>
          <button style={{ ...s.btnGhost, padding: "6px 14px", fontSize: 12 }}>View all</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {claimsData.slice(0, 3).map(claim => (
            <div key={claim.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.green + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={16} color={COLORS.green} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{claim.trigger}</p>
                  <p style={{ color: COLORS.muted, fontSize: 11 }}>{claim.id} · {claim.date}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700, color: COLORS.green }}>+Rs. {claim.amount}</p>
                <span style={s.tag(COLORS.green)}>{claim.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
