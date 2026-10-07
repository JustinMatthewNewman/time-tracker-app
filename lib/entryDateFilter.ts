import { startOfWeek, endOfWeek } from "./weekBuckets";
import { startOfMonth, endOfMonth } from "./monthBuckets";

/**
 * Date-range filtering for an already-fetched set of time entries.
 *
 * Separate from the server-side `useTimeEntriesByDateRange` on purpose: the
 * Tickets page deliberately holds *every* entry (it is an all-time ticket
 * ranking), so narrowing it is a local slice of data already in memory rather
 * than a refetch. Pulling the maths out here rather than leaving it inline in
 * the page is what makes the boundary behaviour testable — see
 * lib/entryDateFilter.test.ts, which is mostly about the inclusive end.
 */
export type DateRangePreset = "all" | "week" | "month" | "last30" | "last90" | "custom";

export const DATE_RANGE_PRESETS: { id: Exclude<DateRangePreset, "custom">; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "last30", label: "Last 30 days" },
  { id: "last90", label: "Last 90 days" },
];

export interface DateRangeFilter {
  preset: DateRangePreset;
  /** yyyy-mm-dd, only read when preset is "custom". */
  customStart: string;
  /** yyyy-mm-dd, only read when preset is "custom". */
  customEnd: string;
}

/**
 * Resolved bounds as epoch milliseconds, both inclusive of their whole day.
 * `null` on either side means unbounded.
 */
export interface ResolvedRange {
  startMs: number | null;
  endMs: number | null;
}

function localMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Parsed component-wise rather than with `new Date("yyyy-mm-dd")`, which the
// spec says to read as *UTC* midnight — that shifts the boundary by the local
// offset, so for anyone west of UTC a range starting "the 5th" would silently
// drop the 5th's first hours. Same rule as lib/weekBuckets.ts.
function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  // Rejects impossible dates that Date would silently roll over (2026-02-31
  // becoming March 3rd), which would widen the range past what was asked for.
  if (date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) return null;
  return date;
}

/** The instant just before the *next* day begins, so the end day is included. */
function endOfDayMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - 1;
}

export function resolveDateRange(filter: DateRangeFilter, now: Date = new Date()): ResolvedRange {
  switch (filter.preset) {
    case "all":
      return { startMs: null, endMs: null };
    case "week":
      return { startMs: startOfWeek(now).getTime(), endMs: endOfDayMs(endOfWeek(now)) };
    case "month":
      return { startMs: startOfMonth(now).getTime(), endMs: endOfDayMs(endOfMonth(now)) };
    case "last30":
    case "last90": {
      const days = filter.preset === "last30" ? 30 : 90;
      const today = localMidnight(now);
      // `days - 1` because today counts as one of them: "last 30 days" ending
      // today spans 30 calendar days, not 31.
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1));
      return { startMs: start.getTime(), endMs: endOfDayMs(today) };
    }
    case "custom": {
      const start = parseLocalDate(filter.customStart);
      const end = parseLocalDate(filter.customEnd);
      // An unparseable or missing side leaves that side unbounded rather than
      // filtering everything out — a half-filled custom range should show more
      // than it will once finished, not nothing.
      return { startMs: start ? start.getTime() : null, endMs: end ? endOfDayMs(end) : null };
    }
  }
}

/** True when the custom range is back to front, which no entry can satisfy. */
export function isRangeInvalid(filter: DateRangeFilter): boolean {
  if (filter.preset !== "custom") return false;
  const start = parseLocalDate(filter.customStart);
  const end = parseLocalDate(filter.customEnd);
  if (!start || !end) return false;
  return end.getTime() < start.getTime();
}

interface DatedEntry {
  startTime: string;
}

/**
 * Keeps entries whose *start* falls inside the range.
 *
 * Start rather than end, and deliberately not "overlaps the range": a time
 * entry belongs to the day it was logged against, which is the day the
 * breakdown groups it under everywhere else in the app. Choosing overlap here
 * would put an entry spanning midnight into two different range filters and
 * double-count it against the totals shown beside them.
 */
export function filterEntriesByRange<T extends DatedEntry>(entries: T[], range: ResolvedRange): T[] {
  if (range.startMs === null && range.endMs === null) return entries;
  return entries.filter((entry) => {
    const at = new Date(entry.startTime).getTime();
    if (Number.isNaN(at)) return false;
    if (range.startMs !== null && at < range.startMs) return false;
    if (range.endMs !== null && at > range.endMs) return false;
    return true;
  });
}

/** Human-readable summary of what is currently in scope. */
export function describeRange(filter: DateRangeFilter, now: Date = new Date()): string {
  if (filter.preset === "all") return "All time";
  const { startMs, endMs } = resolveDateRange(filter, now);
  const fmt = (ms: number) =>
    new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  if (startMs === null && endMs === null) return "All time";
  if (startMs === null) return `Up to ${fmt(endMs!)}`;
  if (endMs === null) return `From ${fmt(startMs)}`;
  return `${fmt(startMs)} – ${fmt(endMs)}`;
}
