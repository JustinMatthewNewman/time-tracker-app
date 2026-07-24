"use client";

import { useCallback, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import { listMyTimeEntries } from "@/src/dataconnect-generated";
import type { ListMyTimeEntriesData, ListMyTimeEntriesVariables } from "@/src/dataconnect-generated";
import { fetchAllPages } from "@/lib/dataconnectPagination";

export interface MyTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  description?: string | null;
  ticket?: { ticketNumber: number; ticketLink?: string | null } | null;
  officeNumber?: string | null;
  workLogId?: string | null;
  workLogName?: string | null;
}

export function useMyTimeEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MyTimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.uid) {
      setEntries([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // See hooks/useTimeEntriesByWorkLog.ts: Data Connect's generated React
      // query hooks default to a "prefer cache" fetch policy that mutations
      // never invalidate. SERVER_ONLY guarantees fresh totals on every load.
      // fetchAllPages guards against the 500-row default cutting off entries
      // beyond the first page (see lib/dataconnectPagination.ts).
      const timeEntries = await fetchAllPages<
        ListMyTimeEntriesVariables,
        ListMyTimeEntriesData["timeEntries"][number]
      >(
        (vars) => listMyTimeEntries(vars, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }).then((r) => r.data.timeEntries),
        {}
      );
      setEntries(
        timeEntries.map((entry) => ({
          id: entry.id,
          startTime: entry.startTime,
          endTime: entry.endTime,
          description: entry.description ?? null,
          ticket: entry.ticket ?? null,
          officeNumber: entry.officeNumber || "",
          workLogId: entry.workLog?.id ?? null,
          workLogName: entry.workLog?.name ?? null,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load time entries");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return { entries, loading, error, refetch };
}
