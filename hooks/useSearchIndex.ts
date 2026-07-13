"use client";

import { useCallback, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "./useAuth";
import { useMyTimeEntries } from "./useMyTimeEntries";
import { listWorkLogs } from "@/src/dataconnect-generated";

export interface SearchWorkLog {
  id: string;
  name: string;
  workLogDate: string;
}

// Backs the global search bar: work log titles (which useMyTimeEntries
// doesn't cover — a work log with zero entries would otherwise be invisible
// to search) plus every time entry's description, ticket, and parent work
// log name/id.
export function useSearchIndex() {
  const { user } = useAuth();
  const [workLogs, setWorkLogs] = useState<SearchWorkLog[]>([]);
  const [workLogsLoading, setWorkLogsLoading] = useState(false);
  const { entries: timeEntries, loading: entriesLoading, refetch: refetchEntries } = useMyTimeEntries();

  const refetchWorkLogs = useCallback(async () => {
    if (!user?.uid) {
      setWorkLogs([]);
      return;
    }
    setWorkLogsLoading(true);
    try {
      const result = await listWorkLogs({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
      setWorkLogs(
        result.data.workLogs.map((log) => ({ id: log.id, name: log.name, workLogDate: log.workLogDate }))
      );
    } finally {
      setWorkLogsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetchWorkLogs();
  }, [refetchWorkLogs]);

  // Exposed so the search bar can pull a fresh snapshot right as it opens
  // rather than relying on whatever was fetched when this hook first
  // mounted — otherwise a work log/entry created earlier in the same
  // session wouldn't show up in search until a full page reload.
  const refresh = useCallback(() => {
    refetchWorkLogs();
    refetchEntries();
  }, [refetchWorkLogs, refetchEntries]);

  return {
    workLogs,
    timeEntries,
    loading: workLogsLoading || entriesLoading,
    refresh,
  };
}
