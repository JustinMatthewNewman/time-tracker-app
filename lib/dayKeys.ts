// Local-safe helpers for the "yyyy-mm-dd" day keys that TimeEntry.date uses.
//
// The trap this exists to avoid: `new Date("2026-08-09")` parses as UTC
// midnight, so formatting it back with toLocaleDateString() in any timezone
// behind UTC renders the *previous* day ("Aug 8" for a UTC-4 user). Same class
// of bug already documented in lib/weekBuckets.ts, NewWorkLogDialog.tsx and
// scripts/seed-stress-test.mjs — a day key must be split into parts and
// rebuilt at local midnight, never handed to the Date string parser.

/** A calendar day as "yyyy-mm-dd", matching TimeEntry.date. */
export type DayKey = string;

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "short",
  day: "numeric",
  year: "numeric",
};

export function toDayKey(date: Date): DayKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today in the viewer's own timezone — comparable against a TimeEntry.date. */
export function todayDayKey(): DayKey {
  return toDayKey(new Date());
}

// Data Connect returns the Date scalar as "yyyy-mm-dd", but slicing keeps this
// correct if a full ISO timestamp ever comes through — the same defensive read
// CalendarHeatmap does with `entry.date.slice(0, 10)`.
export function normalizeDayKey(value: string): DayKey {
  return value.slice(0, 10);
}

/** Parses a day key at *local* midnight, so formatting can't shift the date. */
export function parseDayKey(key: DayKey): Date {
  const [year, month, day] = normalizeDayKey(key).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDayKey(key: DayKey, options: Intl.DateTimeFormatOptions = DEFAULT_FORMAT): string {
  return parseDayKey(key).toLocaleDateString([], options);
}
