import { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Shield, Zap, TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin, CloudRain, Thermometer, Wind, Lock, Bell, ChevronRight, Star, Award, Users, DollarSign, Activity, Eye, RefreshCw, ArrowUpRight, ArrowDownRight, Wallet, BarChart2, LogOut, Menu, X, Home, FileText, CreditCard, Radio, AlertCircle, ChevronUp, ChevronDown, Phone, User } from "lucide-react";

const COLORS = {
  bg: "#060D1F",
  surface: "#0D1B35",
  card: "#112040",
  border: "#1E3A6E",
  accent: "#FF6B35",
  gold: "#F5A623",
  green: "#10B981",
  red: "#EF4444",
  blue: "#3B82F6",
  text: "#E8F0FF",
  muted: "#6B8CC7",
  purple: "#8B5CF6",
};

const gigWorker = {
  name: "Raju Sharma",
  phone: "+91 98765 43210",
  platform: "Zepto",
  zone: "Koramangala, Bengaluru",
  tenure: "3 years",
  dailyAvg: 720,
  monthlyEarnings: 21500,
  gigScore: 267,
  tier: "Silver",
  weeksPaid: 18,
  streak: 6,
  corpusInvested: 937.8,
  corpusReturn: 1006.4,
  weeksToMaturity: 34,
  policy: { weeklyPremium: 39, maxPayout: 750, coverageActive: true },
  claims: [
    { id: "CLM-2841", trigger: "Heavy Rain", date: "Mar 28, 2026", amount: 504, status: "Paid", zone: "Koramangala" },
    { id: "CLM-2756", trigger: "Extreme Heat", date: "Mar 12, 2026", amount: 360, status: "Paid", zone: "Koramangala" },
    { id: "CLM-2694", trigger: "Severe AQI", date: "Feb 18, 2026", amount: 288, status: "Paid", zone: "Koramangala" },
    { id: "CLM-2601", trigger: "Heavy Rain", date: "Jan 30, 2026", amount: 576, status: "Paid", zone: "HSR Layout" },
  ],
};

const corpusData = [
  { week: "W1", corpus: 14.7, cumulative: 14.7 },
  { week: "W4", corpus: 14.7, cumulative: 58.8 },
  { week: "W8", corpus: 14.7, cumulative: 117.6 },
  { week: "W12", corpus: 14.7, cumulative: 185.6 },
  { week: "W16", corpus: 14.7, cumulative: 264.2 },
  { week: "W18", corpus: 14.7, cumulative: 937.8 },
];

const premiumData = [
  { week: "W1", premium: 49, tier: "Bronze" },
  { week: "W4", premium: 49, tier: "Bronze" },
  { week: "W8", premium: 39, tier: "Silver" },
  { week: "W12", premium: 39, tier: "Silver" },
  { week: "W16", premium: 39, tier: "Silver" },
  { week: "W18", premium: 39, tier: "Silver" },
];

const scoreHistory = [
  { week: "W1", score: 10 }, { week: "W2", score: 25 }, { week: "W3", score: 40 },
  { week: "W4", score: 75 }, { week: "W6", score: 100 }, { week: "W8", score: 130 },
  { week: "W10", score: 165 }, { week: "W12", score: 190 }, { week: "W14", score: 220 },
  { week: "W16", score: 245 }, { week: "W18", score: 267 },
];

const lossRatioData = [
  { month: "Oct", ratio: 38, claims: 142 }, { month: "Nov", ratio: 29, claims: 98 },
  { month: "Dec", ratio: 31, claims: 115 }, { month: "Jan", ratio: 44, claims: 189 },
  { month: "Feb", ratio: 35, claims: 143 }, { month: "Mar", ratio: 52, claims: 231 },
];

const triggerStatuses = [
  { id: "T1", name: "Heavy Rain", icon: "🌧️", api: "OpenWeatherMap / IMD", threshold: ">64.5mm / 24h", current: "12.3mm", status: "safe", payout: "50–80%", color: "#3B82F6" },
  { id: "T2", name: "Extreme Heat", icon: "🌡️", api: "IMD Heat API / NDMA", threshold: ">45°C with advisory", current: "38.2°C", status: "safe", payout: "30–50%", color: "#F59E0B" },
  { id: "T3", name: "Severe AQI", icon: "💨", api: "CPCB Safar API", threshold: "AQI >400 for 3+hrs", current: "AQI 187", status: "warning", payout: "25–40%", color: "#8B5CF6" },
  { id: "T4", name: "Curfew / Lockdown", icon: "🚫", api: "State Govt. API + Platform", threshold: "Official order issued", current: "No alerts", status: "safe", payout: "80–100%", color: "#EF4444" },
  { id: "T5", name: "Flash Flood", icon: "🌊", api: "NDMA Flood Alert API", threshold: "Level-3 flood alert", current: "No alert", status: "safe", payout: "80–100%", color: "#06B6D4" },
];

export default function GigShield() {
  const [screen, setScreen] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("worker");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [onboardStep, setOnboardStep] = useState(0);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [platformId, setPlatformId] = useState("");
  const [triggers, setTriggers] = useState(triggerStatuses);
  const [alertBanner, setAlertBanner] = useState(null);
  const [claimInProgress, setClaimInProgress] = useState(false);
  const [claimStage, setClaimStage] = useState(0);
  const [withdrawOption, setWithdrawOption] = useState(null);
  const [ticker, setTicker] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Simulate live ticker
  useEffect(() => {
    const t = setInterval(() => setTicker(p => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  // Simulate AQI warning escalating
  useEffect(() => {
    if (!loggedIn) return;
    const t = setInterval(() => {
      setTriggers(prev => prev.map(tr => {
        if (tr.id === "T3") {
          const aqiVal = 187 + (ticker % 5) * 30;
          const newStatus = aqiVal >= 400 ? "triggered" : aqiVal >= 300 ? "warning" : "safe";
          if (newStatus === "triggered" && tr.status !== "triggered") {
            setAlertBanner({ trigger: "Severe AQI", amount: 216, id: "CLM-2899" });
            setTimeout(() => setAlertBanner(null), 8000);
          }
          return { ...tr, current: `AQI ${aqiVal}`, status: newStatus };
        }
        return tr;
      }));
    }, 4000);
    return () => clearInterval(t);
  }, [loggedIn, ticker]);

  const simulateClaim = () => {
    setClaimInProgress(true);
    setClaimStage(0);
    const stages = [0, 1, 2, 3, 4];
    stages.forEach((s, i) => setTimeout(() => setClaimStage(s), i * 900));
    setTimeout(() => { setClaimInProgress(false); setClaimStage(0); }, 5000);
  };

  const tierColors = { Bronze: "#CD7F32", Silver: "#94A3B8", Gold: "#F5A623", Platinum: "#A855F7" };
  const tierNext = { Bronze: "Silver", Silver: "Gold", Gold: "Platinum" };
  const tierThreshold = { Bronze: 100, Silver: 300, Gold: 600, Platinum: 1000 };

  const scoreProgress = Math.min(100, ((gigWorker.gigScore - (gigWorker.tier === "Silver" ? 100 : 0)) / (tierThreshold[gigWorker.tier] - (gigWorker.tier === "Silver" ? 100 : 0))) * 100);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const s = {
    app: { fontFamily: "'Sora', 'DM Sans', sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text, display: "flex" },
    sidebar: { width: sidebarOpen ? 240 : 64, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", transition: "width 0.3s ease", overflow: "hidden", flexShrink: 0 },
    main: { flex: 1, overflow: "auto", display: "flex", flexDirection: "column" },
    card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20 },
    btn: { background: COLORS.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" },
    btnGhost: { background: "transparent", color: COLORS.muted, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 20px", fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" },
    input: { background: "#0A1628", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", color: COLORS.text, fontFamily: "'Sora', sans-serif", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
    tag: (color) => ({ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700 }),
    stat: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 4 },
  };

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div style={{ ...s.app, justifyContent: "center", alignItems: "center", background: "radial-gradient(ellipse at 30% 40%, #0D2B5E 0%, #060D1F 60%)" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #060D1F; } ::-webkit-scrollbar-thumb { background: #1E3A6E; border-radius: 4px; }`}</style>
        <div style={{ width: 420, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Logo */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #FF6B35, #FF9B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={28} color="#fff" />
              </div>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>GigShield</span>
            </div>
            <p style={{ color: COLORS.muted, fontSize: 14, margin: 0 }}>Income protection for India's delivery workers</p>
          </div>

          {/* Login Card */}
          <div style={{ ...s.card, padding: 32, borderRadius: 24 }}>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>Choose your role to continue</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              {["Worker", "Admin"].map(r => (
                <button key={r} onClick={() => setRole(r.toLowerCase())} style={{ flex: 1, padding: "14px", borderRadius: 12, border: `2px solid ${role === r.toLowerCase() ? COLORS.accent : COLORS.border}`, background: role === r.toLowerCase() ? COLORS.accent + "22" : "transparent", color: role === r.toLowerCase() ? COLORS.accent : COLORS.muted, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                  {r === "Worker" ? "👷 Worker" : "📊 Admin"}
                </button>
              ))}
            </div>

            <label style={{ color: COLORS.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>MOBILE NUMBER</label>
            <input style={{ ...s.input, marginTop: 8, marginBottom: 16 }} placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />

            <button style={{ ...s.btn, width: "100%", padding: "15px", fontSize: 15 }} onClick={() => setScreen("otp")}>
              Get OTP →
            </button>
          </div>

          <p style={{ textAlign: "center", color: COLORS.muted, fontSize: 12 }}>
            Also available on <span style={{ color: COLORS.accent }}>WhatsApp</span> for low-data access
          </p>
        </div>
      </div>
    );
  }

  // ── OTP Screen ───────────────────────────────────────────────────────────────
  if (screen === "otp") {
    return (
      <div style={{ ...s.app, justifyContent: "center", alignItems: "center", background: "radial-gradient(ellipse at 30% 40%, #0D2B5E 0%, #060D1F 60%)" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap'); * { box-sizing: border-box; }`}</style>
        <div style={{ width: 400, ...s.card, padding: 36, borderRadius: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #FF6B35, #FF9B35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={22} color="#fff" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800 }}>GigShield</span>
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Enter OTP</h2>
          <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 28 }}>Sent to +91 98765 43210</p>

          <div style={{ display: "flex", gap: 12, marginBottom: 28, justifyContent: "center" }}>
            {[0,1,2,3].map(i => (
              <input key={i} ref={otpRefs[i]} maxLength={1}
                style={{ width: 60, height: 60, textAlign: "center", background: "#0A1628", border: `2px solid ${otp[i] ? COLORS.accent : COLORS.border}`, borderRadius: 14, color: COLORS.text, fontSize: 22, fontWeight: 700, fontFamily: "'Sora', sans-serif", outline: "none" }}
                value={otp[i]}
                onChange={e => { const v = otp.slice(); v[i] = e.target.value; setOtp(v); if (e.target.value && i < 3) otpRefs[i+1].current.focus(); }} />
            ))}
          </div>

          <button style={{ ...s.btn, width: "100%", padding: 15, fontSize: 15 }} onClick={() => role === "worker" ? setScreen("onboard") : (setLoggedIn(true), setScreen("app"), setRole("admin"), setActiveTab("admin"))}>
            Verify & Continue →
          </button>
          <button style={{ ...s.btnGhost, width: "100%", marginTop: 12 }} onClick={() => setScreen("login")}>← Back</button>
        </div>
      </div>
    );
  }

  // ── Onboarding ───────────────────────────────────────────────────────────────
  if (screen === "onboard") {
    const steps = [
      { title: "Your Platform", subtitle: "Connect your delivery account" },
      { title: "Risk Profile", subtitle: "AI is analyzing your zone & history" },
      { title: "Choose Your Plan", subtitle: "Weekly coverage starting Monday" },
    ];
    return (
      <div style={{ ...s.app, justifyContent: "center", alignItems: "center", background: "radial-gradient(ellipse at 70% 30%, #0D2B5E 0%, #060D1F 60%)" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap'); * { box-sizing: border-box; }`}</style>
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

  // ── Main App ─────────────────────────────────────────────────────────────────
  const navItems = role === "admin"
    ? [
        { id: "admin", icon: <BarChart2 size={18} />, label: "Analytics" },
        { id: "triggers_admin", icon: <Radio size={18} />, label: "Live Triggers" },
        { id: "fraud", icon: <AlertCircle size={18} />, label: "Fraud Queue" },
        { id: "corpus_admin", icon: <TrendingUp size={18} />, label: "Corpus Fund" },
      ]
    : [
        { id: "dashboard", icon: <Home size={18} />, label: "Dashboard" },
        { id: "gigscore", icon: <Star size={18} />, label: "GigScore" },
        { id: "policy", icon: <FileText size={18} />, label: "My Policy" },
        { id: "triggers", icon: <Radio size={18} />, label: "Live Triggers" },
        { id: "claims", icon: <CheckCircle size={18} />, label: "Claims" },
        { id: "corpus", icon: <TrendingUp size={18} />, label: "GigCorpus" },
      ];

  return (
    <div style={s.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #060D1F; } ::-webkit-scrollbar-thumb { background: #1E3A6E; border-radius: 4px; }
      button:hover { opacity: 0.9; } input:focus { border-color: #FF6B35 !important; }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={s.sidebar}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #FF6B35, #FF9B35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Shield size={18} color="#fff" />
          </div>
          {sidebarOpen && <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: "nowrap" }}>GigShield</span>}
        </div>

        {sidebarOpen && role === "worker" && (
          <div style={{ padding: "16px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${tierColors[gigWorker.tier]}33`, border: `2px solid ${tierColors[gigWorker.tier]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👷</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{gigWorker.name}</p>
                <p style={{ color: tierColors[gigWorker.tier], fontSize: 11, fontWeight: 600 }}>● {gigWorker.tier} · {gigWorker.platform}</p>
              </div>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", background: activeTab === item.id ? COLORS.accent + "22" : "transparent", color: activeTab === item.id ? COLORS.accent : COLORS.muted, fontFamily: "'Sora', sans-serif", fontWeight: activeTab === item.id ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all 0.2s", textAlign: "left", width: "100%" }}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 8px", borderTop: `1px solid ${COLORS.border}` }}>
          <button onClick={() => setScreen("login")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "none", background: "transparent", color: COLORS.muted, fontFamily: "'Sora', sans-serif", fontSize: 13, cursor: "pointer", width: "100%" }}>
            <LogOut size={18} />{sidebarOpen && "Sign Out"}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={s.main}>
        {/* Topbar */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surface, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer" }}>
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 800 }}>{navItems.find(n => n.id === activeTab)?.label}</h1>
              <p style={{ color: COLORS.muted, fontSize: 11 }}>Live as of {new Date().toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {alertBanner && (
              <div style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, animation: "slideIn 0.4s ease" }}>
                <Zap size={14} color={COLORS.accent} />
                <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700 }}>Auto-claim {alertBanner.id} initiated! Rs. {alertBanner.amount} payout</span>
              </div>
            )}
            <div style={{ position: "relative" }}>
              <Bell size={20} color={COLORS.muted} />
              <span style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: "50%", background: COLORS.accent }} />
            </div>
          </div>
        </div>

        {/* ── WORKER DASHBOARD ── */}
        {activeTab === "dashboard" && (
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
                  {triggerStatuses.map(tr => (
                    <div key={tr.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#0A1628", borderRadius: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{tr.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{tr.name}</span>
                      </div>
                      <span style={{ ...s.tag(triggers.find(t=>t.id===tr.id)?.status === "triggered" ? COLORS.red : triggers.find(t=>t.id===tr.id)?.status === "warning" ? COLORS.gold : COLORS.green), fontSize: 10 }}>
                        {triggers.find(t=>t.id===tr.id)?.status?.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GigScore Progress */}
              <div style={s.card}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>GigScore Progress</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: `conic-gradient(${tierColors[gigWorker.tier]} ${scoreProgress * 3.6}deg, #1E3A6E 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
                  <AreaChart data={scoreHistory}>
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
                <button onClick={() => setActiveTab("claims")} style={{ ...s.btnGhost, padding: "6px 14px", fontSize: 12 }}>View all</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {gigWorker.claims.slice(0, 3).map(claim => (
                  <div key={claim.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#0A1628", borderRadius: 12 }}>
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
        )}

        {/* ── GIGSCORE SCREEN ── */}
        {activeTab === "gigscore" && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Score Hero */}
            <div style={{ ...s.card, background: `linear-gradient(135deg, #112040 0%, #0D1B35 100%)`, position: "relative", overflow: "hidden", padding: 32 }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `${tierColors[gigWorker.tier]}11`, border: `1px solid ${tierColors[gigWorker.tier]}22` }} />
              <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
                <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${tierColors[gigWorker.tier]} ${scoreProgress * 3.6}deg, #1E3A6E 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                  <AreaChart data={scoreHistory}>
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
                    <div key={action} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0A1628", borderRadius: 8 }}>
                      <span style={{ color: COLORS.text, fontSize: 13 }}>{action}</span>
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
        )}

        {/* ── LIVE TRIGGERS ── */}
        {(activeTab === "triggers" || activeTab === "triggers_admin") && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, animation: "pulse 1.5s infinite" }} />
              <span style={{ color: COLORS.green, fontSize: 12, fontWeight: 600 }}>LIVE MONITORING — Bengaluru, Koramangala Zone</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {triggers.map(tr => (
                <div key={tr.id} style={{ ...s.card, border: `1px solid ${tr.status === "triggered" ? COLORS.red : tr.status === "warning" ? COLORS.gold : COLORS.border}`, background: tr.status === "triggered" ? COLORS.red + "11" : tr.status === "warning" ? COLORS.gold + "11" : COLORS.card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 28 }}>{tr.icon}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15 }}>{tr.name}</p>
                        <p style={{ color: COLORS.muted, fontSize: 11 }}>{tr.api}</p>
                      </div>
                    </div>
                    <span style={s.tag(tr.status === "triggered" ? COLORS.red : tr.status === "warning" ? COLORS.gold : COLORS.green)}>
                      {tr.status === "triggered" ? "⚡ TRIGGERED" : tr.status === "warning" ? "⚠ WARNING" : "✓ SAFE"}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "#0A1628", borderRadius: 8, padding: 10 }}>
                      <p style={{ color: COLORS.muted, fontSize: 10, marginBottom: 2 }}>THRESHOLD</p>
                      <p style={{ fontSize: 12, fontWeight: 600 }}>{tr.threshold}</p>
                    </div>
                    <div style={{ background: "#0A1628", borderRadius: 8, padding: 10 }}>
                      <p style={{ color: COLORS.muted, fontSize: 10, marginBottom: 2 }}>CURRENT READING</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: tr.status === "triggered" ? COLORS.red : tr.status === "warning" ? COLORS.gold : COLORS.green }}>{tr.current}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}>Payout if triggered: <strong style={{ color: COLORS.text }}>{tr.payout} daily avg</strong></span>
                    {tr.status === "triggered" && <button style={{ ...s.btn, padding: "6px 14px", fontSize: 12 }} onClick={simulateClaim}>Simulate Claim</button>}
                  </div>

                  {/* Claim Progress */}
                  {claimInProgress && tr.status === "triggered" && (
                    <div style={{ marginTop: 12, background: "#0A1628", borderRadius: 10, padding: 14 }}>
                      {["📡 Detecting disruption zone...", "🔍 Cross-validating with secondary source...", "📍 Confirming worker GPS zone...", "🤖 Running fraud detection (5 layers)...", "✅ Claim approved! Payout initiated."].map((stage, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, opacity: i <= claimStage ? 1 : 0.3, transition: "opacity 0.3s" }}>
                          <span style={{ fontSize: 12 }}>{i < claimStage ? "✅" : i === claimStage ? "⏳" : "⬜"}</span>
                          <span style={{ fontSize: 12, color: i <= claimStage ? COLORS.text : COLORS.muted }}>{stage}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={s.card}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Zero-Touch Claim Flow</h3>
              <div style={{ display: "flex", gap: 0 }}>
                {["API Poll\n(15min)", "Threshold\nCrossed", "Zone\nMatch", "Fraud\nCheck", "Claim\nCreated", "UPI\nPayout"].map((step, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.accent + "22", border: `2px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 13, fontWeight: 700, color: COLORS.accent }}>{i + 1}</div>
                    <p style={{ color: COLORS.muted, fontSize: 10, whiteSpace: "pre-line" }}>{step}</p>
                    {i < 5 && <div style={{ position: "absolute", top: 18, left: "60%", width: "80%", height: 2, background: COLORS.border }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CLAIMS ── */}
        {activeTab === "claims" && (
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
                  <div key={claim.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#0A1628", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
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

            <div style={{ ...s.card, background: "linear-gradient(135deg, #1a1040, #112040)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Simulate Auto-Claim</h3>
                  <p style={{ color: COLORS.muted, fontSize: 13 }}>Watch the zero-touch claim flow in real-time</p>
                </div>
                <button style={s.btn} onClick={simulateClaim}>▶ Run Simulation</button>
              </div>
              {claimInProgress && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  {["📡 Trigger threshold crossed — AQI 412 detected in Koramangala", "🔄 Cross-validating with NDMA secondary source...", "📍 Worker GPS confirmed within disrupted zone", "🤖 Fraud Score: 12/100 — Auto-approved", "💸 Rs. 216 payout sent to UPI — Claim CLM-2899 CLOSED"].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: i <= claimStage ? COLORS.green + "22" : "#0A1628", border: `1px solid ${i <= claimStage ? COLORS.green + "44" : COLORS.border}`, transition: "all 0.3s", opacity: i <= claimStage ? 1 : 0.4 }}>
                      <span style={{ fontSize: 12 }}>{i <= claimStage ? "✅" : "⬜"}</span>
                      <span style={{ fontSize: 12 }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GIGCORPUS ── */}
        {activeTab === "corpus" && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Hero */}
            <div style={{ ...s.card, background: "linear-gradient(135deg, #0D2B5E 0%, #112040 100%)", padding: 28 }}>
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
                  <AreaChart data={corpusData}>
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
                    <Pie data={[{v:40},{v:25},{v:20},{v:10},{v:5}]} dataKey="v" cx={60} cy={60} innerRadius={35} outerRadius={60}>
                      {["#10B981","#3B82F6","#8B5CF6","#F5A623","#6B8CC7"].map((c,i) => <Cell key={i} fill={c} />)}
                    </Pie>
                  </PieChart>
                  <div style={{ flex: 1 }}>
                    {[["G-Secs", "40%", "#10B981"], ["RBI Bonds", "25%", "#3B82F6"], ["Liquid MF", "20%", "#8B5CF6"], ["Debt Funds", "10%", "#F5A623"], ["Overnight", "5%", "#6B8CC7"]].map(([n, p, c]) => (
                      <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                          <span style={{ fontSize: 11, color: COLORS.muted }}>{n}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{p}</span>
                      </div>
                    ))}
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
        )}

        {/* ── POLICY ── */}
        {activeTab === "policy" && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ ...s.card, background: "linear-gradient(135deg, #0D2B5E, #112040)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ color: COLORS.muted, fontSize: 12, letterSpacing: 1 }}>ACTIVE POLICY</p>
                  <h2 style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>Silver Protection Plan</h2>
                  <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>Policy ID: GS-KA-2026-9876 · Renews every Monday 00:00</p>
                </div>
                <span style={{ ...s.tag(COLORS.green), fontSize: 12, padding: "6px 16px" }}>● ACTIVE</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 20 }}>
                {[["Weekly Premium", "Rs. 39"], ["Max Payout", "Rs. 750/week"], ["Claim Speed", "8 hours"], ["Coverage Since", "Week 1, 2026"]].map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12 }}>
                    <p style={{ color: COLORS.muted, fontSize: 10 }}>{k}</p>
                    <p style={{ fontWeight: 700, fontSize: 15, marginTop: 4 }}>{v}</p>
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
        )}

        {/* ── ADMIN DASHBOARD ── */}
        {activeTab === "admin" && (
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
        )}

        {/* ── FRAUD QUEUE ── */}
        {activeTab === "fraud" && (
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
        )}

        {/* ── CORPUS ADMIN ── */}
        {activeTab === "corpus_admin" && (
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
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#0A1628", borderRadius: 10 }}>
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
        )}
      </div>
    </div>
  );
}
