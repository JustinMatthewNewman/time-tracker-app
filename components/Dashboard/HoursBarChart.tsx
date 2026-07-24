import { Card } from "@heroui/react";
import { formatDuration } from "@/lib/timeTotals";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";

export interface HoursBarDatum {
  label: string;
  totalMinutes: number;
}

interface HoursBarChartProps {
  title: string;
  data: HoursBarDatum[];
  emptyMessage?: string;
  // Ranking views (hours by ticket/work log) want largest-first; chronological
  // views (hours by month) need to keep the caller's own order instead.
  sortByValue?: boolean;
}

export function HoursBarChart({ title, data, emptyMessage = "No data yet.", sortByValue = true }: HoursBarChartProps) {
  const { tooltip, showAt, hide } = useChartTooltip<HoursBarDatum>();
  const ordered = sortByValue ? [...data].sort((a, b) => b.totalMinutes - a.totalMinutes) : data;
  const max = Math.max(0, ...ordered.map((d) => d.totalMinutes));

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {ordered.length === 0 ? (
        <p className="text-sm text-foreground/60">{emptyMessage}</p>
      ) : (
        <div className="relative flex flex-col gap-2">
          {ordered.map((d) => {
            const widthPct = max > 0 ? (d.totalMinutes / max) * 100 : 0;
            return (
              <div
                key={d.label}
                className="group flex items-center gap-3"
                title={`${d.label}: ${formatDuration(d.totalMinutes)}`}
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
                  {formatDuration(d.totalMinutes)}
                </span>
              </div>
            );
          })}

          {tooltip && (
            <ChartTooltip x={tooltip.x} y={tooltip.y}>
              <div className="font-medium text-foreground">{tooltip.data.label}</div>
              <div className="text-foreground/60">{formatDuration(tooltip.data.totalMinutes)}</div>
            </ChartTooltip>
          )}
        </div>
      )}
    </Card>
  );
}

export default HoursBarChart;
