"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSelectMyPerformanceMode } from "@/src/dataconnect-generated/react";
import { useUserSettings } from "./UserSettingsContext";

const STORAGE_KEY = "performanceMode";

type PerformanceModeContextType = {
  performanceMode: boolean;
  setPerformanceMode: (value: boolean) => void;
};

const PerformanceModeContext = createContext<PerformanceModeContextType | null>(null);

// Persisted per-account on the User table (like colorScheme, see
// ThemeSelectionContext) so it follows the signed-in user across devices.
// Still mirrored to localStorage as an instant paint before the DB value
// loads (via UserSettingsContext's shared fetch) and as the only source for
// the signed-out landing page.
export function PerformanceModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { performanceMode: dbPerformanceMode, refetch } = useUserSettings();
  const [performanceMode, setPerformanceModeState] = useState(false);
  const selectMutation = useSelectMyPerformanceMode();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerformanceModeState(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (dbPerformanceMode == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerformanceModeState(dbPerformanceMode);
    window.localStorage.setItem(STORAGE_KEY, String(dbPerformanceMode));
  }, [dbPerformanceMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("perf-mode", performanceMode);
  }, [performanceMode]);

  const setPerformanceMode = useCallback(
    (value: boolean) => {
      setPerformanceModeState(value);
      window.localStorage.setItem(STORAGE_KEY, String(value));
      // Fire-and-forget: the UI already reflects the change from local
      // state above, so the mutation doesn't need to block the toggle.
      if (user?.uid) {
        selectMutation.mutate({ performanceMode: value }, { onSuccess: () => refetch() });
      }
    },
    [user?.uid, selectMutation, refetch]
  );

  return (
    <PerformanceModeContext.Provider value={{ performanceMode, setPerformanceMode }}>
      {children}
    </PerformanceModeContext.Provider>
  );
}

export function usePerformanceMode() {
  const ctx = useContext(PerformanceModeContext);
  if (!ctx) {
    throw new Error("usePerformanceMode must be used within a PerformanceModeProvider");
  }
  return ctx;
}
