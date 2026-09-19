"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, EmptyState, Skeleton } from "@heroui/react";
import { Persons, Plus, TrashBin } from "@gravity-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { normalizeTicketColor, TICKET_COLOR_PRESETS } from "@/lib/ticketColor";
import { DeleteTeamDialog } from "./DeleteTeamDialog";

interface TeamRow {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  weeklyTargetHours: number | null;
  createdAt: string;
  members: { id: string }[];
}

const NEUTRAL_SWATCH = "var(--muted)";

export function AdminDepartmentPanel({ enabled }: { enabled: boolean }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAdminFetch<{ teams: TeamRow[] }>(
    "/api/admin/teams",
    enabled
  );
  const teams = useMemo(() => data?.teams ?? [], [data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? teams[0]?.id ?? null;
  const team = teams.find((t) => t.id === activeId) ?? null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Re-seed the settings form from the server's copy whenever the selected
  // team changes or the list refetches after a save.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(team?.name ?? "");
    setDescription(team?.description ?? "");
    setColor(team?.color ?? null);
    setTarget(team?.weeklyTargetHours != null ? String(team.weeklyTargetHours) : "");
  }, [team?.id, team?.name, team?.description, team?.color, team?.weeklyTargetHours]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(false);
    setFormError(null);
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

  const dirty =
    !!team &&
    (name.trim() !== team.name ||
      description.trim() !== (team.description ?? "") ||
      (color ?? null) !== (team.color ?? null) ||
      target !== (team.weeklyTargetHours != null ? String(team.weeklyTargetHours) : ""));

  const saveSettings = async () => {
    if (!team) return;
    setSaving(true);
    setFormError(null);
    setSaved(false);
    try {
      await request(`/api/admin/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          color,
          // "" means "no target"; the server normalises 0 to null too.
          weeklyTargetHours: target === "" ? null : Number(target),
        }),
      });
      await refetch();
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save team");
    } finally {
      setSaving(false);
    }
  };

  const createTeam = async () => {
    setFormError(null);
    try {
      const body = await request("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      await refetch();
      // Select the team that was just made, rather than leaving the panel on
      // whatever was selected before — creating it is a statement of intent to
      // work on it.
      setSelectedId(body?.team?.id ?? null);
      setNewName("");
      setCreating(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create team");
    }
  };

  const deleteTeam = async () => {
    if (!team) return;
    await request(`/api/admin/teams/${team.id}`, { method: "DELETE" });
    await refetch();
    setSelectedId(null);
  };

  if (error) {
    return <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>;
  }

  if (loading && teams.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {/* Teams ---------------------------------------------------------- */}
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">Teams</p>
          {!creating && (
            <Button size="sm" variant="outline" onPress={() => setCreating(true)}>
              <Plus className="size-4" aria-hidden /> New team
            </Button>
          )}
        </div>

        {creating && (
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-1 flex-col gap-1 text-xs text-foreground/60">
              Team name
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={80}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newName.trim()) createTeam();
                  if (e.key === "Escape") { setCreating(false); setNewName(""); }
                }}
                className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
              />
            </label>
            <Button size="sm" variant="primary" onPress={createTeam} isDisabled={!newName.trim()}>
              Create
            </Button>
            <Button size="sm" variant="outline" onPress={() => { setCreating(false); setNewName(""); }}>
              Cancel
            </Button>
          </div>
        )}

        {teams.length === 0 ? (
          <EmptyState className="p-6">
            <Persons className="size-8 text-foreground/40" />
            <p className="text-sm text-foreground/60">No teams yet. Create one to get started.</p>
          </EmptyState>
        ) : (
          <ul className="flex flex-col">
            {teams.map((t) => {
              const isActive = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setSelectedId(t.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      isActive ? "bg-accent-soft text-foreground" : "text-foreground/70 hover:bg-default-100"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: t.color ?? NEUTRAL_SWATCH }}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
                    <span className="shrink-0 text-xs text-foreground/50">
                      {t.members.length} {t.members.length === 1 ? "member" : "members"}
                    </span>
                    {t.weeklyTargetHours != null && (
                      <span className="shrink-0 text-xs tabular-nums text-foreground/40">
                        {t.weeklyTargetHours}h/wk
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Team-wide settings --------------------------------------------- */}
      {team && (
        <Card className="flex flex-col gap-3 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">
            {team.name} settings
          </p>

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
              rows={2}
              maxLength={500}
              className="resize-y rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
            />
          </label>

          <div className="flex flex-col gap-1 text-xs text-foreground/60">
            Team colour
            <div className="flex flex-wrap items-center gap-2">
              {/* Shares the ticket palette: one curated set of colours keeps
                  teams from clashing with each other, and nothing here needs a
                  second opinion about what "a good swatch" is. */}
              {TICKET_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  aria-label={preset.name}
                  aria-pressed={color === preset.hex}
                  onClick={() => setColor(preset.hex)}
                  className={`size-6 rounded-full border transition ${
                    color === preset.hex ? "border-foreground" : "border-default-200"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                />
              ))}
              <input
                type="color"
                aria-label="Custom team colour"
                value={color ?? "#888888"}
                onChange={(e) => setColor(normalizeTicketColor(e.target.value))}
                className="size-7 cursor-pointer rounded border border-default-200 bg-transparent"
              />
              {color && (
                <Button size="sm" variant="outline" onPress={() => setColor(null)}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          <label className="flex max-w-xs flex-col gap-1 text-xs text-foreground/60">
            Target hours per week (whole team)
            <input
              type="number"
              min={0}
              max={168}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="No target"
              className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
            />
            <span className="text-foreground/40">
              Shown as attainment beside the team&apos;s totals, prorated to whatever range is
              selected. Leave empty for no target.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              onPress={saveSettings}
              isDisabled={saving || !dirty || name.trim().length === 0}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            {saved && !dirty && <span className="text-xs text-success">Saved</span>}
            {dirty && !saving && <span className="text-xs text-foreground/50">Unsaved changes</span>}

            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onPress={() => setDeleteOpen(true)}
            >
              <TrashBin className="size-4" aria-hidden /> Delete team
            </Button>
          </div>

          {formError && <p className="text-sm text-danger">{formError}</p>}
        </Card>
      )}

      <DeleteTeamDialog
        isOpen={deleteOpen}
        teamName={team?.name ?? ""}
        memberCount={team?.members.length ?? 0}
        onClose={() => setDeleteOpen(false)}
        onDelete={deleteTeam}
      />
    </div>
  );
}

export default AdminDepartmentPanel;
