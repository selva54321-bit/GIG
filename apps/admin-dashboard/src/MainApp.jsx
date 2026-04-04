import React from "react";
import Login from "./pages/Auth/Login";
import OTP from "./pages/Auth/OTP";
import Onboarding from "./pages/Auth/Onboarding";

import WorkerDashboard from "./pages/Worker/Dashboard";
import GigScore from "./pages/Worker/GigScore";
import Policy from "./pages/Worker/Policy";
import LiveTriggers from "./pages/Shared/LiveTriggers";
import Claims from "./pages/Worker/Claims";
import GigCorpus from "./pages/Worker/GigCorpus";

import Analytics from "./pages/Admin/Analytics";
import FraudQueue from "./pages/Admin/FraudQueue";
import CorpusFund from "./pages/Admin/CorpusFund";

import MobileAppView from "./pages/MobileAppView";

import { useAppContext } from "./context/AppContext";
import Layout from "./components/Layout";

export default function MainApp() {
  const { screen, activeTab } = useAppContext();

  if (screen === "login") return <Login />;
  if (screen === "otp") return <OTP />;
  if (screen === "onboard") return <Onboarding />;

  return (
    <Layout>
      {activeTab === "dashboard" && <WorkerDashboard />}
      {activeTab === "gigscore" && <GigScore />}
      {activeTab === "policy" && <Policy />}
      {activeTab === "claims" && <Claims />}
      {activeTab === "corpus" && <GigCorpus />}
      {activeTab === "triggers" && <LiveTriggers />}
      {activeTab === "mobile_preview" && <MobileAppView />}
      
      {activeTab === "admin" && <Analytics />}
      {activeTab === "triggers_admin" && <LiveTriggers />}
      {activeTab === "fraud" && <FraudQueue />}
      {activeTab === "corpus_admin" && <CorpusFund />}
    </Layout>
  );
}
