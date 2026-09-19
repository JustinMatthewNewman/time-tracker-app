"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, ListBox, Select, Skeleton } from "@heroui/react";
import { Person, Persons, TrashBin } from "@gravity-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { useTicketColorsSetting } from "@/context/TicketColorsContext";
import { SideNavListBox } from "@/components/Utilities/SideNavListBox";
import type { MemberDay, MemberMetrics, TeamMetrics } from "@/lib/adminTeamMetrics";
import { AdminShell } from "./AdminShell";
import { IsoStackedBarChart } from "./IsoStackedBarChart";
import { MemberStatStrip, TeamStatStrip } from "./TeamStats";
import { TeamRangeToggle } from "./TeamRangeToggle";
import { defaultTeamRange, isRangeInvalid, resolveRange, type TeamRange } from "./teamRange";

interface MemberRow {
  id: string;
  username: string;
  email: string | null;
  userType: string;
}

interface TeamRow {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members: MemberRow[];
}

interface AdminUserRow {
  id: string;
  username: string;
  email: string | null;
  userType: string;
}

interface TeamMetricsResponse {
  totals: TeamMetrics;
  members: MemberMetrics[];
  /** Null when the range is wider than the server will break down by day. */
  daily: Record<string, MemberDay[]> | null;
  dailyLimitDays: number;
}

export function AdminTeamsPage() {
  const { user } = useAuth();
  const { ticketColorsEnabled } = useTicketColorsSetting();
  const { data, loading, error, refetch } = useAdminFetch<{ teams: TeamRow[] }>(
    "/api/admin/teams",
    true
  );
  // Only fetched to populate the add-member picker, so it waits until the
  // picker is actually opened rather than loading every user with the page.
  const [addingOpen, setAddingOpen] = useState(false);
  const usersQuery = useAdminFetch<{ users: AdminUserRow[] }>("/api/admin/users", addingOpen);

  const teams = useMemo(() => data?.teams ?? [], [data]);

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const activeTeamId = selectedTeamId ?? teams[0]?.id ?? null;
  const team = teams.find((t) => t.id === activeTeamId) ?? null;

  // Defaults to the week rather than the month: the per-day chart below reads
  // best at a week's worth of bars, and the stats are unaffected by the choice.
  const [range, setRange] = useState<TeamRange>(() => ({ ...defaultTeamRange(), preset: "week" }));
  const rangeInvalid = isRangeInvalid(range);
  const { start, end } = resolveRange(range);
  // Same endpoint the team dashboard reads; the URL is the cache key
  // useAdminFetch refetches on, so changing team or range reloads.
  const metricsPath = useMemo(
    () => (activeTeamId ? `/api/admin/teams/${activeTeamId}/metrics?start=${start}&end=${end}` : ""),
    [activeTeamId, start, end]
  );
  const metricsQuery = useAdminFetch<TeamMetricsResponse>(
    metricsPath,
    !!activeTeamId && !rangeInvalid
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);

  // Reload the form whenever the selected team changes or the list refetches.
  // Keyed on the team's own values rather than a mount key so a save that
  // normalises input (trimming, empty description -> null) is reflected back.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(team?.name ?? "");
    setDescription(team?.description ?? "");
  }, [team?.id, team?.name, team?.description]);

  // Save status clears on team *identity* only, deliberately separate from the
  // sync above. Folding the two together meant a successful save cleared its
  // own confirmation: saving refetches, the refetch changes team.name, and the
  // effect then reset `saved` right after saveDetails set it — so "Saved" never
  // appeared even though the write had landed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveError(null);
    setSaved(false);
  }, [team?.id]);

  const request = useCallback(
    async (path: string, init: RequestInit) => {
      if (!user) throw new Error("Not signed in");
      const token = await user.getIdToken();
      const res = await fetch(path, {
        ...init,
        headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      return res.json();
    },
    [user]
  );

  const dirty = !!team && (name.trim() !== team.name || description.trim() !== (team.description ?? ""));

  const saveDetails = async () => {
    if (!team) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await request(`/api/admin/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      // Refetch rather than patching local state: the server normalises the
      // values it stores, and a rejected edit must not leave the form showing
      // something that was never saved.
      await refetch();
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save team");
    } finally {
      setSaving(false);
    }
  };

  const addMember = async (userId: string) => {
    if (!team) return;
    setBusyMemberId(userId);
    setSaveError(null);
    try {
      await request(`/api/admin/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      await refetch();
      setAddingOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setBusyMemberId(null);
    }
  };

  const removeMember = async (userId: string) => {
    if (!team) return;
    setBusyMemberId(userId);
    setSaveError(null);
    try {
      await request(`/api/admin/teams/${team.id}/members/${userId}`, { method: "DELETE" });
      await refetch();
      if (selectedMemberId === userId) setSelectedMemberId(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setBusyMemberId(null);
    }
  };

  // AdminGetTeam returns the roster in insertion order, so removing and
  // re-adding someone silently reshuffles the sidebar. Sort by name to keep
  // the list stable across edits.
  const members = useMemo(
    () => [...(team?.members ?? [])].sort((a, b) => a.username.localeCompare(b.username)),
    [team]
  );
  const selectedMember = members.find((m) => m.id === selectedMemberId) ?? null;
  const memberMetrics =
    (selectedMember && metricsQuery.data?.members.find((m) => m.id === selectedMember.id)) || null;
  const memberDays =
    (selectedMember && metricsQuery.data?.daily?.[selectedMember.id]) || null;
  const addableUsers = (usersQuery.data?.users ?? []).filter(
    (u) => !members.some((m) => m.id === u.id)
  );

  const teamPicker = (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-foreground/40">Team</span>
      <Select
        aria-label="Team"
        selectedKey={activeTeamId ?? undefined}
        onSelectionChange={(key) => {
          if (key == null) return;
          setSelectedTeamId(String(key));
          // The member selection belongs to the old team, so it can't survive
          // the switch.
          setSelectedMemberId(null);
          setAddingOpen(false);
        }}
        isDisabled={teams.length === 0}
        placeholder="Pick a team"
      >
        <Select.Trigger className="h-9 w-full text-sm">
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
    </div>
  );

  const nav = (
    <SideNavListBox
      ariaLabel="Team members"
      heading="Members"
      headingAside={members.length > 0 ? String(members.length) : undefined}
      items={members.map((m) => ({
        id: m.id,
        label: m.username,
        description: m.userType,
        icon: Person,
      }))}
      selectedId={selectedMemberId}
      onSelect={setSelectedMemberId}
      emptyMessage={loading ? "Loading…" : "No members on this team yet."}
      header={teamPicker}
      action={
        team && (
          <div className="flex flex-col gap-2">
            {addingOpen ? (
              <>
                <Select
                  aria-label="Add a member"
                  isDisabled={usersQuery.loading || !!busyMemberId}
                  placeholder={usersQuery.loading ? "Loading users…" : "Pick a user"}
                  onSelectionChange={(key) => key != null && addMember(String(key))}
                >
                  <Select.Trigger className="h-9 w-full text-sm">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {addableUsers.map((u) => (
                        <ListBox.Item key={u.id} id={u.id} textValue={u.username}>
                          {u.username}
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                {!usersQuery.loading && addableUsers.length === 0 && (
                  <p className="text-xs text-foreground/60">Everyone is already on this team.</p>
                )}
                <Button size="sm" variant="outline" onPress={() => setAddingOpen(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onPress={() => setAddingOpen(true)}>
                Add member
              </Button>
            )}
          </div>
        )
      }
    />
  );

  return (
    <AdminShell
      feature="AdminDashboard"
      gateLabel="team administration"
      nav={nav}
      heading={team?.name ?? "Teams"}
      description="View and edit team details"
      headerExtra={team ? <TeamRangeToggle value={range} onChange={setRange} /> : undefined}
    >
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading && !team && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      )}

      {!loading && teams.length === 0 && (
        <EmptyState className="p-8">
          <Persons className="size-8 text-foreground/40" />
          <p className="text-sm text-foreground/60">No teams yet.</p>
        </EmptyState>
      )}

      {team && (
        <div className="flex max-w-4xl flex-col gap-4">
          {/* Team stats first, then the selected member's, then the editor —
              the numbers are what this page is read for, the form is what it
              is occasionally used for. */}
          <Card className="flex flex-col gap-3 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">
              Team stats
            </p>
            {rangeInvalid ? (
              <p className="text-sm text-foreground/60">Choose a valid date range.</p>
            ) : metricsQuery.error ? (
              <p className="text-sm text-danger">{metricsQuery.error}</p>
            ) : metricsQuery.loading || !metricsQuery.data ? (
              <Skeleton className="h-16 w-full rounded" />
            ) : (
              <TeamStatStrip totals={metricsQuery.data.totals} enabled={ticketColorsEnabled} />
            )}
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">
              {selectedMember ? "Member" : "Members"}
            </p>

            {selectedMember ? (
              <>
                <div>
                  <p className="text-lg font-semibold text-foreground">{selectedMember.username}</p>
                  <p className="text-sm text-foreground/60">{selectedMember.email ?? "No email"}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-foreground/50">
                    {selectedMember.userType}
                  </p>
                </div>

                {/* Same range as the team strip above, so the two are directly
                    comparable rather than each carrying their own period. */}
                {rangeInvalid ? null : metricsQuery.loading || !metricsQuery.data ? (
                  <Skeleton className="h-16 w-full rounded" />
                ) : memberMetrics ? (
                  <MemberStatStrip member={memberMetrics} enabled={ticketColorsEnabled} />
                ) : (
                  <p className="text-sm text-foreground/60">No stats for this member yet.</p>
                )}

                {!rangeInvalid && metricsQuery.data && (
                  <div className="mt-1">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/40">
                      Tickets per day
                    </p>
                    {memberDays ? (
                      <IsoStackedBarChart days={memberDays} />
                    ) : (
                      <p className="text-sm text-foreground/60">
                        Pick a range of {metricsQuery.data.dailyLimitDays} days or fewer to see the
                        daily breakdown.
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => removeMember(selectedMember.id)}
                    isDisabled={busyMemberId === selectedMember.id}
                  >
                    <TrashBin className="size-4" aria-hidden />
                    {busyMemberId === selectedMember.id ? "Removing…" : "Remove from team"}
                  </Button>
                  {/* Said plainly, because "remove" next to a person's name
                      reads like it might delete the account. */}
                  <span className="text-xs text-foreground/50">
                    Removes the membership only — the account and its time entries are untouched.
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground/60">
                {members.length === 0
                  ? "This team has no members. Add one from the sidebar."
                  : "Pick a member in the sidebar to see their details."}
              </p>
            )}
          </Card>
          <Card className="flex flex-col gap-3 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">
                Team details
              </p>
              <span className="text-xs text-foreground/50">
                Created {new Date(team.createdAt).toLocaleDateString()}
              </span>
            </div>

            <label className="flex flex-col gap-1 text-xs text-foreground/60">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-foreground/60">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                className="resize-y rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
              />
            </label>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="primary"
                onPress={saveDetails}
                isDisabled={saving || !dirty || name.trim().length === 0}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              {/* Only meaningful while the form still matches what was saved —
                  it would otherwise sit there contradicting unsaved edits. */}
              {saved && !dirty && <span className="text-xs text-success">Saved</span>}
              {dirty && !saving && <span className="text-xs text-foreground/50">Unsaved changes</span>}
            </div>

            {saveError && <p className="text-sm text-danger">{saveError}</p>}
          </Card>

        </div>
      )}
    </AdminShell>
  );
}

export default AdminTeamsPage;
