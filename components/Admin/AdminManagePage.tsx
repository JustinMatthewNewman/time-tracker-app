"use client";

import { useState } from "react";
import { Persons, PersonGear, Shield } from "@gravity-ui/icons";
import { AdminUsersPanel } from "./AdminUsersPanel";
import { AdminUserTypesPanel } from "./AdminUserTypesPanel";
import { AdminDepartmentPanel } from "./AdminDepartmentPanel";
import { SideNavListBox } from "@/components/Utilities/SideNavListBox";
import { AdminShell } from "./AdminShell";

type ManageId = "users" | "userTypes" | "department";

const SECTIONS = [
  { id: "users", label: "Users", description: "Everyone, and their tier", icon: Persons },
  { id: "userTypes", label: "User Types", description: "Tiers and their grants", icon: Shield },
  {
    id: "department",
    label: "Department",
    description: "Teams and team-wide settings",
    icon: PersonGear,
  },
] as const;

/**
 * /admin — account administration.
 *
 * Split from the team dashboard (/admin/dashboard) so the two are separate
 * nav items. The split follows a grant boundary that already existed:
 * AdminPage opens this page, AdminDashboard opens the team one.
 */
export function AdminManagePage() {
  const [section, setSection] = useState<ManageId>("users");
  const active = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  const nav = (
    <SideNavListBox
      ariaLabel="Admin sections"
      heading="Manage"
      items={SECTIONS.map((item) => ({
        id: item.id,
        label: item.label,
        description: item.description,
        icon: item.icon,
      }))}
      selectedId={section}
      onSelect={(id) => setSection(id as ManageId)}
    />
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
      {section === "department" && <AdminDepartmentPanel enabled />}
    </AdminShell>
  );
}

export default AdminManagePage;
