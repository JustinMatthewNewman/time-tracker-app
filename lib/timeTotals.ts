export const UNASSIGNED_TICKET = "(No ticket)";

export interface TicketTotal {
  ticket: string;
  entryCount: number;
  totalMinutes: number;
}

interface EntryLike {
  ticketNumber?: string | null;
  startTime: string;
  endTime: string;
}

export function minutesBetween(startTime: string, endTime: string): number {
  return (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000;
}

export function groupByTicket<T extends EntryLike>(entries: T[]): TicketTotal[] {
  const byTicket = new Map<string, TicketTotal>();

  for (const entry of entries) {
    const ticket = entry.ticketNumber?.trim() || UNASSIGNED_TICKET;
    const minutes = minutesBetween(entry.startTime, entry.endTime);

    const existing = byTicket.get(ticket);
    if (existing) {
      existing.entryCount += 1;
      existing.totalMinutes += minutes;
    } else {
      byTicket.set(ticket, { ticket, entryCount: 1, totalMinutes: minutes });
    }
  }

  return Array.from(byTicket.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
