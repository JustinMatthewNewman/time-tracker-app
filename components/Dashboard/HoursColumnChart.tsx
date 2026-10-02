"use client";

import Link from "next/link";
import { Card, Skeleton } from "@heroui/react";
import { formatDuration, ticketLabelWithTitle, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";
import { TicketTitleSuffix } from "./TicketTitleSuffix";
import type { HoursBarDatum } from "./HoursBarChart";

export interface HoursColumnDatum extends HoursBarDatum {
  /** When set, the axis label links to that ticket's page. */
  ticketNumber?: string | null;
}

interface HoursColumnChartProps {
  title: string;
  data: HoursColumnDatum[];
  emptyMessage?: string;
  formatValue?: (value: number) => string;
  loading?: boolean;
}

const COLUMN_COUNT_FOR_SKELETON = 8;

/**
 * Vertical sibling to HoursBarChart.
 *
 * A note on form, since it's a real trade-off: for *ranked* magnitude,
 * horizontal bars are the stronger choice — the label sits inline and can be
 * as long as it likes. Columns are used here because ticket numbers are short
 * enough to sit under a column without rotating, and the vertical form reads
 * as a distinct "this week" snapshot next to the all-time horizontal ranking
 * on the Tickets report. Callers must cap how many columns they pass; there's
 * no room to crowd.
 */
export function HoursColumnChart({
  title,
  data,
  emptyMessage = "No data yet.",
  formatValue = formatDuration,
  loading,
}: HoursColumnChartProps) {
  const { tooltip, showAt, hide } = useChartTooltip<HoursColumnDatum>();
  const ordered = [...data].sort((a, b) => b.value - a.value);
  const max = Math.max(0, ...ordered.map((d) => d.value));

  return (
    <Card className="p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>

      {loading ? (
        <div className="flex h-56 items-end gap-2">
          {Array.from({ length: COLUMN_COUNT_FOR_SKELETON }, (_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-[4px]"
              style={{ height: `${30 + ((i * 37) % 60)}%` }}
            />
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <p className="text-sm text-foreground/60">{emptyMessage}</p>
      ) : (
        /* Scrolls inside its own container rather than letting the page body
           scroll sideways. */
        <div className="relative overflow-x-auto">
          <div className="flex min-w-[20rem] items-end gap-2" style={{ height: "14rem" }}>
            {ordered.map((d) => {
              const heightPct = max > 0 ? (d.value / max) * 100 : 0;
              return (
                <div
                  key={d.label}
                  className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                  title={`${ticketLabelWithTitle(d.label, d.title)}: ${formatValue(d.value)}`}
                  onPointerEnter={(e) => showAt(e, d)}
                  onPointerLeave={hide}
                >
                  {/* Value label above the column — direct-labelled because a
                      weekly snapshot is short enough that every column can
                      carry its number without crowding.

                      Fixed height, not auto: a label that wraps to two lines
                      ("5h 30m" in a narrow column) would eat into that
                      column's bar area and shrink its bar relative to
                      single-line neighbours, quietly breaking the magnitude
                      encoding. Reserving the space keeps every column on the
                      same scale. */}
                  <span className="flex h-7 shrink-0 items-end justify-center text-center text-[10px] leading-tight text-foreground/50 tabular-nums">
                    {formatValue(d.value)}
                  </span>

                  {/* The column itself: a flex spacer above keeps it anchored
                      to the baseline, so height is a true magnitude encoding
                      rather than a centred block. */}
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-[4px] bg-accent transition-[filter] group-hover:brightness-110"
                      style={{ height: `${Math.max(heightPct, 1)}%` }}
                      aria-hidden
                    />
                  </div>

                  <span className="w-full shrink-0 truncate text-center text-[11px] text-foreground/70">
                    {d.ticketNumber && d.label !== UNASSIGNED_TICKET ? (
                      <Link href={`/ticket/${d.ticketNumber}`} className="hover:text-foreground hover:underline">
                        {d.label}
                      </Link>
                    ) : (
                      d.label
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">
                {tooltip.data.label}
                <TicketTitleSuffix title={tooltip.data.title} />
              </div>
              <div className="text-foreground/60">{formatValue(tooltip.data.value)}</div>
              {tooltip.data.detail && <div className="text-foreground/50">{tooltip.data.detail}</div>}
            </ChartTooltip>
          )}
        </div>
      )}

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Label</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((d) => (
            <tr key={d.label}>
              <td>{ticketLabelWithTitle(d.label, d.title)}</td>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default HoursColumnChart;
