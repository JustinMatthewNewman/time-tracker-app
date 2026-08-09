"use client";

import { useMemo } from "react";
import { Card, Skeleton } from "@heroui/react";
import { useTimeEntriesByDateRange } from "@/hooks/useTimeEntriesByDateRange";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";
import { weekKey } from "@/lib/weekBuckets";
import { sequentialStepColor, SEQUENTIAL_STEP_COUNT } from "./chartColor";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";

const CELL = 11;
const GAP = 3;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Monday-indexed row labels (0=Mon..6=Sun), matching lib/weekBuckets' week start.
const DAY_ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

interface DayCell {
  key: string; // yyyy-mm-dd
  date: Date;
  totalMinutes: number;
  bucket: number; // 0 = no data; 1..SEQUENTIAL_STEP_COUNT = intensity step
}

// Data-driven quintile thresholds (rather than fixed hour cutoffs) so the
// ramp adapts to each user's actual logging volume instead of looking empty
// for lighter users. Returns a function mapping a day's minutes to a bucket
// index 0 (no data) .. SEQUENTIAL_STEP_COUNT (busiest).
function buildBucketer(nonZeroValues: number[]): (minutes: number) => number {
  if (nonZeroValues.length === 0) return () => 0;
  const sorted = [...nonZeroValues].sort((a, b) => a - b);
  const thresholds = Array.from({ length: SEQUENTIAL_STEP_COUNT - 1 }, (_, i) => {
    const p = (i + 1) / SEQUENTIAL_STEP_COUNT;
    return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  });
  return (minutes: number) => {
    if (minutes <= 0) return 0;
    let bucket = 1;
    for (const t of thresholds) {
      if (minutes > t) bucket += 1;
    }
    return Math.min(bucket, SEQUENTIAL_STEP_COUNT);
  };
}

export function CalendarHeatmap() {
  const { tooltip, showAt, hide } = useChartTooltip<DayCell>();

  const { startDate, endDate, year } = useMemo(() => {
    const today = new Date();
    const jan1 = new Date(today.getFullYear(), 0, 1);
    return { startDate: isoLocalMidnight(jan1), endDate: isoLocalMidnight(today), year: today.getFullYear() };
  }, []);

  const { entries, loading } = useTimeEntriesByDateRange(startDate, endDate);

  const dayTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const entry of entries) {
      const key = entry.date.slice(0, 10);
      totals.set(key, (totals.get(key) ?? 0) + minutesBetween(entry.startTime, entry.endTime));
    }
    return totals;
  }, [entries]);

  const { cells, weekKeys } = useMemo(() => {
    const bucketOf = buildBucketer([...dayTotals.values()].filter((m) => m > 0));
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: DayCell[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      const totalMinutes = dayTotals.get(key) ?? 0;
      days.push({ key, date: new Date(cursor), totalMinutes, bucket: bucketOf(totalMinutes) });
      cursor.setDate(cursor.getDate() + 1);
    }
    const weeks = Array.from(new Set(days.map((d) => weekKey(d.date))));
    return { cells: days, weekKeys: weeks };
  }, [dayTotals, startDate, endDate]);

  const weekIndex = useMemo(() => new Map(weekKeys.map((k, i) => [k, i])), [weekKeys]);

  const rowLabelWidth = 24;
  const width = rowLabelWidth + weekKeys.length * (CELL + GAP);
  const height = 7 * (CELL + GAP) + 16; // + month label row

  // One label per month, placed at that month's first week column.
  const monthLabels = useMemo(() => {
    const seen = new Set<number>();
    const labels: { month: string; col: number }[] = [];
    for (const cell of cells) {
      const m = cell.date.getMonth();
      if (seen.has(m)) continue;
      seen.add(m);
      labels.push({ month: MONTH_NAMES[m], col: weekIndex.get(weekKey(cell.date)) ?? 0 });
    }
    return labels;
  }, [cells, weekIndex]);

  const hasAnyData = [...dayTotals.values()].some((m) => m > 0);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{year} activity</h2>
        {!loading && (
          <div className="flex items-center gap-1.5 text-[11px] text-foreground/50">
            <span>Less</span>
            {Array.from({ length: SEQUENTIAL_STEP_COUNT + 1 }, (_, step) => (
              <span
                key={step}
                className="size-2.5 rounded-[2px]"
                style={{ backgroundColor: step === 0 ? "var(--default)" : sequentialStepColor(step - 1) }}
                aria-hidden
              />
            ))}
            <span>More</span>
          </div>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-28 w-full rounded-lg" />
      ) : !hasAnyData ? (
        <p className="py-10 text-center text-sm text-foreground/60">No time entries logged yet this year.</p>
      ) : (
        <div className="relative w-full">
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
            {monthLabels.map(({ month, col }) => (
              <text key={month} x={rowLabelWidth + col * (CELL + GAP)} y={10} className="fill-foreground/50" fontSize={10}>
                {month}
              </text>
            ))}
            <g transform="translate(0, 16)">
              {DAY_ROW_LABELS.map((label, row) =>
                label ? (
                  <text key={label} x={0} y={row * (CELL + GAP) + CELL - 1} className="fill-foreground/50" fontSize={9}>
                    {label}
                  </text>
                ) : null
              )}
            </g>
            <g transform={`translate(${rowLabelWidth}, 16)`}>
              {cells.map((cell) => {
                const col = weekIndex.get(weekKey(cell.date)) ?? 0;
                const row = (cell.date.getDay() + 6) % 7; // Monday=0..Sunday=6
                return (
                  <rect
                    key={cell.key}
                    x={col * (CELL + GAP)}
                    y={row * (CELL + GAP)}
                    width={CELL}
                    height={CELL}
                    rx={2}
                    fill={cell.bucket === 0 ? "var(--default)" : sequentialStepColor(cell.bucket - 1)}
                    aria-label={`${cell.date.toDateString()}: ${formatDuration(cell.totalMinutes)}`}
                    onPointerEnter={(e) => showAt(e, cell)}
                    onPointerLeave={hide}
                  />
                );
              })}
            </g>
          </svg>

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">
                {tooltip.data.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div className="text-foreground/60">
                {tooltip.data.totalMinutes > 0 ? formatDuration(tooltip.data.totalMinutes) : "No hours logged"}
              </div>
            </ChartTooltip>
          )}
        </div>
      )}

      <table className="sr-only">
        <caption>{year} daily hours</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Total hours</th>
          </tr>
        </thead>
        <tbody>
          {cells.map((cell) => (
            <tr key={cell.key}>
              <td>{cell.date.toDateString()}</td>
              <td>{formatDuration(cell.totalMinutes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default CalendarHeatmap;
