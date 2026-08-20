"use client";

import { Card, EmptyState, Skeleton } from "@heroui/react";
import { Check, Minus } from "@gravity-ui/icons";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface UserTypeRow {
  id: string;
  name: string;
  features: string[];
}

interface FeatureRow {
  id: string;
  name: string;
  description: string | null;
}

interface UserTypesResponse {
  userTypes: UserTypeRow[];
  features: FeatureRow[];
}

export function AdminUserTypesPanel({ enabled }: { enabled: boolean }) {
  const { data, loading, error } = useAdminFetch<UserTypesResponse>(
    "/api/admin/user-types",
    enabled
  );

  const userTypes = data?.userTypes ?? [];
  const features = data?.features ?? [];

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (userTypes.length === 0) {
    return (
      <EmptyState className="p-8">
        <p className="text-sm text-foreground/60">No user types found.</p>
        <p className="text-sm text-foreground/60">
          Run the SeedUserTypes mutation in dataconnect/seed_data.gql.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {features.length === 0 && (
        <p className="text-sm text-foreground/60">
          No features defined yet — run SeedFeatures in dataconnect/seed_data.gql.
        </p>
      )}

      {userTypes.map((tier) => {
        const granted = new Set(tier.features);

        return (
          <Card key={tier.id} className="p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-base font-semibold">{tier.name}</h3>
              <span className="text-xs tabular-nums text-foreground/50">
                {granted.size} of {features.length} feature{features.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Every known feature is listed per tier, granted or not — a bare
                list of grants can't distinguish "this capability doesn't
                exist" from "it exists and this tier lacks it", which is
                exactly what you're checking when auditing permissions. */}
            <ul className="mt-3 flex flex-col gap-1.5">
              {features.map((feature) => {
                const isGranted = granted.has(feature.name);
                return (
                  <li key={feature.id} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                        isGranted ? "bg-accent text-accent-foreground" : "bg-default text-foreground/40"
                      }`}
                      aria-hidden
                    >
                      {isGranted ? <Check className="size-3" /> : <Minus className="size-3" />}
                    </span>
                    <span className="min-w-0">
                      <span className={isGranted ? "text-foreground" : "text-foreground/45"}>
                        {feature.name}
                      </span>
                      <span className="sr-only">{isGranted ? " — granted" : " — not granted"}</span>
                      {feature.description && (
                        <span className="block text-xs text-foreground/50">{feature.description}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}

export default AdminUserTypesPanel;
