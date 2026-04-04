import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { COLORS, s, tierColors } from "../../theme/theme";

export default function Onboarding() {
  const { setScreen, setLoggedIn, setActiveTab } = useAppContext();
  const [onboardStep, setOnboardStep] = useState(0);
  const [platformId, setPlatformId] = useState("");

  const steps = [
    { title: "Your Platform", subtitle: "Connect your delivery account" },
    { title: "Risk Profile", subtitle: "AI is analyzing your zone & history" },
    { title: "Choose Your Plan", subtitle: "Weekly coverage starting Monday" },
  ];

  return (
    <div style={{ ...s.app, justifyContent: "center", alignItems: "center", background: "radial-gradient(ellipse at 70% 30%, #0D2B5E 0%, #060D1F 60%)" }}>
      <div style={{ width: 480 }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= onboardStep ? COLORS.accent : COLORS.border, transition: "background 0.3s" }} />)}
        </div>

        <div style={{ ...s.card, padding: 36, borderRadius: 24 }}>
          <p style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1, margin: "0 0 4px" }}>STEP {onboardStep + 1} OF 3</p>
          <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800 }}>{steps[onboardStep].title}</h2>
          <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 28 }}>{steps[onboardStep].subtitle}</p>

          {onboardStep === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>SELECT PLATFORM</label>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  {["Zepto", "Blinkit", "Zomato", "Swiggy"].map(p => (
                    <button key={p} onClick={() => setPlatformId(p)} style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${platformId === p ? COLORS.accent : COLORS.border}`, background: platformId === p ? COLORS.accent + "22" : "transparent", color: platformId === p ? COLORS.accent : COLORS.muted, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>PARTNER WORKER ID</label>
                <input style={{ ...s.input, marginTop: 8 }} placeholder="e.g. ZPT-2024-KA-98765" defaultValue="ZPT-2024-KA-98765" />
              </div>
              <div>
                <label style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>DELIVERY ZONE</label>
                <input style={{ ...s.input, marginTop: 8 }} placeholder="e.g. Koramangala, Bengaluru" defaultValue="Koramangala, Bengaluru" />
              </div>
            </div>
          )}

          {onboardStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#0A1628", borderRadius: 14, padding: 18, border: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.accent, fontWeight: 700, fontSize: 13, margin: "0 0 12px" }}>🤖 AI Risk Profile Generated</p>
                {[
                  ["Daily Avg. Income", "Rs. 720 / day"],
                  ["Monthly Earnings", "Rs. 21,500"],
                  ["Delivery Zone Risk", "Medium (Koramangala)"],
                  ["Monsoon Flood Risk", "Moderate"],
                  ["Heat Advisory Risk", "Low–Medium"],
                  ["Platform Tenure", "3 years (Low churn risk)"],
                  ["Starting GigScore Tier", "Bronze → Silver eligible in 4 weeks"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 8 }}>
                    <span style={{ color: COLORS.muted, fontSize: 13 }}>{k}</span>
                    <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onboardStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { tier: "Bronze", price: 49, payout: 500, corpus: "Rs. 807 at year-end", highlight: false },
                { tier: "Silver", price: 39, payout: 750, corpus: "Rs. 643 at year-end", highlight: true },
              ].map(plan => (
                <div key={plan.tier} style={{ border: `2px solid ${plan.highlight ? COLORS.accent : COLORS.border}`, borderRadius: 16, padding: 18, background: plan.highlight ? COLORS.accent + "11" : "transparent", position: "relative" }}>
                  {plan.highlight && <span style={{ position: "absolute", top: -10, right: 16, ...s.tag(COLORS.accent), fontSize: 10 }}>RECOMMENDED</span>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 16, margin: "0 0 2px", color: tierColors[plan.tier] }}>{plan.tier} Plan</p>
                      <p style={{ color: COLORS.muted, fontSize: 12, margin: 0 }}>Up to Rs. {plan.payout}/week payout</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 800, fontSize: 22, margin: "0 0 2px", color: COLORS.accent }}>Rs. {plan.price}</p>
                      <p style={{ color: COLORS.muted, fontSize: 11, margin: 0 }}>per week</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, padding: "8px 12px", background: COLORS.green + "22", borderRadius: 8, border: `1px solid ${COLORS.green}44` }}>
                    <p style={{ color: COLORS.green, fontSize: 12, margin: 0, fontWeight: 600 }}>💰 GigCorpus Return: {plan.corpus}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: 14, background: "#0A1628", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 8px" }}>PAYMENT METHOD</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {["UPI Autopay", "Platform Wallet"].map(m => (
                    <button key={m} style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, fontSize: 12, fontFamily: "'Sora', sans-serif", cursor: "pointer" }}>{m}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {onboardStep > 0 && <button style={s.btnGhost} onClick={() => setOnboardStep(p => p - 1)}>← Back</button>}
            <button style={{ ...s.btn, flex: 1, padding: 15 }} onClick={() => {
              if (onboardStep < 2) setOnboardStep(p => p + 1);
              else { setLoggedIn(true); setScreen("app"); setActiveTab("dashboard"); }
            }}>
              {onboardStep < 2 ? "Continue →" : "Activate Coverage 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
