"use client";

import { useMemo } from "react";
import type { WorkLogTimeEntry } from "@/hooks/useTimeEntriesByWorkLog";
import { groupByTicket, formatDuration } from "@/lib/timeTotals";

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
  const totals = useMemo(() => groupByTicket(entries), [entries]);

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

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2 text-left">Ticket</th>
              <th className="w-24 border p-2 text-left">Entries</th>
              <th className="w-32 border p-2 text-left">Total Time</th>
            </tr>
          </thead>

          <tbody>
            {totals.map((t) => (
              <tr key={t.ticket}>
                <td className="border p-2">
                  {t.ticketLink ? (
                    <a
                      href={t.ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      {t.ticket}
                    </a>
                  ) : (
                    t.ticket
                  )}
                </td>
                <td className="border p-2">{t.entryCount}</td>
                <td className="border p-2">{formatDuration(t.totalMinutes)}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="font-semibold">
              <td className="border p-2">Total</td>
              <td className="border p-2">{entries.length}</td>
              <td className="border p-2">{formatDuration(grandTotalMinutes)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default TicketBreakdown;
