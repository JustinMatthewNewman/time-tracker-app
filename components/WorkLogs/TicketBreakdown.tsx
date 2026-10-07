"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@heroui/react";
import { ArrowDown, ArrowUp, ArrowUpRightFromSquare, Copy, CopyCheck } from "@gravity-ui/icons";
import {
  capTicketTotals,
  groupByTicket,
  formatDuration,
  formatDecimalHours,
  buildTicketTitleMap,
  isOtherTicketLabel,
  UNASSIGNED_TICKET,
} from "@/lib/timeTotals";
import { compareTicketTotals, type TicketSortKey } from "@/lib/ticketSort";
import { useTicketColors } from "@/hooks/useTicketColors";
import {
  CATEGORICAL_HUE_COUNT,
  getSeriesColor,
  NEUTRAL_SERIES_COLOR,
  type SeriesColor,
} from "@/components/Dashboard/chartColor";
import { TicketTitleSuffix } from "@/components/Dashboard/TicketTitleSuffix";
import { useBorders } from "@/context/BordersContext";
import { useTickets } from "@/context/TicketsContext";
import { useUserSettings } from "@/context/UserSettingsContext";
import { useEntryCounts } from "@/context/EntryCountsContext";
import { resolveExternalTicketLink } from "@/lib/externalTicketLink";
import { DonutChart } from "./DonutChart";
import { TicketBarChart } from "./TicketBarChart";

// Precedence: a ticket's own assigned color wins, then the neutral token for
// "(No ticket)" and the "Other" overflow bucket, then the theme-aware
// categorical rotation.
//
// The rotation stays the fallback rather than being replaced outright, so a
// ticket nobody has colored looks exactly as it did before and still re-tints
// with the active ColorScheme — the property chartColor.ts exists to protect.
// An assigned color is a deliberate override of that, and only affects the
// tickets someone actually chose a color for.
function sliceStyle(ticket: string, colorIndex: number, assigned?: string): SeriesColor {
  if (assigned) return { color: assigned };
  if (ticket === UNASSIGNED_TICKET || isOtherTicketLabel(ticket)) return NEUTRAL_SERIES_COLOR;
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

export type SortDirection = "asc" | "desc";

interface TicketBreakdownProps {
  hasSelection: boolean;
  entries: TicketBreakdownEntry[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

/** A sortable column header. Click to sort; click again to reverse. */
function SortHeader({
  label,
  columnKey,
  sortKey,
  direction,
  onSort,
  className,
}: {
  label: string;
  columnKey: TicketSortKey;
  sortKey: TicketSortKey;
  direction: SortDirection;
  onSort: (key: TicketSortKey) => void;
  className?: string;
}) {
  const active = sortKey === columnKey;
  return (
    <th
      className={`border p-2 text-left ${className ?? ""}`}
      // The native sort semantic, so a screen reader announces the current
      // order rather than leaving the button's arrow as the only cue.
      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={`flex w-full items-center gap-1 text-left ${
          active ? "text-foreground" : "text-foreground/70 hover:text-foreground"
        }`}
      >
        {label}
        {active ? (
          direction === "asc" ? (
            <ArrowUp className="size-3 shrink-0" aria-hidden />
          ) : (
            <ArrowDown className="size-3 shrink-0" aria-hidden />
          )
        ) : (
          <ArrowDown className="size-3 shrink-0 opacity-0 group-hover:opacity-40" aria-hidden />
        )}
      </button>
    </th>
  );
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
  const { externalTicketLinkTemplate } = useUserSettings();
  const { showEntryCounts } = useEntryCounts();
  const ticketColors = useTicketColors();
  const totals = useMemo(() => groupByTicket(entries), [entries]);
  const ticketTitleByNumber = useMemo(() => buildTicketTitleMap(tickets), [tickets]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Time descending is the question this table is usually asked ("where did
  // the week go"), which is also groupByTicket's own order.
  const [sortKey, setSortKey] = useState<TicketSortKey>("time");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const handleSort = (key: TicketSortKey) => {
    if (key === sortKey) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    // Magnitudes open largest-first; the ticket number opens lowest-first,
    // which is the order people read a list of numbers in.
    setDirection(key === "ticket" ? "asc" : "desc");
  };

  const sortedTotals = useMemo(() => {
    const sorted = [...totals].sort((a, b) => compareTicketTotals(a, b, sortKey));
    return direction === "desc" ? sorted.reverse() : sorted;
  }, [totals, sortKey, direction]);

  // The charts always show the biggest tickets, independently of how the table
  // is currently ordered: sorting is a way to *find* a row, while the donut and
  // the bars are a fixed ranked summary. Tying them to the sort would mean
  // sorting by ticket number produced a chart of eight arbitrary low-numbered
  // tickets.
  const chartTotals = useMemo(() => capTicketTotals(totals, CATEGORICAL_HUE_COUNT), [totals]);

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
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
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
            <Skeleton className="size-40 shrink-0 rounded-full" />
            <div className="w-full space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-3 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded" />
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

  const chartData = chartTotals.map((t, i) => ({
    label: t.ticket,
    value: t.totalMinutes,
    ...sliceStyle(t.ticket, i, ticketColors.colorFor(t.ticket) ?? undefined),
  }));
  const styleByTicket = new Map(chartData.map((d) => [d.label, { color: d.color, filter: d.filter }]));

  // Row dots have to resolve a colour for *every* ticket, including the ones
  // folded into "Other" above and so absent from the chart map. Falling back
  // to the neutral token rather than a rotation hue is deliberate: past the
  // hue budget a categorical colour would be a repeat, which means a different
  // ticket.
  const dotStyle = (ticket: string) => styleByTicket.get(ticket) ?? NEUTRAL_SERIES_COLOR;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="min-w-0 flex-[2] overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="group">
                <SortHeader
                  label="Ticket"
                  columnKey="ticket"
                  sortKey={sortKey}
                  direction={direction}
                  onSort={handleSort}
                />
                {showEntryCounts && (
                  <SortHeader
                    label="Entries"
                    columnKey="entries"
                    sortKey={sortKey}
                    direction={direction}
                    onSort={handleSort}
                    className="w-24"
                  />
                )}
                <SortHeader
                  label="Total Time"
                  columnKey="time"
                  sortKey={sortKey}
                  direction={direction}
                  onSort={handleSort}
                  className="w-32"
                />
                <th className="w-24 border p-2 text-left">Hours</th>
              </tr>
            </thead>

            <tbody>
              {sortedTotals.map((t) => {
                const hoursKey = `${t.ticket}-hours`;
                const externalLink =
                  t.ticket === UNASSIGNED_TICKET
                    ? null
                    : resolveExternalTicketLink(Number(t.ticket), t.ticketLink, externalTicketLinkTemplate);
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
                            backgroundColor: dotStyle(t.ticket).color,
                            filter: dotStyle(t.ticket).filter,
                          }}
                          aria-hidden
                        />
                        {/* min-w-0 + the nowrap/truncate inside: a long ticket
                            title must shorten rather than wrap this cell onto a
                            second line, which would make every row in the table
                            taller than the one number it exists to show. */}
                        <span className="flex h-5 min-w-0 flex-1 items-center whitespace-nowrap">
                          {t.ticket !== UNASSIGNED_TICKET && !isOtherTicketLabel(t.ticket) ? (
                            <Link
                              href={`/ticket/${t.ticket}`}
                              title={`View ticket ${t.ticket} in Time Tracker`}
                              aria-label={`View ticket ${t.ticket} in Time Tracker`}
                              className="shrink-0 text-primary underline"
                            >
                              {t.ticket}
                            </Link>
                          ) : (
                            <span className="shrink-0">{t.ticket}</span>
                          )}
                          <TicketTitleSuffix
                            title={
                              t.ticket !== UNASSIGNED_TICKET
                                ? ticketTitleByNumber.get(Number(t.ticket))
                                : null
                            }
                          />
                        </span>
                        {/* Two destinations, deliberately not interchangeable:
                            the number itself is the in-app ticket page, and this
                            icon leaves for the external tracker. Distinguished by
                            shape and behaviour, not colour alone — an outward
                            arrow that opens a new tab versus underlined text that
                            navigates in place. */}
                        {externalLink && (
                          <a
                            href={externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open ticket ${t.ticket} in the external ticket system`}
                            aria-label={`Open ticket ${t.ticket} in the external ticket system (opens in a new tab)`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex size-5 shrink-0 items-center justify-center rounded text-foreground/40 hover:bg-default hover:text-accent"
                          >
                            <ArrowUpRightFromSquare className="size-3.5" />
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
                    {showEntryCounts && <td className="border p-2">{t.entryCount}</td>}
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
                {showEntryCounts && <td className="border p-2">{entries.length}</td>}
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
            formatValue={formatDuration}
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
                  {d.label !== UNASSIGNED_TICKET && !isOtherTicketLabel(d.label) ? (
                    <Link href={`/ticket/${d.label}`} className="hover:underline">
                      {d.label}
                    </Link>
                  ) : (
                    d.label
                  )}
                  <TicketTitleSuffix
                    title={
                      d.label !== UNASSIGNED_TICKET && !isOtherTicketLabel(d.label)
                        ? ticketTitleByNumber.get(Number(d.label))
                        : null
                    }
                  />
                </span>
                <span className="text-foreground/50">
                  {grandTotalMinutes > 0 ? Math.round((d.value / grandTotalMinutes) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full width, on its own row under the table rather than stacked in the
          donut's third-width rail. Bar length is the whole encoding here, and
          in a 33% column the bars were a few dozen pixels long — the chart had
          the least room on the page while carrying the most precise comparison
          on it. */}
      <div className={`rounded-lg p-4 ${bordersEnabled ? "border border-default-200" : ""}`}>
        <h3 className="mb-3 text-sm font-medium text-foreground">
          {showEntryCounts ? "Hours and entries by ticket" : "Hours by ticket"}
        </h3>
        <TicketBarChart
          data={chartTotals.map((t) => ({
            label: t.ticket,
            title:
              t.ticket !== UNASSIGNED_TICKET && !isOtherTicketLabel(t.ticket)
                ? ticketTitleByNumber.get(Number(t.ticket))
                : null,
            entryCount: t.entryCount,
            totalMinutes: t.totalMinutes,
            ...dotStyle(t.ticket),
          }))}
          formatDuration={formatDuration}
          showEntryCounts={showEntryCounts}
        />
      </div>
    </div>
  );
}

export default TicketBreakdown;
