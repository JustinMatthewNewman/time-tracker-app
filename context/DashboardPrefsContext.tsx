"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useSelectMyDashboardShowWeekends,
  useSelectMyDashboardTimelineView,
} from "@/src/dataconnect-generated/react";
import { useUserSettings } from "./UserSettingsContext";

type DashboardPrefsContextType = {
  showWeekends: boolean;
  setShowWeekends: (value: boolean) => void;
  /** False = ranked tickets per day; true = 15-minute slot timeline. */
  timelineView: boolean;
  setTimelineView: (value: boolean) => void;
};

const DashboardPrefsContext = createContext<DashboardPrefsContextType | null>(null);

// Per-account display preferences for the dashboard Overview, persisted the
// same way as borders/squareCorners (see BordersContext for the pattern this
// mirrors exactly: local state for an instant toggle, fire-and-forget mutation
// behind it, refetch on success).
//
// Defaults to false (weekends hidden) until the DB value loads — matching the
// column default — so the breakdown row doesn't render 7 columns and then snap
// back to 5, which reads as a glitch.
export function DashboardPrefsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const {
    dashboardShowWeekends: dbShowWeekends,
    dashboardTimelineView: dbTimelineView,
    refetch,
  } = useUserSettings();
  const [showWeekends, setShowWeekendsState] = useState(false);
  const [timelineView, setTimelineViewState] = useState(false);
  const selectMutation = useSelectMyDashboardShowWeekends();
  const timelineMutation = useSelectMyDashboardTimelineView();

  useEffect(() => {
    if (dbShowWeekends == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowWeekendsState(dbShowWeekends);
  }, [dbShowWeekends]);

  useEffect(() => {
    if (dbTimelineView == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimelineViewState(dbTimelineView);
  }, [dbTimelineView]);

  const setShowWeekends = useCallback(
    (value: boolean) => {
      setShowWeekendsState(value);
      // Fire-and-forget: the row already re-rendered from local state above,
      // so the mutation doesn't need to block the toggle.
      if (user?.uid) {
        selectMutation.mutate({ dashboardShowWeekends: value }, { onSuccess: () => refetch() });
      }
    },
    [user?.uid, selectMutation, refetch]
  );

  const setTimelineView = useCallback(
    (value: boolean) => {
      setTimelineViewState(value);
      if (user?.uid) {
        timelineMutation.mutate({ dashboardTimelineView: value }, { onSuccess: () => refetch() });
      }
    },
    [user?.uid, timelineMutation, refetch]
  );

  return (
    <DashboardPrefsContext.Provider value={{ showWeekends, setShowWeekends, timelineView, setTimelineView }}>
      {children}
    </DashboardPrefsContext.Provider>
  );
}

export function useDashboardPrefs() {
  const ctx = useContext(DashboardPrefsContext);
  if (!ctx) {
    throw new Error("useDashboardPrefs must be used within a DashboardPrefsProvider");
  }
  return ctx;
}
