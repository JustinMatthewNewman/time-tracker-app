"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  useListWorkLogs,
  useGetMyUser,
  useCreateWorkLog,
  useUpdateWorkLog,
  useDeleteWorkLog,
} from "@/src/dataconnect-generated/react";
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

export function useWorkLogs() {
  const { user } = useAuth();

  const listQuery = useListWorkLogs({ enabled: !!user?.uid });
  const myUserQuery = useGetMyUser({ enabled: !!user?.uid });
  const createMutation = useCreateWorkLog();
  const updateMutation = useUpdateWorkLog();
  const deleteMutation = useDeleteWorkLog();

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

      await listQuery.refetch();
      return { workLogId };
    },
    [myUserQuery.data, createMutation, listQuery]
  );

  const renameWorkLog = useCallback(
    async (workLogId: string, name: string) => {
      await updateMutation.mutateAsync({ workLogId, name } as UpdateWorkLogVariables);
      await listQuery.refetch();
    },
    [updateMutation, listQuery]
  );

  const deleteWorkLog = useCallback(
    async (workLogId: string) => {
      await deleteMutation.mutateAsync({ workLogId } as DeleteWorkLogVariables);
      await listQuery.refetch();
    },
    [deleteMutation, listQuery]
  );

  return {
    workLogs,
    loading: listQuery.isPending,
    error: listQuery.error?.message || null,
    refetch: listQuery.refetch,
    createWorkLog,
    renameWorkLog,
    deleteWorkLog,
  };
}
