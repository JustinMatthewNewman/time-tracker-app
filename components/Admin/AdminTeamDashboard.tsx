"use client";

import { useMemo, useState } from "react";
import { PersonGear } from "@gravity-ui/icons";
import { EmptyState } from "@heroui/react";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { TeamOverview } from "./TeamOverview";
import { TeamRangeToggle } from "./TeamRangeToggle";
import { SideNavListBox } from "@/components/Utilities/SideNavListBox";
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
    <SideNavListBox
      ariaLabel="Admin sections"
      heading="Teams"
      headingAside={teams.length > 0 ? `${teams.length}` : undefined}
      items={teams.map((team) => ({
        id: team.id,
        label: team.name,
        description: `${team.memberCount} ${team.memberCount === 1 ? "member" : "members"}`,
        icon: PersonGear,
      }))}
      selectedId={activeTeamId}
      onSelect={setSelectedTeamId}
      emptyMessage={loading ? "Loading teams…" : "No teams yet."}
    />
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
