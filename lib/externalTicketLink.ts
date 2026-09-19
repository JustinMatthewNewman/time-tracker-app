// Resolves the URL for "open this ticket in the external ticket system".
//
// Two sources feed it, and before this they were used inconsistently: the
// ticket page substituted the user's template and ignored Ticket.ticketLink,
// while the work log breakdown did the exact opposite. Same ticket, two
// different answers depending on which screen you were looking at.
//
// Precedence here is most-specific-wins: a URL saved on the ticket itself
// describes that ticket, whereas the template is a per-user default derived
// only from the number.

/** Literal substituted with the ticket number in a user's link template. */
export const TICKET_ID_PLACEHOLDER = "{ticket_id}";

/**
 * Only http(s) links are ever returned.
 *
 * This is a real guard, not defensive habit. Ticket rows are shared data —
 * Ticket.ticketLink is one column visible to every user — so a link saved by
 * one account renders as an anchor in another account's browser. Without a
 * scheme check, a "javascript:" URL stored there would execute on click in
 * someone else's session. The template is self-set and lower risk, but it
 * goes through the same check rather than relying on that distinction holding.
 */
function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? trimmed : null;
  } catch {
    // Not absolute. A relative link would resolve against this app rather
    // than the external system, which is the opposite of what's wanted.
    return null;
  }
}

/**
 * The external URL for a ticket, or null when there isn't a usable one.
 *
 * `ticketLink` is the ticket's own saved URL; `template` is the user's
 * setting (User.externalTicketLinkTemplate), which must contain the
 * placeholder to be meaningful — a template without it would send every
 * ticket to the same page.
 */
export function resolveExternalTicketLink(
  ticketNumber: number | null | undefined,
  ticketLink: string | null | undefined,
  template: string | null | undefined
): string | null {
  const explicit = safeHttpUrl(ticketLink);
  if (explicit) return explicit;

  if (ticketNumber === null || ticketNumber === undefined || !Number.isFinite(ticketNumber)) return null;
  if (!template || !template.includes(TICKET_ID_PLACEHOLDER)) return null;

  // replaceAll, not replace: a template can legitimately mention the ticket
  // twice (a path segment and a query parameter, say), and replacing only the
  // first would leave a literal "{ticket_id}" in the URL.
  return safeHttpUrl(template.replaceAll(TICKET_ID_PLACEHOLDER, String(ticketNumber)));
}
