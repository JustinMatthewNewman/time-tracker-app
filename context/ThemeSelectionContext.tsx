"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "@/hooks/useAuth";
import {
  useListColorSchemes,
  useSelectMyColorScheme,
  useClearMyColorScheme,
} from "@/src/dataconnect-generated/react";
import { getMyUser } from "@/src/dataconnect-generated";
import type { SelectMyColorSchemeVariables } from "@/src/dataconnect-generated";

// Mirrors HeroUI's base semantic color tokens (@heroui/styles
// themes/default/variables.css) — hover/soft/secondary variants all derive
// from these via color-mix(), so applying just these re-themes everything.
export interface ThemeVariant {
  id: string;
  isDark: boolean;
  background: string;
  foreground: string;
  surface: string;
  surfaceForeground: string;
  overlay: string;
  overlayForeground: string;
  muted: string;
  default: string;
  defaultForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  separator: string;
}

export interface ColorSchemeOption {
  id: string;
  name: string;
  variants: ThemeVariant[];
}

export function getVariant(scheme: ColorSchemeOption | null, isDark: boolean): ThemeVariant | null {
  if (!scheme) return null;
  return scheme.variants.find((v) => v.isDark === isDark) ?? null;
}

type ThemeSelectionContextType = {
  schemes: ColorSchemeOption[];
  selectedScheme: ColorSchemeOption | null;
  selectScheme: (colorSchemeId: string) => Promise<void>;
  clearScheme: () => Promise<void>;
  loading: boolean;
};

const ThemeSelectionContext = createContext<ThemeSelectionContextType | null>(null);

// Single source of truth for the signed-in user's color scheme selection.
// DbThemeApplier and SettingsCard both need this value; without a shared
// context each would hold its own independent fetch state, so a selection
// made in one would never be visible to the other until a full page reload.
export function ThemeSelectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const listQuery = useListColorSchemes({ enabled: !!user?.uid });
  const selectMutation = useSelectMyColorScheme();
  const clearMutation = useClearMyColorScheme();

  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const schemes: ColorSchemeOption[] = (listQuery.data?.colorSchemes ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    variants: s.themes,
  }));
  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId) ?? null;

  // Data Connect's generated React query hooks default to a "prefer cache"
  // fetch policy that mutations never invalidate (see useTimeEntriesByWorkLog
  // for the same issue with time entries), so a plain refetch() can return a
  // stale selection forever. Fetching directly with SERVER_ONLY guarantees
  // this reflects the latest selection.
  const refetchMyScheme = useCallback(async () => {
    if (!user?.uid) {
      setSelectedSchemeId(null);
      return;
    }
    setLoadingUser(true);
    try {
      const result = await getMyUser({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
      setSelectedSchemeId(result.data.user?.colorScheme?.id ?? null);
    } finally {
      setLoadingUser(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetchMyScheme();
  }, [refetchMyScheme]);

  const selectScheme = useCallback(
    async (colorSchemeId: string) => {
      await selectMutation.mutateAsync({ colorSchemeId } as SelectMyColorSchemeVariables);
      await refetchMyScheme();
    },
    [selectMutation, refetchMyScheme]
  );

  const clearScheme = useCallback(async () => {
    await clearMutation.mutateAsync(undefined);
    await refetchMyScheme();
  }, [clearMutation, refetchMyScheme]);

  return (
    <ThemeSelectionContext.Provider
      value={{
        schemes,
        selectedScheme,
        selectScheme,
        clearScheme,
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
