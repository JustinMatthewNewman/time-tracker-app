import { truncateTicketTitle } from "@/lib/timeTotals";

interface TicketTitleSuffixProps {
  title?: string | null;
}

// Trailing " - Title" for a ticket-number label, lighter weight/color than
// the number so the number stays the primary identifier. Shared by every
// place a ticket shows up as a short label (calendar day cells, work log /
// ticket breakdowns) so the format stays identical across all of them.
//
// Three things keep it from ever changing the height of what it sits in,
// because it lands in table cells, chips and day cells that are all sized to
// one line of the *number*:
//
//   - a smaller size than its label, so the same width holds more of the title
//   - `truncate`, which shortens rather than wraps — in a flex row (the table's
//     ticket cell) `min-w-0 flex-1` lets it actually shrink, and in the tooltips
//     it degrades to plain nowrap, which is all that's wanted there
//   - truncateTicketTitle's hard character cap behind both, so a pathological
//     title can't blow out the intrinsic width before CSS gets a say
export function TicketTitleSuffix({ title }: TicketTitleSuffixProps) {
  if (!title) return null;
  return (
    <span className="min-w-0 flex-1 truncate text-xs font-normal text-foreground/50">
      {" "}
      - {truncateTicketTitle(title)}
    </span>
  );
}

export default TicketTitleSuffix;
