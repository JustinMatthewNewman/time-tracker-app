import { toDayKey, formatDayKey } from "@/lib/dayKeys";
import { startOfWeek, endOfWeek } from "@/lib/weekBuckets";
import { startOfMonth, endOfMonth } from "@/lib/monthBuckets";

/**
 * The team dashboard's two viewing modes: a single previous day, or a range.
 *
 * Kept as data rather than living inside the toggle component so the range
 * maths is testable and the dashboard can own the state.
 */
export type RangeMode = "day" | "range";
export type RangePresetId = "week" | "month" | "last30" | "custom";

export interface TeamRange {
  mode: RangeMode;
  preset: RangePresetId;
  customStart: string;
  customEnd: string;
}

export function previousDayKey(today = new Date()): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  return toDayKey(d);
}

export const RANGE_PRESETS: readonly { id: Exclude<RangePresetId, "custom">; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "last30", label: "Last 30 days" },
] as const;

function presetRange(preset: Exclude<RangePresetId, "custom">, today: Date) {
  switch (preset) {
    case "week":
      return { start: toDayKey(startOfWeek(today)), end: toDayKey(endOfWeek(today)) };
    case "month":
      return { start: toDayKey(startOfMonth(today)), end: toDayKey(endOfMonth(today)) };
    case "last30": {
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
      return { start: toDayKey(start), end: toDayKey(today) };
    }
  }
}

/** Resolves the control's state to the concrete day keys the API is asked for. */
export function resolveRange(range: TeamRange, today = new Date()): { start: string; end: string } {
  if (range.mode === "day") {
    const day = previousDayKey(today);
    return { start: day, end: day };
  }
  if (range.preset === "custom") {
    return { start: range.customStart, end: range.customEnd };
  }
  return presetRange(range.preset, today);
}

/** True when the resolved range is unusable and should not be requested. */
export function isRangeInvalid(range: TeamRange, today = new Date()): boolean {
  const { start, end } = resolveRange(range, today);
  if (!start || !end) return true;
  // Day keys are zero-padded, so lexical order is chronological order.
  return start > end;
}

export function describeRange(range: TeamRange, today = new Date()): string {
  const { start, end } = resolveRange(range, today);
  if (!start || !end) return "No range selected";
  if (start === end) return formatDayKey(start);
  return `${formatDayKey(start)} → ${formatDayKey(end)}`;
}

export function defaultTeamRange(today = new Date()): TeamRange {
  // Defaults to the month, not the previous day: the previous day is often a
  // weekend or a holiday, and landing on a legitimately empty page reads as a
  // broken dashboard rather than an accurate one.
  return {
    mode: "range",
    preset: "month",
    customStart: toDayKey(startOfMonth(today)),
    customEnd: toDayKey(today),
  };
}
