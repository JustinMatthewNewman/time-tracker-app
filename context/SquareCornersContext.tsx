"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSelectMySquareCorners } from "@/src/dataconnect-generated/react";
import { useUserSettings } from "./UserSettingsContext";

type SquareCornersContextType = {
  squareCorners: boolean;
  setSquareCorners: (value: boolean) => void;
};

const SquareCornersContext = createContext<SquareCornersContextType | null>(null);

// Squares off corners app-wide (see the .square-corners rules in globals.css),
// persisted per-account like bordersEnabled.
//
// Defaults to false until the DB value loads, matching the app's normal
// rounded look — the same reasoning as BordersProvider defaulting to true:
// start on the familiar appearance so nothing flashes into a different style
// and back.
export function SquareCornersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { squareCorners: dbSquareCorners, refetch } = useUserSettings();
  const [squareCorners, setSquareCornersState] = useState(false);
  const selectMutation = useSelectMySquareCorners();

  useEffect(() => {
    if (dbSquareCorners == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSquareCornersState(dbSquareCorners);
  }, [dbSquareCorners]);

  useEffect(() => {
    document.documentElement.classList.toggle("square-corners", squareCorners);
  }, [squareCorners]);

  const setSquareCorners = useCallback(
    (value: boolean) => {
      setSquareCornersState(value);
      // Fire-and-forget: local state already drives the UI, so the mutation
      // doesn't block the toggle.
      if (user?.uid) {
        selectMutation.mutate({ squareCorners: value }, { onSuccess: () => refetch() });
      }
    },
    [user?.uid, selectMutation, refetch]
  );

  return (
    <SquareCornersContext.Provider value={{ squareCorners, setSquareCorners }}>
      {children}
    </SquareCornersContext.Provider>
  );
}

export function useSquareCorners() {
  const ctx = useContext(SquareCornersContext);
  if (!ctx) {
    throw new Error("useSquareCorners must be used within a SquareCornersProvider");
  }
  return ctx;
}
