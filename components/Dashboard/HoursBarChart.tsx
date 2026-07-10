import { Card } from "@heroui/react";
import { formatDuration } from "@/lib/timeTotals";

export interface HoursBarDatum {
  label: string;
  totalMinutes: number;
}

interface HoursBarChartProps {
  title: string;
  data: HoursBarDatum[];
  emptyMessage?: string;
}

export function HoursBarChart({ title, data, emptyMessage = "No data yet." }: HoursBarChartProps) {
  const sorted = [...data].sort((a, b) => b.totalMinutes - a.totalMinutes);
  const max = sorted.length > 0 ? sorted[0].totalMinutes : 0;

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-foreground/60">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((d) => {
            const widthPct = max > 0 ? (d.totalMinutes / max) * 100 : 0;
            return (
              <div
                key={d.label}
                className="group flex items-center gap-3"
                title={`${d.label}: ${formatDuration(d.totalMinutes)}`}
              >
                <span className="w-32 shrink-0 truncate text-sm text-foreground/70">
                  {d.label}
                </span>
                <div className="flex-1">
                  <div
                    className="h-4 rounded-r-[4px] bg-blue-600 transition-[filter] group-hover:brightness-110 dark:bg-blue-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-medium text-foreground tabular-nums">
                  {formatDuration(d.totalMinutes)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default HoursBarChart;
