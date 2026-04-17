import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Award } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { COLORS, s, tierColors, tierNext, tierThreshold } from "../../theme/theme";

export default function GigScore() {
  const { workerProfile, scoreHistoryData } = useAppContext();
  const gigWorker = workerProfile;
  const scoreProgress = Math.min(100, ((gigWorker.gigScore - (gigWorker.tier === "Silver" ? 100 : 0)) / (tierThreshold[gigWorker.tier] - (gigWorker.tier === "Silver" ? 100 : 0))) * 100);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Score Hero */}
      <div style={{ ...s.card, background: `linear-gradient(135deg, ${COLORS.purple}14 0%, ${COLORS.bg} 100%)`, position: "relative", overflow: "hidden", padding: 32 }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `${tierColors[gigWorker.tier]}11`, border: `1px solid ${tierColors[gigWorker.tier]}22` }} />
        <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
          <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${tierColors[gigWorker.tier]} ${scoreProgress * 3.6}deg, ${COLORS.border} 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 106, height: 106, borderRadius: "50%", background: COLORS.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: tierColors[gigWorker.tier] }}>{gigWorker.gigScore}</span>
              <span style={{ fontSize: 11, color: COLORS.muted }}>GigScore</span>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Award size={24} color={tierColors[gigWorker.tier]} />
              <h2 style={{ fontSize: 28, fontWeight: 800, color: tierColors[gigWorker.tier] }}>{gigWorker.tier} Tier</h2>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 14 }}>{tierThreshold[gigWorker.tier] - gigWorker.gigScore} more points to reach <strong style={{ color: tierColors[tierNext[gigWorker.tier]] }}>{tierNext[gigWorker.tier]}</strong></p>
            <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
              {[["🔥", `${gigWorker.streak}-week streak`], ["📅", `${gigWorker.weeksPaid} weeks paid`], ["💸", `Rs. ${gigWorker.policy.weeklyPremium}/wk premium`]].map(([ic, lb]) => (
                <div key={lb} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 18 }}>{ic}</p>
                  <p style={{ color: COLORS.muted, fontSize: 11 }}>{lb}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Score History */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Score Growth (18 Weeks)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={scoreHistoryData}>
              <defs><linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.4}/><stop offset="95%" stopColor={COLORS.gold} stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="week" stroke={COLORS.muted} fontSize={10} />
              <YAxis stroke={COLORS.muted} fontSize={10} />
              <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 11 }} />
              <Area type="monotone" dataKey="score" stroke={COLORS.gold} strokeWidth={2.5} fill="url(#sg2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Points Breakdown */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>How to Earn Points</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["+10/week", "Weekly subscription payment", COLORS.green],
              ["+20", "4-week streak bonus", COLORS.gold],
              ["+5/week", "Claim-free week", COLORS.blue],
              ["+25", "Referral bonus", COLORS.purple],
              ["+100", "12-month anniversary", COLORS.accent],
              ["-50", "Fraudulent claim detected", COLORS.red],
            ].map(([pts, action, color]) => (
              <div key={action} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
                <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 500 }}>{action}</span>
                <span style={{ color, fontWeight: 700, fontSize: 13 }}>{pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier Benefits */}
      <div style={s.card}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Tier Benefits Comparison</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {["Bronze", "Silver", "Gold", "Platinum"].map(tier => (
            <div key={tier} style={{ border: `2px solid ${tier === gigWorker.tier ? tierColors[tier] : COLORS.border}`, borderRadius: 14, padding: 14, background: tier === gigWorker.tier ? tierColors[tier] + "11" : "transparent" }}>
              <p style={{ fontWeight: 800, color: tierColors[tier], marginBottom: 10 }}>{tier}</p>
              {[["Premium", { Bronze: "Rs. 49", Silver: "Rs. 39", Gold: "Rs. 29", Platinum: "Rs. 19" }[tier]],
                ["Max Payout", { Bronze: "Rs. 500", Silver: "Rs. 750", Gold: "Rs. 1,000", Platinum: "Rs. 1,500" }[tier]],
                ["Payout Speed", { Bronze: "48hrs", Silver: "8hrs", Gold: "4hrs", Platinum: "2hrs" }[tier]],
                ["Corpus Bonus", { Bronze: "Pro-rata", Silver: "Full", Gold: "+5%", Platinum: "+10%" }[tier]],
              ].map(([k, v]) => (
                <div key={k} style={{ marginBottom: 6 }}>
                  <p style={{ color: COLORS.muted, fontSize: 10 }}>{k}</p>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{v}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
