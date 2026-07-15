"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "performanceMode";

type PerformanceModeContextType = {
  performanceMode: boolean;
  setPerformanceMode: (value: boolean) => void;
};

const PerformanceModeContext = createContext<PerformanceModeContextType | null>(null);

// Purely a client-side device preference (like next-themes' light/dark), so
// it lives in localStorage rather than the Theme/User tables — no schema
// migration or network round-trip needed to read or flip it.
export function PerformanceModeProvider({ children }: { children: React.ReactNode }) {
  const [performanceMode, setPerformanceModeState] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPerformanceModeState(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("perf-mode", performanceMode);
  }, [performanceMode]);

  const setPerformanceMode = useCallback((value: boolean) => {
    setPerformanceModeState(value);
    window.localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

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
