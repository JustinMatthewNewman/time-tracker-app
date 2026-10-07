"use client";

import { useMemo, useState } from "react";
import { Card, Skeleton, Tabs } from "@heroui/react";
import { useTimeEntriesByDateRange } from "@/hooks/useTimeEntriesByDateRange";
import { useTickets } from "@/context/TicketsContext";
import { useTicketColors } from "@/hooks/useTicketColors";
import {
  capTicketTotals,
  groupByTicket,
  formatDuration,
  buildTicketTitleMap,
  isOtherTicketLabel,
  UNASSIGNED_TICKET,
} from "@/lib/timeTotals";
import { startOfWeek, endOfWeek } from "@/lib/weekBuckets";
import { useEntryCounts } from "@/context/EntryCountsContext";
import { getSeriesColor, NEUTRAL_SERIES_COLOR, CATEGORICAL_HUE_COUNT } from "./chartColor";
import { DonutChart } from "@/components/WorkLogs/DonutChart";
import { TicketBarChart } from "@/components/WorkLogs/TicketBarChart";

type Window = "week" | "month";

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

function sliceStyle(ticket: string, colorIndex: number) {
  return ticket === UNASSIGNED_TICKET || isOtherTicketLabel(ticket)
    ? NEUTRAL_SERIES_COLOR
    : getSeriesColor(colorIndex);
}

// Same categorical part-of-whole (donut) + magnitude (bar) pairing as
// components/WorkLogs/TicketBreakdown.tsx — that pairing was already the
// right form for ticket breakdowns, just re-windowed to "this week"/"this
// month" here instead of "this work log".
export function TicketBreakdownWeekly() {
  const [window, setWindow] = useState<Window>("week");

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    if (window === "week") {
      return { startDate: isoLocalMidnight(startOfWeek(today)), endDate: isoLocalMidnight(endOfWeek(today)) };
    }
    return {
      startDate: isoLocalMidnight(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: isoLocalMidnight(today),
    };
  }, [window]);

  const { entries, loading } = useTimeEntriesByDateRange(startDate, endDate);
  const { showEntryCounts } = useEntryCounts();
  const { tickets } = useTickets();
  const ticketColors = useTicketColors();
  const ticketTitleByNumber = useMemo(() => buildTicketTitleMap(tickets), [tickets]);
  const rawTotals = useMemo(() => groupByTicket(entries), [entries]);
  const totals = useMemo(() => capTicketTotals(rawTotals, CATEGORICAL_HUE_COUNT), [rawTotals]);
  const grandTotalMinutes = totals.reduce((sum, t) => sum + t.totalMinutes, 0);

  const chartData = totals.map((t, i) => {
    const assigned = ticketColors.colorFor(t.ticket);
    return {
      label: t.ticket,
      value: t.totalMinutes,
      ...(assigned ? { color: assigned } : sliceStyle(t.ticket, i)),
    };
  });
  const styleByTicket = new Map(chartData.map((d) => [d.label, { color: d.color, filter: d.filter }]));

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Ticket breakdown</h2>
        <Tabs selectedKey={window} onSelectionChange={(key) => setWindow(String(key) as Window)} aria-label="Breakdown window">
          <Tabs.ListContainer>
            <Tabs.List className="text-xs">
              <Tabs.Tab id="week" className="px-2.5 py-1 text-xs">
                This week
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="month" className="px-2.5 py-1 text-xs">
                This month
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="week" className="hidden">{null}</Tabs.Panel>
          <Tabs.Panel id="month" className="hidden">{null}</Tabs.Panel>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="size-40 shrink-0 rounded-full" />
          <div className="flex w-full flex-1 flex-col gap-2">
            {[100, 70, 45].map((widthPct, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24 shrink-0 rounded" />
                <Skeleton className="h-4 flex-1 rounded-r-[4px]" style={{ maxWidth: `${widthPct}%` }} />
              </div>
            ))}
          </div>
        </div>
      ) : totals.length === 0 ? (
        <p className="py-10 text-center text-sm text-foreground/60">No time entries in this window yet.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Donut over a legend, as a compact part-of-whole header — the
              bars below carry the comparison, so the donut only has to answer
              "how is the week split" and doesn't need half the card's width. */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <DonutChart
              data={chartData}
              centerLabel={formatDuration(grandTotalMinutes)}
              centerSubLabel="total"
              formatValue={formatDuration}
            />
            <div className="grid w-full flex-1 grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
              {chartData.map((d) => (
                <div key={d.label} className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: d.color, filter: d.filter }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground/80">{d.label}</span>
                  <span className="shrink-0 tabular-nums text-foreground/50">
                    {grandTotalMinutes > 0 ? Math.round((d.value / grandTotalMinutes) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full width: bar length is the entire encoding, and sharing the row
              with the donut left these bars a few dozen pixels long. */}
          <TicketBarChart
            data={totals.map((t) => ({
              label: t.ticket,
              title:
                t.ticket !== UNASSIGNED_TICKET && !isOtherTicketLabel(t.ticket)
                  ? ticketTitleByNumber.get(Number(t.ticket))
                  : null,
              entryCount: t.entryCount,
              totalMinutes: t.totalMinutes,
              ...styleByTicket.get(t.ticket)!,
            }))}
            formatDuration={formatDuration}
            showEntryCounts={showEntryCounts}
          />
        </div>
      )}
    </Card>
  );
}

export default TicketBreakdownWeekly;
