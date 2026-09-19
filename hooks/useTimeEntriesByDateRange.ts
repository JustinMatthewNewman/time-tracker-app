"use client";

import { useCallback, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import { listMyTimeEntriesByDateRange } from "@/src/dataconnect-generated";
import type {
  ListMyTimeEntriesByDateRangeData,
  ListMyTimeEntriesByDateRangeVariables,
} from "@/src/dataconnect-generated";
import { fetchAllPages } from "@/lib/dataconnectPagination";

export interface RangeTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string | null;
  ticket?: { ticketNumber: number; ticketLink?: string | null } | null;
  officeNumber?: string | null;
  createdAt: string;
}

function toRangeTimeEntries(
  timeEntries: ListMyTimeEntriesByDateRangeData["timeEntries"]
): RangeTimeEntry[] {
  return timeEntries.map((entry) => ({
    id: entry.id,
    startTime: entry.startTime,
    endTime: entry.endTime,
    date: entry.date,
    description: entry.description ?? null,
    ticket: entry.ticket ?? null,
    officeNumber: entry.officeNumber || "",
    createdAt: entry.createdAt,
  }));
}

// Windowed time-entry fetch for dashboard widgets (weekly trend, calendar
// heatmap, monthly bars) — scoped to a date range instead of pulling the
// entire multi-year set via useMyTimeEntries() on every widget.
export function useTimeEntriesByDateRange(startDate: string | null, endDate: string | null) {
  // No userId to resolve or pass: ListMyTimeEntriesByDateRange binds its row
  // filter to auth.uid server-side, so the signed-in token decides the scope.
  // That also drops the GetMyUser round trip this hook used to wait on.
  const { user } = useAuth();
  const signedIn = !!user?.uid;

  const [entries, setEntries] = useState<RangeTimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!signedIn || !startDate || !endDate) {
      setEntries([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rows = await fetchAllPages<
        ListMyTimeEntriesByDateRangeVariables,
        ListMyTimeEntriesByDateRangeData["timeEntries"][number]
      >(
        (vars) =>
          listMyTimeEntriesByDateRange(vars, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }).then(
            (r) => r.data.timeEntries
          ),
        { startDate, endDate }
      );
      setEntries(toRangeTimeEntries(rows));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load time entries");
    } finally {
      setLoading(false);
    }
  }, [signedIn, startDate, endDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { entries, loading, error, refetch };
}
