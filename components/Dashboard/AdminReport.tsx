"use client";

import { useMemo, useState } from "react";
import { EmptyState, ListBox, Select, Skeleton } from "@heroui/react";
import { PersonGear } from "@gravity-ui/icons";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { TeamOverview } from "@/components/Admin/TeamOverview";
import { TeamRangeToggle } from "@/components/Admin/TeamRangeToggle";
import { defaultTeamRange, type TeamRange } from "@/components/Admin/teamRange";

interface TeamsResponse {
  teams: { id: string; name: string; members: unknown[] }[];
}

/**
 * The Dashboard's "Admin" report — what used to be the standalone
 * /admin/dashboard page.
 *
 * The page had its own sidebar listing teams; inside the dashboard that slot
 * belongs to the report list, so team selection moved to a picker here. The
 * overview itself (TeamOverview) is unchanged.
 */
export function AdminReport() {
  const { data, loading, error } = useAdminFetch<TeamsResponse>("/api/admin/teams", true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [range, setRange] = useState<TeamRange>(() => defaultTeamRange());

  const teams = useMemo(() => data?.teams ?? [], [data]);
  // Land on a team rather than an empty pane; the list arrives async, so this
  // resolves per render instead of in an effect.
  const activeTeamId = selectedTeamId ?? teams[0]?.id ?? null;

  if (error) {
    return <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>;
  }

  if (loading && teams.length === 0) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }

  if (teams.length === 0) {
    return (
      <EmptyState className="p-8">
        <PersonGear className="size-8 text-foreground/40" />
        <p className="text-sm text-foreground/60">No teams to report on yet.</p>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Select
          aria-label="Team"
          selectedKey={activeTeamId ?? undefined}
          onSelectionChange={(key) => key != null && setSelectedTeamId(String(key))}
          placeholder="Pick a team"
        >
          <Select.Trigger className="h-9 min-w-56 text-sm">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {teams.map((t) => (
                <ListBox.Item key={t.id} id={t.id} textValue={t.name}>
                  {t.name}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <TeamRangeToggle value={range} onChange={setRange} />
      </div>

      {activeTeamId && <TeamOverview key={activeTeamId} teamId={activeTeamId} range={range} />}
    </div>
  );
}

export default AdminReport;
