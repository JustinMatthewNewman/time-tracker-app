"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@heroui/react";
import { groupByTicket, formatDuration, formatDecimalHours, buildTicketTitleMap, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { useTicketColors } from "@/hooks/useTicketColors";
import { getSeriesColor, NEUTRAL_SERIES_COLOR, type SeriesColor } from "@/components/Dashboard/chartColor";
import { TicketTitleSuffix } from "@/components/Dashboard/TicketTitleSuffix";
import { ArrowUpRightFromSquare, Copy, CopyCheck } from "@gravity-ui/icons";
import { useBorders } from "@/context/BordersContext";
import { useTickets } from "@/context/TicketsContext";
import { DonutChart } from "./DonutChart";
import { TicketBarChart } from "./TicketBarChart";

// Precedence: a ticket's own assigned color wins, then the neutral token for
// "(No ticket)", then the theme-aware categorical rotation.
//
// The rotation stays the fallback rather than being replaced outright, so a
// ticket nobody has colored looks exactly as it did before and still re-tints
// with the active ColorScheme — the property chartColor.ts exists to protect.
// An assigned color is a deliberate override of that, and only affects the
// tickets someone actually chose a color for.
function sliceStyle(ticket: string, colorIndex: number, assigned?: string): SeriesColor {
  if (assigned) return { color: assigned };
  if (ticket === UNASSIGNED_TICKET) return NEUTRAL_SERIES_COLOR;
  return getSeriesColor(colorIndex);
}

// Minimal shape groupByTicket actually needs — kept structural (rather than
// importing WorkLogTimeEntry) so callers with a differently-shaped entry
// (e.g. useMyTimeEntries' MyTimeEntry, for the all-tickets page) can pass
// their entries straight through without an adapter.
export interface TicketBreakdownEntry {
  ticket?: { ticketNumber: number; ticketLink?: string | null } | null;
  startTime: string;
  endTime: string;
}

interface TicketBreakdownProps {
  hasSelection: boolean;
  entries: TicketBreakdownEntry[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

// Renders as plain content rather than its own Card — it's shown nested
// inside WorkLogTimeEntryCardLayout's shared card, alongside the entries
// table view, behind the same sticky header.
export function TicketBreakdown({
  hasSelection,
  entries,
  loading,
  error,
  emptyMessage = "No time entries for this work log.",
}: TicketBreakdownProps) {
  const { bordersEnabled } = useBorders();
  const { tickets } = useTickets();
  const ticketColors = useTicketColors();
  const totals = useMemo(() => groupByTicket(entries), [entries]);
  const ticketTitleByNumber = useMemo(() => buildTicketTitleMap(tickets), [tickets]);
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
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
        <div className="min-w-0 flex-[2] space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-full rounded" />
          ))}
        </div>
        <div
          className={`flex flex-1 flex-col items-center gap-4 rounded-lg p-4 md:max-w-[33%] ${
            bordersEnabled ? "border border-default-200" : ""
          }`}
        >
          <Skeleton className="size-32 shrink-0 rounded-full" />
          <div className="w-full space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-3 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (totals.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground/60">{emptyMessage}</p>
      </div>
    );
  }

  const grandTotalMinutes = totals.reduce((sum, t) => sum + t.totalMinutes, 0);

  const chartData = totals.map((t, i) => ({
    label: t.ticket,
    value: t.totalMinutes,
    ...sliceStyle(t.ticket, i, ticketColors.colorFor(t.ticket) ?? undefined),
  }));
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
              const rowStyle = ticketColors.rowStyle(t.ticket);
              const edgeStyle = ticketColors.edgeStyle(t.ticket);
              return (
                <tr
                  key={t.ticket}
                  // Faint wash of the ticket's own color, so scanning the table
                  // groups by ticket visually before you read a single number.
                  // Untinted when no color is assigned, rather than falling back
                  // to the rotation hue — a categorical color is legible as a
                  // 10px dot but reads as noise smeared across a whole row.
                  style={rowStyle}
                >
                  <td
                    className="border p-2"
                    // Inset shadow rather than a real border: at 12% the wash
                    // is nearly invisible for a dark or desaturated color, and
                    // a full-strength edge keeps it readable — without an
                    // actual border-left, which would fight the table's own
                    // collapsed borders and shift every column by 3px.
                    style={edgeStyle}
                  >
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
                        <TicketTitleSuffix
                          title={t.ticket !== UNASSIGNED_TICKET ? ticketTitleByNumber.get(Number(t.ticket)) : null}
                        />
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
                <TicketTitleSuffix
                  title={d.label !== UNASSIGNED_TICKET ? ticketTitleByNumber.get(Number(d.label)) : null}
                />
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
              title: t.ticket !== UNASSIGNED_TICKET ? ticketTitleByNumber.get(Number(t.ticket)) : null,
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
