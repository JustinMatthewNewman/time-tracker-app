"use client";

import { Persons, PersonGear, Shield } from "@gravity-ui/icons";
import { useBorders } from "@/context/BordersContext";

export type AdminSelection =
  | { kind: "panel"; id: "users" | "userTypes" }
  | { kind: "team"; id: string };

export interface NavTeam {
  id: string;
  name: string;
  memberCount: number;
}

interface AdminSectionNavProps {
  teams: NavTeam[];
  teamsLoading: boolean;
  showTeams: boolean;
  selection: AdminSelection;
  onSelect: (selection: AdminSelection) => void;
}

const MANAGE_ITEMS = [
  { id: "users", label: "Users", description: "Everyone, and their tier", icon: Persons },
  { id: "userTypes", label: "User Types", description: "Tiers and their grants", icon: Shield },
] as const;

function isSame(a: AdminSelection, b: AdminSelection) {
  return a.kind === b.kind && a.id === b.id;
}

/**
 * Admin sidebar. Built from buttons rather than the vertical Tabs that
 * ReportListBox uses because this list is in two labelled groups — a single
 * Tabs.List can't carry group headings, and splitting it into two Tabs
 * components would mean one of them always holding a selectedKey it doesn't
 * own. The selected styling is deliberately identical to ReportListBox's.
 */
export function AdminSectionNav({
  teams,
  teamsLoading,
  showTeams,
  selection,
  onSelect,
}: AdminSectionNavProps) {
  const { bordersEnabled } = useBorders();

  const itemClass = (active: boolean) =>
    `flex w-full min-w-0 items-start gap-2 border-l-2 px-3 py-2 text-left transition-colors ${
      active
        ? "border-accent bg-accent-soft text-foreground"
        : "border-transparent text-foreground/60 hover:bg-default-100"
    }`;

  return (
    <nav
      aria-label="Admin sections"
      className={`flex h-full w-full min-h-0 flex-col overflow-y-auto bg-surface ${
        bordersEnabled ? "border border-default-200" : ""
      }`}
      data-glass="surface"
    >
      <p className="px-3 pt-3 pb-1 text-xs font-medium uppercase tracking-wide text-foreground/40">
        Manage
      </p>
      {MANAGE_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isSame(selection, { kind: "panel", id: item.id });
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect({ kind: "panel", id: item.id })}
            className={itemClass(active)}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{item.label}</span>
              <span className="truncate text-sm text-gray-500">{item.description}</span>
            </span>
          </button>
        );
      })}

      {showTeams && (
        <>
          <p className="px-3 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-foreground/40">
            Teams
          </p>
          {teamsLoading && <p className="px-3 py-2 text-sm text-foreground/50">Loading teams…</p>}
          {!teamsLoading && teams.length === 0 && (
            <p className="px-3 py-2 text-sm text-foreground/50">No teams yet.</p>
          )}
          {teams.map((team) => {
            const active = isSame(selection, { kind: "team", id: team.id });
            return (
              <button
                key={team.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect({ kind: "team", id: team.id })}
                className={itemClass(active)}
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
        </>
      )}
    </nav>
  );
}

export default AdminSectionNav;
