"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { WorkLogTimeEntry } from "@/hooks/useTimeEntriesByWorkLog";
import { groupByTicket, formatDuration, formatDecimalHours, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { getSeriesColor, NEUTRAL_SERIES_COLOR, type SeriesColor } from "@/components/Dashboard/chartColor";
import { ArrowUpRightFromSquare, Copy, CopyCheck } from "@gravity-ui/icons";
import { useBorders } from "@/context/BordersContext";
import { DonutChart } from "./DonutChart";
import { TicketBarChart } from "./TicketBarChart";

// "(No ticket)" always renders as the theme's neutral --muted token instead
// of taking a categorical rotation slot.
function sliceStyle(ticket: string, colorIndex: number): SeriesColor {
  if (ticket === UNASSIGNED_TICKET) return NEUTRAL_SERIES_COLOR;
  return getSeriesColor(colorIndex);
}

interface TicketBreakdownProps {
  hasSelection: boolean;
  entries: WorkLogTimeEntry[];
  loading?: boolean;
  error?: string | null;
}

// Renders as plain content rather than its own Card — it's shown nested
// inside WorkLogTimeEntryCardLayout's shared card, alongside the entries
// table view, behind the same sticky header.
export function TicketBreakdown({ hasSelection, entries, loading, error }: TicketBreakdownProps) {
  const { bordersEnabled } = useBorders();
  const totals = useMemo(() => groupByTicket(entries), [entries]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  if (!hasSelection) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground/60">Select a work log from the sidebar to view its ticket breakdown.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground/60">Loading ticket breakdown...</p>
      </div>
    );
  }

  if (totals.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground/60">No time entries for this work log.</p>
      </div>
    );
  }

  const grandTotalMinutes = totals.reduce((sum, t) => sum + t.totalMinutes, 0);

  const chartData = totals.map((t, i) => ({ label: t.ticket, value: t.totalMinutes, ...sliceStyle(t.ticket, i) }));
  const styleByTicket = new Map(chartData.map((d) => [d.label, { color: d.color, filter: d.filter }]));

  return (
    <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
      <div className="min-w-0 flex-[2] overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2 text-left">Ticket</th>
              <th className="w-24 border p-2 text-left">Entries</th>
              <th className="w-32 border p-2 text-left">Total Time</th>
              <th className="w-24 border p-2 text-left">Hours</th>
            </tr>
          </thead>

          <tbody>
            {totals.map((t) => {
              const hoursKey = `${t.ticket}-hours`;
              return (
                <tr key={t.ticket}>
                  <td className="border p-2">
                    {/* Every item in this row shares the same fixed h-5 box
                        (content centered inside via its own flex), rather
                        than relying on the row's items-center to line up
                        boxes of different intrinsic heights — a <button>'s
                        default sizing isn't as predictable as a plain
                        <span>/<a>'s, which was throwing off the row's
                        vertical alignment. */}
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: styleByTicket.get(t.ticket)?.color,
                          filter: styleByTicket.get(t.ticket)?.filter,
                        }}
                        aria-hidden
                      />
                      <span className="flex h-5 min-w-0 items-center">
                        {t.ticket !== UNASSIGNED_TICKET ? (
                          <Link href={`/ticket/${t.ticket}`} className="text-primary underline">
                            {t.ticket}
                          </Link>
                        ) : (
                          t.ticket
                        )}
                      </span>
                      {t.ticketLink && (
                        <a
                          href={t.ticketLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open external link for ticket ${t.ticket}`}
                          className="flex size-5 shrink-0 items-center justify-center text-foreground/40 hover:text-foreground"
                        >
                          <ArrowUpRightFromSquare className="size-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        aria-label={`Copy ticket ${t.ticket}`}
                        onClick={() => handleCopy(t.ticket, t.ticket)}
                        className="flex size-5 shrink-0 items-center justify-center rounded text-foreground/50 hover:bg-default hover:text-foreground"
                      >
                        {copiedKey === t.ticket ? (
                          <CopyCheck className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </span>
                  </td>
                  <td className="border p-2">{t.entryCount}</td>
                  <td className="border p-2">{formatDuration(t.totalMinutes)}</td>
                  <td className="border p-2">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex h-5 items-center">{formatDecimalHours(t.totalMinutes)}</span>
                      <button
                        type="button"
                        aria-label={`Copy hours for ticket ${t.ticket}`}
                        onClick={() => handleCopy(hoursKey, formatDecimalHours(t.totalMinutes))}
                        className="flex size-5 shrink-0 items-center justify-center rounded text-foreground/50 hover:bg-default hover:text-foreground"
                      >
                        {copiedKey === hoursKey ? (
                          <CopyCheck className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="font-semibold">
              <td className="border p-2">Total</td>
              <td className="border p-2">{entries.length}</td>
              <td className="border p-2">{formatDuration(grandTotalMinutes)}</td>
              <td className="border p-2">{formatDecimalHours(grandTotalMinutes)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div
        className={`flex flex-1 flex-col items-center gap-4 rounded-lg p-4 md:max-w-[33%] ${
          bordersEnabled ? "border border-default-200" : ""
        }`}
      >
        <DonutChart
          data={chartData}
          centerLabel={formatDuration(grandTotalMinutes)}
          centerSubLabel="total"
        />
        <div className="w-full space-y-1.5 text-xs">
          {chartData.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color, filter: d.filter }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-foreground/80">
                {d.label !== UNASSIGNED_TICKET ? (
                  <Link href={`/ticket/${d.label}`} className="hover:underline">
                    {d.label}
                  </Link>
                ) : (
                  d.label
                )}
              </span>
              <span className="text-foreground/50">
                {grandTotalMinutes > 0 ? Math.round((d.value / grandTotalMinutes) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>

        <div className="w-full border-t border-default-200 pt-4">
          <TicketBarChart
            data={totals.map((t) => ({
              label: t.ticket,
              entryCount: t.entryCount,
              totalMinutes: t.totalMinutes,
              ...styleByTicket.get(t.ticket)!,
            }))}
            formatDuration={formatDuration}
          />
        </div>
      </div>
    </div>
  );
}

export default TicketBreakdown;
