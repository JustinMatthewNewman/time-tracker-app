"use client";

import { createContext, useCallback, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useListColorSchemes,
  useSelectMyColorScheme,
  useClearMyColorScheme,
} from "@/src/dataconnect-generated/react";
import type { SelectMyColorSchemeVariables } from "@/src/dataconnect-generated";
import { useUserSettings } from "./UserSettingsContext";

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
  const { colorSchemeId, loading: settingsLoading, refetch } = useUserSettings();

  const listQuery = useListColorSchemes({ enabled: !!user?.uid });
  const selectMutation = useSelectMyColorScheme();
  const clearMutation = useClearMyColorScheme();

  const schemes: ColorSchemeOption[] = (listQuery.data?.colorSchemes ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    variants: s.themes,
  }));
  const selectedScheme = schemes.find((s) => s.id === colorSchemeId) ?? null;

  const selectScheme = useCallback(
    async (colorSchemeId: string) => {
      await selectMutation.mutateAsync({ colorSchemeId } as SelectMyColorSchemeVariables);
      await refetch();
    },
    [selectMutation, refetch]
  );

  const clearScheme = useCallback(async () => {
    await clearMutation.mutateAsync(undefined);
    await refetch();
  }, [clearMutation, refetch]);

  return (
    <ThemeSelectionContext.Provider
      value={{
        schemes,
        selectedScheme,
        selectScheme,
        clearScheme,
        loading: listQuery.isPending || settingsLoading,
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
