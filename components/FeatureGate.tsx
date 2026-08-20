"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, EmptyState, Spinner } from "@heroui/react";
import { CircleExclamation, Shield } from "@gravity-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useFeatures } from "@/hooks/useFeatures";
import type { FeatureName } from "@/lib/features";

interface FeatureGateProps {
  feature: FeatureName;
  /** Named in the denial copy, e.g. "the dashboard". */
  label: string;
  children: React.ReactNode;
}

/**
 * Refuses to render `children` unless the signed-in user's tier holds
 * `feature`. Shared by every gated page so the four states below are handled
 * identically rather than re-derived (and mis-derived) per page.
 *
 * The states, in order — the third is the one that's easy to get wrong:
 *   1. auth resolving      -> spinner
 *   2. signed out          -> redirect home
 *   3. grants failed       -> retry prompt, NOT a denial. An errored lookup
 *                             leaves the feature set empty, which looks exactly
 *                             like "not granted"; reporting that as denial
 *                             would lock a legitimate user out of their own
 *                             page over a transient network failure.
 *   4. grants resolved     -> render, or deny
 *
 * SCOPE: this is a client-side gate. For AdminPage it shadows a real
 * server-side check (lib/featureAccess.ts) and the APIs refuse independently.
 * For a page whose data is the user's own — the dashboard — there is no
 * privileged backend to guard, so this stops the page from rendering but is
 * not a security boundary. See the NavLink comment in Navbar.tsx.
 */
export function FeatureGate({ feature, label, children }: FeatureGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { features, loading, error, refetch } = useFeatures();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || (user && loading)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner aria-label="Loading" />
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState className="p-12">
          <CircleExclamation className="size-8 text-foreground/40" />
          <p className="text-lg font-semibold">Couldn&apos;t verify access</p>
          <p className="text-sm text-foreground/60">{error}</p>
          <Button size="sm" className="mt-2" onPress={() => refetch()}>
            Try again
          </Button>
        </EmptyState>
      </div>
    );
  }

  if (!features.has(feature)) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState className="p-12">
          <Shield className="size-8 text-foreground/40" />
          <p className="text-lg font-semibold">Access required</p>
          <p className="text-sm text-foreground/60">
            Your account tier doesn&apos;t include {label}.
          </p>
        </EmptyState>
      </div>
    );
  }

  return <>{children}</>;
}

export default FeatureGate;
