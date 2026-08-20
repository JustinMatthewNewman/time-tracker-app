"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

// Shared loader for the admin panels' /api/admin/* reads. Every one of those
// routes needs the same three things — a fresh ID token on the Authorization
// header, the server's error message surfaced rather than a bare status code,
// and loading/error state — so they live here instead of in each panel.
//
// The token is minted per request (getIdToken refreshes it when near expiry)
// rather than captured once, so a long-lived admin tab doesn't start 401ing.
export function useAdminFetch<T>(path: string, enabled: boolean) {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [user, enabled, path]);

  useEffect(() => {
    // Fetch-on-mount; the setState lands in refetch's async body rather than
    // synchronously here, same as the fetching hooks elsewhere in hooks/.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
