"use client";

import { createContext, useContext, useState } from "react";

type SelectedWorkLogContextType = {
  selectedWorkLogId: string | null;
  setSelectedWorkLogId: (id: string | null) => void;
};

const SelectedWorkLogContext = createContext<SelectedWorkLogContextType | null>(null);

export function SelectedWorkLogProvider({ children }: { children: React.ReactNode }) {
  const [selectedWorkLogId, setSelectedWorkLogId] = useState<string | null>(null);

  return (
    <SelectedWorkLogContext.Provider value={{ selectedWorkLogId, setSelectedWorkLogId }}>
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
