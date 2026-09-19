"use client";

import { useMemo, useState } from "react";
import { PersonGear } from "@gravity-ui/icons";
import { EmptyState } from "@heroui/react";
import { useBorders } from "@/context/BordersContext";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { TeamOverview } from "./TeamOverview";
import { TeamRangeToggle } from "./TeamRangeToggle";
import { AdminShell } from "./AdminShell";
import { defaultTeamRange, type TeamRange } from "./teamRange";

interface TeamsResponse {
  teams: { id: string; name: string; description: string | null; members: unknown[] }[];
}

/**
 * /admin/dashboard — per-team time and productivity totals.
 *
 * Separate page and nav item from /admin, gated on AdminDashboard rather than
 * AdminPage: seeing who exists and seeing what everyone logged are different
 * privileges, and that split already existed in the grants.
 */
export function AdminTeamDashboard() {
  const { bordersEnabled } = useBorders();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  // One range across teams rather than per team: switching teams to compare
  // them is the main thing done here, and a range that reset on every switch
  // would make that comparison impossible.
  const [range, setRange] = useState<TeamRange>(() => defaultTeamRange());

  const { data, loading } = useAdminFetch<TeamsResponse>("/api/admin/teams", true);

  const teams = useMemo(
    () => (data?.teams ?? []).map((t) => ({ id: t.id, name: t.name, memberCount: t.members.length })),
    [data]
  );

  // Land on the first team rather than an empty pane; the list arrives async,
  // so this resolves per render instead of in an effect.
  const activeTeamId = selectedTeamId ?? teams[0]?.id ?? null;
  const activeTeam = teams.find((t) => t.id === activeTeamId);

  const nav = (
    <nav
      aria-label="Admin sections"
      className={`flex h-full w-full min-h-0 flex-col overflow-y-auto bg-surface ${
        bordersEnabled ? "border border-default-200" : ""
      }`}
      data-glass="surface"
    >
      <p className="px-3 pt-3 pb-1 text-xs font-medium uppercase tracking-wide text-foreground/40">
        Teams
      </p>
      {loading && <p className="px-3 py-2 text-sm text-foreground/50">Loading teams…</p>}
      {!loading && teams.length === 0 && (
        <p className="px-3 py-2 text-sm text-foreground/50">No teams yet.</p>
      )}
      {teams.map((team) => {
        const isActive = team.id === activeTeamId;
        return (
          <button
            key={team.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => setSelectedTeamId(team.id)}
            className={`flex w-full min-w-0 items-start gap-2 border-l-2 px-3 py-2 text-left transition-colors ${
              isActive
                ? "border-accent bg-accent-soft text-foreground"
                : "border-transparent text-foreground/60 hover:bg-default-100"
            }`}
          >
            <PersonGear className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{team.name}</span>
              <span className="truncate text-sm text-gray-500">
                {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <AdminShell
      feature="AdminDashboard"
      gateLabel="the admin dashboard"
      nav={nav}
      heading={activeTeam?.name ?? "Admin Dashboard"}
      description={activeTeam ? "Team and per-member totals" : "Pick a team"}
      headerExtra={activeTeamId ? <TeamRangeToggle value={range} onChange={setRange} /> : undefined}
    >
      {activeTeamId ? (
        <TeamOverview key={activeTeamId} teamId={activeTeamId} range={range} />
      ) : (
        !loading && (
          <EmptyState className="p-8">
            <PersonGear className="size-8 text-foreground/40" />
            <p className="text-sm text-foreground/60">No teams to report on yet.</p>
          </EmptyState>
        )
      )}
    </AdminShell>
  );
}

export default AdminTeamDashboard;
