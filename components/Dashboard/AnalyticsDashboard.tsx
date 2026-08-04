"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { useWorkLogs } from "@/hooks/useWorkLogs";
import { groupByTicket, minutesBetween, formatDuration } from "@/lib/timeTotals";
import { StatTile } from "./StatTile";
import { HoursBarChart } from "./HoursBarChart";
import { WeeklyStatTiles } from "./WeeklyStatTiles";
import { WeeklyTrendChart } from "./WeeklyTrendChart";
import { CalendarHeatmap } from "./CalendarHeatmap";
import { TicketBreakdownWeekly } from "./TicketBreakdownWeekly";
import { MonthlyHoursBar } from "./MonthlyHoursBar";
import AmbientBackground from "@/components/AmbientBackground";

const UNTITLED_WORK_LOG = "(Untitled work log)";
const TOP_N_ALL_TIME = 25;

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

  // groupByTicket already returns entries sorted by totalMinutes descending;
  // groupByWorkLog (local, above) doesn't, so it's sorted here before
  // capping — otherwise slicing to top N could keep the wrong entries.
  const byTicket = useMemo(() => groupByTicket(entries).slice(0, TOP_N_ALL_TIME), [entries]);
  const byWorkLog = useMemo(
    () => groupByWorkLog(entries).sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, TOP_N_ALL_TIME),
    [entries]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return (
    <div className="relative flex flex-col gap-4 p-4">
      <AmbientBackground intensity={0.85} />

      <div className="relative z-10 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <WeeklyStatTiles />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeeklyTrendChart />
          <CalendarHeatmap />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TicketBreakdownWeekly />
          <MonthlyHoursBar />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile label="Total hours logged" value={loading ? "…" : formatDuration(totalMinutes)} />
          <StatTile label="Total time entries" value={loading ? "…" : String(entries.length)} />
          <StatTile label="Total work logs" value={String(workLogs.length)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HoursBarChart
            title={`Hours by ticket (all time, top ${TOP_N_ALL_TIME})`}
            data={byTicket.map((t) => ({ label: t.ticket, totalMinutes: t.totalMinutes }))}
            emptyMessage={loading ? "Loading..." : "No time entries yet."}
          />
          <HoursBarChart
            title={`Hours by work log (all time, top ${TOP_N_ALL_TIME})`}
            data={byWorkLog}
            emptyMessage={loading ? "Loading..." : "No time entries yet."}
          />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
