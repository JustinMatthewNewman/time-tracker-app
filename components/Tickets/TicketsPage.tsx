"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Spinner } from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { TicketBreakdown } from "@/components/WorkLogs/TicketBreakdown";
import AmbientBackground from "@/components/AmbientBackground";
import {
  DATE_RANGE_PRESETS,
  describeRange,
  filterEntriesByRange,
  isRangeInvalid,
  resolveDateRange,
  type DateRangeFilter,
} from "@/lib/entryDateFilter";

const DEFAULT_FILTER: DateRangeFilter = { preset: "all", customStart: "", customEnd: "" };

export function TicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { entries, loading, error } = useMyTimeEntries();
  const [filter, setFilter] = useState<DateRangeFilter>(DEFAULT_FILTER);

  const invalid = isRangeInvalid(filter);

  // Filtered locally rather than by refetching: this page's whole point is the
  // all-time ranking, so the full set is already loaded (and the fetch is the
  // slow part — see the note in AGENTS.md on ~9,900 seeded entries). Sorting
  // lives one level down, in TicketBreakdown's column headers.
  const visibleEntries = useMemo(() => {
    if (invalid) return [];
    return filterEntriesByRange(entries, resolveDateRange(filter));
  }, [entries, filter, invalid]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner aria-label="Loading" />
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  const setPreset = (preset: DateRangeFilter["preset"]) => setFilter((f) => ({ ...f, preset }));

  return (
    <div className="relative flex h-full flex-col overflow-hidden p-4 sm:p-6">
      <AmbientBackground intensity={0.85} />
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-6">
        <Card className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-4">
          {/* Preset buttons plus a custom From/To pair, matching
              components/Admin/TeamRangeToggle.tsx rather than introducing a
              second date-range idiom in the same app — same labels, same
              `variant` convention for the selected one. */}
          <div className="flex shrink-0 flex-col gap-2 border-b border-default-200 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-foreground/40">
                Period
              </span>
              <div className="flex flex-wrap gap-1" role="group" aria-label="Date range preset">
                {DATE_RANGE_PRESETS.map((p) => (
                  <Button
                    key={p.id}
                    size="sm"
                    variant={filter.preset === p.id ? "primary" : "outline"}
                    onPress={() => setPreset(p.id)}
                  >
                    {p.label}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant={filter.preset === "custom" ? "primary" : "outline"}
                  onPress={() => setPreset("custom")}
                >
                  Custom
                </Button>
              </div>
            </div>

            {filter.preset === "custom" ? (
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs text-foreground/60">
                  From
                  <input
                    type="date"
                    value={filter.customStart}
                    onChange={(e) => setFilter((f) => ({ ...f, customStart: e.target.value }))}
                    className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-foreground/60">
                  To
                  <input
                    type="date"
                    value={filter.customEnd}
                    onChange={(e) => setFilter((f) => ({ ...f, customEnd: e.target.value }))}
                    className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
                  />
                </label>
              </div>
            ) : (
              <p className="text-xs tabular-nums text-foreground/60">{describeRange(filter)}</p>
            )}

            {invalid && <p className="text-sm text-danger">End date must not be before start date.</p>}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <TicketBreakdown
              hasSelection
              entries={visibleEntries}
              loading={loading}
              error={error}
              emptyMessage={
                filter.preset === "all"
                  ? "No time entries yet — tickets will show up here once you log time against one."
                  : "No time logged in this period."
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TicketsPage;
