"use client";

import { useMemo } from "react";
import { Card } from "@heroui/react";
import { scaleLinear } from "d3-scale";
import type { MyTimeEntry } from "@/hooks/useMyTimeEntries";
import { useTickets } from "@/context/TicketsContext";
import { groupByTicket } from "@/lib/timeTotals";
import { CATEGORICAL_HUE_COUNT, getSeriesColor } from "./chartColor";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";

const WIDTH = 420;
const HEIGHT = 260;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 32 };

interface ScatterPoint {
  ticket: string;
  predicted: number;
  actual: number;
}

interface PredictedActualScatterProps {
  entries: MyTimeEntry[];
  loading: boolean;
}

// entries/loading come from AnalyticsDashboard's single useMyTimeEntries()
// call — see TicketDurationBoxPlot's comment for why every widget can't
// just fetch its own copy of this all-time dataset. Tickets (and their
// estimatedHours) come from the app-wide TicketsProvider — a much smaller,
// already-shared dataset, so calling useTickets() here directly doesn't
// repeat the redundant-fetch mistake fixed for useMyTimeEntries().
export function PredictedActualScatter({ entries, loading }: PredictedActualScatterProps) {
  const { tickets, loading: ticketsLoading } = useTickets();
  const { tooltip, showAt, hide } = useChartTooltip<ScatterPoint>();
  const stillLoading = loading || ticketsLoading;

  const points = useMemo<ScatterPoint[]>(() => {
    const actualHoursByTicket = new Map(groupByTicket(entries).map((t) => [t.ticket, t.totalMinutes / 60]));
    return tickets
      .filter((t): t is typeof t & { estimatedHours: number } => t.estimatedHours != null)
      .map((t) => ({
        ticket: String(t.ticketNumber),
        predicted: t.estimatedHours,
        actual: actualHoursByTicket.get(String(t.ticketNumber)) ?? 0,
      }))
      .sort((a, b) => b.predicted - a.predicted)
      .slice(0, CATEGORICAL_HUE_COUNT);
  }, [tickets, entries]);

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxValue = Math.max(1, ...points.flatMap((p) => [p.predicted, p.actual]));

  const x = useMemo(() => scaleLinear().domain([0, maxValue]).range([0, innerWidth]).nice(), [maxValue, innerWidth]);
  const y = useMemo(() => scaleLinear().domain([0, maxValue]).range([innerHeight, 0]).nice(), [maxValue, innerHeight]);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Predicted vs. actual time</h2>
      </div>

      {points.length === 0 && !stillLoading ? (
        <p className="py-10 text-center text-sm text-foreground/60">
          Set an estimated hours value on a ticket to see it plotted here.
        </p>
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
              {x.ticks(4).map((tick) => (
                <text key={tick} x={x(tick)} y={innerHeight + 16} textAnchor="middle" fontSize={10} className="fill-foreground/50">
                  {tick}h
                </text>
              ))}

              {/* predicted === actual reference line */}
              <line x1={x(0)} y1={y(0)} x2={x(maxValue)} y2={y(maxValue)} stroke="var(--foreground)" strokeOpacity={0.25} strokeWidth={1} strokeDasharray="4 4" />

              {points.map((p, i) => {
                const style = getSeriesColor(i);
                return (
                  <circle
                    key={p.ticket}
                    cx={x(p.predicted)}
                    cy={y(p.actual)}
                    r={6}
                    fill={style.color}
                    style={style.filter ? { filter: style.filter } : undefined}
                    stroke="var(--surface)"
                    strokeWidth={1.5}
                    onPointerEnter={(e) => showAt(e, p)}
                    onPointerLeave={hide}
                  />
                );
              })}
            </g>
          </svg>

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">Ticket {tooltip.data.ticket}</div>
              <div className="text-foreground/60">Predicted {tooltip.data.predicted}h · Actual {tooltip.data.actual}h</div>
            </ChartTooltip>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-foreground/60">
            {points.map((p, i) => {
              const style = getSeriesColor(i);
              return (
                <span key={p.ticket} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: style.color, filter: style.filter }} />
                  {p.ticket}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <table className="sr-only">
        <caption>Predicted vs. actual time by ticket</caption>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Predicted hours</th>
            <th>Actual hours</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.ticket}>
              <td>{p.ticket}</td>
              <td>{p.predicted}</td>
              <td>{p.actual}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default PredictedActualScatter;
