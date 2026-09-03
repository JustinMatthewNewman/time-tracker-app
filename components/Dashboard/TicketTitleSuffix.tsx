import { truncateTicketTitle } from "@/lib/timeTotals";

interface TicketTitleSuffixProps {
  title?: string | null;
}

// Trailing " - Title" for a ticket-number label, lighter weight/color than
// the number so the number stays the primary identifier. Shared by every
// place a ticket shows up as a short label (calendar day cells, work log /
// ticket breakdowns) so the format stays identical across all of them.
export function TicketTitleSuffix({ title }: TicketTitleSuffixProps) {
  if (!title) return null;
  return <span className="font-normal text-foreground/50"> - {truncateTicketTitle(title)}</span>;
}

export default TicketTitleSuffix;
