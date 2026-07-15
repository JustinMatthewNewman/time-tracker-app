"use client";

export interface TicketBarChartRow {
  label: string;
  entryCount: number;
  totalMinutes: number;
  color: string;
  filter?: string;
}

interface TicketBarChartProps {
  data: TicketBarChartRow[];
  formatDuration: (minutes: number) => string;
}

// Horizontal grouped bar chart: one row-group per ticket (stacked
// top-to-bottom rather than side-scrolling), each with two bars — entry
// count and total time — growing rightward from a shared label. Each metric
// is scaled against its own max since counts and minutes aren't comparable.
export function TicketBarChart({ data, formatDuration }: TicketBarChartProps) {
  const maxEntries = Math.max(1, ...data.map((d) => d.entryCount));
  const maxMinutes = Math.max(1, ...data.map((d) => d.totalMinutes));

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-center gap-4 text-[11px] text-foreground/50">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-foreground/70" /> Entries
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-foreground/70 opacity-40" /> Total time
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((row) => {
          const entriesPct = (row.entryCount / maxEntries) * 100;
          const minutesPct = (row.totalMinutes / maxMinutes) * 100;

          return (
            <div key={row.label} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-x-2 gap-y-1">
              <span
                className="row-span-2 truncate text-right text-xs font-medium text-foreground"
                title={row.label}
              >
                {row.label}
              </span>

              <div className="h-2 w-full overflow-hidden rounded-full bg-default-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${entriesPct}%`, backgroundColor: row.color, filter: row.filter }}
                />
              </div>
              <span className="text-xs tabular-nums text-foreground/60">{row.entryCount}</span>

              <div className="h-2 w-full overflow-hidden rounded-full bg-default-100">
                <div
                  className="h-full rounded-full opacity-40"
                  style={{ width: `${minutesPct}%`, backgroundColor: row.color, filter: row.filter }}
                />
              </div>
              <span className="text-xs tabular-nums text-foreground/60">{formatDuration(row.totalMinutes)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TicketBarChart;
