"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSelectMyShowEntryCounts } from "@/src/dataconnect-generated/react";
import { useUserSettings } from "./UserSettingsContext";

type EntryCountsContextType = {
  showEntryCounts: boolean;
  setShowEntryCounts: (value: boolean) => void;
};

const EntryCountsContext = createContext<EntryCountsContextType | null>(null);

// Whether ticket breakdowns show their per-ticket entry *count* alongside the
// time totals — the "Entries" table column and the paired bar in
// TicketBarChart. Persisted per-account exactly like bordersEnabled (see
// BordersContext for the pattern this mirrors: local state for an instant
// toggle, fire-and-forget mutation behind it, refetch on success).
//
// Defaults to true until the DB value loads, matching the column default, so
// the table doesn't render without the column and then grow one — which reads
// as a layout glitch rather than as a preference being applied.
export function EntryCountsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showEntryCounts: dbShowEntryCounts, refetch } = useUserSettings();
  const [showEntryCounts, setShowEntryCountsState] = useState(true);
  const selectMutation = useSelectMyShowEntryCounts();

  useEffect(() => {
    if (dbShowEntryCounts == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowEntryCountsState(dbShowEntryCounts);
  }, [dbShowEntryCounts]);

  const setShowEntryCounts = useCallback(
    (value: boolean) => {
      setShowEntryCountsState(value);
      // Fire-and-forget: the table already re-rendered from local state above.
      if (user?.uid) {
        selectMutation.mutate({ showEntryCounts: value }, { onSuccess: () => refetch() });
      }
    },
    [user?.uid, selectMutation, refetch]
  );

  return (
    <EntryCountsContext.Provider value={{ showEntryCounts, setShowEntryCounts }}>
      {children}
    </EntryCountsContext.Provider>
  );
}

export function useEntryCounts() {
  const ctx = useContext(EntryCountsContext);
  if (!ctx) {
    throw new Error("useEntryCounts must be used within an EntryCountsProvider");
  }
  return ctx;
}
