import { isOtherTicketLabel, UNASSIGNED_TICKET, type TicketTotal } from "./timeTotals";

/** Which column a ticket breakdown table is ordered by. */
export type TicketSortKey = "ticket" | "entries" | "time";

/**
 * Ascending comparator for a ticket breakdown row. Callers reverse the result
 * for descending order.
 *
 * The non-obvious part is the ticket column. Ticket labels are display
 * *strings* (groupByTicket keys on `String(ticketNumber)`), so a plain
 * localeCompare would order them lexicographically — 10 before 9, 1000 before
 * 200 — which looks like a broken sort to anyone reading a column of numbers.
 *
 * The two labels that aren't numbers at all — the unassigned bucket and the
 * "Other (N tickets)" overflow row — are pinned after every real ticket. They
 * are summaries rather than tickets, so they belong at the end of the numeric
 * run regardless of direction; the caller's reverse then moves them to the top,
 * which is the right place for a summary in a descending list.
 */
export function compareTicketTotals(a: TicketTotal, b: TicketTotal, key: TicketSortKey): number {
  if (key === "entries") return a.entryCount - b.entryCount;
  if (key === "time") return a.totalMinutes - b.totalMinutes;

  const an = Number(a.ticket);
  const bn = Number(b.ticket);
  // Number("") is 0 and Number(" 12 ") is 12, neither of which is a ticket
  // label this app produces — but checking isFinite on the parse is what keeps
  // UNASSIGNED_TICKET and the Other row (both NaN) out of the numeric branch.
  const aNum = Number.isFinite(an) && a.ticket !== UNASSIGNED_TICKET && !isOtherTicketLabel(a.ticket);
  const bNum = Number.isFinite(bn) && b.ticket !== UNASSIGNED_TICKET && !isOtherTicketLabel(b.ticket);

  if (aNum && bNum) return an - bn;
  if (aNum) return -1;
  if (bNum) return 1;
  return a.ticket.localeCompare(b.ticket);
}
