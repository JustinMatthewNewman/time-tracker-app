"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useListTimeEntriesByWorkLog } from "@/src/dataconnect-generated/react";
import type { ListTimeEntriesByWorkLogData } from "@/src/dataconnect-generated";

export interface WorkLogTimeEntry {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string | null;
  ticketNumber?: string | null;
  officeNumber?: string | null;
  createdAt: string;
}

export function useTimeEntriesByWorkLog(workLogId: string | null) {
  const { user } = useAuth();

  const listQuery = useListTimeEntriesByWorkLog(
    { workLogId: workLogId || "" },
    { enabled: !!user?.uid && !!workLogId }
  );

  const entries = useMemo<WorkLogTimeEntry[]>(() => {
    if (!workLogId) return [];

    return (listQuery.data?.timeEntries ?? []).map(
      (entry: ListTimeEntriesByWorkLogData["timeEntries"][number]) => ({
        id: entry.id,
        startTime: entry.startTime,
        endTime: entry.endTime,
        date: entry.date,
        description: entry.description || "",
        ticketNumber: entry.ticketNumber || "",
        officeNumber: entry.officeNumber || "",
        createdAt: entry.createdAt,
      })
    );
  }, [listQuery.data, workLogId]);

  return {
    entries,
    loading: listQuery.isPending,
    error: listQuery.error?.message || null,
    refetch: listQuery.refetch,
  };
}
