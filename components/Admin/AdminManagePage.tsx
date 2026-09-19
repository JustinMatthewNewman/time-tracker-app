"use client";

import { useState } from "react";
import { Persons, Shield } from "@gravity-ui/icons";
import { useBorders } from "@/context/BordersContext";
import { AdminUsersPanel } from "./AdminUsersPanel";
import { AdminUserTypesPanel } from "./AdminUserTypesPanel";
import { AdminShell } from "./AdminShell";

type ManageId = "users" | "userTypes";

const SECTIONS = [
  { id: "users", label: "Users", description: "Everyone, and their tier", icon: Persons },
  { id: "userTypes", label: "User Types", description: "Tiers and their grants", icon: Shield },
] as const;

/**
 * /admin — account administration.
 *
 * Split from the team dashboard (/admin/dashboard) so the two are separate
 * nav items. The split follows a grant boundary that already existed:
 * AdminPage opens this page, AdminDashboard opens the team one.
 */
export function AdminManagePage() {
  const { bordersEnabled } = useBorders();
  const [section, setSection] = useState<ManageId>("users");
  const active = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  const nav = (
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
      {SECTIONS.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === section;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => setSection(item.id)}
            className={`flex w-full min-w-0 items-start gap-2 border-l-2 px-3 py-2 text-left transition-colors ${
              isActive
                ? "border-accent bg-accent-soft text-foreground"
                : "border-transparent text-foreground/60 hover:bg-default-100"
            }`}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium">{item.label}</span>
              <span className="truncate text-sm text-gray-500">{item.description}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <AdminShell
      feature="AdminPage"
      gateLabel="the admin page"
      nav={nav}
      heading={active.label}
      description={active.description}
    >
      {/* `enabled` defers each panel's fetch until it's actually opened. */}
      {section === "users" && <AdminUsersPanel enabled />}
      {section === "userTypes" && <AdminUserTypesPanel enabled />}
    </AdminShell>
  );
}

export default AdminManagePage;
