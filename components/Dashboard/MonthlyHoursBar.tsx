"use client";

import { useMemo } from "react";
import { minutesBetween } from "@/lib/timeTotals";
import { normalizeDayKey } from "@/lib/dayKeys";
import { HoursBarChart } from "./HoursBarChart";
import type { BreakdownEntry } from "@/lib/weekdayBreakdown";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthlyHoursBarProps {
  /**
   * The shared long-horizon entry set — spans ~52 weeks, so it reaches back
   * into the previous year and MUST be filtered to `year` here. (It used to
   * scope itself via its own year-bounded fetch.)
   */
  entries: BreakdownEntry[];
  loading?: boolean;
  year: number;
}

// Reuses HoursBarChart directly — magnitude-across-discrete-categories
// (one bar per month) is already that component's job; no new chart needed.
export function MonthlyHoursBar({ entries, loading, year }: MonthlyHoursBarProps) {
  const data = useMemo(() => {
    const totals = new Array(12).fill(0);
    for (const entry of entries) {
      // Year and month read straight off the "yyyy-mm-dd" day key — no Date
      // construction at all, so there's no timezone step that could shift a
      // Jan 1 or Dec 31 entry into the adjacent year.
      const [entryYear, entryMonth] = normalizeDayKey(entry.date).split("-").map(Number);
      if (entryYear !== year) continue;
      totals[entryMonth - 1] += minutesBetween(entry.startTime, entry.endTime);
    }
    return MONTH_NAMES.map((label, i) => ({ label, value: totals[i] }));
  }, [entries, year]);

  return (
    <HoursBarChart
      title={`${year} by month`}
      data={data}
      emptyMessage="No time entries yet."
      sortByValue={false}
      loading={loading}
    />
  );
}

export default MonthlyHoursBar;
