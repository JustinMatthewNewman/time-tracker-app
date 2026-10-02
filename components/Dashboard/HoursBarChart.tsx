import { Card, Skeleton } from "@heroui/react";
import { formatDuration, ticketLabelWithTitle } from "@/lib/timeTotals";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";
import { TicketTitleSuffix } from "./TicketTitleSuffix";

export interface HoursBarDatum {
  label: string;
  // Optional — only ticket-labeled callers (TicketsReport) have a title to
  // offer; the work-log-labeled caller (WorkLogsReport) leaves it undefined.
  title?: string | null;
  /**
   * The magnitude this bar encodes. Minutes for the hours-by-X callers (the
   * default `formatValue` is formatDuration), but deliberately NOT named
   * `totalMinutes`: the tickets-by-office caller passes a ticket *count*, and
   * a field called minutes holding "8 tickets" is a trap for the next reader.
   */
  value: number;
  /** Optional second tooltip line, e.g. "12h 30m · 8 entries". */
  detail?: string | null;
}

interface HoursBarChartProps {
  title: string;
  data: HoursBarDatum[];
  emptyMessage?: string;
  // Ranking views (hours by ticket/work log) want largest-first; chronological
  // views (hours by month) need to keep the caller's own order instead.
  sortByValue?: boolean;
  /** Defaults to duration formatting; counts pass their own. */
  formatValue?: (value: number) => string;
  loading?: boolean;
}

export function HoursBarChart({
  title,
  data,
  emptyMessage = "No data yet.",
  sortByValue = true,
  formatValue = formatDuration,
  loading,
}: HoursBarChartProps) {
  const { tooltip, showAt, hide } = useChartTooltip<HoursBarDatum>();
  const ordered = sortByValue ? [...data].sort((a, b) => b.value - a.value) : data;
  const max = Math.max(0, ...ordered.map((d) => d.value));

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[100, 80, 60, 40].map((widthPct, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-32 shrink-0 rounded" />
              <Skeleton className="h-4 flex-1 rounded-r-[4px]" style={{ maxWidth: `${widthPct}%` }} />
              <Skeleton className="h-4 w-16 shrink-0 rounded" />
            </div>
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <p className="text-sm text-foreground/60">{emptyMessage}</p>
      ) : (
        <div className="relative flex flex-col gap-2">
          {ordered.map((d) => {
            const widthPct = max > 0 ? (d.value / max) * 100 : 0;
            return (
              <div
                key={d.label}
                className="group flex items-center gap-3"
                title={`${ticketLabelWithTitle(d.label, d.title)}: ${formatValue(d.value)}`}
                onPointerEnter={(e) => showAt(e, d)}
                onPointerLeave={hide}
              >
                <span className="w-32 shrink-0 truncate text-sm text-foreground/70">
                  {d.label}
                </span>
                <div className="flex-1">
                  <div
                    className="h-4 rounded-r-[4px] transition-[filter] group-hover:brightness-110"
                    style={{ width: `${widthPct}%`, backgroundColor: "var(--accent)" }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-medium text-foreground tabular-nums">
                  {formatValue(d.value)}
                </span>
              </div>
            );
          })}

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
    </Card>
  );
}

export default HoursBarChart;
