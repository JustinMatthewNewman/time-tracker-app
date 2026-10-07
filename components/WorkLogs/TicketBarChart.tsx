"use client";

import { ChartTooltip, useChartTooltip } from "@/components/Dashboard/ChartTooltip";
import { TicketTitleSuffix } from "@/components/Dashboard/TicketTitleSuffix";
import { ticketLabelWithTitle } from "@/lib/timeTotals";

export interface TicketBarChartRow {
  label: string;
  // Optional — only ticket-labeled callers (TicketBreakdownWeekly) have a
  // title to offer; a plain work-log-labeled row leaves this undefined.
  title?: string | null;
  entryCount: number;
  totalMinutes: number;
  color: string;
  filter?: string;
}

interface TicketBarChartProps {
  data: TicketBarChartRow[];
  formatDuration: (minutes: number) => string;
  /**
   * Drops the entry-count bar and leaves only total time (see the Entry counts
   * setting in context/EntryCountsContext). The count still rides along in the
   * tooltip — hiding the bar is about what takes up room in the chart, not
   * about withholding the number.
   */
  showEntryCounts?: boolean;
}

// Horizontal grouped bar chart: one row-group per ticket (stacked
// top-to-bottom rather than side-scrolling), each with two bars — entry
// count and total time — growing rightward from a shared label. Each metric
// is scaled against its own max since counts and minutes aren't comparable.
export function TicketBarChart({ data, formatDuration, showEntryCounts = true }: TicketBarChartProps) {
  const { tooltip, showAt, hide } = useChartTooltip<TicketBarChartRow>();
  const maxEntries = Math.max(1, ...data.map((d) => d.entryCount));
  const maxMinutes = Math.max(1, ...data.map((d) => d.totalMinutes));

  return (
    <div className="relative w-full">
      {showEntryCounts && (
        <div className="mb-3 flex items-center justify-center gap-4 text-[11px] text-foreground/50">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-foreground/70" /> Entries
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-foreground/70 opacity-40" /> Total time
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data.map((row) => {
          const entriesPct = (row.entryCount / maxEntries) * 100;
          const minutesPct = (row.totalMinutes / maxMinutes) * 100;

          return (
            <div
              key={row.label}
              // The label column is sized in `ch` rather than rem so it fits a
              // ticket number exactly; the value column is fixed so every bar
              // in the chart shares one baseline and one end point, which is
              // what makes the lengths comparable at a glance.
              className="grid grid-cols-[10ch_1fr_5rem] items-center gap-x-3 gap-y-1"
              onPointerEnter={(e) => showAt(e, row)}
              onPointerLeave={hide}
            >
              <span
                className={`truncate text-right text-xs font-medium text-foreground ${
                  showEntryCounts ? "row-span-2" : ""
                }`}
                title={ticketLabelWithTitle(row.label, row.title)}
              >
                {row.label}
              </span>

              {showEntryCounts && (
                <>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-default-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${entriesPct}%`, backgroundColor: row.color, filter: row.filter }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-foreground/60">{row.entryCount}</span>
                </>
              )}

              <div className="h-2 w-full overflow-hidden rounded-full bg-default-100">
                <div
                  className={`h-full rounded-full ${showEntryCounts ? "opacity-40" : ""}`}
                  style={{ width: `${minutesPct}%`, backgroundColor: row.color, filter: row.filter }}
                />
              </div>
              <span className="text-xs tabular-nums text-foreground/60">{formatDuration(row.totalMinutes)}</span>
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
          <div className="text-foreground/60">
            {tooltip.data.entryCount} entries · {formatDuration(tooltip.data.totalMinutes)}
          </div>
        </ChartTooltip>
      )}
    </div>
  );
}

export default TicketBarChart;
