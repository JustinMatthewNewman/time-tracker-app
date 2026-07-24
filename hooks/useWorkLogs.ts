"use client";

import { useCallback, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import { useTickets } from "@/context/TicketsContext";
import type { ParsedHourBlock } from "@/lib/workLogParser";
import {
  useGetMyUser,
  useCreateWorkLog,
  useCreateWorkLogOnly,
  useCreateTimeEntry,
  useUpdateWorkLog,
  useDeleteWorkLog,
} from "@/src/dataconnect-generated/react";
import { listWorkLogs } from "@/src/dataconnect-generated";
import type {
  ListWorkLogsData,
  ListWorkLogsVariables,
  CreateWorkLogVariables,
  CreateWorkLogOnlyVariables,
  CreateTimeEntryVariables,
  UpdateWorkLogVariables,
  DeleteWorkLogVariables,
} from "@/src/dataconnect-generated";
import { fetchAllPages } from "@/lib/dataconnectPagination";

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

// Turns a parsed block's minutes-since-midnight offset into an absolute
// Timestamp by shifting the work log's local-midnight ISO instant — the same
// approach CreateWorkLog's server-side `vars.workLogDate + duration(...)`
// takes, just computed client-side since these offsets are arbitrary
// (not fixed 15-min increments).
function addMinutesToIso(workLogDateIso: string, minutes: number): string {
  return new Date(new Date(workLogDateIso).getTime() + minutes * 60_000).toISOString();
}

export function useWorkLogs() {
  const { user } = useAuth();
  const { ensureTicketsExist } = useTickets();

  const myUserQuery = useGetMyUser({ enabled: !!user?.uid });
  const createMutation = useCreateWorkLog();
  const createWorkLogOnlyMutation = useCreateWorkLogOnly();
  const createTimeEntryMutation = useCreateTimeEntry();
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
      const logs = await fetchAllPages<ListWorkLogsVariables, ListWorkLogsData["workLogs"][number]>(
        (vars) => listWorkLogs(vars, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }).then((r) => r.data.workLogs),
        {}
      );
      setWorkLogs(toWorkLogData(logs));
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
    async (data: {
      name: string;
      workLogDate: string;
      description?: string;
      // Present when the user pasted/uploaded a work log in NewWorkLogDialog.
      // Replaces the usual fixed 15-min blank template with exactly the
      // entries parsed from their text.
      parsedBlocks?: ParsedHourBlock[];
    }) => {
      const myUserId = myUserQuery.data?.user?.id;
      if (!myUserId) throw new Error("User profile not found");

      const workLogId = crypto.randomUUID();
      const hasParsedEntries = !!data.parsedBlocks?.some((block) => block.entries.length > 0);

      if (hasParsedEntries) {
        await createWorkLogOnlyMutation.mutateAsync({
          userId: myUserId,
          workLogId,
          name: data.name,
          workLogDate: data.workLogDate,
          description: data.description || undefined,
        } as CreateWorkLogOnlyVariables);

        const entries = data.parsedBlocks!.flatMap((block) => block.entries);
        const ticketNumbers = entries
          .map((entry) => entry.ticketNumber)
          .filter((n): n is number => n != null);
        await ensureTicketsExist(ticketNumbers);

        const now = new Date().toISOString();
        await Promise.all(
          entries.map((entry) =>
            createTimeEntryMutation.mutateAsync({
              userId: myUserId,
              workLogId,
              startTime: addMinutesToIso(data.workLogDate, entry.startMinutes),
              endTime: addMinutesToIso(data.workLogDate, entry.endMinutes),
              date: data.workLogDate,
              createdAt: now,
              description: entry.description || undefined,
              ticketNumber: entry.ticketNumber ?? undefined,
            } as CreateTimeEntryVariables)
          )
        );
      } else {
        await createMutation.mutateAsync({
          userId: myUserId,
          workLogId,
          name: data.name,
          workLogDate: data.workLogDate,
          description: data.description || undefined,
        } as CreateWorkLogVariables);
      }

      await refetch();
      // Data Connect always returns UUIDs with hyphens stripped, but
      // crypto.randomUUID() produces the hyphenated form. Returning the raw
      // client id here means callers who use it to select/highlight the new
      // row (e.g. ListBoxComponent) never find a match against workLogs[].id,
      // so the new entry silently never appears selected.
      return { workLogId: workLogId.replace(/-/g, "") };
    },
    [myUserQuery.data, createMutation, createWorkLogOnlyMutation, createTimeEntryMutation, ensureTicketsExist, refetch]
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
