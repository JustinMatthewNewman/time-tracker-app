"use client";

import { useMemo, useState } from "react";
import { Card } from "@heroui/react";
import { Bars, ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import AmbientBackground from "@/components/AmbientBackground";
import FeatureGate from "@/components/FeatureGate";
import { useSidebar } from "@/context/SideBarContext";
import { useBorders } from "@/context/BordersContext";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { useFeatures } from "@/hooks/useFeatures";
import { AdminUsersPanel } from "./AdminUsersPanel";
import { AdminUserTypesPanel } from "./AdminUserTypesPanel";
import { AdminSectionNav, type AdminSelection, type NavTeam } from "./AdminSectionNav";
import { TeamOverview } from "./TeamOverview";
import { TeamRangeToggle } from "./TeamRangeToggle";
import { defaultTeamRange, type TeamRange } from "./teamRange";

interface TeamsResponse {
  teams: { id: string; name: string; description: string | null; members: unknown[] }[];
}

export function AdminDashboard() {
  const { isOpen, toggle: toggleSidebar } = useSidebar();
  const { bordersEnabled } = useBorders();
  const { features } = useFeatures();
  const [selection, setSelection] = useState<AdminSelection>({ kind: "panel", id: "users" });
  // One range for the whole admin page rather than per team: switching teams
  // to compare them is the main thing an admin does here, and a range that
  // reset on every switch would make that comparison impossible.
  const [range, setRange] = useState<TeamRange>(() => defaultTeamRange());

  // Same split as before the restructure: reaching the admin page (AdminPage)
  // and seeing team rosters (AdminDashboard) are separate grants.
  const canSeeTeams = features.has("AdminDashboard");
  const { data: teamsData, loading: teamsLoading } = useAdminFetch<TeamsResponse>(
    "/api/admin/teams",
    canSeeTeams
  );

  const teams: NavTeam[] = useMemo(
    () =>
      (teamsData?.teams ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        memberCount: t.members.length,
      })),
    [teamsData]
  );

  // If the grant behind a team view disappears mid-session, fall back to a
  // panel rather than leaving a team selected that can no longer be loaded.
  const activeSelection: AdminSelection =
    selection.kind === "team" && !canSeeTeams ? { kind: "panel", id: "users" } : selection;

  const selectedTeam =
    activeSelection.kind === "team" ? teams.find((t) => t.id === activeSelection.id) : undefined;

  const heading =
    activeSelection.kind === "team"
      ? selectedTeam?.name ?? "Team"
      : activeSelection.id === "users"
        ? "Users"
        : "User Types";

  const description =
    activeSelection.kind === "team"
      ? "Team and per-member totals"
      : activeSelection.id === "users"
        ? "Everyone, and their tier"
        : "Tiers and their grants";

  // The gate below is the polite half only — /api/admin/* re-checks the same
  // grants server-side, so these panels would get 403s even if it were
  // bypassed.
  return (
    <FeatureGate feature="AdminPage" label="the admin page">
      <div className="relative flex h-full flex-col overflow-hidden">
        <AmbientBackground intensity={0.85} />

        {/* Mobile view switcher, mirroring DashboardLayout's. */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Show section" : "Show admin sections"}
          className="absolute right-4 bottom-4 z-20 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition hover:bg-accent-hover active:scale-95 md:hidden"
        >
          {isOpen ? <ChevronRight className="size-5" aria-hidden /> : <ChevronLeft className="size-5" aria-hidden />}
        </button>

        <div className="relative z-10 flex h-full min-h-0 flex-1 items-stretch overflow-hidden">
          <aside
            className={`transition-all duration-300 overflow-hidden ${isOpen ? "w-full md:w-88" : "w-0"}`}
          >
            <div className="h-full w-full bg-default-50 p-4 md:w-88">
              <AdminSectionNav
                teams={teams}
                teamsLoading={teamsLoading}
                showTeams={canSeeTeams}
                selection={activeSelection}
                onSelect={setSelection}
              />
            </div>
          </aside>

          <div
            className={`flex h-full min-w-0 flex-1 min-h-0 flex-col p-4 text-foreground border-l transition-colors duration-300
              ${isOpen && bordersEnabled ? "border-default-200" : "border-transparent"}`}
          >
            <Card className="flex h-full min-h-0 flex-col overflow-hidden border border-default-200">
              <div
                className={`sticky top-0 z-10 flex shrink-0 flex-col gap-3 p-3 ${
                  bordersEnabled ? "border-b border-default-200" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    aria-label={isOpen ? "Hide admin sections" : "Show admin sections"}
                    className="hidden size-8 shrink-0 items-center justify-center rounded-md text-foreground/60 hover:bg-default hover:text-foreground md:inline-flex"
                  >
                    <Bars className="size-4" aria-hidden />
                  </button>
                  <span className="font-medium text-foreground">{heading}</span>
                  <span className="text-sm text-gray-500">{description}</span>
                </div>

                {/* Only the team views are range-scoped; showing the control
                    over the user/tier panels would imply it filters them. */}
                {activeSelection.kind === "team" && (
                  <TeamRangeToggle value={range} onChange={setRange} />
                )}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {/* `enabled` defers each panel's fetch until it's actually
                    opened, so landing on Admin doesn't pull every dataset. */}
                {activeSelection.kind === "panel" && activeSelection.id === "users" && (
                  <AdminUsersPanel enabled />
                )}
                {activeSelection.kind === "panel" && activeSelection.id === "userTypes" && (
                  <AdminUserTypesPanel enabled />
                )}
                {activeSelection.kind === "team" && (
                  <TeamOverview key={activeSelection.id} teamId={activeSelection.id} range={range} />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

export default AdminDashboard;
