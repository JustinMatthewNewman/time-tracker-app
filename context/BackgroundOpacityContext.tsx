"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSelectMyBackgroundOpacity } from "@/src/dataconnect-generated/react";
import { useUserSettings } from "./UserSettingsContext";

const DEFAULT_OPACITY = 100;
const SAVE_DEBOUNCE_MS = 400;

type BackgroundOpacityContextType = {
  backgroundOpacity: number;
  setBackgroundOpacity: (value: number) => void;
};

const BackgroundOpacityContext = createContext<BackgroundOpacityContextType | null>(null);

// Percentage multiplier applied on top of each page's own AmbientBackground
// intensity prop, persisted on the User table like performanceMode. Writes
// to the DB are debounced (a slider drag fires many changes per second) —
// the visual itself updates instantly from local state regardless.
export function BackgroundOpacityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { backgroundOpacity: dbBackgroundOpacity, refetch } = useUserSettings();
  const [backgroundOpacity, setBackgroundOpacityState] = useState(DEFAULT_OPACITY);
  const selectMutation = useSelectMyBackgroundOpacity();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dbBackgroundOpacity == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBackgroundOpacityState(dbBackgroundOpacity);
  }, [dbBackgroundOpacity]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const setBackgroundOpacity = useCallback(
    (value: number) => {
      setBackgroundOpacityState(value);
      if (!user?.uid) return;

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        selectMutation.mutate({ backgroundOpacity: value }, { onSuccess: () => refetch() });
      }, SAVE_DEBOUNCE_MS);
    },
    [user?.uid, selectMutation, refetch]
  );

  return (
    <BackgroundOpacityContext.Provider value={{ backgroundOpacity, setBackgroundOpacity }}>
      {children}
    </BackgroundOpacityContext.Provider>
  );
}

export function useBackgroundOpacity() {
  const ctx = useContext(BackgroundOpacityContext);
  if (!ctx) {
    throw new Error("useBackgroundOpacity must be used within a BackgroundOpacityProvider");
  }
  return ctx;
}
