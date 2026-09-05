"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import type { EventPrefs } from "@/lib/googleCalendar/events";
import type { SyncResult } from "@/lib/googleCalendar/sync";

// Client-side state for the Google Calendar integration card.
//
// Same shape as useAdminFetch (fresh ID token per request, server error text
// surfaced instead of a bare status), but this one also owns mutations, so it
// keeps the status object as the single source of truth and replaces it from
// whatever a mutation returns rather than refetching after every write.

export interface GoogleCalendarStatus {
  configured: boolean;
  connected: boolean;
  maxRangeDays?: number;
  calendarId?: string;
  googleEmail?: string | null;
  connectedAt?: string;
  lastSyncedAt?: string | null;
  hasCalendarScope?: boolean;
  prefs?: EventPrefs;
}

export interface SyncRangeInput {
  start: string;
  end: string;
}

async function authedFetch<T>(
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) {
    const error = new Error(body.error || `Request failed (${res.status})`);
    // Carried through so the card can render a "Reconnect" affordance for
    // reauth_required rather than a generic red box.
    (error as Error & { code?: string }).code = body.code;
    throw error;
  }
  return body as T;
}

export function useGoogleCalendar() {
  const { user } = useAuth();
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      setStatus(await authedFetch<GoogleCalendarStatus>(token, "/api/google-calendar/status"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  /** Runs a mutation with shared busy/error handling. */
  const run = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T | null> => {
      if (!user) return null;
      setBusy(true);
      setError(null);
      try {
        return await fn(await user.getIdToken());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [user]
  );

  /**
   * Starts the OAuth flow by navigating the whole page to Google.
   *
   * Not a popup: the callback needs to set an httpOnly cookie and land back on
   * /settings, and a full-page redirect makes that a plain browser flow with
   * nothing to postMessage between windows. The connect route hands back a URL
   * rather than redirecting because the request that asks for it is
   * authenticated with a header — see that route's comment.
   */
  const connect = useCallback(
    () =>
      run(async (token) => {
        const { authUrl } = await authedFetch<{ authUrl: string }>(
          token,
          "/api/google-calendar/connect",
          { method: "POST" }
        );
        window.location.href = authUrl;
        return true;
      }),
    [run]
  );

  const disconnect = useCallback(
    (deleteCalendar: boolean) =>
      run(async (token) => {
        const result = await authedFetch<{ calendarDeleted: boolean; warnings?: string[] }>(
          token,
          "/api/google-calendar/disconnect",
          { method: "POST", body: JSON.stringify({ deleteCalendar }) }
        );
        setStatus((prev) => (prev ? { ...prev, connected: false, prefs: undefined } : prev));
        return result;
      }),
    [run]
  );

  const updatePrefs = useCallback(
    (patch: Partial<EventPrefs>) =>
      run(async (token) => {
        const updated = await authedFetch<GoogleCalendarStatus>(
          token,
          "/api/google-calendar/settings",
          { method: "PATCH", body: JSON.stringify(patch) }
        );
        setStatus((prev) => (prev ? { ...prev, ...updated } : prev));
        return updated;
      }),
    [run]
  );

  const sync = useCallback(
    (range: SyncRangeInput) =>
      run(async (token) => {
        const result = await authedFetch<SyncResult>(token, "/api/google-calendar/sync", {
          method: "POST",
          body: JSON.stringify(range),
        });
        // A completed sync stamps lastSyncedAt server-side; reflect it without
        // a second round trip.
        if (!result.truncated && result.errors.length === 0) {
          setStatus((prev) => (prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : prev));
        }
        return result;
      }),
    [run]
  );

  return { status, loading, error, busy, refetch, connect, disconnect, updatePrefs, sync, setError };
}
