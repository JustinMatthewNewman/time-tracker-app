"use client";

import { useMemo } from "react";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { useTickets } from "@/context/TicketsContext";
import { groupByTicket, buildTicketTitleMap, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { HoursBarChart } from "./HoursBarChart";
import { TicketBreakdownWeekly } from "./TicketBreakdownWeekly";

const TOP_N_ALL_TIME = 25;

export function TicketsReport() {
  const { entries, loading, error } = useMyTimeEntries();
  const { tickets } = useTickets();
  const ticketTitleByNumber = useMemo(() => buildTicketTitleMap(tickets), [tickets]);

  const byTicket = useMemo(() => groupByTicket(entries).slice(0, TOP_N_ALL_TIME), [entries]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <TicketBreakdownWeekly />

      <HoursBarChart
        title={`Hours by ticket (all time, top ${TOP_N_ALL_TIME})`}
        data={byTicket.map((t) => ({
          label: t.ticket,
          title: t.ticket !== UNASSIGNED_TICKET ? ticketTitleByNumber.get(Number(t.ticket)) : null,
          totalMinutes: t.totalMinutes,
        }))}
        emptyMessage="No time entries yet."
        loading={loading}
      />
    </div>
  );
}

export default TicketsReport;
