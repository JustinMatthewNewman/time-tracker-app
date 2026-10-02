"use client";

import { useMemo } from "react";
import { useTickets } from "@/context/TicketsContext";
import { formatDuration } from "@/lib/timeTotals";
import {
  buildWeekDayKeys,
  groupEntriesByDay,
  groupTicketsByOffice,
  type BreakdownEntry,
} from "@/lib/weekdayBreakdown";
import { HoursBarChart } from "./HoursBarChart";

interface TicketsByOfficeProps {
  /** Selected week + prior week; narrowed to the selected week here. */
  entries: BreakdownEntry[];
  loading?: boolean;
  weekStart: Date;
}

/**
 * How many distinct tickets each office accounted for this week.
 *
 * Horizontal bars, not columns: office names are free text and can be long, so
 * an inline label beats a truncated one under a column.
 *
 * Office comes from the linked Ticket, not from TimeEntry.officeNumber — that
 * column is vestigial and the app's mutations deliberately stopped writing it
 * (see the UpdateTimeEntry note in dataconnect/example/mutations.gql).
 * TicketsContext already loads every ticket with its office, so this joins
 * client-side and needs no change to the entry query.
 */
export function TicketsByOffice({ entries, loading, weekStart }: TicketsByOfficeProps) {
  const { tickets, loading: ticketsLoading } = useTickets();

  const officeByTicketNumber = useMemo(
    () => new Map(tickets.map((t) => [t.ticketNumber, t.office])),
    [tickets]
  );

  const weekEntries = useMemo(() => {
    const keys = new Set(buildWeekDayKeys(weekStart, true));
    const byDay = groupEntriesByDay(entries);
    return [...byDay.entries()].filter(([key]) => keys.has(key)).flatMap(([, list]) => list);
  }, [entries, weekStart]);

  const data = useMemo(
    () =>
      groupTicketsByOffice(weekEntries, officeByTicketNumber).map((o) => ({
        label: o.office,
        value: o.ticketCount,
        detail: `${formatDuration(o.totalMinutes)} · ${o.entryCount} ${
          o.entryCount === 1 ? "entry" : "entries"
        }`,
      })),
    [weekEntries, officeByTicketNumber]
  );

  return (
    <HoursBarChart
      title="Tickets by office this week"
      data={data}
      emptyMessage="No tickets worked this week."
      formatValue={(count) => `${count} ${count === 1 ? "ticket" : "tickets"}`}
      loading={loading || ticketsLoading}
    />
  );
}

export default TicketsByOffice;
