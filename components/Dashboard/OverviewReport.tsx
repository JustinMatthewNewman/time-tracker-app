"use client";

import { useMemo } from "react";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";
import { StatTile } from "./StatTile";
import { WeeklyStatTiles } from "./WeeklyStatTiles";
import { WeeklyTrendChart } from "./WeeklyTrendChart";
import { CalendarHeatmap } from "./CalendarHeatmap";
import { MonthlyHoursBar } from "./MonthlyHoursBar";

export function OverviewReport() {
  const { entries, loading, error } = useMyTimeEntries();

  const totalMinutes = useMemo(
    () => entries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0),
    [entries]
  );

  return (
    <div className="flex flex-col gap-4">
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

      <MonthlyHoursBar />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile label="Total hours logged" value={formatDuration(totalMinutes)} loading={loading} />
        <StatTile label="Total time entries" value={String(entries.length)} loading={loading} />
      </div>
    </div>
  );
}

export default OverviewReport;
