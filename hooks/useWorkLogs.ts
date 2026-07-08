"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useListWorkLogs } from "@/src/dataconnect-generated/react";
import type { ListWorkLogsData } from "@/src/dataconnect-generated";

export interface WorkLogData {
  id: string;
  name: string;
  description?: string | null;
  workLogDate: string;
  createdAt: string;
}

export function useWorkLogs() {
  const { user } = useAuth();

  const listQuery = useListWorkLogs({ enabled: !!user?.uid });

  const workLogs = useMemo<WorkLogData[]>(
    () =>
      (listQuery.data?.workLogs ?? []).map(
        (log: ListWorkLogsData["workLogs"][number]) => ({
          id: log.id,
          name: log.name,
          description: log.description || "",
          workLogDate: log.workLogDate,
          createdAt: log.createdAt,
        })
      ),
    [listQuery.data]
  );

  return {
    workLogs,
    loading: listQuery.isPending,
    error: listQuery.error?.message || null,
    refetch: listQuery.refetch,
  };
}
