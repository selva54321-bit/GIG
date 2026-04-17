import React, { createContext, useContext, useEffect, useState } from "react";
import {
  triggerStatuses,
  gigWorker,
  scoreHistory,
  corpusData,
  premiumData,
  lossRatioData,
} from "../data/mockData";

const AppContext = createContext();

const DEMO_VALID_OTPS = ["1111", "123456"];

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

const DEFAULT_POLICY = {
  id: "GS-KA-2026-9876",
  premium: gigWorker.policy.weeklyPremium,
  starts: "2026-01-06T00:00:00.000Z",
  ends: "2026-12-30T23:59:59.000Z",
  status: "ACTIVE",
};

const DEFAULT_API_SOURCES = {
  auth: "mock",
  policy: "mock",
  claims: "mock",
  gigscore: "mock",
  corpus: "mock",
  analytics: "mock",
  fraud: "mock",
  adminCorpus: "mock",
  triggers: "mock",
};

function cloneTriggers() {
  return triggerStatuses.map((item) => ({ ...item }));
}

function withPhone(profile, phoneNumber) {
  return {
    ...profile,
    phone: phoneNumber || profile.phone,
    policy: { ...profile.policy },
    claims: profile.claims.map((item) => ({ ...item })),
  };
}

export function AppProvider({ children }) {
  const [screen, setScreen] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("worker");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [triggers, setTriggers] = useState(cloneTriggers);
  const [alertBanner, setAlertBanner] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(gigWorker.phone);
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  const [workerProfile, setWorkerProfile] = useState(withPhone(gigWorker, gigWorker.phone));
  const [claimsData, setClaimsData] = useState(gigWorker.claims.map((item) => ({ ...item })));
  const [scoreHistoryData, setScoreHistoryData] = useState(scoreHistory.map((item) => ({ ...item })));
  const [premiumHistoryData, setPremiumHistoryData] = useState(premiumData.map((item) => ({ ...item })));
  const [corpusGrowthData, setCorpusGrowthData] = useState(corpusData.map((item) => ({ ...item })));
  const [policyData, setPolicyData] = useState({ ...DEFAULT_POLICY });

  const [analyticsSummary, setAnalyticsSummary] = useState({ ...DEFAULT_ANALYTICS });
  const [analyticsSeries] = useState(lossRatioData.map((item) => ({ ...item })));
  const [fraudQueueData, setFraudQueueData] = useState(DEFAULT_FRAUD_QUEUE.map((item) => ({ ...item, flags: [...item.flags] })));
  const [adminCorpusSummary, setAdminCorpusSummary] = useState({
    ...DEFAULT_CORPUS_SUMMARY,
    portfolio: DEFAULT_CORPUS_SUMMARY.portfolio.map((item) => ({ ...item })),
  });
  const [apiSources] = useState({ ...DEFAULT_API_SOURCES });

  useEffect(() => {
    setWorkerProfile((prev) => ({ ...prev, phone: phoneNumber || gigWorker.phone }));
  }, [phoneNumber]);

  useEffect(() => {
    if (!loggedIn) return;

    const intervalRef = setInterval(() => {
      setTriggers((prev) => {
        const next = prev.map((item) => ({ ...item, status: "safe" }));
        const selected = Math.floor(Math.random() * next.length);
        const riskLevel = Math.random();

        if (riskLevel > 0.7) {
          const status = riskLevel > 0.88 ? "triggered" : "warning";
          next[selected].status = status;

          if (status === "triggered") {
            const payout = Math.min(workerProfile.policy.maxPayout, Math.max(180, Math.round(workerProfile.dailyAvg * 0.7)));
            const nextAlert = {
              trigger: next[selected].name,
              amount: payout,
              id: `CLM-${String(Date.now()).slice(-4)}`,
            };
            setAlertBanner(nextAlert);
            setTimeout(() => setAlertBanner(null), 8000);
          }
        } else {
          const aqi = next.find((item) => item.name === "Severe AQI");
          if (aqi) aqi.status = "warning";
        }

        return next;
      });
    }, 20000);

    return () => clearInterval(intervalRef);
  }, [loggedIn, workerProfile.dailyAvg, workerProfile.policy.maxPayout]);

  const verifyOtpCode = async (otpCode) => {
    setAuthLoading(true);
    setLastError(null);

    const normalized = String(otpCode || "").trim();

    await new Promise((resolve) => setTimeout(resolve, 450));

    if (!DEMO_VALID_OTPS.includes(normalized)) {
      const message = "Invalid OTP. Use 1111 for demo login.";
      setLastError(message);
      setAuthLoading(false);
      return { success: false, message };
    }

    localStorage.setItem("token", "showcase_demo_token");
    setAuthLoading(false);
    return { success: true };
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setScreen("login");
    setRole("worker");
    setActiveTab("dashboard");
    setAlertBanner(null);
    setLastError(null);
    setTriggers(cloneTriggers());

    setWorkerProfile(withPhone(gigWorker, phoneNumber || gigWorker.phone));
    setClaimsData(gigWorker.claims.map((item) => ({ ...item })));
    setScoreHistoryData(scoreHistory.map((item) => ({ ...item })));
    setPremiumHistoryData(premiumData.map((item) => ({ ...item })));
    setCorpusGrowthData(corpusData.map((item) => ({ ...item })));
    setPolicyData({ ...DEFAULT_POLICY });

    setAnalyticsSummary({ ...DEFAULT_ANALYTICS });
    setFraudQueueData(DEFAULT_FRAUD_QUEUE.map((item) => ({ ...item, flags: [...item.flags] })));
    setAdminCorpusSummary({
      ...DEFAULT_CORPUS_SUMMARY,
      portfolio: DEFAULT_CORPUS_SUMMARY.portfolio.map((item) => ({ ...item })),
    });
  };

  const value = {
    screen,
    setScreen,
    loggedIn,
    setLoggedIn,
    role,
    setRole,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    triggers,
    setTriggers,
    alertBanner,
    setAlertBanner,
    phoneNumber,
    setPhoneNumber,
    workerProfile,
    claimsData,
    scoreHistoryData,
    premiumHistoryData,
    corpusGrowthData,
    policyData,
    analyticsSummary,
    analyticsSeries,
    fraudQueueData,
    adminCorpusSummary,
    authLoading,
    dataLoading,
    lastError,
    apiSources,
    verifyOtpCode,
    signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
