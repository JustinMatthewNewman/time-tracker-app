"use client";

import { useCallback, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import {
  useGetMyUser,
  useCreateWorkLog,
  useUpdateWorkLog,
  useDeleteWorkLog,
} from "@/src/dataconnect-generated/react";
import { listWorkLogs } from "@/src/dataconnect-generated";
import type {
  ListWorkLogsData,
  CreateWorkLogVariables,
  UpdateWorkLogVariables,
  DeleteWorkLogVariables,
} from "@/src/dataconnect-generated";

export interface WorkLogData {
  id: string;
  name: string;
  description?: string | null;
  workLogDate: string;
  createdAt: string;
}

function toWorkLogData(logs: ListWorkLogsData["workLogs"]): WorkLogData[] {
  return logs.map((log) => ({
    id: log.id,
    name: log.name,
    description: log.description || "",
    workLogDate: log.workLogDate,
    createdAt: log.createdAt,
  }));
}

export function useWorkLogs() {
  const { user } = useAuth();

  const myUserQuery = useGetMyUser({ enabled: !!user?.uid });
  const createMutation = useCreateWorkLog();
  const updateMutation = useUpdateWorkLog();
  const deleteMutation = useDeleteWorkLog();

  const [workLogs, setWorkLogs] = useState<WorkLogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data Connect's generated React query hooks default to a "prefer cache"
  // fetch policy that mutations never invalidate (see useTimeEntriesByWorkLog
  // for the same issue), so a plain refetch() from useListWorkLogs can return
  // a stale list forever after a create/rename/delete. SERVER_ONLY guarantees
  // the sidebar reflects the latest state.
  const refetch = useCallback(async () => {
    if (!user?.uid) {
      setWorkLogs([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await listWorkLogs({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
      setWorkLogs(toWorkLogData(result.data.workLogs));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load work logs");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const createWorkLog = useCallback(
    async (data: { name: string; workLogDate: string; description?: string }) => {
      const myUserId = myUserQuery.data?.user?.id;
      if (!myUserId) throw new Error("User profile not found");

      const workLogId = crypto.randomUUID();

      await createMutation.mutateAsync({
        userId: myUserId,
        workLogId,
        name: data.name,
        workLogDate: data.workLogDate,
        description: data.description || undefined,
      } as CreateWorkLogVariables);

      await refetch();
      // Data Connect always returns UUIDs with hyphens stripped, but
      // crypto.randomUUID() produces the hyphenated form. Returning the raw
      // client id here means callers who use it to select/highlight the new
      // row (e.g. ListBoxComponent) never find a match against workLogs[].id,
      // so the new entry silently never appears selected.
      return { workLogId: workLogId.replace(/-/g, "") };
    },
    [myUserQuery.data, createMutation, refetch]
  );

  const renameWorkLog = useCallback(
    async (workLogId: string, name: string) => {
      await updateMutation.mutateAsync({ workLogId, name } as UpdateWorkLogVariables);
      await refetch();
    },
    [updateMutation, refetch]
  );

  const deleteWorkLog = useCallback(
    async (workLogId: string) => {
      await deleteMutation.mutateAsync({ workLogId } as DeleteWorkLogVariables);
      await refetch();
    },
    [deleteMutation, refetch]
  );

  return {
    workLogs,
    loading,
    error,
    refetch,
    createWorkLog,
    renameWorkLog,
    deleteWorkLog,
  };
}
