"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "@/hooks/useAuth";
import { listTickets, upsertTicket, updateTicket } from "@/src/dataconnect-generated";
import type {
  UpsertTicketVariables,
  UpdateTicketVariables,
  ListTicketsData,
  ListTicketsVariables,
} from "@/src/dataconnect-generated";
import { fetchAllPages } from "@/lib/dataconnectPagination";
import { normalizeTicketColor } from "@/lib/ticketColor";

export interface Ticket {
  id: string;
  ticketNumber: number;
  office: string | null;
  ticketTitle: string | null;
  ticketLink: string | null;
  /** Canonical "#rrggbb", or null when no color has been chosen. */
  color: string | null;
}

/**
 * The subset of a ticket that entry-level queries carry.
 *
 * Components that merely display or edit a *linked* ticket take this instead
 * of the full `Ticket`, so a caller holding a WorkLogTimeEntryTicket can pass
 * it straight through with no adapter. Same structural-prop reasoning as
 * TicketBreakdownEntry — and the reason adding `color` to `Ticket` didn't
 * force every entry query to grow a field it has no use for. Colors are
 * looked up from this context by ticket number, exactly as titles already are
 * (see buildTicketTitleMap in lib/timeTotals.ts).
 */
export interface TicketRef {
  id: string;
  ticketNumber: number;
  office?: string | null;
  ticketTitle?: string | null;
}

export interface CreateTicketInput {
  ticketNumber: number;
  office: string;
  ticketTitle?: string;
  ticketLink?: string;
  color?: string | null;
}

export interface UpdateTicketInput {
  ticketNumber: number;
  // Optional so callers can patch a single field (e.g. just ticketTitle)
  // without having to know/resend the other fields' current values —
  // updateTicket's underlying GraphQL variables are all nullable, and an
  // omitted variable leaves that column untouched (same partial-update
  // behavior ensureTicketsExist already relies on for ticketNumber-only
  // upserts).
  office?: string;
  ticketTitle?: string;
  ticketLink?: string;
  // Explicitly nullable, unlike the fields above: null is a meaningful value
  // here ("clear this ticket's color"), whereas omitting the key leaves the
  // column untouched. The other three have no such distinction to express.
  color?: string | null;
}

type TicketsContextType = {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  createTicket: (data: CreateTicketInput) => Promise<Ticket>;
  updateTicketDetails: (data: UpdateTicketInput) => Promise<Ticket>;
  ensureTicketsExist: (ticketNumbers: number[]) => Promise<void>;
};

const TicketsContext = createContext<TicketsContextType | null>(null);

function normalizeTicket(ticket: ListTicketsData["tickets"][number]): Ticket {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    office: ticket.office ?? null,
    ticketTitle: ticket.ticketTitle ?? null,
    ticketLink: ticket.ticketLink ?? null,
    // Normalized at the boundary, so nothing downstream can hand an unvetted
    // string to a CSS color-mix() — see lib/ticketColor.ts.
    color: normalizeTicketColor(ticket.color),
  };
}

// Shared across every TicketComboBox instance (one per time entry row, and
// there can be many rows across many hour sections) so that creating or
// editing a ticket in one row is immediately visible to every other row
// referencing the same ticket, rather than each row holding its own stale
// copy of the ticket list (same multi-instance-state pitfall as
// ThemeSelectionContext/useWorkLogs).
export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.uid) {
      setTickets([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAllPages<ListTicketsVariables, ListTicketsData["tickets"][number]>(
        (vars) => listTickets(vars, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }).then((r) => r.data.tickets),
        {}
      );
      const normalized = rows.map(normalizeTicket);
      setTickets(normalized);
      return normalized;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  // ticket_upsert/ticket_update only return Ticket_Key (ticketNumber — the
  // table's actual key), not id, so the saved ticket's id has to come from
  // re-fetching the list rather than the mutation result itself.
  const createTicket = useCallback(
    async (data: CreateTicketInput) => {
      await upsertTicket({
        ticketNumber: data.ticketNumber,
        office: data.office,
        ticketTitle: data.ticketTitle,
        ticketLink: data.ticketLink,
        color: data.color,
      } as UpsertTicketVariables);
      const fresh = await refetch();
      const saved = fresh.find((t) => t.ticketNumber === data.ticketNumber);
      if (!saved) throw new Error("Ticket was saved but could not be found afterward");
      return saved;
    },
    [refetch]
  );

  const updateTicketDetails = useCallback(
    async (data: UpdateTicketInput) => {
      await updateTicket({
        ticketNumber: data.ticketNumber,
        office: data.office,
        ticketTitle: data.ticketTitle,
        ticketLink: data.ticketLink,
        color: data.color,
      } as UpdateTicketVariables);
      const fresh = await refetch();
      const saved = fresh.find((t) => t.ticketNumber === data.ticketNumber);
      if (!saved) throw new Error("Ticket was saved but could not be found afterward");
      return saved;
    },
    [refetch]
  );

  // Bulk-import path (parsed work log upload): guarantees a Ticket row exists
  // for every referenced number, without touching office/title/link on any
  // that already exist. Only ticketNumber is ever sent for a genuinely new
  // row — parsed text carries no office info, and there's nothing else to
  // set, so there's no risk of clobbering data that isn't there yet.
  const ensureTicketsExist = useCallback(
    async (ticketNumbers: number[]) => {
      const distinct = Array.from(new Set(ticketNumbers));
      if (distinct.length === 0) return;

      const current = await refetch();
      const known = new Set(current.map((t) => t.ticketNumber));
      const missing = distinct.filter((n) => !known.has(n));
      if (missing.length === 0) return;

      await Promise.all(missing.map((ticketNumber) => upsertTicket({ ticketNumber })));
      await refetch();
    },
    [refetch]
  );

  return (
    <TicketsContext.Provider
      value={{ tickets, loading, error, createTicket, updateTicketDetails, ensureTicketsExist }}
    >
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) {
    throw new Error("useTickets must be used within a TicketsProvider");
  }
  return ctx;
}
