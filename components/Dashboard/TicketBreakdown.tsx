"use client";

import { useMemo } from "react";
import { Card } from "@heroui/react";
import type { WorkLogTimeEntry } from "@/hooks/useTimeEntriesByWorkLog";

const UNASSIGNED_TICKET = "(No ticket)";

interface TicketTotal {
  ticket: string;
  entryCount: number;
  totalMinutes: number;
}

interface TicketBreakdownProps {
  hasSelection: boolean;
  entries: WorkLogTimeEntry[];
  loading?: boolean;
  error?: string | null;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function TicketBreakdown({ hasSelection, entries, loading, error }: TicketBreakdownProps) {
  const totals = useMemo<TicketTotal[]>(() => {
    const byTicket = new Map<string, TicketTotal>();

    for (const entry of entries) {
      const ticket = entry.ticketNumber?.trim() || UNASSIGNED_TICKET;
      const minutes =
        (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 60000;

      const existing = byTicket.get(ticket);
      if (existing) {
        existing.entryCount += 1;
        existing.totalMinutes += minutes;
      } else {
        byTicket.set(ticket, { ticket, entryCount: 1, totalMinutes: minutes });
      }
    }

    return Array.from(byTicket.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [entries]);

  if (!hasSelection) {
    return (
      <Card className="p-8 text-center">
        <p className="text-foreground/60">Select a work log from the sidebar to view its ticket breakdown.</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border border-red-200">
        <p className="text-red-700 text-sm">{error}</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-foreground/60">Loading ticket breakdown...</p>
      </Card>
    );
  }

  if (totals.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-foreground/60">No time entries for this work log.</p>
      </Card>
    );
  }

  const grandTotalMinutes = totals.reduce((sum, t) => sum + t.totalMinutes, 0);

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-3">Ticket Breakdown</h2>

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
                <td className="border p-2">{t.ticket}</td>
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
    </Card>
  );
}

export default TicketBreakdown;
