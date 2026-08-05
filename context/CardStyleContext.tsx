"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSelectMyCardStyle } from "@/src/dataconnect-generated/react";
import { useUserSettings } from "./UserSettingsContext";

const DEFAULT_CARD_OPACITY = 100;
const DEFAULT_CARD_BLUR = 0;
const SAVE_DEBOUNCE_MS = 400;

type CardStyleContextType = {
  cardOpacity: number;
  cardBlur: number;
  setCardOpacity: (value: number) => void;
  setCardBlur: (value: number) => void;
};

const CardStyleContext = createContext<CardStyleContextType | null>(null);

// Card background opacity/blur ("frosted glass" look), persisted on the
// User table and applied app-wide via --card-opacity/--card-blur CSS custom
// properties (see .card--default/.card--secondary/.card--tertiary in
// globals.css) rather than threading props through every Card usage. Both
// fields debounce into a single combined SelectMyCardStyle mutation, since
// they're edited together in the same Settings section.
export function CardStyleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { cardOpacity: dbCardOpacity, cardBlur: dbCardBlur, refetch } = useUserSettings();
  const [cardOpacity, setCardOpacityState] = useState(DEFAULT_CARD_OPACITY);
  const [cardBlur, setCardBlurState] = useState(DEFAULT_CARD_BLUR);
  const selectMutation = useSelectMyCardStyle();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The debounced write needs both fields' *current* values, not just
  // whichever one just changed, since the mutation sets both at once.
  const latestRef = useRef({ cardOpacity, cardBlur });
  useEffect(() => {
    latestRef.current = { cardOpacity, cardBlur };
  }, [cardOpacity, cardBlur]);

  useEffect(() => {
    if (dbCardOpacity == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCardOpacityState(dbCardOpacity);
  }, [dbCardOpacity]);

  useEffect(() => {
    if (dbCardBlur == null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCardBlurState(dbCardBlur);
  }, [dbCardBlur]);

  useEffect(() => {
    document.documentElement.style.setProperty("--card-opacity", `${cardOpacity}%`);
  }, [cardOpacity]);

  useEffect(() => {
    document.documentElement.style.setProperty("--card-blur", `${cardBlur}px`);
  }, [cardBlur]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const scheduleSave = useCallback(() => {
    if (!user?.uid) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const { cardOpacity, cardBlur } = latestRef.current;
      selectMutation.mutate({ cardOpacity, cardBlur }, { onSuccess: () => refetch() });
    }, SAVE_DEBOUNCE_MS);
  }, [user?.uid, selectMutation, refetch]);

  const setCardOpacity = useCallback(
    (value: number) => {
      setCardOpacityState(value);
      scheduleSave();
    },
    [scheduleSave]
  );

  const setCardBlur = useCallback(
    (value: number) => {
      setCardBlurState(value);
      scheduleSave();
    },
    [scheduleSave]
  );

  return (
    <CardStyleContext.Provider value={{ cardOpacity, cardBlur, setCardOpacity, setCardBlur }}>
      {children}
    </CardStyleContext.Provider>
  );
}

export function useCardStyle() {
  const ctx = useContext(CardStyleContext);
  if (!ctx) {
    throw new Error("useCardStyle must be used within a CardStyleProvider");
  }
  return ctx;
}
