"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "@/hooks/useAuth";
import {
  useListThemes,
  useSelectMyTheme,
  useClearMyTheme,
} from "@/src/dataconnect-generated/react";
import { getMyUser } from "@/src/dataconnect-generated";
import type { SelectMyThemeVariables } from "@/src/dataconnect-generated";

export interface ThemeOption {
  id: string;
  name: string;
  background: string;
  foreground: string;
  isDark: boolean;
}

type ThemeSelectionContextType = {
  themes: ThemeOption[];
  selectedTheme: ThemeOption | null;
  selectTheme: (themeId: string) => Promise<void>;
  clearTheme: () => Promise<void>;
  loading: boolean;
};

const ThemeSelectionContext = createContext<ThemeSelectionContextType | null>(null);

// Single source of truth for the signed-in user's DB theme selection.
// DbThemeApplier and SettingsCard both need this value; without a shared
// context each would hold its own independent fetch state, so a selection
// made in one would never be visible to the other until a full page reload.
export function ThemeSelectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const listQuery = useListThemes({ enabled: !!user?.uid });
  const selectMutation = useSelectMyTheme();
  const clearMutation = useClearMyTheme();

  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const themes: ThemeOption[] = listQuery.data?.themes ?? [];

  // Data Connect's generated React query hooks default to a "prefer cache"
  // fetch policy that mutations never invalidate (see useTimeEntriesByWorkLog
  // for the same issue with time entries), so a plain refetch() can return a
  // stale theme forever. Fetching directly with SERVER_ONLY guarantees this
  // reflects the latest selection.
  const refetchMyTheme = useCallback(async () => {
    if (!user?.uid) {
      setSelectedTheme(null);
      return;
    }
    setLoadingUser(true);
    try {
      const result = await getMyUser({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
      setSelectedTheme(result.data.user?.theme ?? null);
    } finally {
      setLoadingUser(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetchMyTheme();
  }, [refetchMyTheme]);

  const selectTheme = useCallback(
    async (themeId: string) => {
      await selectMutation.mutateAsync({ themeId } as SelectMyThemeVariables);
      await refetchMyTheme();
    },
    [selectMutation, refetchMyTheme]
  );

  const clearTheme = useCallback(async () => {
    await clearMutation.mutateAsync(undefined);
    await refetchMyTheme();
  }, [clearMutation, refetchMyTheme]);

  return (
    <ThemeSelectionContext.Provider
      value={{
        themes,
        selectedTheme,
        selectTheme,
        clearTheme,
        loading: listQuery.isPending || loadingUser,
      }}
    >
      {children}
    </ThemeSelectionContext.Provider>
  );
}

export function useThemeSelection() {
  const ctx = useContext(ThemeSelectionContext);
  if (!ctx) {
    throw new Error("useThemeSelection must be used within a ThemeSelectionProvider");
  }
  return ctx;
}
