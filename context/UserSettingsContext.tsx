"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { QueryFetchPolicy } from "firebase/data-connect";
import { useAuth } from "@/hooks/useAuth";
import { getMyUser } from "@/src/dataconnect-generated";

type UserSettingsState = {
  colorSchemeId: string | null;
  performanceMode: boolean | null;
  backgroundOpacity: number | null;
  externalTicketLinkTemplate: string | null;
  cardOpacity: number | null;
  cardBlur: number | null;
  bordersEnabled: boolean | null;
};

type UserSettingsContextType = UserSettingsState & {
  loading: boolean;
  refetch: () => Promise<void>;
};

const EMPTY_STATE: UserSettingsState = {
  colorSchemeId: null,
  performanceMode: null,
  backgroundOpacity: null,
  externalTicketLinkTemplate: null,
  cardOpacity: null,
  cardBlur: null,
  bordersEnabled: null,
};

const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

// Single shared GetMyUser fetch backing every per-account preference (color
// scheme, performance mode, background opacity, external ticket link
// template). ThemeSelectionContext, PerformanceModeContext,
// BackgroundOpacityContext, and the Settings/Ticket pages all read from
// here instead of each issuing their own SERVER_ONLY GetMyUser query — that
// used to mean one extra full round-trip per preference on every page load.
export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<UserSettingsState>(EMPTY_STATE);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!user?.uid) {
      setState(EMPTY_STATE);
      return;
    }
    setLoading(true);
    try {
      // SERVER_ONLY, not the default cache-preferring policy, so a value
      // just written by a mutation is never masked by a stale cached read.
      const result = await getMyUser({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
      const dbUser = result.data.user;
      setState({
        colorSchemeId: dbUser?.colorScheme?.id ?? null,
        performanceMode: dbUser?.performanceMode ?? false,
        backgroundOpacity: dbUser?.backgroundOpacity ?? 100,
        externalTicketLinkTemplate: dbUser?.externalTicketLinkTemplate ?? null,
        cardOpacity: dbUser?.cardOpacity ?? 100,
        cardBlur: dbUser?.cardBlur ?? 0,
        bordersEnabled: dbUser?.bordersEnabled ?? true,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return (
    <UserSettingsContext.Provider value={{ ...state, loading, refetch }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) {
    throw new Error("useUserSettings must be used within a UserSettingsProvider");
  }
  return ctx;
}
