"use client";

import { useCallback, useMemo } from "react";
import { useTickets } from "@/context/TicketsContext";
import { useTicketColorsSetting } from "@/context/TicketColorsContext";
import { buildTicketColorMap, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { effectiveTicketColor, ticketRowTint } from "@/lib/ticketColor";

// The single place anything in the app asks "what color is this ticket, and
// may I paint with it?".
//
// It exists so the Ticket Colors setting can't be honoured inconsistently.
// Every tinted surface — breakdown rows, entry rows, the ticket page header,
// the dashboard lists — resolves through here, so the preference is enforced
// in one place rather than each component remembering to check it. A component
// that forgot would keep painting after the switch was turned off, and that
// bug is invisible until someone actually toggles it.
//
// Resolution goes through TicketsContext by number rather than through the
// entry's own `ticket` sub-object, because entry-level queries deliberately
// don't carry `color` — the same reason titles are looked up separately (see
// buildTicketTitleMap in lib/timeTotals.ts).

export interface TicketColors {
  /** False when the user has switched Ticket Colors off. */
  enabled: boolean;
  /** The ticket's color (chosen or derived), or null for "(No ticket)" / setting off. */
  colorFor: (ticket: number | string | null | undefined) => string | null;
  /** Faint row wash, or undefined when there's nothing to paint. */
  rowStyle: (ticket: number | string | null | undefined) => React.CSSProperties | undefined;
  /** Full-strength left edge for a tinted row's first cell. */
  edgeStyle: (ticket: number | string | null | undefined) => React.CSSProperties | undefined;
}

export function useTicketColors(): TicketColors {
  const { tickets } = useTickets();
  const { ticketColorsEnabled } = useTicketColorsSetting();

  const colorByNumber = useMemo(() => buildTicketColorMap(tickets), [tickets]);

  const colorFor = useCallback(
    (ticket: number | string | null | undefined): string | null => {
      if (!ticketColorsEnabled) return null;
      if (ticket === null || ticket === undefined) return null;
      // Callers vary: grouped views hold the ticket as a display string (and
      // use UNASSIGNED_TICKET for "none"), while row-level callers hold the
      // number. Both are accepted so no call site needs a conversion dance.
      if (ticket === UNASSIGNED_TICKET) return null;
      const num = typeof ticket === "number" ? ticket : Number(ticket);
      if (!Number.isFinite(num)) return null;
      // Chosen color if there is one, otherwise the number-derived default —
      // so every ticket is colored and the feature is visible without anyone
      // hand-assigning 100 tickets first.
      return effectiveTicketColor(colorByNumber.get(num), num);
    },
    [ticketColorsEnabled, colorByNumber]
  );

  const rowStyle = useCallback(
    (ticket: number | string | null | undefined) => {
      const color = colorFor(ticket);
      return color ? { backgroundColor: ticketRowTint(color) } : undefined;
    },
    [colorFor]
  );

  const edgeStyle = useCallback(
    (ticket: number | string | null | undefined) => {
      const color = colorFor(ticket);
      // Inset shadow rather than border-left: it adds no width, so it can't
      // shift a table's collapsed borders or nudge every column across by 3px.
      return color ? { boxShadow: `inset 3px 0 0 0 ${color}` } : undefined;
    },
    [colorFor]
  );

  return { enabled: ticketColorsEnabled, colorFor, rowStyle, edgeStyle };
}
