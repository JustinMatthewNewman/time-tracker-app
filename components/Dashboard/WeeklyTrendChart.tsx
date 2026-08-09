"use client";

import { useMemo, useState } from "react";
import { Card, Skeleton, Tabs } from "@heroui/react";
import { scaleLinear, scalePoint } from "d3-scale";
import { line as d3line, area as d3area, curveMonotoneX } from "d3-shape";
import { useTimeEntriesByDateRange } from "@/hooks/useTimeEntriesByDateRange";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";
import { startOfWeek, weekKey, weekLabel } from "@/lib/weekBuckets";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";

type Window = "12w" | "6m" | "1y";

const WINDOW_WEEKS: Record<Window, number> = { "12w": 12, "6m": 26, "1y": 52 };
const WINDOW_LABEL: Record<Window, string> = { "12w": "12 weeks", "6m": "6 months", "1y": "1 year" };

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

interface WeekPoint {
  key: string;
  start: Date;
  totalMinutes: number;
}

const WIDTH = 640;
const HEIGHT = 220;
const MARGIN = { top: 16, right: 16, bottom: 28, left: 16 };

export function WeeklyTrendChart() {
  const [window, setWindow] = useState<Window>("12w");
  const { tooltip, showAt, hide } = useChartTooltip<WeekPoint>();

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    const weeks = WINDOW_WEEKS[window];
    const start = startOfWeek(new Date(today.getFullYear(), today.getMonth(), today.getDate() - weeks * 7));
    return { startDate: isoLocalMidnight(start), endDate: isoLocalMidnight(today) };
  }, [window]);

  const { entries, loading } = useTimeEntriesByDateRange(startDate, endDate);

  const points = useMemo<WeekPoint[]>(() => {
    const totals = new Map<string, number>();
    for (const entry of entries) {
      const key = weekKey(new Date(entry.startTime));
      totals.set(key, (totals.get(key) ?? 0) + minutesBetween(entry.startTime, entry.endTime));
    }

    // Walk every week in the window (not just weeks with data) so gaps show
    // as a dip to zero rather than silently skipping — a line chart that
    // skips missing categories misrepresents the trend.
    const weeks: WeekPoint[] = [];
    const cursor = startOfWeek(new Date(startDate));
    const end = startOfWeek(new Date(endDate));
    while (cursor <= end) {
      const key = weekKey(cursor);
      weeks.push({ key, start: new Date(cursor), totalMinutes: totals.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 7);
    }
    return weeks;
  }, [entries, startDate, endDate]);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const x = useMemo(
    () => scalePoint<string>().domain(points.map((p) => p.key)).range([0, innerWidth]).padding(0.5),
    [points, innerWidth]
  );
  const maxMinutes = Math.max(1, ...points.map((p) => p.totalMinutes));
  const y = useMemo(
    () => scaleLinear().domain([0, maxMinutes]).range([innerHeight, 0]).nice(),
    [maxMinutes, innerHeight]
  );

  const linePath = useMemo(
    () =>
      d3line<WeekPoint>()
        .x((p) => x(p.key) ?? 0)
        .y((p) => y(p.totalMinutes))
        .curve(curveMonotoneX)(points) ?? "",
    [points, x, y]
  );
  const areaPath = useMemo(
    () =>
      d3area<WeekPoint>()
        .x((p) => x(p.key) ?? 0)
        .y0(innerHeight)
        .y1((p) => y(p.totalMinutes))
        .curve(curveMonotoneX)(points) ?? "",
    [points, x, y, innerHeight]
  );

  // Every ~4th week gets an axis label, always including the last (most
  // recent) week — enough context without crowding a 52-week domain.
  const labelStep = Math.max(1, Math.ceil(points.length / 8));

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Weekly hours</h2>
        <Tabs
          selectedKey={window}
          onSelectionChange={(key) => setWindow(String(key) as Window)}
          aria-label="Trend window"
        >
          <Tabs.ListContainer>
            <Tabs.List className="text-xs">
              {(Object.keys(WINDOW_WEEKS) as Window[]).map((w) => (
                <Tabs.Tab key={w} id={w} className="px-2.5 py-1 text-xs">
                  {WINDOW_LABEL[w]}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          {(Object.keys(WINDOW_WEEKS) as Window[]).map((w) => (
            <Tabs.Panel key={w} id={w} className="hidden">
              {null}
            </Tabs.Panel>
          ))}
        </Tabs>
      </div>

      {loading ? (
        <Skeleton className="h-[220px] w-full rounded-lg" />
      ) : points.every((p) => p.totalMinutes === 0) ? (
        <p className="py-10 text-center text-sm text-foreground/60">No time entries in this window yet.</p>
      ) : (
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" style={{ minWidth: WIDTH }}>
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* Recessive gridlines — three horizontal reference lines, no axis box. */}
              {y.ticks(3).map((tick) => (
                <line
                  key={tick}
                  x1={0}
                  x2={innerWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="var(--border)"
                  strokeWidth={1}
                  opacity={0.5}
                />
              ))}

              <path d={areaPath} fill="var(--accent)" opacity={0.12} stroke="none" />
              <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

              {points.map((p, i) => (
                <g key={p.key}>
                  {i % labelStep === 0 && (
                    <text
                      x={x(p.key) ?? 0}
                      y={innerHeight + 18}
                      textAnchor="middle"
                      className="fill-foreground/50"
                      fontSize={10}
                    >
                      {p.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </text>
                  )}
                  {/* Wide invisible hit target — bigger than the visible mark, per the interaction spec. */}
                  <rect
                    x={(x(p.key) ?? 0) - (innerWidth / Math.max(1, points.length - 1)) / 2}
                    y={0}
                    width={innerWidth / Math.max(1, points.length - 1)}
                    height={innerHeight}
                    fill="transparent"
                    onPointerEnter={(e) => showAt(e, p)}
                    onPointerLeave={hide}
                  />
                  {tooltip?.data.key === p.key && (
                    <>
                      <line x1={x(p.key) ?? 0} x2={x(p.key) ?? 0} y1={0} y2={innerHeight} stroke="var(--accent)" strokeWidth={1} opacity={0.35} />
                      <circle cx={x(p.key) ?? 0} cy={y(p.totalMinutes)} r={4} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
                    </>
                  )}
                </g>
              ))}
            </g>
          </svg>

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">{weekLabel(tooltip.data.start)}</div>
              <div className="text-foreground/60">{formatDuration(tooltip.data.totalMinutes)}</div>
            </ChartTooltip>
          )}
        </div>
      )}

      <table className="sr-only">
        <caption>Weekly hours, {WINDOW_LABEL[window]}</caption>
        <thead>
          <tr>
            <th>Week of</th>
            <th>Total hours</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.key}>
              <td>{weekLabel(p.start)}</td>
              <td>{formatDuration(p.totalMinutes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default WeeklyTrendChart;
