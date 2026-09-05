"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSelectMyTicketColorsEnabled } from "@/src/dataconnect-generated/react";
import { useUserSettings } from "./UserSettingsContext";

type TicketColorsContextType = {
  ticketColorsEnabled: boolean;
  setTicketColorsEnabled: (value: boolean) => void;
};

const TicketColorsContext = createContext<TicketColorsContextType | null>(null);

// Whether a ticket's assigned color (Ticket.color) tints the surfaces it
// appears on. Persisted per account, exactly like bordersEnabled — same
// fire-and-forget write, and the same default-to-true-until-loaded so the app
// doesn't flash uncolored before the DB value arrives.
//
// Purely a display switch: turning it off never clears a ticket's color. The
// color is shared data, this preference is personal, so muting the tints
// affects only the person who did it.
export function TicketColorsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { ticketColorsEnabled: dbTicketColorsEnabled, refetch } = useUserSettings();
  const [ticketColorsEnabled, setStateValue] = useState(true);
  const selectMutation = useSelectMyTicketColorsEnabled();

  // Guards a real race. The stored value arrives asynchronously, and the
  // switch is interactive from first paint — so a user who lands on Settings
  // and clicks immediately can have their click silently undone by the
  // in-flight fetch resolving a moment later and writing the old value back
  // over it. Caught by the browser test, which toggled fast enough to hit it
  // intermittently.
  //
  // Once either side has spoken — the fetch has hydrated, or the user has
  // chosen — the DB value stops being applied. User intent wins over a
  // response that was already stale when it landed.
  //
  // NOTE: the sibling preference providers (BordersProvider,
  // PerformanceModeProvider, ...) share the original pattern and therefore the
  // same latent race; only this one is fixed here.
  const settledRef = useRef(false);

  useEffect(() => {
    if (dbTicketColorsEnabled == null || settledRef.current) return;
    settledRef.current = true;
    setStateValue(dbTicketColorsEnabled);
  }, [dbTicketColorsEnabled]);

  const setTicketColorsEnabled = useCallback(
    (value: boolean) => {
      settledRef.current = true;
      setStateValue(value);
      // Fire-and-forget: local state already drives the UI, so the toggle
      // doesn't wait on the round trip.
      if (user?.uid) {
        selectMutation.mutate({ ticketColorsEnabled: value }, { onSuccess: () => refetch() });
      }
    },
    [user?.uid, selectMutation, refetch]
  );

  return (
    <TicketColorsContext.Provider value={{ ticketColorsEnabled, setTicketColorsEnabled }}>
      {children}
    </TicketColorsContext.Provider>
  );
}

export function useTicketColorsSetting() {
  const ctx = useContext(TicketColorsContext);
  if (!ctx) {
    throw new Error("useTicketColorsSetting must be used within a TicketColorsProvider");
  }
  return ctx;
}
