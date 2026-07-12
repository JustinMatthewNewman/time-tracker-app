"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import { listTimeEntriesByWorkLog } from "@/src/dataconnect-generated";
import type { ListTimeEntriesByWorkLogData } from "@/src/dataconnect-generated";

export interface WorkLogTimeEntryTicket {
  id: string;
  ticketNumber: number;
  office: string | null;
  ticketTitle: string | null;
  ticketLink: string | null;
}

export interface WorkLogTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string | null;
  ticket?: WorkLogTimeEntryTicket | null;
  createdAt: string;
}

function toWorkLogTimeEntries(
  timeEntries: ListTimeEntriesByWorkLogData["timeEntries"]
): WorkLogTimeEntry[] {
  return timeEntries.map((entry) => ({
    id: entry.id,
    startTime: entry.startTime,
    endTime: entry.endTime,
    date: entry.date,
    description: entry.description || "",
    ticket: entry.ticket
      ? {
          id: entry.ticket.id,
          ticketNumber: entry.ticket.ticketNumber,
          office: entry.ticket.office ?? null,
          ticketTitle: entry.ticket.ticketTitle ?? null,
          ticketLink: entry.ticket.ticketLink ?? null,
        }
      : null,
    createdAt: entry.createdAt,
  }));
}

export function useTimeEntriesByWorkLog(workLogId: string | null) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WorkLogTimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether we already have data for the *current* workLogId, so a
  // background refetch after a save can update silently instead of flashing
  // a full "Loading..." state over the table the user is looking at.
  const hasLoadedRef = useRef(false);

  const refetch = useCallback(async () => {
    if (!user?.uid || !workLogId) {
      setEntries([]);
      hasLoadedRef.current = false;
      return;
    }

    if (!hasLoadedRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      // Data Connect's generated React query hooks default to a
      // "prefer cache" fetch policy that mutations never invalidate, so a
      // plain refetch() from those hooks can return a stale snapshot
      // forever. Fetching directly with SERVER_ONLY guarantees we always
      // see the latest data after a save.
      const result = await listTimeEntriesByWorkLog(
        { workLogId },
        { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }
      );
      setEntries(toWorkLogTimeEntries(result.data.timeEntries));
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load time entries");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, workLogId]);

  useEffect(() => {
    hasLoadedRef.current = false;
    // Legitimate fetch-on-mount/param-change; `refetch` is also exposed to
    // callers (e.g. to re-run after a mutation), so it can't be restructured
    // to avoid touching state from here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workLogId, user?.uid]);

  return { entries, loading, error, refetch };
}
