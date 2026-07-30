"use client";

import { useMemo } from "react";
import { Card } from "@heroui/react";
import { scaleLinear } from "d3-scale";
import { area as d3area, curveBasis } from "d3-shape";
import { deviation } from "d3-array";
import type { MyTimeEntry } from "@/hooks/useMyTimeEntries";
import { groupByTicket } from "@/lib/timeTotals";
import { kde, kernelEpanechnikov } from "@/lib/kde";
import { CATEGORICAL_HUE_COUNT, getSeriesColor } from "./chartColor";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";

const WIDTH = 480;
const ROW_HEIGHT = 34;
const RIDGE_OVERLAP = 1.7; // ridge peak can rise into the row above — the deliberate joyplot look
const MARGIN = { top: 10, right: 16, bottom: 24, left: 84 };
const THRESHOLD_COUNT = 96;
const MIN_BANDWIDTH = 0.4;
const MAX_BANDWIDTH = 2.5;

interface Ridge {
  ticket: string;
  hours: number[];
  curve: [number, number][];
  peak: number;
}

function hourOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

interface TicketActivityRidgelineProps {
  entries: MyTimeEntry[];
  loading: boolean;
}

// Time-of-day activity density per ticket — top CATEGORICAL_HUE_COUNT
// tickets by total minutes, all-time. Ridges are the identity mechanism via
// direct row labels (not a legend), each filled with a per-ticket hue at low
// opacity since ridges deliberately overlap (the joyplot idiom) rather than
// needing the "2px gap" spacing that applies to adjacent/stacked marks.
//
// entries/loading come from AnalyticsDashboard's single useMyTimeEntries()
// call — see TicketDurationBoxPlot's comment for why every widget can't
// just fetch its own copy of this all-time dataset.
export function TicketActivityRidgeline({ entries, loading }: TicketActivityRidgelineProps) {
  const { tooltip, showAt, hide } = useChartTooltip<{ ticket: string; hour: number; density: number }>();

  const { ridges, domain } = useMemo(() => {
    const topTickets = groupByTicket(entries).slice(0, CATEGORICAL_HUE_COUNT);
    const byTicket = new Map<string, number[]>();
    for (const t of topTickets) byTicket.set(t.ticket, []);

    for (const entry of entries) {
      const ticketLabel = entry.ticket ? String(entry.ticket.ticketNumber) : "(No ticket)";
      const bucket = byTicket.get(ticketLabel);
      if (!bucket) continue;
      bucket.push(hourOfDay(entry.startTime));
    }

    const allHours = Array.from(byTicket.values()).flat();
    if (allHours.length === 0) return { ridges: [] as Ridge[], domain: [6, 20] as [number, number] };

    const lo = Math.max(0, Math.floor(Math.min(...allHours)) - 1);
    const hi = Math.min(24, Math.ceil(Math.max(...allHours)) + 1);
    const thresholds = Array.from({ length: THRESHOLD_COUNT }, (_, i) => lo + (i / (THRESHOLD_COUNT - 1)) * (hi - lo));

    const built: Ridge[] = topTickets
      .map((t) => {
        const hours = byTicket.get(t.ticket) ?? [];
        if (hours.length < 2) return null;
        const sd = deviation(hours) ?? 1;
        const bandwidth = Math.min(MAX_BANDWIDTH, Math.max(MIN_BANDWIDTH, 1.06 * sd * Math.pow(hours.length, -1 / 5)));
        const curve = kde(kernelEpanechnikov(bandwidth), thresholds, hours);
        const peak = Math.max(...curve.map(([, v]) => v), 1e-6);
        return { ticket: t.ticket, hours, curve, peak };
      })
      .filter((r): r is Ridge => r !== null);

    return { ridges: built, domain: [lo, hi] as [number, number] };
  }, [entries]);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = ridges.length * ROW_HEIGHT;
  const x = useMemo(() => scaleLinear().domain(domain).range([0, innerWidth]), [domain, innerWidth]);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Daily activity profile by ticket</h2>
      </div>

      {ridges.length === 0 && !loading ? (
        <p className="py-10 text-center text-sm text-foreground/60">Not enough entries per ticket yet.</p>
      ) : (
        <div className="relative w-full">
          <svg viewBox={`0 0 ${WIDTH} ${MARGIN.top + innerHeight + MARGIN.bottom}`} className="w-full h-auto">
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {/* Draw bottom-most ridge first so higher rows overlap on top, matching the joyplot's layered look. */}
              {[...ridges].reverse().map((ridge, revIndex) => {
                const rowIndex = ridges.length - 1 - revIndex;
                const baseline = (rowIndex + 1) * ROW_HEIGHT - ROW_HEIGHT * 0.25;
                const rowMaxRise = ROW_HEIGHT * RIDGE_OVERLAP;
                const yScale = scaleLinear().domain([0, ridge.peak]).range([0, rowMaxRise]);
                const style = getSeriesColor(rowIndex);

                const points = ridge.curve.map(([hourVal, density]) => [x(hourVal), baseline - yScale(density)] as [number, number]);
                const path =
                  d3area<[number, number]>()
                    .x((p) => p[0])
                    .y0(baseline)
                    .y1((p) => p[1])
                    .curve(curveBasis)(points) ?? "";

                return (
                  <g key={ridge.ticket}>
                    <path d={path} fill={style.color} style={style.filter ? { filter: style.filter } : undefined} opacity={0.45} stroke={style.color} strokeWidth={1.5} strokeOpacity={0.9} />
                    <text x={-8} y={baseline} dy={-2} textAnchor="end" fontSize={10} className="fill-foreground/70">
                      {ridge.ticket}
                    </text>
                    <rect
                      x={0}
                      y={baseline - rowMaxRise}
                      width={innerWidth}
                      height={rowMaxRise + 4}
                      fill="transparent"
                      onPointerMove={(e) => {
                        // Fraction-based rather than x.invert(offsetX) — offsetX is in
                        // rendered CSS pixels, but the scale is defined in SVG viewBox
                        // units, and the two differ once "w-full h-auto" rescales the
                        // SVG to its container's actual width.
                        const rect = e.currentTarget.getBoundingClientRect();
                        const fraction = (e.clientX - rect.left) / rect.width;
                        const hourVal = domain[0] + fraction * (domain[1] - domain[0]);
                        const nearest = ridge.curve.reduce((a, b) => (Math.abs(b[0] - hourVal) < Math.abs(a[0] - hourVal) ? b : a));
                        showAt(e, { ticket: ridge.ticket, hour: nearest[0], density: nearest[1] });
                      }}
                      onPointerLeave={hide}
                    />
                  </g>
                );
              })}

              {x.ticks(Math.min(8, Math.round(domain[1] - domain[0]))).map((tick) => (
                <text key={tick} x={x(tick)} y={innerHeight + 16} textAnchor="middle" fontSize={10} className="fill-foreground/50">
                  {tick % 12 === 0 ? "12" : tick % 12}
                  {tick < 12 ? "am" : "pm"}
                </text>
              ))}
            </g>
          </svg>

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">Ticket {tooltip.data.ticket}</div>
              <div className="text-foreground/60">
                {Math.floor(tooltip.data.hour) % 12 === 0 ? 12 : Math.floor(tooltip.data.hour) % 12}
                {Math.floor(tooltip.data.hour) < 12 ? "am" : "pm"}
              </div>
            </ChartTooltip>
          )}
        </div>
      )}

      <table className="sr-only">
        <caption>Daily activity profile by ticket</caption>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Entry count</th>
          </tr>
        </thead>
        <tbody>
          {ridges.map((r) => (
            <tr key={r.ticket}>
              <td>{r.ticket}</td>
              <td>{r.hours.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default TicketActivityRidgeline;
