"use client";

import { useMemo } from "react";
import { Card } from "@heroui/react";
import { scaleBand, scaleLinear } from "d3-scale";
import { quantileSorted } from "d3-array";
import type { MyTimeEntry } from "@/hooks/useMyTimeEntries";
import { groupByTicket, minutesBetween, formatDuration } from "@/lib/timeTotals";
import { CATEGORICAL_HUE_COUNT } from "./chartColor";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";

const WIDTH = 480;
const HEIGHT = 240;
const MARGIN = { top: 8, right: 8, bottom: 24, left: 32 };
const BOX_WIDTH_RATIO = 0.5;

interface BoxStat {
  ticket: string;
  q1: number;
  median: number;
  q3: number;
  whiskerLow: number;
  whiskerHigh: number;
  outliers: number[];
}

function computeBoxStat(ticket: string, hoursSorted: number[]): BoxStat {
  const q1 = quantileSorted(hoursSorted, 0.25) ?? 0;
  const median = quantileSorted(hoursSorted, 0.5) ?? 0;
  const q3 = quantileSorted(hoursSorted, 0.75) ?? 0;
  const iqr = q3 - q1;
  const lowFence = q1 - 1.5 * iqr;
  const highFence = q3 + 1.5 * iqr;

  const within = hoursSorted.filter((v) => v >= lowFence && v <= highFence);
  const outliers = hoursSorted.filter((v) => v < lowFence || v > highFence);

  return {
    ticket,
    q1,
    median,
    q3,
    whiskerLow: within.length ? within[0] : q1,
    whiskerHigh: within.length ? within[within.length - 1] : q3,
    outliers,
  };
}

interface TicketDurationBoxPlotProps {
  entries: MyTimeEntry[];
  loading: boolean;
}

// Box-and-whisker per ticket — top CATEGORICAL_HUE_COUNT tickets by total
// minutes, all-time. Single accent hue for every box (like HoursBarChart's
// ranked bars): each box already has a positional x-axis label, so no
// per-ticket categorical color is needed for identity here.
//
// entries/loading are passed down from AnalyticsDashboard's single
// useMyTimeEntries() call rather than fetched here — this all-time dataset
// is ~9,900 rows across ~20 paginated round-trips, and every dashboard
// widget independently re-fetching the same rows was straining the local
// Data Connect emulator's known concurrency fragility (see AGENTS.md).
export function TicketDurationBoxPlot({ entries, loading }: TicketDurationBoxPlotProps) {
  const { tooltip, showAt, hide } = useChartTooltip<BoxStat>();

  const boxes = useMemo(() => {
    const topTickets = groupByTicket(entries).slice(0, CATEGORICAL_HUE_COUNT);
    const byTicket = new Map<string, number[]>();
    for (const t of topTickets) byTicket.set(t.ticket, []);

    for (const entry of entries) {
      const ticketLabel = entry.ticket ? String(entry.ticket.ticketNumber) : "(No ticket)";
      const bucket = byTicket.get(ticketLabel);
      if (!bucket) continue;
      bucket.push(minutesBetween(entry.startTime, entry.endTime) / 60);
    }

    return Array.from(byTicket.entries())
      .filter(([, hours]) => hours.length >= 2)
      .map(([ticket, hours]) => computeBoxStat(ticket, [...hours].sort((a, b) => a - b)));
  }, [entries]);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const x = useMemo(
    () => scaleBand<string>().domain(boxes.map((b) => b.ticket)).range([0, innerWidth]).padding(0.4),
    [boxes, innerWidth]
  );
  const maxHours = Math.max(1, ...boxes.flatMap((b) => [b.whiskerHigh, ...b.outliers]));
  const y = useMemo(() => scaleLinear().domain([0, maxHours]).range([innerHeight, 0]).nice(), [maxHours, innerHeight]);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Task duration distribution</h2>
      </div>

      {boxes.length === 0 && !loading ? (
        <p className="py-10 text-center text-sm text-foreground/60">Not enough entries per ticket yet.</p>
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

              {boxes.map((box) => {
                const bandwidth = x.bandwidth();
                const boxWidth = bandwidth * BOX_WIDTH_RATIO;
                const center = (x(box.ticket) ?? 0) + bandwidth / 2;
                return (
                  <g
                    key={box.ticket}
                    onPointerEnter={(e) => showAt(e, box)}
                    onPointerLeave={hide}
                  >
                    {/* Invisible wide hit target, per the interaction spec */}
                    <rect x={x(box.ticket) ?? 0} y={0} width={bandwidth} height={innerHeight} fill="transparent" />

                    <line x1={center} x2={center} y1={y(box.whiskerLow)} y2={y(box.q1)} stroke="var(--accent)" strokeWidth={1.5} />
                    <line x1={center} x2={center} y1={y(box.q3)} y2={y(box.whiskerHigh)} stroke="var(--accent)" strokeWidth={1.5} />

                    <rect
                      x={center - boxWidth / 2}
                      y={y(box.q3)}
                      width={boxWidth}
                      height={Math.max(1, y(box.q1) - y(box.q3))}
                      rx={3}
                      fill="var(--accent)"
                      opacity={0.25}
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                    />
                    <line x1={center - boxWidth / 2} x2={center + boxWidth / 2} y1={y(box.median)} y2={y(box.median)} stroke="var(--accent)" strokeWidth={2} />

                    {box.outliers.map((o, i) => (
                      <circle key={i} cx={center} cy={y(o)} r={2.5} fill="var(--surface)" stroke="var(--accent)" strokeWidth={1.5} />
                    ))}

                    <text x={center} y={innerHeight + 16} textAnchor="middle" fontSize={10} className="fill-foreground/50">
                      {box.ticket}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">Ticket {tooltip.data.ticket}</div>
              <div className="text-foreground/60">
                Median {formatDuration(tooltip.data.median * 60)} · Q1–Q3 {formatDuration(tooltip.data.q1 * 60)}–{formatDuration(tooltip.data.q3 * 60)}
              </div>
              {tooltip.data.outliers.length > 0 && (
                <div className="text-foreground/60">{tooltip.data.outliers.length} outlier{tooltip.data.outliers.length === 1 ? "" : "s"}</div>
              )}
            </ChartTooltip>
          )}
        </div>
      )}

      <table className="sr-only">
        <caption>Task duration distribution by ticket</caption>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Q1</th>
            <th>Median</th>
            <th>Q3</th>
            <th>Outliers</th>
          </tr>
        </thead>
        <tbody>
          {boxes.map((box) => (
            <tr key={box.ticket}>
              <td>{box.ticket}</td>
              <td>{formatDuration(box.q1 * 60)}</td>
              <td>{formatDuration(box.median * 60)}</td>
              <td>{formatDuration(box.q3 * 60)}</td>
              <td>{box.outliers.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default TicketDurationBoxPlot;
