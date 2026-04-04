import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   GIGGUARD — Complete Worker Mobile App
   All business logic, all screens, all interactions in one JSX file
   ═══════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────
const C = {
  bg:          "#07111F",
  surface:     "#0C1A2E",
  card:        "#101F38",
  cardElev:    "#152540",
  border:      "#1C3050",
  accent:      "#FF6B35",
  accentGlow:  "rgba(255,107,53,0.25)",
  gold:        "#F0A500",
  goldGlow:    "rgba(240,165,0,0.2)",
  green:       "#00D68F",
  greenGlow:   "rgba(0,214,143,0.2)",
  red:         "#FF3D5A",
  blue:        "#4D9EFF",
  purple:      "#B06EFF",
  text:        "#E2EDFF",
  dim:         "#7A9EC5",
  muted:       "#3D5A7A",
  white:       "#FFFFFF",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`;

const GLOBAL_CSS = `
  .mobile-app-wrapper * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  .mobile-app-wrapper { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 80vh; font-family: 'Outfit', sans-serif; }
  .mobile-app-wrapper ::-webkit-scrollbar { width: 0px; }
  .mobile-app-wrapper input, .mobile-app-wrapper button, .mobile-app-wrapper select { font-family: 'Outfit', sans-serif; }
  .mobile-app-wrapper input:focus { outline: none; }
  .mobile-app-wrapper button { cursor: pointer; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes spin     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  @keyframes ping     { 0% { transform:scale(1); opacity:1; } 75%,100% { transform:scale(2); opacity:0; } }
  @keyframes shimmer  { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
  @keyframes bounceIn { 0% { transform:scale(.7); opacity:0; } 60% { transform:scale(1.05); opacity:1; } 100% { transform:scale(1); } }
  @keyframes glow     { 0%,100% { box-shadow:0 0 8px rgba(255,107,53,.4); } 50% { box-shadow:0 0 20px rgba(255,107,53,.8); } }
  .fade-up   { animation: fadeUp .4s ease forwards; }
  .fade-in   { animation: fadeIn .3s ease forwards; }
  .slide-up  { animation: slideUp .4s cubic-bezier(.16,1,.3,1) forwards; }
  .bounce-in { animation: bounceIn .5s cubic-bezier(.16,1,.3,1) forwards; }
`;

// ─────────────────────────────────────────────────────────────────────
// BUSINESS LOGIC ENGINE
// ─────────────────────────────────────────────────────────────────────
const TIER_CONFIG = {
  Bronze:   { min:0,   max:99,  label:"Bronze",   premium:49, payout:500,  speed:"48h", color:"#CD7F32", next:"Silver",   ptNeeded:100  },
  Silver:   { min:100, max:299, label:"Silver",   premium:39, payout:750,  speed:"8h",  color:"#94A3B8", next:"Gold",     ptNeeded:300  },
  Gold:     { min:300, max:599, label:"Gold",     premium:29, payout:1000, speed:"4h",  color:"#F0A500", next:"Platinum", ptNeeded:600  },
  Platinum: { min:600, max:999, label:"Platinum", premium:19, payout:1500, speed:"2h",  color:"#B06EFF", next:null,       ptNeeded:null },
};

const POINT_RULES = {
  weeklyPayment:      { pts: 10,  desc: "Weekly subscription payment"   },
  streak4:            { pts: 20,  desc: "4-week streak bonus"            },
  streak12:           { pts: 60,  desc: "12-week streak bonus"           },
  claimFreeWeek:      { pts: 5,   desc: "Claim-free week"                },
  referral:           { pts: 25,  desc: "Referral (new subscriber)"      },
  onboardingQuiz:     { pts: 15,  desc: "Onboarding quiz completed"      },
  anniversary12:      { pts: 100, desc: "12-month anniversary"           },
  corpusTopup:        { pts: 8,   desc: "Voluntary corpus top-up"        },
  fraudPenalty:       { pts: -50, desc: "Fraudulent claim detected"      },
  lapsePenalty:       { pts: -5,  desc: "Policy lapse (missed payment)"  },
};

function getTier(score) {
  if (score >= 600) return "Platinum";
  if (score >= 300) return "Gold";
  if (score >= 100) return "Silver";
  return "Bronze";
}

function getTierProgress(score) {
  const tier   = getTier(score);
  const cfg    = TIER_CONFIG[tier];
  const pct    = Math.min(100, ((score - cfg.min) / (cfg.max - cfg.min)) * 100);
  const ptsLeft = cfg.max + 1 - score;
  return { tier, cfg, pct, ptsLeft };
}

/* Premium Formula:
   Weekly Premium = Base - GigScore Discount - Zone Safety Discount + Seasonal Loading
   Floor: ₹15 always */
function calcPremium({ score, zoneSafetyDisc = 0, seasonalLoad = 0 }) {
  const base = TIER_CONFIG[getTier(score)].premium;
  return Math.max(15, base - zoneSafetyDisc + seasonalLoad);
}

/* GigCorpus Formula:
   30% of each weekly premium invested
   Future Value of annuity at 7.2% p.a. (weekly compounding) */
function calcCorpus(weeklyPremium, weeksActive) {
  const ANNUAL_RATE  = 0.072;
  const weeklyRate   = ANNUAL_RATE / 52;
  const weeklyContrib = parseFloat((weeklyPremium * 0.30).toFixed(2));
  const invested     = parseFloat((weeklyContrib * weeksActive).toFixed(2));
  // FV of annuity-due: Σ C*(1+r)^(n-t) for t=0..n-1
  let fv = 0;
  for (let w = 0; w < weeksActive; w++) {
    fv += weeklyContrib * Math.pow(1 + weeklyRate, weeksActive - w);
  }
  const mgmtFee      = parseFloat((fv * 0.015).toFixed(2));
  const netReturn    = parseFloat((fv - mgmtFee).toFixed(2));
  return { weeklyContrib, invested, gross: +fv.toFixed(2), mgmtFee, netReturn };
}

/* Payout Formula:
   Payout = Daily Average Income × Trigger Payout % */
const TRIGGER_DEFS = [
  { id:"T1", name:"Heavy Rain",   emoji:"🌧️", api:"OpenWeatherMap / IMD",  threshold:"Rainfall >64.5mm / 24h",       unit:"mm",  safe:30,  warn:50,  fire:64.5, payMin:0.50, payMax:0.80, color:C.blue   },
  { id:"T2", name:"Extreme Heat", emoji:"🌡️", api:"IMD Heat API / NDMA",   threshold:"Temp >45°C + heat advisory",   unit:"°C",  safe:38,  warn:42,  fire:45,   payMin:0.30, payMax:0.50, color:C.gold   },
  { id:"T3", name:"Severe AQI",   emoji:"💨", api:"CPCB Safar API",         threshold:"AQI >400 for 3+ consecutive hrs", unit:"AQI", safe:200, warn:300, fire:400,  payMin:0.25, payMax:0.40, color:C.purple },
  { id:"T4", name:"Curfew",       emoji:"🚫", api:"State Govt + Platform",  threshold:"Official curfew / zone halt",  unit:"",    safe:0,   warn:0,   fire:1,    payMin:0.80, payMax:1.00, color:C.red    },
  { id:"T5", name:"Flash Flood",  emoji:"🌊", api:"NDMA Flood Alert API",   threshold:"NDMA Level-3 flood alert",    unit:"",    safe:0,   warn:0,   fire:1,    payMin:0.80, payMax:1.00, color:"#06B6D4" },
];

function calcPayout(dailyAvg, triggerId) {
  const t = TRIGGER_DEFS.find(d => d.id === triggerId);
  if (!t) return 0;
  const pct = t.payMin + (t.payMax - t.payMin) * 0.65;
  return Math.round(dailyAvg * pct);
}

/* Fraud Score Engine (5 layers, 0–100) */
function calcFraudScore({ gpsValid, zoneValid, velocityNormal, networkClean, tier, isFirstClaim }) {
  let score = 0;
  if (!gpsValid)        score += 38; // GPS spoof
  if (!zoneValid)       score += 22; // Zone farming
  if (!velocityNormal)  score += 18; // Velocity anomaly (Isolation Forest proxy)
  if (!networkClean)    score += 17; // Network graph fraud (GNN proxy)
  if (isFirstClaim && tier === "Bronze") score += 5; // New account gate
  return Math.min(100, score);
}

// Premium allocation buckets (per ₹100)
const PREMIUM_ALLOC = [
  { label: "Claim Reserve",   pct: 45, color: C.green  },
  { label: "GigCorpus Pool",  pct: 30, color: C.gold   },
  { label: "Fraud Reserve",   pct: 10, color: C.purple },
  { label: "Platform Ops",    pct: 10, color: C.blue   },
  { label: "Reinsurance",     pct:  5, color: C.dim    },
];

// Portfolio allocation
const PORTFOLIO = [
  { name:"G-Secs",       alloc:40, ret:7.35, color:C.green  },
  { name:"RBI Bonds",    alloc:25, ret:7.65, color:C.blue   },
  { name:"Liquid MF",    alloc:20, ret:6.90, color:C.purple },
  { name:"Debt Funds",   alloc:10, ret:7.45, color:C.gold   },
  { name:"Overnight",    alloc: 5, ret:5.80, color:C.dim    },
];

// ─────────────────────────────────────────────────────────────────────
// INITIAL STATE (Worker Profile)
// ─────────────────────────────────────────────────────────────────────
const INITIAL_WORKER = {
  name: "Raju Sharma",
  phone: "+91 98765 43210",
  platform: "Zepto",
  zone: "Koramangala, Bengaluru",
  zoneCode: "BLR-KOR-04",
  partnerId: "ZPT-2024-KA-98765",
  tenure: "3 years",
  dailyAvg: 720,
  monthlyEarnings: 21500,
  gigScore: 267,
  weeksPaid: 18,
  streak: 6,
  referrals: 2,
  planActive: true,
  planStart: "Jan 6, 2026",
  upiId: "raju.sharma@okaxis",
  claimCount: 4,
  totalClaimed: 1728,
  notifications: [
    { id:1, type:"claim",  msg:"Rs. 504 payout processed — Heavy Rain",  time:"2h ago",  read:false },
    { id:2, type:"score",  msg:"🔥 6-week streak! +20 bonus points",      time:"1d ago",  read:false },
    { id:3, type:"corpus", msg:"Corpus updated: Rs. 937.80 invested",     time:"3d ago",  read:true  },
    { id:4, type:"tip",    msg:"2 more weeks to Silver → Gold boundary",  time:"1w ago",  read:true  },
  ],
};

const CLAIM_HISTORY = [
  { id:"CLM-2841", trigger:"Heavy Rain",   triggerId:"T1", date:"Mar 28, 2026", amount:504,  status:"Paid",    zone:"Koramangala", fraudScore:8  },
  { id:"CLM-2756", trigger:"Extreme Heat", triggerId:"T2", date:"Mar 12, 2026", amount:360,  status:"Paid",    zone:"Koramangala", fraudScore:11 },
  { id:"CLM-2694", trigger:"Severe AQI",   triggerId:"T3", date:"Feb 18, 2026", amount:288,  status:"Paid",    zone:"Koramangala", fraudScore:6  },
  { id:"CLM-2601", trigger:"Heavy Rain",   triggerId:"T1", date:"Jan 30, 2026", amount:576,  status:"Paid",    zone:"HSR Layout",  fraudScore:9  },
];

const SCORE_HISTORY = [
  { w:"W1",  s:10  }, { w:"W2",  s:25  }, { w:"W3",  s:40  }, { w:"W4",  s:75  },
  { w:"W5",  s:90  }, { w:"W6",  s:100 }, { w:"W7",  s:115 }, { w:"W8",  s:135 },
  { w:"W9",  s:155 }, { w:"W10", s:175 }, { w:"W11", s:190 }, { w:"W12", s:210 },
  { w:"W13", s:222 }, { w:"W14", s:238 }, { w:"W15", s:248 }, { w:"W16", s:256 },
  { w:"W17", s:263 }, { w:"W18", s:267 },
];

// ─────────────────────────────────────────────────────────────────────
// MINI SVG CHART COMPONENTS
// ─────────────────────────────────────────────────────────────────────
function LineChart({ data, dataKey, w = 300, h = 80, color = C.accent, fill = false }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d[dataKey]);
  const min  = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => [
    (i / (vals.length - 1)) * w,
    h - ((v - min) / range) * (h - 8) - 4,
  ]);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`lg_${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaD} fill={`url(#lg_${color.replace("#","")})`} />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill={color} />
    </svg>
  );
}

function BarChart({ data, dataKey, w = 300, h = 80, color = C.accent }) {
  if (!data || data.length === 0) return null;
  const vals = data.map(d => d[dataKey]);
  const max  = Math.max(...vals) || 1;
  const barW = (w / data.length) - 3;
  return (
    <svg width={w} height={h}>
      {vals.map((v, i) => {
        const bh = ((v / max) * (h - 8));
        return (
          <rect key={i} x={i * (barW + 3)} y={h - bh} width={barW} height={bh}
            fill={color} rx="3" opacity="0.85" />
        );
      })}
    </svg>
  );
}

function CircleProgress({ score, size = 120, tier }) {
  const { pct, cfg } = getTierProgress(score);
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={cfg.color}
        strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.16,1,.3,1)" }}
        filter={`drop-shadow(0 0 6px ${cfg.color})`} />
    </svg>
  );
}

function MiniDonut({ data, size = 120 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = data.reduce((a, d) => a + d.alloc, 0);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {data.map((d, i) => {
        const dash = (d.alloc / total) * circ;
        const seg = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={d.color} strokeWidth="18"
            strokeDasharray={`${dash - 1} ${circ}`}
            strokeDashoffset={-offset} />
        );
        offset += dash;
        return seg;
      })}
      <circle cx={size/2} cy={size/2} r={r - 12} fill={C.card} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// REUSABLE UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────
function Tag({ label, color = C.accent }) {
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 6, padding: "2px 9px", fontSize: 10, fontWeight: 700, letterSpacing: .4 }}>
      {label}
    </span>
  );
}

function Btn({ children, onPress, variant = "primary", style: sx = {}, disabled = false }) {
  const base = {
    width: "100%", padding: "14px 0", borderRadius: 14, fontFamily: "'Outfit', sans-serif",
    fontWeight: 700, fontSize: 15, border: "none", transition: "all .15s", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? .5 : 1,
  };
  const variants = {
    primary:   { background: `linear-gradient(135deg, ${C.accent}, #FF8C5A)`, color: C.white, boxShadow: `0 4px 20px ${C.accentGlow}` },
    ghost:     { background: "transparent", color: C.dim, border: `1px solid ${C.border}` },
    gold:      { background: `linear-gradient(135deg, ${C.gold}, #FFC347)`, color: "#1a0f00", boxShadow: `0 4px 20px ${C.goldGlow}` },
    danger:    { background: C.red + "22", color: C.red, border: `1px solid ${C.red}44` },
    secondary: { background: C.card, color: C.text, border: `1px solid ${C.border}` },
  };
  return (
    <button onClick={disabled ? null : onPress} style={{ ...base, ...variants[variant], ...sx }}>
      {children}
    </button>
  );
}

function Card({ children, style: sx = {}, glow = null }) {
  return (
    <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`,
      padding: 16, ...(glow ? { boxShadow: `0 0 24px ${glow}` } : {}), ...sx }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color = C.accent, icon }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 14px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: C.dim, fontWeight: 600, letterSpacing: .6, textTransform: "uppercase" }}>{label}</span>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ text, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{text}</div>
      {sub && <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "12px 0" }} />;
}

function LiveDot({ color = C.green }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 8, height: 8 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "ping 1.5s infinite" }} />
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
    </span>
  );
}

function Toast({ msg, visible }) {
  if (!visible) return null;
  return (
    <div style={{ position: "absolute", bottom: 90, left: 16, right: 16, zIndex: 999,
      background: C.green, color: "#001a0f", borderRadius: 14, padding: "13px 16px",
      fontWeight: 700, fontSize: 13, textAlign: "center", animation: "slideUp .3s ease",
      boxShadow: `0 8px 30px ${C.greenGlow}` }}>
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: SPLASH
// ─────────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", background: C.bg, gap: 20 }}>
      <div style={{ animation: "bounceIn .6s .3s cubic-bezier(.16,1,.3,1) both" }}>
        <div style={{ width: 90, height: 90, borderRadius: 28, background: `linear-gradient(135deg, ${C.accent}, #FF9B35)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42,
          boxShadow: `0 0 40px ${C.accentGlow}` }}>
          🛡️
        </div>
      </div>
      <div style={{ animation: "fadeUp .5s .7s ease both", textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: C.white, letterSpacing: -1 }}>GigGuard</div>
        <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>Income protection for delivery workers</div>
      </div>
      <div style={{ animation: "fadeIn .5s 1.5s ease both", marginTop: 30 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border, overflow: "hidden" }}>
          <div style={{ height: "100%", background: C.accent, animation: "shimmer 1.5s infinite",
            backgroundImage: `linear-gradient(90deg, ${C.accent} 0%, #FF9B35 50%, ${C.accent} 100%)`,
            backgroundSize: "400px 100%" }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: LOGIN
// ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onNext }) {
  const [phone, setPhone]   = useState("98765 43210");
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 20px 32px", background: C.bg }}>
      <div style={{ marginBottom: 40, animation: "fadeUp .4s ease" }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${C.accent}, #FF9B35)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 20,
          boxShadow: `0 0 20px ${C.accentGlow}` }}>
          🛡️
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>Welcome to<br/>GigGuard</div>
        <div style={{ fontSize: 14, color: C.dim, marginTop: 8 }}>Your income safety net, every week.</div>
      </div>

      <div style={{ flex: 1, animation: "fadeUp .4s .1s ease both" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: .8, marginBottom: 8 }}>MOBILE NUMBER</div>
          <div style={{ display: "flex", alignItems: "center", background: C.surface, border: `2px solid ${focused ? C.accent : C.border}`,
            borderRadius: 14, overflow: "hidden", transition: "border-color .2s" }}>
            <div style={{ padding: "14px 14px", borderRight: `1px solid ${C.border}`, color: C.dim, fontWeight: 600, fontSize: 15, flexShrink: 0 }}>
              +91
            </div>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              style={{ flex: 1, background: "transparent", border: "none", padding: "14px", color: C.text, fontSize: 16, fontWeight: 600 }}
              placeholder="Enter mobile number" />
          </div>
        </div>

        <Btn onPress={onNext}>Send OTP →</Btn>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: C.muted }}>Also available via </span>
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>WhatsApp</span>
          <span style={{ fontSize: 12, color: C.muted }}> for low-data access</span>
        </div>
      </div>

      <div style={{ animation: "fadeUp .4s .2s ease both" }}>
        {[["🛡️", "Income protection during disruptions"],
          ["💰", "GigCorpus returns at year-end"],
          ["⚡", "Auto-claim — no forms, no waiting"]].map(([ic, tx]) => (
          <div key={tx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
            <span style={{ fontSize: 20 }}>{ic}</span>
            <span style={{ fontSize: 13, color: C.dim }}>{tx}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: OTP VERIFICATION
// ─────────────────────────────────────────────────────────────────────
function OTPScreen({ onNext, onBack }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verified, setVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(p => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleOtpChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 3) refs[i + 1].current.focus();
    if (next.every(d => d !== "") && next.join("") === "1234") {
      setVerified(true);
      setTimeout(onNext, 600);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "48px 20px 32px", background: C.bg }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.dim, fontSize: 13, textAlign: "left", marginBottom: 32, fontWeight: 600 }}>
        ← Back
      </button>
      <div style={{ marginBottom: 36, animation: "fadeUp .4s ease" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.white }}>Verify OTP</div>
        <div style={{ fontSize: 13, color: C.dim, marginTop: 6 }}>Enter the 4-digit code sent to +91 98765 43210</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>(Demo: use 1234)</div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 36, animation: "fadeUp .4s .1s ease both" }}>
        {[0,1,2,3].map(i => (
          <input key={i} ref={refs[i]} maxLength={1} value={otp[i]}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === "Backspace" && !otp[i] && i > 0) refs[i-1].current.focus(); }}
            style={{ width: 65, height: 65, textAlign: "center", background: C.surface,
              border: `2px solid ${otp[i] ? C.accent : C.border}`, borderRadius: 16, color: C.white,
              fontSize: 24, fontWeight: 700, transition: "border-color .2s",
              ...(verified ? { background: C.green + "22", borderColor: C.green } : {}) }} />
        ))}
      </div>

      {verified
        ? <div style={{ textAlign: "center", color: C.green, fontWeight: 700, animation: "bounceIn .4s ease" }}>✅ Verified! Setting up profile...</div>
        : (
          <>
            <Btn onPress={() => { if (otp.join("").length === 4) { setVerified(true); setTimeout(onNext, 600); } }}>
              Verify OTP
            </Btn>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.muted }}>
              {resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : <span style={{ color: C.accent, fontWeight: 600, cursor: "pointer" }} onClick={() => setResendTimer(30)}>Resend OTP</span>}
            </div>
          </>
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: ONBOARDING (3 steps)
// ─────────────────────────────────────────────────────────────────────
function OnboardingScreen({ onDone }) {
  const [step, setStep]           = useState(0);
  const [platform, setPlatform]   = useState("Zepto");
  const [zone, setZone]           = useState("Koramangala, Bengaluru");
  const [pid, setPid]             = useState("ZPT-2024-KA-98765");
  const [analysing, setAnalysing] = useState(false);
  const [profileDone, setProfileDone] = useState(false);
  const [plan, setPlan]           = useState("Silver");
  const [payment, setPayment]     = useState("UPI");
  const [profileItems, setProfileItems] = useState([]);

  const AI_PROFILE_STEPS = [
    "Reading platform earnings data...",
    "Analysing zone flood & heat risk...",
    "Running XGBoost premium model...",
    "Generating risk profile...",
    "✅ Profile complete!",
  ];

  const startAI = () => {
    setAnalysing(true);
    setProfileItems([]);
    AI_PROFILE_STEPS.forEach((s, i) => {
      setTimeout(() => {
        setProfileItems(p => [...p, s]);
        if (i === AI_PROFILE_STEPS.length - 1) { setAnalysing(false); setProfileDone(true); }
      }, i * 700);
    });
  };

  const stepTitles = ["Your Platform", "AI Risk Profile", "Choose Your Plan"];
  const stepSubs   = ["Connect your delivery account", "Powered by XGBoost ML", "Weekly coverage — starts Monday"];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      {/* Progress Bar */}
      <div style={{ display: "flex", gap: 6, padding: "20px 20px 0" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= step ? C.accent : C.border, transition: "background .3s" }} />
        ))}
      </div>

      <div style={{ flex: 1, padding: "24px 20px 32px", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: .8 }}>STEP {step+1} OF 3</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.white, marginTop: 4 }}>{stepTitles[step]}</div>
          <div style={{ fontSize: 13, color: C.dim, marginTop: 3 }}>{stepSubs[step]}</div>
        </div>

        {/* STEP 0 */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, animation: "fadeUp .4s ease" }}>
            <div>
              <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, letterSpacing: .8, marginBottom: 8 }}>SELECT PLATFORM</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Zepto","Blinkit","Zomato","Swiggy"].map(p => (
                  <button key={p} onClick={() => setPlatform(p)} style={{ padding: 12, borderRadius: 12,
                    border: `2px solid ${platform === p ? C.accent : C.border}`,
                    background: platform === p ? C.accent + "18" : C.surface,
                    color: platform === p ? C.accent : C.dim, fontFamily:"'Outfit',sans-serif",
                    fontWeight: 700, fontSize: 13, transition: "all .15s" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, letterSpacing: .8, marginBottom: 8 }}>PARTNER ID</div>
              <input value={pid} onChange={e => setPid(e.target.value)}
                style={{ width: "100%", padding: "13px 14px", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, color: C.text, fontSize: 14 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, letterSpacing: .8, marginBottom: 8 }}>DELIVERY ZONE</div>
              <input value={zone} onChange={e => setZone(e.target.value)}
                style={{ width: "100%", padding: "13px 14px", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, color: C.text, fontSize: 14 }} />
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp .4s ease" }}>
            {!analysing && !profileDone && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div style={{ fontSize: 56 }}>🤖</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, textAlign: "center" }}>Tap to run AI Risk Profiling</div>
                <div style={{ fontSize: 12, color: C.dim, textAlign: "center" }}>XGBoost model · Weather API · Zone GIS data</div>
                <Btn onPress={startAI} style={{ width: "auto", padding: "13px 36px" }}>Run AI Analysis</Btn>
              </div>
            )}
            {(analysing || profileDone) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {profileItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    background: C.surface, borderRadius: 10, animation: "fadeUp .3s ease" }}>
                    <span style={{ fontSize: 14 }}>{item.startsWith("✅") ? "✅" : analysing && i === profileItems.length - 1 ? <span style={{ animation: "spin 1s infinite linear", display: "inline-block" }}>⟳</span> : "✅"}</span>
                    <span style={{ fontSize: 13, color: C.text }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
            {profileDone && (
              <Card style={{ animation: "slideUp .4s ease" }}>
                <div style={{ color: C.accent, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📊 AI Profile Result</div>
                {[
                  ["Daily Avg. Income", "₹720 / day"],
                  ["Monthly Earnings",  "₹21,500"],
                  ["Zone Flood Risk",   "Moderate"],
                  ["Heat Risk",         "Low–Medium"],
                  ["Platform Tenure",   "3 years"],
                  ["Starting Tier",     "Bronze → Silver eligible W4"],
                  ["Recommended Plan",  "Silver (₹39/wk)"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0",
                    borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.dim, fontSize: 12 }}>{k}</span>
                    <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp .4s ease" }}>
            {[
              { tier:"Silver", price:39, payout:750,  corpus:"₹643 at year-end",  rec:true  },
              { tier:"Bronze", price:49, payout:500,  corpus:"₹807 at year-end",  rec:false },
            ].map(p => (
              <div key={p.tier} onClick={() => setPlan(p.tier)}
                style={{ border: `2px solid ${plan === p.tier ? C.accent : C.border}`, borderRadius: 16, padding: 14,
                  background: plan === p.tier ? C.accent + "11" : C.surface, cursor: "pointer", position: "relative", transition: "all .2s" }}>
                {p.rec && <span style={{ position: "absolute", top: -10, right: 14, ...{background:C.accent,color:"#fff",borderRadius:6,padding:"2px 9px",fontSize:10,fontWeight:700} }}>RECOMMENDED</span>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: TIER_CONFIG[p.tier].color }}>{p.tier} Plan</div>
                    <div style={{ color: C.dim, fontSize: 12 }}>Up to ₹{p.payout}/week payout</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: 24, color: C.accent }}>₹{p.price}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>/week</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, padding: "8px 10px", background: C.green + "15", borderRadius: 8,
                  border: `1px solid ${C.green}33`, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>💰</span>
                  <span style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>GigCorpus Return: {p.corpus}</span>
                </div>
              </div>
            ))}

            <div style={{ background: C.surface, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, marginBottom: 8 }}>PAYMENT METHOD</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["UPI Autopay", "Platform Wallet"].map(m => (
                  <button key={m} onClick={() => setPayment(m)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10,
                      border: `2px solid ${payment === m ? C.accent : C.border}`,
                      background: payment === m ? C.accent + "18" : "transparent",
                      color: payment === m ? C.accent : C.dim, fontFamily:"'Outfit',sans-serif",
                      fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {step > 0 && <Btn onPress={() => setStep(p => p-1)} variant="ghost" style={{ flex: "0 0 80px", width: 80 }}>← Back</Btn>}
          <Btn
            onPress={() => { if (step < 2) setStep(p => p+1); else onDone(); }}
            disabled={step === 1 && !profileDone}
            style={{ flex: 1, width: "auto" }}>
            {step < 2 ? "Continue →" : "🚀 Activate Coverage"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: HOME / DASHBOARD
// ─────────────────────────────────────────────────────────────────────
function HomeScreen({ worker, triggers, onNavigate }) {
  const tp        = getTierProgress(worker.gigScore);
  const premium   = calcPremium({ score: worker.gigScore });
  const corpus    = calcCorpus(premium, worker.weeksPaid);
  const activeTrigger = triggers.find(t => t.status === "triggered");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Alert Banner */}
      {activeTrigger && (
        <div onClick={() => onNavigate("triggers")} style={{ background: `linear-gradient(135deg, ${C.accent}22, ${C.red}11)`,
          border: `1px solid ${C.accent}66`, borderRadius: 16, padding: "13px 16px",
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer", animation: "glow 2s infinite" }}>
          <span style={{ fontSize: 26 }}>⚡</span>
          <div>
            <div style={{ fontWeight: 800, color: C.accent, fontSize: 14 }}>Auto-claim triggered!</div>
            <div style={{ color: C.dim, fontSize: 12 }}>{activeTrigger.name} · Payout in {tp.cfg.speed}</div>
          </div>
          <span style={{ marginLeft: "auto", color: C.accent }}>→</span>
        </div>
      )}

      {/* Hero Card */}
      <Card glow={activeTrigger ? C.accentGlow : null}
        style={{ background: `linear-gradient(145deg, #0D2B5E 0%, ${C.card} 100%)`, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: C.dim, fontWeight: 600 }}>Good morning 👋</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.white, marginTop: 2 }}>Raju Sharma</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <LiveDot color={C.green} />
              <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Coverage Active · {tp.cfg.label} Tier</span>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <CircleProgress score={worker.gigScore} size={68} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: tp.cfg.color, lineHeight: 1 }}>{worker.gigScore}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Weekly Premium", val: `₹${premium}`, color: C.accent },
            { label: "Max Payout",     val: `₹${tp.cfg.payout}`, color: C.green },
            { label: "Streak",          val: `🔥 ${worker.streak}w`, color: C.gold },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
              <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trigger Status Row */}
      <div>
        <SectionTitle text="Live Trigger Status" sub="Tap to monitor" />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {triggers.map(tr => (
            <div key={tr.id} onClick={() => onNavigate("triggers")} style={{ flexShrink: 0, background: C.surface,
              border: `1px solid ${tr.status === "triggered" ? C.red : tr.status === "warning" ? C.gold : C.border}`,
              borderRadius: 12, padding: "8px 12px", display: "flex", align: "center", gap: 6, cursor: "pointer",
              background: tr.status === "triggered" ? C.red + "11" : tr.status === "warning" ? C.gold + "11" : C.surface }}>
              <span style={{ fontSize: 18 }}>{tr.emoji}</span>
              <div>
                <div style={{ fontSize: 10, color: C.dim, fontWeight: 600 }}>{tr.name}</div>
                <div style={{ fontSize: 9, color: tr.status === "triggered" ? C.red : tr.status === "warning" ? C.gold : C.green, fontWeight: 700, textTransform: "uppercase" }}>
                  {tr.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corpus Teaser */}
      <Card glow={C.goldGlow} style={{ background: `linear-gradient(135deg, #1a1500 0%, ${C.card} 100%)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>💰 GigCorpus Fund</div>
          <button onClick={() => onNavigate("corpus")} style={{ background: "none", border: "none", color: C.accent, fontSize: 12, fontWeight: 600 }}>View →</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.gold }}>₹{corpus.invested}</div>
            <div style={{ fontSize: 11, color: C.dim }}>invested · proj. ₹{corpus.netReturn} at maturity</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{52 - worker.weeksPaid}w</div>
            <div style={{ fontSize: 10, color: C.muted }}>to maturity</div>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 5, borderRadius: 5, background: C.border, overflow: "hidden" }}>
          <div style={{ width: `${(worker.weeksPaid / 52) * 100}%`, height: "100%",
            background: `linear-gradient(90deg, ${C.gold}, #FFD700)`, borderRadius: 5 }} />
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{worker.weeksPaid} of 52 weeks completed</div>
      </Card>

      {/* Recent Claim */}
      <div>
        <SectionTitle text="Recent Claims" />
        {CLAIM_HISTORY.slice(0,2).map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
            background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: C.green + "22",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {TRIGGER_DEFS.find(t=>t.id===c.triggerId)?.emoji || "💸"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{c.trigger}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{c.id} · {c.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800, color: C.green, fontSize: 15 }}>+₹{c.amount}</div>
              <Tag label="PAID" color={C.green} />
            </div>
          </div>
        ))}
      </div>

      {/* Score History Chart */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>GigScore Growth (18w)</div>
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>+257 pts</span>
        </div>
        <LineChart data={SCORE_HISTORY} dataKey="s" w={320} h={70} color={C.gold} fill />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: C.muted }}>W1</span>
          <span style={{ fontSize: 10, color: C.muted }}>W18</span>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: GIGSCORE
// ─────────────────────────────────────────────────────────────────────
function GigScoreScreen({ worker }) {
  const tp      = getTierProgress(worker.gigScore);
  const premium = calcPremium({ score: worker.gigScore });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero */}
      <Card style={{ background: `linear-gradient(145deg, #0D1F40, ${C.card})`, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <CircleProgress score={worker.gigScore} size={110} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: tp.cfg.color }}>{worker.gigScore}</div>
              <div style={{ fontSize: 10, color: C.dim }}>GigScore</div>
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 22 }}>🏅</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: tp.cfg.color }}>{tp.tier}</span>
            </div>
            <div style={{ color: C.dim, fontSize: 12, marginBottom: 8 }}>
              {tp.ptsLeft} pts → <span style={{ color: TIER_CONFIG[tp.cfg.next || tp.tier].color }}>{tp.cfg.next || "MAX"}</span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[["🔥", `${worker.streak}w streak`], ["📅", `${worker.weeksPaid}w paid`], ["👥", `${worker.referrals} refs`]].map(([ic, lb]) => (
                <div key={lb} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>{ic}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{lb}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: C.muted }}>{tp.cfg.min} pts</span>
            <span style={{ fontSize: 10, color: tp.cfg.color, fontWeight: 700 }}>{tp.pct.toFixed(0)}% to {tp.cfg.next || "MAX"}</span>
            <span style={{ fontSize: 10, color: C.muted }}>{tp.cfg.max} pts</span>
          </div>
          <div style={{ height: 8, borderRadius: 8, background: C.border, overflow: "hidden" }}>
            <div style={{ width: `${tp.pct}%`, height: "100%", borderRadius: 8,
              background: `linear-gradient(90deg, ${tp.cfg.color}, ${tp.cfg.color}99)`, transition: "width .8s" }} />
          </div>
        </div>
      </Card>

      {/* Score History */}
      <Card>
        <SectionTitle text="Score History (18 Weeks)" />
        <LineChart data={SCORE_HISTORY} dataKey="s" w={320} h={80} color={C.gold} fill />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {["W1","W4","W8","W12","W16","W18"].map(w => (
            <span key={w} style={{ fontSize: 9, color: C.muted }}>{w}</span>
          ))}
        </div>
      </Card>

      {/* Points Table */}
      <Card>
        <SectionTitle text="How to Earn Points" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(POINT_RULES).map(([key, rule]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 10px", background: C.surface, borderRadius: 8 }}>
              <span style={{ color: C.dim, fontSize: 12 }}>{rule.desc}</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: rule.pts > 0 ? C.green : C.red }}>{rule.pts > 0 ? "+" : ""}{rule.pts}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tier Comparison */}
      <Card>
        <SectionTitle text="Tier Benefits" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
            <div key={tier} style={{ border: `2px solid ${tier === worker.tier ? cfg.color : C.border}44`,
              borderRadius: 14, padding: 12, background: tier === worker.tier ? cfg.color + "11" : C.surface }}>
              <div style={{ fontWeight: 800, color: cfg.color, marginBottom: 8 }}>{tier}</div>
              {[["₹"+cfg.premium+"/wk","Premium"],["₹"+cfg.payout,"Max Payout"],[cfg.speed,"Speed"]].map(([v,l]) => (
                <div key={l} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tier === worker.tier ? cfg.color : C.text }}>{v}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: LIVE TRIGGERS
// ─────────────────────────────────────────────────────────────────────
function TriggersScreen({ triggers, worker, onClaimDone }) {
  const [claimActive, setClaimActive]   = useState(null); // triggerId
  const [claimStage, setClaimStage]     = useState(-1);
  const [claimComplete, setClaimComplete] = useState(false);
  const [claimResult, setClaimResult]   = useState(null);

  const CLAIM_STAGES = [
    { icon:"📡", msg:"Polling API — threshold crossed in your zone" },
    { icon:"🔄", msg:"Cross-validating with secondary data source" },
    { icon:"📍", msg:"Confirming worker GPS within disrupted zone"  },
    { icon:"🤖", msg:"Running fraud detection (5 layers)..."        },
    { icon:"✅", msg:"Claim approved! Payout initiated."            },
  ];

  const simulateClaim = (trigger) => {
    setClaimActive(trigger.id);
    setClaimStage(-1);
    setClaimComplete(false);
    const fraudInput = { gpsValid:true, zoneValid:true, velocityNormal:true, networkClean:true, tier:worker.tier, isFirstClaim:false };
    const fraudScore = calcFraudScore(fraudInput);
    const amount     = calcPayout(worker.dailyAvg, trigger.id);
    CLAIM_STAGES.forEach((_, i) => {
      setTimeout(() => {
        setClaimStage(i);
        if (i === CLAIM_STAGES.length - 1) {
          setTimeout(() => {
            setClaimComplete(true);
            setClaimResult({ amount, triggerId: trigger.id, trigger: trigger.name, fraudScore, id: "CLM-" + (2900 + Math.floor(Math.random()*99)) });
            onClaimDone && onClaimDone(amount);
          }, 600);
        }
      }, i * 900);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
        <LiveDot color={C.green} />
        <span style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>LIVE — Monitoring Koramangala, Bengaluru</span>
      </div>

      {/* Claim Result Banner */}
      {claimComplete && claimResult && (
        <div style={{ background: `linear-gradient(135deg, ${C.green}22, #001a0f)`, border: `1px solid ${C.green}66`,
          borderRadius: 16, padding: 16, animation: "bounceIn .5s ease" }}>
          <div style={{ fontWeight: 800, color: C.green, fontSize: 15, marginBottom: 4 }}>💸 Payout Initiated!</div>
          <div style={{ color: C.dim, fontSize: 13 }}>₹{claimResult.amount} → {worker.upiId}</div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>Claim {claimResult.id} · Fraud Score: {claimResult.fraudScore}/100 · Auto-approved</div>
          <Btn onPress={() => { setClaimActive(null); setClaimComplete(false); setClaimResult(null); }} variant="ghost" style={{ marginTop: 12 }}>
            Close
          </Btn>
        </div>
      )}

      {/* Trigger Cards */}
      {triggers.map(tr => (
        <Card key={tr.id} style={{ border: `1px solid ${tr.status === "triggered" ? C.red : tr.status === "warning" ? C.gold : C.border}44`,
          background: tr.status === "triggered" ? C.red + "0A" : tr.status === "warning" ? C.gold + "08" : C.card }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{tr.emoji}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{tr.name}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{tr.api}</div>
              </div>
            </div>
            <Tag
              label={tr.status === "triggered" ? "⚡ TRIGGERED" : tr.status === "warning" ? "⚠ WARNING" : "✓ SAFE"}
              color={tr.status === "triggered" ? C.red : tr.status === "warning" ? C.gold : C.green}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {[["Threshold", tr.threshold],["Current", tr.current],["Data Source", tr.api],["Payout Range", `${(tr.payMin*100).toFixed(0)}–${(tr.payMax*100).toFixed(0)}% daily avg`]].map(([k,v]) => (
              <div key={k} style={{ background: C.surface, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ color: C.muted, fontSize: 9, fontWeight: 600 }}>{k.toUpperCase()}</div>
                <div style={{ color: C.text, fontSize: 11, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Trigger Progress Bar */}
          {tr.unit && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ height: 6, borderRadius: 6, background: C.border, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (parseFloat(tr.current) / tr.fire) * 100)}%`, height: "100%",
                  background: tr.status === "triggered" ? C.red : tr.status === "warning" ? C.gold : C.green,
                  borderRadius: 6, transition: "width .5s, background .5s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 9, color: C.muted }}>0 {tr.unit}</span>
                <span style={{ fontSize: 9, color: C.muted }}>Threshold: {tr.fire} {tr.unit}</span>
              </div>
            </div>
          )}

          {/* Claim pipeline */}
          {claimActive === tr.id && !claimComplete && (
            <div style={{ background: C.surface, borderRadius: 12, padding: 12, marginBottom: 10 }}>
              {CLAIM_STAGES.map((stage, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0",
                  opacity: i <= claimStage ? 1 : 0.3, transition: "opacity .3s" }}>
                  <span style={{ fontSize: 14 }}>{i < claimStage ? "✅" : i === claimStage ? "⏳" : stage.icon}</span>
                  <span style={{ fontSize: 12, color: i <= claimStage ? C.text : C.muted }}>{stage.msg}</span>
                </div>
              ))}
            </div>
          )}

          {tr.status !== "safe" && !claimComplete && (
            <Btn onPress={() => simulateClaim(tr)} variant={tr.status === "triggered" ? "primary" : "ghost"}
              style={{ padding: "11px 0" }}>
              {tr.status === "triggered" ? "⚡ Simulate Auto-Claim" : "Watch Trigger Escalate"}
            </Btn>
          )}
        </Card>
      ))}

      {/* Zero-Touch Flow Visual */}
      <Card>
        <SectionTitle text="Zero-Touch Claim Pipeline" sub="Fully automated — no action needed from you" />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {["API poll every 15 min","Threshold crossed","Secondary validation","GPS zone match","Fraud scoring (5 layers)","UPI payout (2–8h)"].map((step, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.accent + "22",
                  border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: C.accent }}>{i+1}</div>
                {i < arr.length-1 && <div style={{ width: 2, height: 18, background: C.border, margin: "2px 0" }} />}
              </div>
              <div style={{ paddingTop: 6, paddingBottom: i < arr.length-1 ? 0 : 0 }}>
                <span style={{ fontSize: 13, color: C.text }}>{step}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: CLAIMS
// ─────────────────────────────────────────────────────────────────────
function ClaimsScreen({ worker }) {
  const [simRunning, setSimRunning] = useState(false);
  const [simStage,   setSimStage]   = useState(-1);
  const [simDone,    setSimDone]    = useState(false);

  const total   = CLAIM_HISTORY.reduce((s, c) => s + c.amount, 0);
  const avgFraud = (CLAIM_HISTORY.reduce((s, c) => s + c.fraudScore, 0) / CLAIM_HISTORY.length).toFixed(0);

  const SIM_STAGES = [
    "📡 AQI threshold crossed — 412 detected in Koramangala",
    "🔄 Cross-validating CPCB + secondary AQI sensor...",
    "📍 Worker GPS confirmed in disrupted zone",
    "🔍 L1: GPS spoof check — PASS",
    "🔍 L2: Zone registration integrity — PASS",
    "🔍 L3: Velocity anomaly (Isolation Forest) — Score: 0.08 — PASS",
    "🔍 L4: Network graph fraud (GNN) — Score: 0.05 — PASS",
    "🔍 L5: GigScore tier gate (Silver) — PASS",
    "✅ Fraud Score: 8/100 — Auto-approved",
    "💸 ₹216 payout → raju.sharma@okaxis — Claim CLM-2899 CLOSED",
  ];

  const runSim = () => {
    setSimRunning(true); setSimStage(-1); setSimDone(false);
    SIM_STAGES.forEach((_, i) => setTimeout(() => {
      setSimStage(i);
      if (i === SIM_STAGES.length - 1) setTimeout(() => setSimDone(true), 500);
    }, i * 600));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <StatCard label="Total Claimed" value={`₹${total}`} color={C.green} icon="💸" />
        <StatCard label="Claims"        value={CLAIM_HISTORY.length}     color={C.blue}  icon="📋" />
        <StatCard label="Avg Fraud Score" value={`${avgFraud}/100`}    color={C.gold}  icon="🤖" />
      </div>

      {/* Fraud Detection Explainer */}
      <Card style={{ border: `1px solid ${C.purple}44`, background: C.purple + "08" }}>
        <div style={{ fontWeight: 800, color: C.purple, marginBottom: 10, fontSize: 14 }}>🔐 5-Layer Fraud Engine</div>
        {[
          { layer:"L1", name:"GPS Spoof Detection",       model:"Rule + Geofence",     desc:"Was worker active during trigger?" },
          { layer:"L2", name:"Zone Integrity",            model:"Zone-lock rule",      desc:"Did worker farm a risky zone?" },
          { layer:"L3", name:"Velocity Anomaly",         model:"Isolation Forest ML", desc:"3+ claims in 30 days?" },
          { layer:"L4", name:"Network Graph Fraud",      model:"GNN (PyG)",           desc:"Fraud account cluster?" },
          { layer:"L5", name:"GigScore Tier Gate",       model:"Rule-based",          desc:"New Bronze accounts held 48h" },
        ].map(({ layer, name, model, desc }) => (
          <div key={layer} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: C.purple + "22",
              border: `1px solid ${C.purple}44`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: C.purple, flexShrink: 0 }}>{layer}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{name}</div>
              <div style={{ fontSize: 10, color: C.purple }}>{model}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{desc}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Claim History */}
      <div>
        <SectionTitle text="Claim History" />
        {CLAIM_HISTORY.map((c, i) => (
          <div key={c.id} style={{ display: "flex", gap: 12, padding: "12px 14px", background: C.surface,
            borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 8,
            animation: `fadeUp .3s ${i * .05}s ease both` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.green + "20",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {TRIGGER_DEFS.find(t => t.id === c.triggerId)?.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{c.trigger}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{c.id} · {c.date}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                <Tag label={`Fraud: ${c.fraudScore}/100`} color={c.fraudScore < 30 ? C.green : C.gold} />
                <span style={{ fontSize: 10, color: C.muted }}>{c.zone}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 900, color: C.green, fontSize: 17 }}>+₹{c.amount}</div>
              <Tag label="PAID" color={C.green} />
            </div>
          </div>
        ))}
      </div>

      {/* Claim Simulator */}
      <Card style={{ border: `1px solid ${C.accent}44`, background: `linear-gradient(135deg, ${C.accent}08, ${C.card})` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>⚡ Auto-Claim Simulator</div>
            <div style={{ color: C.dim, fontSize: 11, marginTop: 2 }}>Watch all 10 pipeline stages</div>
          </div>
          <Btn onPress={runSim} style={{ width: "auto", padding: "9px 18px", fontSize: 13 }}>▶ Run</Btn>
        </div>
        {simRunning && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SIM_STAGES.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                borderRadius: 8, background: i <= simStage ? C.green + "18" : "#0A1628",
                border: `1px solid ${i <= simStage ? C.green + "44" : C.border}`,
                opacity: i <= simStage ? 1 : 0.35, transition: "all .3s" }}>
                <span style={{ fontSize: 11 }}>{i <= simStage ? "✅" : "⬜"}</span>
                <span style={{ fontSize: 11, color: i <= simStage ? C.text : C.dim }}>{s}</span>
              </div>
            ))}
          </div>
        )}
        {simDone && (
          <div style={{ marginTop: 10, textAlign: "center", color: C.green, fontWeight: 800, animation: "bounceIn .4s ease" }}>
            🎉 Payout processed in &lt;8 hours!
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: POLICY
// ─────────────────────────────────────────────────────────────────────
function PolicyScreen({ worker }) {
  const premium = calcPremium({ score: worker.gigScore });
  const tp      = getTierProgress(worker.gigScore);

  const PREMIUM_HIST = [
    { w:"W1",  p:49 }, { w:"W2",  p:49 }, { w:"W3",  p:49 }, { w:"W4",  p:49 },
    { w:"W5",  p:49 }, { w:"W6",  p:49 }, { w:"W7",  p:49 }, { w:"W8",  p:39 },
    { w:"W9",  p:39 }, { w:"W10", p:39 }, { w:"W11", p:39 }, { w:"W12", p:39 },
    { w:"W13", p:39 }, { w:"W14", p:39 }, { w:"W15", p:39 }, { w:"W16", p:39 },
    { w:"W17", p:39 }, { w:"W18", p:39 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Policy Hero */}
      <Card style={{ background: `linear-gradient(145deg, #0D2045, ${C.card})`, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, letterSpacing: .6 }}>ACTIVE POLICY</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.white, marginTop: 2 }}>{tp.tier} Protection Plan</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>ID: GS-KA-2026-9876 · Renews Monday 00:00</div>
          </div>
          <Tag label="● ACTIVE" color={C.green} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["Weekly Premium",`₹${premium}`],["Max Payout",`₹${tp.cfg.payout}/wk`],["Claim Speed",tp.cfg.speed],["Active Since","W1, Jan 2026"]].map(([k,v]) => (
            <div key={k} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ color: C.muted, fontSize: 10 }}>{k}</div>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 14, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Premium breakdown */}
      <Card>
        <SectionTitle text="Weekly Premium Breakdown" sub={`₹${premium} / week total`} />
        {PREMIUM_ALLOC.map(b => (
          <div key={b.label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: C.dim }}>{b.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>
                {b.pct}% · ₹{(premium * b.pct / 100).toFixed(2)}
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 5, background: C.border, overflow: "hidden" }}>
              <div style={{ width: `${b.pct}%`, height: "100%", background: b.color, borderRadius: 5 }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 10, padding: "10px 12px", background: C.gold + "15", borderRadius: 10,
          border: `1px solid ${C.gold}33`, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <span style={{ fontSize: 12, color: C.gold }}>₹{(premium * 0.30).toFixed(2)}/wk goes into GigCorpus — returned to you at year-end!</span>
        </div>
      </Card>

      {/* Premium history chart */}
      <Card>
        <SectionTitle text="Premium History" sub="Moved to Silver at W8 — saved ₹10/wk" />
        <BarChart data={PREMIUM_HIST} dataKey="p" w={320} h={80} color={C.accent} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 9, color: C.muted }}>W1</span>
          <span style={{ fontSize: 9, color: C.green }}>▼ Tier up at W8</span>
          <span style={{ fontSize: 9, color: C.muted }}>W18</span>
        </div>
      </Card>

      {/* Coverage / Exclusions */}
      <Card>
        <SectionTitle text="Coverage Scope" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>✅ Covered</div>
            {["Heavy Rain >64.5mm","Extreme Heat >45°C","Severe AQI >400","Curfew / Lockdown","Flash Flood Lvl-3"].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ color: C.green, fontSize: 13 }}>✓</span>
                <span style={{ fontSize: 11, color: C.dim }}>{i}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: C.red, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>❌ Excluded</div>
            {["Health/Medical","Life/Accident","Vehicle Repair","Physical Injury","Platform Rating"].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ color: C.red, fontSize: 13 }}>✗</span>
                <span style={{ fontSize: 11, color: C.muted }}>{i}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: GIGCORPUS
// ─────────────────────────────────────────────────────────────────────
function CorpusScreen({ worker }) {
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState(false);
  const premium  = calcPremium({ score: worker.gigScore });
  const corpus   = calcCorpus(premium, worker.weeksPaid);
  const weeksLeft = 52 - worker.weeksPaid;

  const CORPUS_GROWTH = Array.from({ length: worker.weeksPaid }, (_, i) => {
    const c = calcCorpus(premium, i + 1);
    return { w: `W${i+1}`, v: c.invested };
  });

  const confirm = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
      <Toast msg={`✅ ${selected === "cash" ? "₹"+corpus.netReturn+" credited to your UPI!" : selected === "rollover" ? "Rolled over — Year 2 compounding activated!" : "₹"+Math.round(corpus.netReturn/2)+" withdrawn + remainder rolled over!"}`} visible={toast} />

      {/* Hero */}
      <Card glow={C.goldGlow} style={{ background: `linear-gradient(145deg, #1a1200, ${C.card})`, padding: 22 }}>
        <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, letterSpacing: .8 }}>GIGCORPUS FUND</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: C.gold, lineHeight: 1.1, marginTop: 4 }}>₹{corpus.invested}</div>
        <div style={{ color: C.dim, fontSize: 13, marginTop: 4 }}>
          invested · proj. return: <span style={{ color: C.green, fontWeight: 700 }}>₹{corpus.netReturn}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <div>
            <div style={{ color: C.muted, fontSize: 11 }}>Weekly contribution</div>
            <div style={{ color: C.gold, fontWeight: 700 }}>₹{corpus.weeklyContrib}/week</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: C.muted, fontSize: 11 }}>Return rate</div>
            <div style={{ color: C.green, fontWeight: 700 }}>~7.2% p.a.</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.muted, fontSize: 11 }}>Matures in</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.accent }}>{weeksLeft}w</div>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 6, borderRadius: 6, background: C.border, overflow: "hidden" }}>
          <div style={{ width: `${(worker.weeksPaid / 52) * 100}%`, height: "100%",
            background: `linear-gradient(90deg, ${C.gold}, #FFD700)`, borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{worker.weeksPaid} / 52 weeks complete</div>
      </Card>

      {/* Growth Chart */}
      <Card>
        <SectionTitle text="Corpus Growth" sub="30% of premium invested weekly" />
        <LineChart data={CORPUS_GROWTH} dataKey="v" w={320} h={90} color={C.gold} fill />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 9, color: C.muted }}>W1</span>
          <span style={{ fontSize: 9, color: C.gold, fontWeight: 700 }}>₹{corpus.invested} at W{worker.weeksPaid}</span>
          <span style={{ fontSize: 9, color: C.muted }}>W52</span>
        </div>
      </Card>

      {/* Portfolio */}
      <Card>
        <SectionTitle text="Fund Portfolio Allocation" sub="SEBI-regulated · AMC managed" />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <MiniDonut data={PORTFOLIO} size={110} />
          </div>
          <div style={{ flex: 1 }}>
            {PORTFOLIO.map(p => (
              <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: C.dim }}>{p.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.alloc}%</span>
                  <span style={{ fontSize: 9, color: C.muted, marginLeft: 4 }}>{p.ret}%</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 6, padding: "5px 8px", background: C.green + "15", borderRadius: 7 }}>
              <span style={{ color: C.green, fontSize: 11, fontWeight: 700 }}>Wtd. avg: 7.2% p.a.</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Return Projections */}
      <Card>
        <SectionTitle text="Year-End Return Projections" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { tier:"Bronze",   w:49, label:"₹807 net", sub:"₹764 invested" },
            { tier:"Silver",   w:39, label:"₹643 net", sub:"₹608 invested" },
            { tier:"Gold",     w:29, label:"₹478 net (+5%)", sub:"₹452 invested" },
            { tier:"Platinum", w:19, label:"₹312 net (+10%)", sub:"₹296 invested" },
          ].map(r => (
            <div key={r.tier} style={{ background: C.surface, borderRadius: 12, padding: 12,
              border: `1px solid ${r.tier === getTier(worker.gigScore) ? TIER_CONFIG[r.tier].color + "66" : C.border}` }}>
              <div style={{ color: TIER_CONFIG[r.tier].color, fontWeight: 700, fontSize: 12 }}>{r.tier}</div>
              <div style={{ color: C.gold, fontWeight: 900, fontSize: 18, marginTop: 2 }}>{r.label}</div>
              <div style={{ color: C.muted, fontSize: 10 }}>{r.sub}</div>
              <div style={{ color: C.dim, fontSize: 10, marginTop: 1 }}>₹{r.w}/wk × 30%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Withdrawal Options */}
      <Card>
        <SectionTitle text="Choose at Maturity (W52)" sub={`Available in ${weeksLeft} weeks`} />
        {[
          { id:"cash",     icon:"💸", title:"Full Cash Withdrawal", desc:`₹${corpus.netReturn} to ${worker.upiId}`, sub:"Instant UPI credit" },
          { id:"rollover", icon:"🔄", title:"Roll Over (Year 2)",   desc:"~₹2,100+ projected return",             sub:"Compounding accelerates" },
          { id:"partial",  icon:"⚖️", title:"50/50 Split",         desc:`₹${Math.round(corpus.netReturn/2)} out + ₹${Math.round(corpus.netReturn/2)} rolled`, sub:"Balance option" },
          { id:"topup",    icon:"➕", title:"Top-Up Corpus",        desc:"Add ₹5–50 extra/week",                  sub:"+8 GigScore pts/wk" },
        ].map(opt => (
          <div key={opt.id} onClick={() => setSelected(selected === opt.id ? null : opt.id)}
            style={{ display: "flex", gap: 12, padding: "12px 12px", borderRadius: 14, marginBottom: 8,
              border: `2px solid ${selected === opt.id ? C.gold : C.border}`,
              background: selected === opt.id ? C.gold + "0F" : C.surface, cursor: "pointer", transition: "all .2s" }}>
            <span style={{ fontSize: 26, flexShrink: 0 }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{opt.title}</div>
              <div style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>{opt.desc}</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{opt.sub}</div>
            </div>
            {selected === opt.id && <span style={{ color: C.gold, alignSelf: "center" }}>✓</span>}
          </div>
        ))}
        {selected && (
          <Btn onPress={confirm} variant="gold">
            Confirm {["cash","rollover","partial","topup"].includes(selected) ? ["Full Withdrawal","Rollover","50/50 Split","Top-Up"][["cash","rollover","partial","topup"].indexOf(selected)] : ""} →
          </Btn>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SCREEN: PROFILE
// ─────────────────────────────────────────────────────────────────────
function ProfileScreen({ worker, onLogout }) {
  const [referralCopied, setReferralCopied] = useState(false);
  const tp      = getTierProgress(worker.gigScore);
  const premium = calcPremium({ score: worker.gigScore });

  const copyReferral = () => {
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Profile Header */}
      <Card style={{ background: `linear-gradient(145deg, #0D1F40, ${C.card})`, padding: 20 }}>
        <div style={{ display: "flex", align: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: tp.cfg.color + "33",
            border: `2px solid ${tp.cfg.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
            👷
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.white }}>{worker.name}</div>
            <div style={{ color: tp.cfg.color, fontSize: 12, fontWeight: 600 }}>● {tp.tier} Tier · {worker.platform}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{worker.zone}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Partner ID", worker.partnerId.slice(-8)],["UPI", worker.upiId],["Tenure", worker.tenure]].map(([k,v]) => (
            <div key={k} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ color: C.muted, fontSize: 9 }}>{k}</div>
              <div style={{ color: C.white, fontSize: 11, fontWeight: 600, marginTop: 1, wordBreak: "break-all" }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <StatCard label="GigScore" value={worker.gigScore} color={tp.cfg.color} sub={`${tp.tier} · ${tp.ptsLeft}pts to ${tp.cfg.next}`} icon="🏅" />
        <StatCard label="Weekly Premium" value={`₹${premium}`} color={C.accent} sub="Next: Monday 00:00" icon="💳" />
        <StatCard label="Total Claimed" value={`₹${worker.totalClaimed}`} color={C.green} sub={`${worker.claimCount} claims`} icon="💸" />
        <StatCard label="Referrals" value={worker.referrals} color={C.purple} sub="+25 pts each" icon="👥" />
      </div>

      {/* Notifications */}
      <Card>
        <SectionTitle text="Notifications" />
        {worker.notifications.map(n => (
          <div key={n.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? C.border : C.accent,
              marginTop: 4, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: n.read ? C.dim : C.text }}>{n.msg}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Referral */}
      <Card style={{ border: `1px solid ${C.purple}44`, background: C.purple + "08" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: C.purple, marginBottom: 8 }}>👥 Refer & Earn</div>
        <div style={{ color: C.dim, fontSize: 12, marginBottom: 12 }}>
          Earn <span style={{ color: C.purple, fontWeight: 700 }}>+25 GigScore pts</span> for every friend who subscribes. They get <span style={{ color: C.green, fontWeight: 700 }}>₹5 off</span> first week.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: C.surface, borderRadius: 10, padding: "11px 12px", fontSize: 12, fontWeight: 600, color: C.dim, fontFamily: "'DM Mono', monospace" }}>
            GS-RAJU-2026-XK9
          </div>
          <button onClick={copyReferral} style={{ padding: "11px 16px", borderRadius: 10, background: referralCopied ? C.green + "22" : C.accent + "22",
            border: `1px solid ${referralCopied ? C.green : C.accent}44`, color: referralCopied ? C.green : C.accent,
            fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
            {referralCopied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>You've earned <span style={{ color: C.purple, fontWeight: 700 }}>50 pts</span> from {worker.referrals} referrals</div>
      </Card>

      {/* Settings */}
      <Card>
        <SectionTitle text="Account Settings" />
        {[["📱 Change mobile number",""],["🏦 Update UPI / Bank",""],["🔔 Notification preferences",""],["📄 Download policy PDF",""],["❓ Help & Support",""],].map(([label, badge]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: C.dim }}>{label}</span>
            <span style={{ fontSize: 14, color: C.muted }}>›</span>
          </div>
        ))}
      </Card>

      <Btn onPress={onLogout} variant="danger">Sign Out</Btn>
      <div style={{ height: 8 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"home",     emoji:"🏠", label:"Home"     },
  { id:"gigscore", emoji:"🏅", label:"Score"    },
  { id:"triggers", emoji:"📡", label:"Triggers" },
  { id:"claims",   emoji:"📋", label:"Claims"   },
  { id:"corpus",   emoji:"💰", label:"Corpus"   },
  { id:"policy",   emoji:"🛡️", label:"Policy"  },
];

function BottomNav({ active, onChange, alertCount }) {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 72,
      background: C.surface, borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: 4, zIndex: 50 }}>
      {NAV_ITEMS.map(item => (
        <button key={item.id} onClick={() => onChange(item.id)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 6px",
            background: "none", border: "none", cursor: "pointer", position: "relative",
            opacity: active === item.id ? 1 : 0.45, transition: "opacity .15s" }}>
          <span style={{ fontSize: active === item.id ? 22 : 20, transition: "font-size .15s",
            filter: active === item.id ? `drop-shadow(0 0 6px ${C.accent})` : "none" }}>
            {item.emoji}
          </span>
          <span style={{ fontSize: 9, fontWeight: active === item.id ? 700 : 500,
            color: active === item.id ? C.accent : C.dim, letterSpacing: .3 }}>
            {item.label}
          </span>
          {active === item.id && (
            <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
              width: 24, height: 2, borderRadius: 2, background: C.accent }} />
          )}
          {item.id === "triggers" && alertCount > 0 && (
            <span style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: C.red }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────────────────────────────
function TopBar({ tab, worker, onProfile }) {
  const tp = getTierProgress(worker.gigScore);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px 10px", background: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, #FF9B35)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛡️</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.white }}>GigGuard</div>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: .4 }}>{["HOME","GIGSCORE","TRIGGERS","CLAIMS","CORPUS","POLICY"].find((_,i) => ["home","gigscore","triggers","claims","corpus","policy"][i] === tab) || "APP"}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, background: tp.cfg.color + "22",
          border: `1px solid ${tp.cfg.color}44`, borderRadius: 8, padding: "4px 9px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: tp.cfg.color }}>⭐ {worker.gigScore}</span>
        </div>
        <button onClick={onProfile} style={{ width: 32, height: 32, borderRadius: 10, background: C.card,
          border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: 16 }}>👤</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// TRIGGER SIMULATION HOOK
// ─────────────────────────────────────────────────────────────────────
function useTriggers() {
  const [triggers, setTriggers] = useState(TRIGGER_DEFS.map(t => ({
    ...t,
    current: t.id === "T1" ? "12.3mm" : t.id === "T2" ? "38.2°C" : t.id === "T3" ? "AQI 187" : "No alert",
    status: "safe",
    payMin: t.payMin,
    payMax: t.payMax,
  })));

  useEffect(() => {
    let aqiBase = 187;
    let rainBase = 12.3;
    const interval = setInterval(() => {
      setTriggers(prev => prev.map(tr => {
        if (tr.id === "T3") {
          aqiBase = Math.min(430, aqiBase + (Math.random() > 0.4 ? 25 : -10));
          const status = aqiBase >= 400 ? "triggered" : aqiBase >= 300 ? "warning" : "safe";
          return { ...tr, current: `AQI ${Math.round(aqiBase)}`, status };
        }
        if (tr.id === "T1") {
          rainBase = Math.max(0, rainBase + (Math.random() > 0.5 ? 8 : -3));
          const status = rainBase >= 64.5 ? "triggered" : rainBase >= 50 ? "warning" : "safe";
          return { ...tr, current: `${rainBase.toFixed(1)}mm`, status };
        }
        return tr;
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return triggers;
}

// ─────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────
export default function GigShieldApp() {
  const [screen, setScreen] = useState("splash");  // splash | login | otp | onboard | app
  const [tab,    setTab]    = useState("home");
  const [worker, setWorker] = useState(INITIAL_WORKER);
  const triggers = useTriggers();

  const alertCount = triggers.filter(t => t.status === "triggered").length;

  const goTo = (sc) => setScreen(sc);
  const handleTab = (t) => setTab(t);

  if (screen === "splash")  return <Phone><SplashScreen onDone={() => goTo("login")} /></Phone>;
  if (screen === "login")   return <Phone><LoginScreen  onNext={() => goTo("otp")} /></Phone>;
  if (screen === "otp")     return <Phone><OTPScreen    onNext={() => goTo("onboard")} onBack={() => goTo("login")} /></Phone>;
  if (screen === "onboard") return <Phone><OnboardingScreen onDone={() => { setScreen("app"); setTab("home"); }} /></Phone>;

  // Main App
  const screenMap = {
    home:     <HomeScreen     worker={worker} triggers={triggers} onNavigate={handleTab} />,
    gigscore: <GigScoreScreen worker={worker} />,
    triggers: <TriggersScreen triggers={triggers} worker={worker} onClaimDone={(amt) => setWorker(p => ({ ...p, totalClaimed: p.totalClaimed + amt }))} />,
    claims:   <ClaimsScreen   worker={worker} />,
    corpus:   <CorpusScreen   worker={worker} />,
    policy:   <PolicyScreen   worker={worker} />,
    profile:  <ProfileScreen  worker={worker} onLogout={() => goTo("login")} />,
  };

  return (
    <Phone>
      <TopBar tab={tab} worker={worker} onProfile={() => setTab("profile")} />
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 88px" }}>
        {screenMap[tab] || screenMap["home"]}
      </div>
      <BottomNav active={tab} onChange={handleTab} alertCount={alertCount} />
    </Phone>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PHONE FRAME WRAPPER
// ─────────────────────────────────────────────────────────────────────
function Phone({ children }) {
  return (
    <div className="mobile-app-wrapper">
      <style>{FONTS + GLOBAL_CSS}</style>
      <div style={{
        width: 390, height: 844, maxHeight: "90vh", borderRadius: 44,
        overflow: "hidden", display: "flex", flexDirection: "column",
        background: C.bg, position: "relative", flexShrink: 0,
        boxShadow: "0 30px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.06), inset 0 0 0 1px rgba(255,255,255,.04)",
      }}>
        {/* Status bar */}
        <div style={{ background: C.surface, padding: "10px 24px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.dim }}>9:41</span>
          <div style={{ width: 80, height: 16, borderRadius: 10, background: "#000", margin: "0 auto" }} />
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.dim }}>●●●</span>
            <span style={{ fontSize: 10, color: C.dim }}>▮▮▮</span>
            <span style={{ fontSize: 10, color: C.dim }}>⬛</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", position: "relative" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
