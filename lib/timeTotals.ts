export const UNASSIGNED_TICKET = "(No ticket)";

export interface TicketTotal {
  ticket: string;
  ticketLink?: string | null;
  entryCount: number;
  totalMinutes: number;
}

interface EntryLike {
  ticket?: { ticketNumber: number; ticketLink?: string | null } | null;
  startTime: string;
  endTime: string;
}

export function minutesBetween(startTime: string, endTime: string): number {
  return (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000;
}

export function groupByTicket<T extends EntryLike>(entries: T[]): TicketTotal[] {
  const byTicket = new Map<string, TicketTotal>();

  for (const entry of entries) {
    const ticketLabel = entry.ticket ? String(entry.ticket.ticketNumber) : UNASSIGNED_TICKET;
    const minutes = minutesBetween(entry.startTime, entry.endTime);

    const existing = byTicket.get(ticketLabel);
    if (existing) {
      existing.entryCount += 1;
      existing.totalMinutes += minutes;
    } else {
      byTicket.set(ticketLabel, {
        ticket: ticketLabel,
        ticketLink: entry.ticket?.ticketLink,
        entryCount: 1,
        totalMinutes: minutes,
      });
    }
  }

  return Array.from(byTicket.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
}

export function formatDuration(minutes: number): string {
  // Round the total first, then split — rounding the hours/remainder
  // independently (e.g. floor(479.6/60)=7, round(479.6%60)=60) can produce
  // a nonsensical "7h 60m" instead of rolling over to "8h 0m".
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// e.g. 90 minutes -> "1.5"
export function formatDecimalHours(minutes: number): string {
  return (Math.round((minutes / 60) * 100) / 100).toString();
}
