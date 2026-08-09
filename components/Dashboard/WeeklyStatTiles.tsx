"use client";

import { useMemo } from "react";
import { useTimeEntriesByDateRange } from "@/hooks/useTimeEntriesByDateRange";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";
import { startOfWeek, endOfWeek, weekKey } from "@/lib/weekBuckets";
import { StatTile } from "./StatTile";
import type { DeltaDirection } from "./chartColor";

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

function delta(current: number, previous: number): { value: string; direction: DeltaDirection } {
  if (previous === 0) {
    if (current === 0) return { value: "—", direction: "flat" };
    return { value: "New", direction: "up" };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { value: "0%", direction: "flat" };
  return { value: `${Math.abs(pct)}%`, direction: pct > 0 ? "up" : "down" };
}

interface WeeklyStatTilesProps {
  weekStart: Date;
}

export function WeeklyStatTiles({ weekStart }: WeeklyStatTilesProps) {
  const currentWeekStart = startOfWeek(weekStart);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const startDate = isoLocalMidnight(previousWeekStart);
  const endDate = isoLocalMidnight(endOfWeek(currentWeekStart));

  const { entries, loading } = useTimeEntriesByDateRange(startDate, endDate);

  const stats = useMemo(() => {
    const currentKey = weekKey(currentWeekStart);
    const currentEntries = entries.filter((e) => weekKey(new Date(e.startTime)) === currentKey);
    const previousEntries = entries.filter((e) => weekKey(new Date(e.startTime)) !== currentKey);

    const currentMinutes = currentEntries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0);
    const previousMinutes = previousEntries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0);

    const currentTickets = new Set(currentEntries.filter((e) => e.ticket).map((e) => e.ticket!.ticketNumber));
    const previousTickets = new Set(previousEntries.filter((e) => e.ticket).map((e) => e.ticket!.ticketNumber));

    return {
      hours: { current: currentMinutes, delta: delta(currentMinutes, previousMinutes) },
      entryCount: { current: currentEntries.length, delta: delta(currentEntries.length, previousEntries.length) },
      tickets: { current: currentTickets.size, delta: delta(currentTickets.size, previousTickets.size) },
    };
    // currentWeekStart is derived from `weekStart`, which already drives `entries`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile
        label="Hours this week"
        value={formatDuration(stats.hours.current)}
        delta={stats.hours.delta}
        loading={loading}
      />
      <StatTile
        label="Time entries this week"
        value={String(stats.entryCount.current)}
        delta={stats.entryCount.delta}
        loading={loading}
      />
      <StatTile
        label="Active tickets this week"
        value={String(stats.tickets.current)}
        delta={stats.tickets.delta}
        loading={loading}
      />
    </div>
  );
}

export default WeeklyStatTiles;
