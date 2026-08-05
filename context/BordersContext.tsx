"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSelectMyBordersEnabled } from "@/src/dataconnect-generated/react";
import { useUserSettings } from "./UserSettingsContext";

type BordersContextType = {
  bordersEnabled: boolean;
  setBordersEnabled: (value: boolean) => void;
};

const BordersContext = createContext<BordersContextType | null>(null);

// Toggles the Card/table border outline app-wide (see the "no-borders"
// rules in globals.css), persisted per-account like performanceMode.
// Defaults to true (borders on, matching the app's normal look) until the
// DB value loads, rather than flashing borderless first.
export function BordersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { bordersEnabled: dbBordersEnabled, refetch } = useUserSettings();
  const [bordersEnabled, setBordersEnabledState] = useState(true);
  const selectMutation = useSelectMyBordersEnabled();

  useEffect(() => {
    if (dbBordersEnabled == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBordersEnabledState(dbBordersEnabled);
  }, [dbBordersEnabled]);

  useEffect(() => {
    document.documentElement.classList.toggle("no-borders", !bordersEnabled);
  }, [bordersEnabled]);

  const setBordersEnabled = useCallback(
    (value: boolean) => {
      setBordersEnabledState(value);
      // Fire-and-forget: the UI already reflects the change from local
      // state above, so the mutation doesn't need to block the toggle.
      if (user?.uid) {
        selectMutation.mutate({ bordersEnabled: value }, { onSuccess: () => refetch() });
      }
    },
    [user?.uid, selectMutation, refetch]
  );

  return (
    <BordersContext.Provider value={{ bordersEnabled, setBordersEnabled }}>
      {children}
    </BordersContext.Provider>
  );
}

export function useBorders() {
  const ctx = useContext(BordersContext);
  if (!ctx) {
    throw new Error("useBorders must be used within a BordersProvider");
  }
  return ctx;
}
