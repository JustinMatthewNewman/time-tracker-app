"use client";

import { useMemo, useState } from "react";
import { Card, Tabs } from "@heroui/react";
import { useTimeEntriesByDateRange } from "@/hooks/useTimeEntriesByDateRange";
import { groupByTicket, formatDuration, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { startOfWeek, endOfWeek } from "@/lib/weekBuckets";
import { getSeriesColor, NEUTRAL_SERIES_COLOR, CATEGORICAL_HUE_COUNT } from "./chartColor";
import { DonutChart } from "@/components/WorkLogs/DonutChart";
import { TicketBarChart } from "@/components/WorkLogs/TicketBarChart";
import type { TicketTotal } from "@/lib/timeTotals";

type Window = "week" | "month";

const OTHER_LABEL = "Other";

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

// Hues are a fixed, non-cycling set (see chartColor.ts) — a week/month
// window can easily surface more distinct tickets than there are hues, so
// anything past the budget folds into one "Other" bucket rather than
// silently reusing an earlier ticket's color (per the dataviz color
// formula's non-negotiable: never cycle categorical hues).
function capToOther(totals: TicketTotal[]): TicketTotal[] {
  const ticketed = totals.filter((t) => t.ticket !== UNASSIGNED_TICKET);
  const unassigned = totals.filter((t) => t.ticket === UNASSIGNED_TICKET);
  if (ticketed.length <= CATEGORICAL_HUE_COUNT) return totals;

  const kept = ticketed.slice(0, CATEGORICAL_HUE_COUNT);
  const overflow = ticketed.slice(CATEGORICAL_HUE_COUNT);
  const other: TicketTotal = {
    ticket: `${OTHER_LABEL} (${overflow.length} tickets)`,
    entryCount: overflow.reduce((sum, t) => sum + t.entryCount, 0),
    totalMinutes: overflow.reduce((sum, t) => sum + t.totalMinutes, 0),
  };
  return [...kept, ...unassigned, other];
}

function sliceStyle(ticket: string, colorIndex: number) {
  return ticket === UNASSIGNED_TICKET || ticket.startsWith(OTHER_LABEL)
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
  const rawTotals = useMemo(() => groupByTicket(entries), [entries]);
  const totals = useMemo(() => capToOther(rawTotals), [rawTotals]);
  const grandTotalMinutes = totals.reduce((sum, t) => sum + t.totalMinutes, 0);

  const chartData = totals.map((t, i) => ({ label: t.ticket, value: t.totalMinutes, ...sliceStyle(t.ticket, i) }));
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

      {!loading && totals.length === 0 ? (
        <p className="py-10 text-center text-sm text-foreground/60">No time entries in this window yet.</p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <DonutChart data={chartData} centerLabel={formatDuration(grandTotalMinutes)} centerSubLabel="total" />
          <div className="w-full flex-1">
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
      )}
    </Card>
  );
}

export default TicketBreakdownWeekly;
