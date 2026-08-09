"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AmbientBackground from "@/components/AmbientBackground";
import DashboardLayout from "./DashboardLayout";

function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col gap-4 overflow-hidden p-4">
      <AmbientBackground intensity={0.85} />

      <div className="relative z-10 flex h-full min-h-0 flex-col gap-4 overflow-hidden">
        <DashboardLayout />
      </div>
    </div>
  );
}

export default Dashboard;
