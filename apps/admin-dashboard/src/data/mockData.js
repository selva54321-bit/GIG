export const gigWorker = {
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

export const corpusData = [
  { week: "W1", corpus: 14.7, cumulative: 14.7 },
  { week: "W4", corpus: 14.7, cumulative: 58.8 },
  { week: "W8", corpus: 14.7, cumulative: 117.6 },
  { week: "W12", corpus: 14.7, cumulative: 185.6 },
  { week: "W16", corpus: 14.7, cumulative: 264.2 },
  { week: "W18", corpus: 14.7, cumulative: 937.8 },
];

export const premiumData = [
  { week: "W1", premium: 49, tier: "Bronze" },
  { week: "W4", premium: 49, tier: "Bronze" },
  { week: "W8", premium: 39, tier: "Silver" },
  { week: "W12", premium: 39, tier: "Silver" },
  { week: "W16", premium: 39, tier: "Silver" },
  { week: "W18", premium: 39, tier: "Silver" },
];

export const scoreHistory = [
  { week: "W1", score: 10 }, { week: "W2", score: 25 }, { week: "W3", score: 40 },
  { week: "W4", score: 75 }, { week: "W6", score: 100 }, { week: "W8", score: 130 },
  { week: "W10", score: 165 }, { week: "W12", score: 190 }, { week: "W14", score: 220 },
  { week: "W16", score: 245 }, { week: "W18", score: 267 },
];

export const lossRatioData = [
  { month: "Oct", ratio: 38, claims: 142 }, { month: "Nov", ratio: 29, claims: 98 },
  { month: "Dec", ratio: 31, claims: 115 }, { month: "Jan", ratio: 44, claims: 189 },
  { month: "Feb", ratio: 35, claims: 143 }, { month: "Mar", ratio: 52, claims: 231 },
];

export const triggerStatuses = [
  { id: "T1", name: "Heavy Rain", icon: "🌧️", api: "OpenWeatherMap / IMD", threshold: ">64.5mm / 24h", current: "12.3mm", status: "safe", payout: "50–80%", color: "#3B82F6" },
  { id: "T2", name: "Extreme Heat", icon: "🌡️", api: "IMD Heat API / NDMA", threshold: ">45°C with advisory", current: "38.2°C", status: "safe", payout: "30–50%", color: "#F59E0B" },
  { id: "T3", name: "Severe AQI", icon: "💨", api: "CPCB Safar API", threshold: "AQI >400 for 3+hrs", current: "AQI 187", status: "warning", payout: "25–40%", color: "#8B5CF6" },
  { id: "T4", name: "Curfew / Lockdown", icon: "🚫", api: "State Govt. API + Platform", threshold: "Official order issued", current: "No alerts", status: "safe", payout: "80–100%", color: "#EF4444" },
  { id: "T5", name: "Flash Flood", icon: "🌊", api: "NDMA Flood Alert API", threshold: "Level-3 flood alert", current: "No alert", status: "safe", payout: "80–100%", color: "#06B6D4" },
];
