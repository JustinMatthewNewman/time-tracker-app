"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "@/hooks/useAuth";
import { useSelectMyPerformanceMode } from "@/src/dataconnect-generated/react";
import { getMyUser } from "@/src/dataconnect-generated";

const STORAGE_KEY = "performanceMode";

type PerformanceModeContextType = {
  performanceMode: boolean;
  setPerformanceMode: (value: boolean) => void;
};

const PerformanceModeContext = createContext<PerformanceModeContextType | null>(null);

// Persisted per-account on the User table (like colorScheme, see
// ThemeSelectionContext) so it follows the signed-in user across devices.
// Still mirrored to localStorage as an instant paint before the DB value
// loads and as the only source for the signed-out landing page.
export function PerformanceModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [performanceMode, setPerformanceModeState] = useState(false);
  const selectMutation = useSelectMyPerformanceMode();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerformanceModeState(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;

    // SERVER_ONLY, not the default cache-preferring policy, since a stale
    // cached read here would silently override the value just set below.
    getMyUser({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY }).then((result) => {
      if (cancelled) return;
      const dbValue = result.data.user?.performanceMode;
      if (dbValue != null) {
        setPerformanceModeState(dbValue);
        window.localStorage.setItem(STORAGE_KEY, String(dbValue));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    document.documentElement.classList.toggle("perf-mode", performanceMode);
  }, [performanceMode]);

  const setPerformanceMode = useCallback(
    (value: boolean) => {
      setPerformanceModeState(value);
      window.localStorage.setItem(STORAGE_KEY, String(value));
      if (user?.uid) {
        selectMutation.mutate({ performanceMode: value });
      }
    },
    [user?.uid, selectMutation]
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
