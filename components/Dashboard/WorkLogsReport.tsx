"use client";

import { useMemo } from "react";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { useWorkLogs } from "@/hooks/useWorkLogs";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";
import { startOfWeek, endOfWeek } from "@/lib/weekBuckets";
import { StatTile } from "./StatTile";
import { HoursBarChart } from "./HoursBarChart";

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

export function WorkLogsReport() {
  const { entries, loading, error } = useMyTimeEntries();
  const { workLogs, loading: workLogsLoading } = useWorkLogs();

  const totalMinutes = useMemo(
    () => entries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0),
    [entries]
  );

  // groupByWorkLog doesn't sort — done here, before capping to top N, so
  // slicing keeps the highest-total work logs rather than an arbitrary cut.
  const byWorkLog = useMemo(
    () => groupByWorkLog(entries).sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, TOP_N_ALL_TIME),
    [entries]
  );

  const workLogsThisWeek = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    return workLogs.filter((log) => {
      const date = new Date(log.workLogDate);
      return date >= weekStart && date <= weekEnd;
    }).length;
  }, [workLogs]);

  const avgMinutesPerWorkLog = workLogs.length > 0 ? Math.round(totalMinutes / workLogs.length) : 0;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Total work logs" value={String(workLogs.length)} loading={workLogsLoading} />
        <StatTile label="Work logs this week" value={String(workLogsThisWeek)} loading={workLogsLoading} />
        <StatTile
          label="Avg hours per work log"
          value={formatDuration(avgMinutesPerWorkLog)}
          loading={loading || workLogsLoading}
        />
      </div>

      <HoursBarChart
        title={`Hours by work log (all time, top ${TOP_N_ALL_TIME})`}
        data={byWorkLog}
        emptyMessage="No time entries yet."
        loading={loading}
      />
    </div>
  );
}

export default WorkLogsReport;
