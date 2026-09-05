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

export const TICKET_TITLE_MAX_CHARS = 20;

// Caps a ticket title before it's shown alongside the ticket number, so a
// long title can't push other UI (a calendar day cell, a table column) out
// of shape — same rationale as UNASSIGNED_TICKET being a fixed label.
export function truncateTicketTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.length > TICKET_TITLE_MAX_CHARS ? `${trimmed.slice(0, TICKET_TITLE_MAX_CHARS)}…` : trimmed;
}

interface TicketWithTitle {
  ticketNumber: number;
  ticketTitle?: string | null;
}

interface TicketWithColor {
  ticketNumber: number;
  color?: string | null;
}

// Every entry-level `ticket` sub-object (TimeEntry.ticket in the various
// list queries) only ever carries ticketNumber/ticketLink, not the title —
// so callers that group entries by ticket (groupByTicket above) look the
// title up separately from TicketsContext's already-loaded ticket list
// rather than widening every entry query just to carry one extra field.
export function buildTicketTitleMap(tickets: TicketWithTitle[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const t of tickets) {
    if (t.ticketTitle) map.set(t.ticketNumber, t.ticketTitle);
  }
  return map;
}

// Companion to buildTicketTitleMap, and there for exactly the same reason:
// TimeEntry.ticket sub-objects carry only ticketNumber/ticketLink, so a view
// that groups entries by ticket resolves colors from TicketsContext's loaded
// list rather than every entry query growing a `color` field.
//
// Tickets with no color are simply absent from the map, so callers get
// `undefined` and fall back to the theme-aware categorical palette.
export function buildTicketColorMap(tickets: TicketWithColor[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const t of tickets) {
    if (t.color) map.set(t.ticketNumber, t.color);
  }
  return map;
}

// Plain-text "number - Title" for contexts that can't render the styled
// TicketTitleSuffix component (a native `title=` hover attribute, a chart
// tooltip's text-only label) — same truncation rule, just flattened to one
// string instead of two differently-styled spans.
export function ticketLabelWithTitle(ticket: string, title?: string | null): string {
  return title ? `${ticket} - ${truncateTicketTitle(title)}` : ticket;
}
