"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import { useFeatures } from "./useFeatures";
import { listTimeEntriesByTicket } from "@/src/dataconnect-generated";
import type { ListTimeEntriesByTicketData } from "@/src/dataconnect-generated";

export interface TicketTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string | null;
  /** Openable work log. Only ever set for the viewer's own entries. */
  workLog?: { id: string; name: string } | null;
  /** Work log name, including for other people's rows, which aren't openable. */
  workLogName?: string | null;
  createdAt: string;
  /** Whether this row belongs to the signed-in user. */
  isMine: boolean;
  /** Who logged it. Null in the own-only view, where there is nobody to name. */
  username: string | null;
}

interface TicketEntriesApiRow {
  id: string;
  isMine: boolean;
  username: string;
  startTime: string;
  endTime: string;
  date: string;
  description: string | null;
  workLog: { id: string; name: string } | null;
  workLogName: string | null;
  createdAt: string;
}

function toOwnTicketTimeEntries(
  timeEntries: ListTimeEntriesByTicketData["timeEntries"]
): TicketTimeEntry[] {
  return timeEntries.map((entry) => ({
    id: entry.id,
    startTime: entry.startTime,
    endTime: entry.endTime,
    date: entry.date,
    description: entry.description || "",
    workLog: entry.workLog ? { id: entry.workLog.id, name: entry.workLog.name } : null,
    workLogName: entry.workLog?.name ?? null,
    createdAt: entry.createdAt,
    // This query binds every row to auth.uid, so they are all the viewer's.
    isMine: true,
    username: null,
  }));
}

/**
 * Time entries on one ticket.
 *
 * Two sources, chosen by the TicketAllUsers grant:
 *
 *   held    — GET /api/tickets/[n]/entries, every user's entries, each row
 *             flagged isMine by the server from the verified token.
 *   not held — ListTimeEntriesByTicket, bound to auth.uid, as before.
 *
 * The grant is only deciding which request to make. The server re-checks it
 * (requireFeature) and the underlying cross-user query is NO_ACCESS, so a
 * client that lies about holding it gets a 403 and falls back — which is also
 * what happens if the grant is revoked mid-session.
 */
export function useTimeEntriesByTicket(ticketNumber: number | null) {
  const { user } = useAuth();
  const { features, loading: featuresLoading, error: featuresError } = useFeatures();
  const [entries, setEntries] = useState<TicketTimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState(false);

  // On a features error we do not know what the caller holds, and an empty set
  // is indistinguishable from a genuine denial (see useFeatures). Fall back to
  // the own-only view rather than firing a request that would 403.
  const wantsAllUsers = !featuresError && features.has("TicketAllUsers");

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
      if (wantsAllUsers) {
        const token = await user.getIdToken();
        const res = await fetch(`/api/tickets/${ticketNumber}/entries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const body = (await res.json()) as { entries: TicketEntriesApiRow[] };
          setEntries(
            body.entries.map((entry) => ({
              id: entry.id,
              startTime: entry.startTime,
              endTime: entry.endTime,
              date: entry.date,
              description: entry.description || "",
              workLog: entry.workLog,
              workLogName: entry.workLogName,
              createdAt: entry.createdAt,
              isMine: entry.isMine,
              username: entry.username,
            }))
          );
          setAllUsers(true);
          hasLoadedRef.current = true;
          return;
        }
        // 403 means the grant went away (or never really applied). That is an
        // ordinary outcome, not an error to show — drop to the own-only view.
        if (res.status !== 403) {
          throw new Error(`Failed to load time entries (${res.status})`);
        }
      }

      // SERVER_ONLY for the same reason as useTimeEntriesByWorkLog: the
      // generated React query hooks' default fetch policy never gets
      // invalidated by mutations, so a direct call is needed to see fresh data.
      const result = await listTimeEntriesByTicket(
        { ticketNumber },
        { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }
      );
      setEntries(toOwnTicketTimeEntries(result.data.timeEntries));
      setAllUsers(false);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load time entries");
    } finally {
      setLoading(false);
    }
    // `user` in full rather than user?.uid: the all-users path calls
    // user.getIdToken(). refetch is only invoked from the effect below and
    // from an edit callback, so a new identity here cannot loop a render.
  }, [user, ticketNumber, wantsAllUsers]);

  useEffect(() => {
    // Held until the grant is known, so the page doesn't fetch the own-only
    // view first and then visibly swap in everyone else's rows.
    if (featuresLoading) return;
    hasLoadedRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketNumber, user?.uid, wantsAllUsers, featuresLoading]);

  return { entries, loading: loading || featuresLoading, error, refetch, allUsers };
}
