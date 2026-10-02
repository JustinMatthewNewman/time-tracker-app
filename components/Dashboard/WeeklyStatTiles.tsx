"use client";

import { useMemo } from "react";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";
import { startOfWeek, weekKey, getRelativeWeekLabel } from "@/lib/weekBuckets";
import { normalizeDayKey, parseDayKey } from "@/lib/dayKeys";
import { StatTile } from "./StatTile";
import type { DeltaDirection } from "./chartColor";
import type { BreakdownEntry } from "@/lib/weekdayBreakdown";

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
  /** The selected week plus the prior one — the prior week drives the deltas. */
  entries: BreakdownEntry[];
  loading?: boolean;
  weekStart: Date;
}

export function WeeklyStatTiles({ entries, loading, weekStart }: WeeklyStatTilesProps) {
  const currentWeekStart = startOfWeek(weekStart);

  const stats = useMemo(() => {
    const currentKey = weekKey(currentWeekStart);
    // Week derived from `date` via dayKeys, not from `new Date(startTime)` —
    // same bucketing every other widget on this page now uses, so the tiles
    // can't disagree with the breakdown row about which week an entry is in.
    const weekOf = (e: BreakdownEntry) => weekKey(parseDayKey(normalizeDayKey(e.date)));

    const currentEntries = entries.filter((e) => weekOf(e) === currentKey);
    const previousEntries = entries.filter((e) => weekOf(e) !== currentKey);

    const sum = (list: BreakdownEntry[]) =>
      list.reduce((acc, e) => acc + minutesBetween(e.startTime, e.endTime), 0);
    const distinctTickets = (list: BreakdownEntry[]) =>
      new Set(list.filter((e) => e.ticket).map((e) => e.ticket!.ticketNumber)).size;

    const currentMinutes = sum(currentEntries);
    const previousMinutes = sum(previousEntries);
    const currentTickets = distinctTickets(currentEntries);
    const previousTickets = distinctTickets(previousEntries);

    return {
      hours: { current: currentMinutes, delta: delta(currentMinutes, previousMinutes) },
      entryCount: { current: currentEntries.length, delta: delta(currentEntries.length, previousEntries.length) },
      tickets: { current: currentTickets, delta: delta(currentTickets, previousTickets) },
    };
    // currentWeekStart is derived from `weekStart`, which already drives `entries`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  // The Overview defaults to the *previous* week, so a hardcoded "this week"
  // label would be wrong on load. getRelativeWeekLabel already renders
  // "This week"/"Last week"/"3 weeks ago", so the label tracks the selection.
  const scope = getRelativeWeekLabel(currentWeekStart).toLowerCase();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile
        label={`Hours, ${scope}`}
        value={formatDuration(stats.hours.current)}
        delta={stats.hours.delta}
        loading={loading}
      />
      <StatTile
        label={`Time entries, ${scope}`}
        value={String(stats.entryCount.current)}
        delta={stats.entryCount.delta}
        loading={loading}
      />
      <StatTile
        label={`Active tickets, ${scope}`}
        value={String(stats.tickets.current)}
        delta={stats.tickets.delta}
        loading={loading}
      />
    </div>
  );
}

export default WeeklyStatTiles;
