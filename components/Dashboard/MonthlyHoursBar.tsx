"use client";

import { useMemo, useState } from "react";
import { minutesBetween } from "@/lib/timeTotals";
import { useTimeEntriesByDateRange } from "@/hooks/useTimeEntriesByDateRange";
import { HoursBarChart } from "./HoursBarChart";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

// Reuses HoursBarChart directly — magnitude-across-discrete-categories
// (one bar per month) is already that component's job; no new chart needed.
export function MonthlyHoursBar() {
  const [year] = useState(() => new Date().getFullYear());

  const startDate = useMemo(() => isoLocalMidnight(new Date(year, 0, 1)), [year]);
  const endDate = useMemo(() => isoLocalMidnight(new Date(year, 11, 31)), [year]);

  const { entries, loading } = useTimeEntriesByDateRange(startDate, endDate);

  const data = useMemo(() => {
    const totals = new Array(12).fill(0);
    for (const entry of entries) {
      const month = new Date(entry.startTime).getMonth();
      totals[month] += minutesBetween(entry.startTime, entry.endTime);
    }
    return MONTH_NAMES.map((label, i) => ({ label, totalMinutes: totals[i] }));
  }, [entries]);

  return (
    <HoursBarChart
      title={`${year} by month`}
      data={data}
      emptyMessage={loading ? "Loading..." : "No time entries yet."}
      sortByValue={false}
    />
  );
}

export default MonthlyHoursBar;
