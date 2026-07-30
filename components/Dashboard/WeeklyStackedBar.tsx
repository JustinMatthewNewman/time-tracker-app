"use client";

import { useMemo } from "react";
import { Card } from "@heroui/react";
import { scaleBand, scaleLinear } from "d3-scale";
import { stack } from "d3-shape";
import { useTimeEntriesByDateRange } from "@/hooks/useTimeEntriesByDateRange";
import { minutesBetween, formatDuration, groupByTicket, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { startOfWeek, endOfWeek } from "@/lib/weekBuckets";
import { capToOther, sliceStyle } from "./chartColor";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WIDTH = 480;
const HEIGHT = 240;
const MARGIN = { top: 8, right: 8, bottom: 24, left: 32 };
const SEGMENT_GAP = 2;

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

interface HoverSegment {
  day: string;
  ticket: string;
  minutes: number;
}

// Stacked bar, one bar per day of the current week, segments = hours per
// ticket that day. Ticket→color and stack order are computed ONCE from the
// week's total ranking (not per-day) so a ticket keeps the same color and
// position in every bar — the dataviz rule "color follows the entity, never
// its rank" would otherwise break the moment one ticket outranks another on
// a single day.
export function WeeklyStackedBar() {
  const { tooltip, showAt, hide } = useChartTooltip<HoverSegment>();

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    return { startDate: isoLocalMidnight(startOfWeek(today)), endDate: isoLocalMidnight(endOfWeek(today)) };
  }, []);

  const { entries, loading } = useTimeEntriesByDateRange(startDate, endDate);

  const weekTotals = useMemo(() => capToOther(groupByTicket(entries)), [entries]);
  const ticketKeys = useMemo(() => weekTotals.map((t) => t.ticket), [weekTotals]);
  const colorByTicket = useMemo(
    () => new Map(weekTotals.map((t, i) => [t.ticket, sliceStyle(t.ticket, i)])),
    [weekTotals]
  );

  const rows = useMemo(() => {
    // Overflow tickets folded by capToOther above must be re-attributed to
    // the same "Other (N tickets)" key per day, otherwise a day's segments
    // wouldn't sum to that day's real total.
    const otherKey = ticketKeys.find((k) => k.startsWith("Other")) ?? null;
    const keptTickets = new Set(weekTotals.filter((t) => t.ticket !== otherKey).map((t) => t.ticket));

    const start = startOfWeek(new Date(startDate));
    const dayList = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
    // Every ticket key must default to 0 for every day, not be left absent —
    // d3-shape's stack() reads `d[key]` directly, and an absent (undefined)
    // key sums to NaN rather than 0.
    const zeroedRow = Object.fromEntries(ticketKeys.map((k) => [k, 0]));
    const byDay = new Map<string, Record<string, number>>();
    for (const d of dayList) byDay.set(d.toDateString(), { ...zeroedRow });

    for (const entry of entries) {
      const dayKey = new Date(entry.date ?? entry.startTime).toDateString();
      const bucket = byDay.get(dayKey);
      if (!bucket) continue; // outside this week's 7 days
      const ticketLabel = entry.ticket ? String(entry.ticket.ticketNumber) : UNASSIGNED_TICKET;
      const key = keptTickets.has(ticketLabel) ? ticketLabel : otherKey ?? UNASSIGNED_TICKET;
      bucket[key] = (bucket[key] ?? 0) + minutesBetween(entry.startTime, entry.endTime) / 60;
    }

    return dayList.map((d) => ({ day: d.toDateString(), label: DAY_LABELS[(d.getDay() + 6) % 7], ...byDay.get(d.toDateString()) }));
  }, [entries, startDate, weekTotals, ticketKeys]);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const x = useMemo(
    () => scaleBand<string>().domain(rows.map((r) => r.day)).range([0, innerWidth]).padding(0.35),
    [rows, innerWidth]
  );

  const stackGen = useMemo(() => stack<Record<string, number | string>>().keys(ticketKeys), [ticketKeys]);
  // d3-shape's stack() reads `d[key]` for every declared key — a dummy
  // placeholder key that doesn't exist on any row would produce `undefined`
  // (i.e. NaN once summed), so skip calling it entirely while there are no
  // real ticket keys yet (e.g. the instant before data has loaded) instead
  // of ever handing it a fallback key.
  const series = useMemo(
    () => (ticketKeys.length ? stackGen(rows as unknown as Record<string, number>[]) : []),
    [stackGen, rows, ticketKeys]
  );

  const maxHours = Math.max(1, ...rows.map((r) => ticketKeys.reduce((sum, k) => sum + (Number(r[k as keyof typeof r]) || 0), 0)));
  const y = useMemo(() => scaleLinear().domain([0, maxHours]).range([innerHeight, 0]).nice(), [maxHours, innerHeight]);

  const hasAnyData = rows.some((r) => ticketKeys.some((k) => Number(r[k as keyof typeof r]) > 0));

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Weekly activity breakdown</h2>
      </div>

      {!hasAnyData && !loading ? (
        <p className="py-10 text-center text-sm text-foreground/60">No time entries this week yet.</p>
      ) : (
        <div className="relative w-full">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto">
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {y.ticks(4).map((tick) => (
                <g key={tick}>
                  <line x1={0} x2={innerWidth} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeWidth={1} opacity={0.5} />
                  <text x={-8} y={y(tick)} dy={3} textAnchor="end" fontSize={10} className="fill-foreground/50">
                    {tick}h
                  </text>
                </g>
              ))}

              {series.map((layer, layerIndex) => {
                const ticket = String(layer.key);
                const style = colorByTicket.get(ticket) ?? { color: "var(--muted)" };
                return layer.map((d, i) => {
                  const row = rows[i];
                  const bandwidth = x.bandwidth();
                  const xPos = x(row.day) ?? 0;
                  const [y0, y1] = d;
                  if (y1 - y0 <= 0) return null;
                  const top = y(y1);
                  const bottom = y(y0);
                  const isTopSegment = layerIndex === series.length - 1;
                  return (
                    <rect
                      key={`${ticket}-${row.day}`}
                      x={xPos}
                      y={top + SEGMENT_GAP / 2}
                      width={bandwidth}
                      height={Math.max(0, bottom - top - SEGMENT_GAP)}
                      rx={isTopSegment ? 3 : 0}
                      fill={style.color}
                      style={style.filter ? { filter: style.filter } : undefined}
                      onPointerEnter={(e) => showAt(e, { day: row.label, ticket, minutes: (y1 - y0) * 60 })}
                      onPointerLeave={hide}
                    />
                  );
                });
              })}

              {rows.map((row) => (
                <text key={row.day} x={(x(row.day) ?? 0) + x.bandwidth() / 2} y={innerHeight + 16} textAnchor="middle" fontSize={10} className="fill-foreground/50">
                  {row.label}
                </text>
              ))}
            </g>
          </svg>

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">{tooltip.data.day} · {tooltip.data.ticket}</div>
              <div className="text-foreground/60">{formatDuration(tooltip.data.minutes)}</div>
            </ChartTooltip>
          )}

          {ticketKeys.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-foreground/60">
              {ticketKeys.map((ticket) => {
                const style = colorByTicket.get(ticket)!;
                return (
                  <span key={ticket} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm" style={{ backgroundColor: style.color, filter: style.filter }} />
                    {ticket}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      <table className="sr-only">
        <caption>Weekly activity breakdown by ticket</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Ticket</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((row) =>
            ticketKeys
              .filter((k) => Number(row[k as keyof typeof row]) > 0)
              .map((k) => (
                <tr key={`${row.day}-${k}`}>
                  <td>{row.label}</td>
                  <td>{k}</td>
                  <td>{formatDuration(Number(row[k as keyof typeof row]) * 60)}</td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </Card>
  );
}

export default WeeklyStackedBar;
