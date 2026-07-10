"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { useWorkLogs } from "@/hooks/useWorkLogs";
import { groupByTicket, minutesBetween, formatDuration } from "@/lib/timeTotals";
import { StatTile } from "./StatTile";
import { HoursBarChart } from "./HoursBarChart";

const UNTITLED_WORK_LOG = "(Untitled work log)";

function groupByWorkLog(
  entries: { workLogId?: string | null; workLogName?: string | null; startTime: string; endTime: string }[]
) {
  const byWorkLog = new Map<string, { label: string; totalMinutes: number }>();

  for (const entry of entries) {
    const key = entry.workLogId ?? "unassigned";
    const label = entry.workLogName?.trim() || UNTITLED_WORK_LOG;
    const minutes = minutesBetween(entry.startTime, entry.endTime);

    const existing = byWorkLog.get(key);
    if (existing) {
      existing.totalMinutes += minutes;
    } else {
      byWorkLog.set(key, { label, totalMinutes: minutes });
    }
  }

  return Array.from(byWorkLog.values());
}

export function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { entries, loading, error } = useMyTimeEntries();
  const { workLogs } = useWorkLogs();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  const totalMinutes = useMemo(
    () => entries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0),
    [entries]
  );

  const byTicket = useMemo(() => groupByTicket(entries), [entries]);
  const byWorkLog = useMemo(() => groupByWorkLog(entries), [entries]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Total hours logged" value={loading ? "…" : formatDuration(totalMinutes)} />
        <StatTile label="Total time entries" value={loading ? "…" : String(entries.length)} />
        <StatTile label="Total work logs" value={String(workLogs.length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HoursBarChart
          title="Hours by ticket"
          data={byTicket.map((t) => ({ label: t.ticket, totalMinutes: t.totalMinutes }))}
          emptyMessage={loading ? "Loading..." : "No time entries yet."}
        />
        <HoursBarChart
          title="Hours by work log"
          data={byWorkLog}
          emptyMessage={loading ? "Loading..." : "No time entries yet."}
        />
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
