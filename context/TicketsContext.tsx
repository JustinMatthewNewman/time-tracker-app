"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "@/hooks/useAuth";
import { listTickets, upsertTicket, updateTicket } from "@/src/dataconnect-generated";
import type { UpsertTicketVariables, UpdateTicketVariables, ListTicketsData } from "@/src/dataconnect-generated";

export interface Ticket {
  id: string;
  ticketNumber: number;
  office: string | null;
  ticketTitle: string | null;
  ticketLink: string | null;
}

export interface CreateTicketInput {
  ticketNumber: number;
  office: string;
  ticketTitle?: string;
  ticketLink?: string;
}

export interface UpdateTicketInput {
  ticketNumber: number;
  office: string;
  ticketTitle?: string;
  ticketLink?: string;
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
      const result = await listTickets({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
      const normalized = result.data.tickets.map(normalizeTicket);
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
