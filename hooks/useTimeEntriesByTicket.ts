"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import { listTimeEntriesByTicket } from "@/src/dataconnect-generated";
import type { ListTimeEntriesByTicketData } from "@/src/dataconnect-generated";

export interface TicketTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string | null;
  workLog?: { id: string; name: string } | null;
  createdAt: string;
}

function toTicketTimeEntries(
  timeEntries: ListTimeEntriesByTicketData["timeEntries"]
): TicketTimeEntry[] {
  return timeEntries.map((entry) => ({
    id: entry.id,
    startTime: entry.startTime,
    endTime: entry.endTime,
    date: entry.date,
    description: entry.description || "",
    workLog: entry.workLog ? { id: entry.workLog.id, name: entry.workLog.name } : null,
    createdAt: entry.createdAt,
  }));
}

export function useTimeEntriesByTicket(ticketNumber: number | null) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TicketTimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Same "already loaded" tracking as useTimeEntriesByWorkLog, so a
  // background refetch after an edit doesn't flash "Loading..." over the
  // table the user is looking at.
  const hasLoadedRef = useRef(false);

  const refetch = useCallback(async () => {
    if (!user?.uid || ticketNumber === null) {
      setEntries([]);
      hasLoadedRef.current = false;
      return;
    }

    if (!hasLoadedRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      // SERVER_ONLY for the same reason as useTimeEntriesByWorkLog: the
      // generated React query hooks' default fetch policy never gets
      // invalidated by mutations, so a direct call is needed to see fresh data.
      const result = await listTimeEntriesByTicket(
        { ticketNumber },
        { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }
      );
      setEntries(toTicketTimeEntries(result.data.timeEntries));
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load time entries");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, ticketNumber]);

  useEffect(() => {
    hasLoadedRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketNumber, user?.uid]);

  return { entries, loading, error, refetch };
}
