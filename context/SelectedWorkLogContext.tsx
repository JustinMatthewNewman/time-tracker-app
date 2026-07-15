"use client";

import { createContext, useContext, useState } from "react";

type SelectedWorkLogContextType = {
  selectedWorkLogId: string | null;
  setSelectedWorkLogId: (id: string | null) => void;
  // One-shot "scroll to and flash this entry" signal set by the search bar
  // when a time-entry result is picked. WorkLogTimeEntryCardLayout consumes
  // it (auto-expanding the entry's hour block) and clears it once handled,
  // so it doesn't linger and re-trigger on unrelated re-renders.
  focusEntryId: string | null;
  setFocusEntryId: (id: string | null) => void;
};

const SelectedWorkLogContext = createContext<SelectedWorkLogContextType | null>(null);

export function SelectedWorkLogProvider({ children }: { children: React.ReactNode }) {
  const [selectedWorkLogId, setSelectedWorkLogId] = useState<string | null>(null);
  const [focusEntryId, setFocusEntryId] = useState<string | null>(null);

  return (
    <SelectedWorkLogContext.Provider
      value={{ selectedWorkLogId, setSelectedWorkLogId, focusEntryId, setFocusEntryId }}
    >
      {children}
    </SelectedWorkLogContext.Provider>
  );
}

export function useSelectedWorkLog() {
  const ctx = useContext(SelectedWorkLogContext);
  if (!ctx) {
    throw new Error("useSelectedWorkLog must be used within a SelectedWorkLogProvider");
  }
  return ctx;
}
