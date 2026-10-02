"use client";

import { useMemo } from "react";
import { useTickets } from "@/context/TicketsContext";
import { buildTicketTitleMap, groupByTicket, truncateTicketTitle, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { buildWeekDayKeys, groupEntriesByDay, type BreakdownEntry } from "@/lib/weekdayBreakdown";
import { HoursColumnChart } from "./HoursColumnChart";

// Caps the column count so the chart stays readable — HoursColumnChart has no
// room to crowd, and a week rarely has more than a handful of real tickets.
const TOP_N = 12;

interface WeeklyTicketColumnsProps {
  /** Selected week + prior week; narrowed to the selected week here. */
  entries: BreakdownEntry[];
  loading?: boolean;
  weekStart: Date;
}

export function WeeklyTicketColumns({ entries, loading, weekStart }: WeeklyTicketColumnsProps) {
  const { tickets } = useTickets();
  const ticketTitleByNumber = useMemo(() => buildTicketTitleMap(tickets), [tickets]);

  // The shared fetch carries the prior week too (the stat tiles need it for
  // deltas), so this widget narrows to the selected week itself. Weekends are
  // always included regardless of the column toggle: that toggle is about the
  // breakdown row's columns, not about which hours count.
  const weekEntries = useMemo(() => {
    const keys = new Set(buildWeekDayKeys(weekStart, true));
    const byDay = groupEntriesByDay(entries);
    return [...byDay.entries()].filter(([key]) => keys.has(key)).flatMap(([, list]) => list);
  }, [entries, weekStart]);

  const data = useMemo(() => {
    return groupByTicket(weekEntries)
      .slice(0, TOP_N)
      .map((t) => {
        const title =
          t.ticket !== UNASSIGNED_TICKET ? ticketTitleByNumber.get(Number(t.ticket)) ?? null : null;
        return {
          label: t.ticket,
          title,
          value: t.totalMinutes,
          ticketNumber: t.ticket !== UNASSIGNED_TICKET ? t.ticket : null,
          detail: `${t.entryCount} ${t.entryCount === 1 ? "entry" : "entries"}${
            title ? ` · ${truncateTicketTitle(title)}` : ""
          }`,
        };
      });
  }, [weekEntries, ticketTitleByNumber]);

  return (
    <HoursColumnChart
      title="Hours by ticket this week"
      data={data}
      emptyMessage="No time entries this week."
      loading={loading}
    />
  );
}

export default WeeklyTicketColumns;
