"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useGetMyUser } from "@/src/dataconnect-generated/react";
import type { FeatureName } from "@/lib/features";
import type { UserTypeName } from "@/lib/userTypes";

// Reads the capability set that GetMyUser returns nested under the caller's
// tier (userType.features_via_UserTypeFeature). Same useGetMyUser call the
// settings contexts already make, so this adds no extra round trip.
//
// SECURITY: for deciding what to *render* only. Never the sole guard on
// anything privileged — the server re-checks via lib/featureAccess.ts.
export function useFeatures() {
  const { user } = useAuth();
  const myUserQuery = useGetMyUser({ enabled: !!user?.uid });

  const features = useMemo(
    () => new Set((myUserQuery.data?.user?.userType?.features ?? []).map((f) => f.name)),
    [myUserQuery.data]
  );

  return {
    features,
    // The caller's *database* row id (not the Firebase uid) — what admin APIs
    // and lists key on, so callers can tell "this row is me" apart.
    userId: myUserQuery.data?.user?.id,
    userType: myUserQuery.data?.user?.userType?.name as UserTypeName | undefined,
    // Three distinct states, and conflating any two of them causes a real bug:
    //   loading — still fetching; hold off rather than flashing a tab away
    //   error   — we do NOT know what this user holds. `features` is empty
    //             here, which is indistinguishable from a genuine denial, so
    //             callers must branch on this *before* treating an empty set
    //             as "not granted" — otherwise a transient network blip locks
    //             a legitimate user out of their own page.
    //   neither — the set is authoritative.
    loading: myUserQuery.isLoading,
    error: myUserQuery.isError ? (myUserQuery.error?.message ?? "Failed to load access") : null,
    refetch: myUserQuery.refetch,
  };
}

export function useHasFeature(feature: FeatureName) {
  const { features, loading } = useFeatures();
  return { hasFeature: features.has(feature), loading };
}
