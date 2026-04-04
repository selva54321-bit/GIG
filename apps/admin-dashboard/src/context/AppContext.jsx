import React, { createContext, useContext, useState, useEffect } from "react";
import { triggerStatuses } from "../data/mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [screen, setScreen] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("worker");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [triggers, setTriggers] = useState(triggerStatuses);
  const [alertBanner, setAlertBanner] = useState(null);
  const [ticker, setTicker] = useState(0);

  // Simulate live ticker
  useEffect(() => {
    const t = setInterval(() => setTicker((p) => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  // Simulate AQI warning escalating
  useEffect(() => {
    if (!loggedIn) return;
    const t = setInterval(() => {
      setTriggers((prev) =>
        prev.map((tr) => {
          if (tr.id === "T3") {
            const aqiVal = 187 + (ticker % 5) * 30;
            const newStatus =
              aqiVal >= 400 ? "triggered" : aqiVal >= 300 ? "warning" : "safe";
            if (newStatus === "triggered" && tr.status !== "triggered") {
              setAlertBanner({ trigger: "Severe AQI", amount: 216, id: "CLM-2899" });
              setTimeout(() => setAlertBanner(null), 8000);
            }
            return { ...tr, current: `AQI ${aqiVal}`, status: newStatus };
          }
          return tr;
        })
      );
    }, 4000);
    return () => clearInterval(t);
  }, [loggedIn, ticker]);

  const value = {
    screen, setScreen,
    loggedIn, setLoggedIn,
    role, setRole,
    activeTab, setActiveTab,
    sidebarOpen, setSidebarOpen,
    triggers, setTriggers,
    alertBanner, setAlertBanner,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
