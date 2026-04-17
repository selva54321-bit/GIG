import React, { createContext, useContext, useState, useEffect } from "react";
import {
  triggerStatuses,
  gigWorker,
  scoreHistory,
  corpusData,
  premiumData,
  lossRatioData,
} from "../data/mockData";
import {
  authService,
  policyService,
  claimService,
  gigScoreService,
  corpusService,
  adminService,
} from "../shared/apiService";

const AppContext = createContext();

const TRIGGER_LABELS = {
  RAIN: "Heavy Rain",
  HEAT: "Extreme Heat",
  AQI: "Severe AQI",
  CURFEW: "Curfew / Lockdown",
  FLOOD: "Flash Flood",
};

const TIER_ORDER = ["Bronze", "Silver", "Gold", "Platinum"];

const DEFAULT_ANALYTICS = {
  active_policies: 10247,
  weekly_inflow: 3970000,
  corpus_aum: 62000000,
  monthly_loss_ratio_pct: 52,
};

const DEFAULT_FRAUD_QUEUE = [
  { id: "CLM-2901", worker: "Suresh K.", trigger: "Heavy Rain", score: 71, flags: ["GPS spoof detected", "3rd claim in 2 weeks"], status: "review" },
  { id: "CLM-2888", worker: "Priya R.", trigger: "Curfew", score: 45, flags: ["New account <14 days"], status: "review" },
  { id: "CLM-2876", worker: "Amit S.", trigger: "Flash Flood", score: 82, flags: ["Network cluster fraud", "Same device as 4 others"], status: "reject" },
];

const DEFAULT_CORPUS_SUMMARY = {
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

function normalizeTier(rawTier, score) {
  if (TIER_ORDER.includes(rawTier)) return rawTier;

  const mapped = {
    Elite: "Platinum",
    Pro: "Gold",
    Standard: "Silver",
    Risk: "Bronze",
  };

  if (mapped[rawTier]) return mapped[rawTier];

  if (score >= 800) return "Platinum";
  if (score >= 600) return "Gold";
  if (score >= 400) return "Silver";
  return "Bronze";
}

function maxPayoutByTier(tier) {
  const payoutMap = {
    Bronze: 500,
    Silver: 750,
    Gold: 1000,
    Platinum: 1500,
  };

  return payoutMap[tier] || 750;
}

function formatClaimDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
}

function mapClaimStatus(status) {
  const map = {
    APPROVED: "Paid",
    REJECTED: "Rejected",
    FRAUD_FLAGGED: "Review",
    PENDING: "Pending",
  };

  return map[status] || status || "Pending";
}

function mapClaimsToUi(claims, fallbackZone) {
  if (!Array.isArray(claims) || claims.length === 0) return gigWorker.claims;

  return claims.map((claim, idx) => ({
    id: claim.id || `CLM-${1000 + idx}`,
    trigger: TRIGGER_LABELS[claim.trigger_event] || claim.trigger || "Disruption",
    date: formatClaimDate(claim.created_at) || claim.date || "--",
    amount: Number(claim.claim_amount ?? claim.amount ?? 0),
    status: mapClaimStatus(claim.status),
    zone: claim.zone || fallbackZone,
  }));
}

function buildScoreHistory(history, score) {
  if (!Array.isArray(history) || history.length === 0) return scoreHistory;

  const sorted = [...history].reverse();
  return sorted.map((item, index) => ({
    week: `W${index + 1}`,
    score: Number(item.score),
  }));
}

function buildPremiumHistory(weeklyPremium) {
  const premium = Number(weeklyPremium || gigWorker.policy.weeklyPremium);
  return [
    { week: "W1", premium, tier: "Bronze" },
    { week: "W4", premium, tier: "Bronze" },
    { week: "W8", premium, tier: "Silver" },
    { week: "W12", premium, tier: "Silver" },
    { week: "W16", premium, tier: "Silver" },
    { week: "W18", premium, tier: "Silver" },
  ];
}

function buildCorpusGrowth(balance, finalPayout) {
  const start = Math.max(0, Number(balance || gigWorker.corpusInvested));
  const end = Math.max(start, Number(finalPayout || gigWorker.corpusReturn));
  const span = end - start;
  const steps = [0.12, 0.28, 0.45, 0.63, 0.82, 1.0];

  return steps.map((step, index) => {
    const value = start + span * step;
    return {
      week: `W${(index + 1) * 3}`,
      corpus: Number((value / 12).toFixed(2)),
      cumulative: Number(value.toFixed(2)),
    };
  });
}

function deriveWeeksToMaturity(latestMaturity, fallbackWeeks) {
  if (!latestMaturity) return fallbackWeeks;
  const d = new Date(latestMaturity);
  if (Number.isNaN(d.getTime())) return fallbackWeeks;
  const diffMs = d.getTime() - Date.now();
  const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, diffWeeks);
}

function normalizeTriggerStatus(status) {
  if (status === "triggered" || status === "warning" || status === "safe") return status;
  return "safe";
}

function mapLiveTriggersToCards(apiPayload) {
  const zones = apiPayload?.triggers;
  if (!Array.isArray(zones) || zones.length === 0) return triggerStatuses;

  const zone = zones[0];
  const govtAlerts = Array.isArray(zone.govt_alerts) ? zone.govt_alerts : [];
  return [
    {
      id: "T1",
      name: "Heavy Rain",
      icon: "🌧️",
      api: "OpenWeatherMap / IMD",
      threshold: ">64.5mm / 24h",
      current: `${zone.weather?.rain_mm ?? 0}mm`,
      status: normalizeTriggerStatus(zone.statuses?.rain),
      payout: "50–80%",
      color: "#3B82F6",
    },
    {
      id: "T2",
      name: "Extreme Heat",
      icon: "🌡️",
      api: "IMD Heat API / NDMA",
      threshold: ">45°C with advisory",
      current: `${zone.weather?.temperature ?? 0}°C`,
      status: normalizeTriggerStatus(zone.statuses?.heat),
      payout: "30–50%",
      color: "#F59E0B",
    },
    {
      id: "T3",
      name: "Severe AQI",
      icon: "💨",
      api: "CPCB Safar API",
      threshold: "AQI >400 for 3+hrs",
      current: `AQI ${zone.aqi?.aqi ?? 0}`,
      status: normalizeTriggerStatus(zone.statuses?.aqi),
      payout: "25–40%",
      color: "#8B5CF6",
    },
    {
      id: "T4",
      name: "Curfew / Lockdown",
      icon: "🚫",
      api: "State Govt. API + Platform",
      threshold: "Official order issued",
      current: govtAlerts.includes("MOVEMENT_RESTRICTED") ? "Order issued" : "No alerts",
      status: normalizeTriggerStatus(zone.statuses?.curfew),
      payout: "80–100%",
      color: "#EF4444",
    },
    {
      id: "T5",
      name: "Flash Flood",
      icon: "🌊",
      api: "NDMA Flood Alert API",
      threshold: "Level-3 flood alert",
      current: govtAlerts.includes("FLOOD_WARNING") ? "Flood warning" : "No alert",
      status: normalizeTriggerStatus(zone.statuses?.flood),
      payout: "80–100%",
      color: "#06B6D4",
    },
  ];
}

function formatCompactAmount(value) {
  const num = Number(value || 0);
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
  return num.toLocaleString("en-IN");
}

function mapFraudQueueForUi(queue) {
  if (!Array.isArray(queue) || queue.length === 0) return DEFAULT_FRAUD_QUEUE;

  return queue.map((item, index) => {
    const score = Math.round(Number(item.fraud_score || 0));
    const userSuffix = String(item.phone_number || "0000").slice(-4);

    return {
      id: item.id || `CLM-${index + 1}`,
      worker: `Worker ${userSuffix}`,
      trigger: TRIGGER_LABELS[item.trigger_event] || item.trigger_event || "Unknown",
      score,
      flags:
        item.status === "FRAUD_FLAGGED"
          ? ["Fraud risk flagged", `Risk score ${score}/100`]
          : item.status === "PENDING"
            ? ["Pending manual review"]
            : ["Investigate pattern"],
      status: score >= 70 ? "reject" : "review",
    };
  });
}

export function AppProvider({ children }) {
  const [screen, setScreen] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("worker");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [triggers, setTriggers] = useState(triggerStatuses);
  const [alertBanner, setAlertBanner] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(gigWorker.phone);
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  const [workerProfile, setWorkerProfile] = useState(gigWorker);
  const [claimsData, setClaimsData] = useState(gigWorker.claims);
  const [scoreHistoryData, setScoreHistoryData] = useState(scoreHistory);
  const [premiumHistoryData, setPremiumHistoryData] = useState(premiumData);
  const [corpusGrowthData, setCorpusGrowthData] = useState(corpusData);
  const [policyData, setPolicyData] = useState(null);

  const [analyticsSummary, setAnalyticsSummary] = useState(DEFAULT_ANALYTICS);
  const [analyticsSeries] = useState(lossRatioData);
  const [fraudQueueData, setFraudQueueData] = useState(DEFAULT_FRAUD_QUEUE);
  const [adminCorpusSummary, setAdminCorpusSummary] = useState(DEFAULT_CORPUS_SUMMARY);

  const [apiSources, setApiSources] = useState({
    auth: "mock",
    policy: "mock",
    claims: "mock",
    gigscore: "mock",
    corpus: "mock",
    analytics: "mock",
    fraud: "mock",
    adminCorpus: "mock",
    triggers: "mock",
  });

  const raiseAutoClaimBanner = (triggerName) => {
    const nextAlert = {
      trigger: triggerName,
      amount: 216,
      id: `CLM-${String(Date.now()).slice(-4)}`,
    };

    setAlertBanner(nextAlert);
    setTimeout(() => setAlertBanner(null), 8000);
  };

  const fetchTriggerData = async () => {
    try {
      const response = await adminService.getLiveTriggers();
      const source = response?.data?.source || "database";
      const mapped = mapLiveTriggersToCards(response?.data);

      setTriggers((prev) => {
        const newlyTriggered = mapped.find((tr, idx) => tr.status === "triggered" && prev[idx]?.status !== "triggered");
        if (newlyTriggered) {
          raiseAutoClaimBanner(newlyTriggered.name);
        }
        return mapped;
      });

      setApiSources((prev) => ({ ...prev, triggers: source }));
    } catch (error) {
      setApiSources((prev) => ({ ...prev, triggers: "mock" }));
      setTriggers(triggerStatuses);
    }
  };

  const fetchWorkerData = async () => {
    const [policyResp, claimsResp, gigResp, corpusResp] = await Promise.allSettled([
      policyService.activePolicy(),
      claimService.getClaims(),
      gigScoreService.getCurrent(),
      corpusService.getStats(),
    ]);

    const profile = {
      ...gigWorker,
      phone: phoneNumber || gigWorker.phone,
      policy: { ...gigWorker.policy },
    };

    let resolvedPolicyData = null;
    let resolvedClaims = gigWorker.claims;
    let resolvedScoreHistory = scoreHistory;
    let resolvedPremiumHistory = premiumData;
    let resolvedCorpusHistory = corpusData;

    if (policyResp.status === "fulfilled") {
      const payload = policyResp.value.data;
      const policy = payload?.policy;
      setApiSources((prev) => ({ ...prev, policy: payload?.source || "database" }));

      if (policy) {
        const premium = Number(policy.premium || profile.policy.weeklyPremium);
        profile.policy.weeklyPremium = premium;
        resolvedPremiumHistory = buildPremiumHistory(premium);
        resolvedPolicyData = policy;
      }
    } else {
      setApiSources((prev) => ({ ...prev, policy: "mock" }));
    }

    if (gigResp.status === "fulfilled") {
      const payload = gigResp.value.data;
      const score = Number(payload?.current_score || profile.gigScore);
      const tier = normalizeTier(payload?.tier, score);

      profile.gigScore = score;
      profile.tier = tier;
      profile.policy.maxPayout = maxPayoutByTier(tier);
      resolvedScoreHistory = buildScoreHistory(payload?.history, score);
      setApiSources((prev) => ({ ...prev, gigscore: payload?.source || "database" }));
    } else {
      setApiSources((prev) => ({ ...prev, gigscore: "mock" }));
    }

    if (claimsResp.status === "fulfilled") {
      const payload = claimsResp.value.data;
      resolvedClaims = mapClaimsToUi(payload?.claims, profile.zone);
      setApiSources((prev) => ({ ...prev, claims: payload?.source || "database" }));
    } else {
      setApiSources((prev) => ({ ...prev, claims: "mock" }));
    }

    if (corpusResp.status === "fulfilled") {
      const payload = corpusResp.value.data;
      const balance = Number(payload?.balance ?? profile.corpusInvested);
      const finalPayout = Number(payload?.projected_final_payout ?? (balance + Number(payload?.projected_yield || 0)));

      profile.corpusInvested = Number(balance.toFixed(2));
      profile.corpusReturn = Number(finalPayout.toFixed(2));
      profile.weeksToMaturity = deriveWeeksToMaturity(payload?.latest_maturity, profile.weeksToMaturity);

      resolvedCorpusHistory = buildCorpusGrowth(profile.corpusInvested, profile.corpusReturn);
      setApiSources((prev) => ({ ...prev, corpus: payload?.source || "database" }));
    } else {
      setApiSources((prev) => ({ ...prev, corpus: "mock" }));
    }

    setWorkerProfile(profile);
    setPolicyData(resolvedPolicyData);
    setClaimsData(resolvedClaims);
    setScoreHistoryData(resolvedScoreHistory);
    setPremiumHistoryData(resolvedPremiumHistory);
    setCorpusGrowthData(resolvedCorpusHistory);
  };

  const fetchAdminData = async () => {
    const [analyticsResp, fraudResp, corpusResp] = await Promise.allSettled([
      adminService.getAnalyticsSummary(),
      adminService.getFraudQueue(),
      adminService.getCorpusSummary(),
    ]);

    if (analyticsResp.status === "fulfilled") {
      const payload = analyticsResp.value.data;
      setAnalyticsSummary(payload?.summary || DEFAULT_ANALYTICS);
      setApiSources((prev) => ({ ...prev, analytics: payload?.source || "database" }));
    } else {
      setAnalyticsSummary(DEFAULT_ANALYTICS);
      setApiSources((prev) => ({ ...prev, analytics: "mock" }));
    }

    if (fraudResp.status === "fulfilled") {
      const payload = fraudResp.value.data;
      setFraudQueueData(mapFraudQueueForUi(payload?.queue));
      setApiSources((prev) => ({ ...prev, fraud: payload?.source || "database" }));
    } else {
      setFraudQueueData(DEFAULT_FRAUD_QUEUE);
      setApiSources((prev) => ({ ...prev, fraud: "mock" }));
    }

    if (corpusResp.status === "fulfilled") {
      const payload = corpusResp.value.data;
      setAdminCorpusSummary(payload?.summary || DEFAULT_CORPUS_SUMMARY);
      setApiSources((prev) => ({ ...prev, adminCorpus: payload?.source || "database" }));
    } else {
      setAdminCorpusSummary(DEFAULT_CORPUS_SUMMARY);
      setApiSources((prev) => ({ ...prev, adminCorpus: "mock" }));
    }
  };

  const verifyOtpCode = async (otpCode) => {
    setAuthLoading(true);
    setLastError(null);

    try {
      const response = await authService.verifyOTP(phoneNumber, otpCode);
      const payload = response?.data;

      if (!payload?.success || !payload?.token) {
        setLastError(payload?.message || "OTP verification failed.");
        return { success: false, message: payload?.message || "OTP verification failed." };
      }

      localStorage.setItem("token", payload.token);
      setApiSources((prev) => ({ ...prev, auth: "database" }));
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to verify OTP right now.";
      setLastError(message);
      setApiSources((prev) => ({ ...prev, auth: "mock" }));
      return { success: false, message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setScreen("login");
    setRole("worker");
    setActiveTab("dashboard");
    setAlertBanner(null);
    setLastError(null);
    setWorkerProfile(gigWorker);
    setClaimsData(gigWorker.claims);
    setScoreHistoryData(scoreHistory);
    setPremiumHistoryData(premiumData);
    setCorpusGrowthData(corpusData);
    setPolicyData(null);
    setAnalyticsSummary(DEFAULT_ANALYTICS);
    setFraudQueueData(DEFAULT_FRAUD_QUEUE);
    setAdminCorpusSummary(DEFAULT_CORPUS_SUMMARY);
    setTriggers(triggerStatuses);
  };

  useEffect(() => {
    if (!loggedIn) return;

    let active = true;

    const load = async () => {
      if (!active) return;
      setDataLoading(true);

      try {
        if (role === "worker") {
          await fetchWorkerData();
        } else {
          await fetchAdminData();
        }

        await fetchTriggerData();
      } catch (error) {
        setLastError("Unable to refresh live data. Showing fallback snapshot.");
      } finally {
        if (active) setDataLoading(false);
      }
    };

    load();
    const intervalRef = setInterval(load, 30000);

    return () => {
      active = false;
      clearInterval(intervalRef);
    };
  }, [loggedIn, role]);

  const value = {
    screen, setScreen,
    loggedIn, setLoggedIn,
    role, setRole,
    activeTab, setActiveTab,
    sidebarOpen, setSidebarOpen,
    triggers, setTriggers,
    alertBanner, setAlertBanner,
    phoneNumber, setPhoneNumber,
    workerProfile, claimsData, scoreHistoryData, premiumHistoryData, corpusGrowthData,
    policyData,
    analyticsSummary, analyticsSeries, fraudQueueData, adminCorpusSummary,
    authLoading, dataLoading, lastError,
    apiSources,
    verifyOtpCode,
    signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
