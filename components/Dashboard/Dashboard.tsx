"use client";

import AmbientBackground from "@/components/AmbientBackground";
import FeatureGate from "@/components/FeatureGate";
import DashboardLayout from "./DashboardLayout";

function Dashboard() {
  // FeatureGate absorbs the auth-loading/redirect handling this component used
  // to do itself, and adds the Dashboard grant check on top.
  return (
    <FeatureGate feature="Dashboard" label="the dashboard">
      <div className="relative flex h-full flex-col gap-4 overflow-hidden p-4">
        <AmbientBackground intensity={0.85} />

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-4 overflow-hidden">
          <DashboardLayout />
        </div>
      </div>
    </FeatureGate>
  );
}

export default Dashboard;
