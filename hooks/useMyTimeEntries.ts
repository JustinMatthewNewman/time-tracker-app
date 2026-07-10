"use client";

import { useCallback, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import { listMyTimeEntries } from "@/src/dataconnect-generated";

export interface MyTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  ticketNumber?: string | null;
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
      const result = await listMyTimeEntries({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
      setEntries(
        result.data.timeEntries.map((entry) => ({
          id: entry.id,
          startTime: entry.startTime,
          endTime: entry.endTime,
          ticketNumber: entry.ticketNumber || "",
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
