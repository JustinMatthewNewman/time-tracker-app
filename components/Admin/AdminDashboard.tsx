"use client";

import { useState } from "react";
import { Card, Tabs } from "@heroui/react";
import AmbientBackground from "@/components/AmbientBackground";
import FeatureGate from "@/components/FeatureGate";
import { useFeatures } from "@/hooks/useFeatures";
import type { FeatureName } from "@/lib/features";
import { AdminUsersPanel } from "./AdminUsersPanel";
import { AdminUserTypesPanel } from "./AdminUserTypesPanel";
import { AdminTeamsPanel } from "./AdminTeamsPanel";

// `feature` gates the tab the same way NAV_LINKS gates a nav item: reaching
// the admin page (AdminPage) and seeing team rosters (AdminDashboard) are
// separate grants. Tabs without one are ungated beyond AdminPage itself.
const TABS: readonly { id: string; label: string; feature?: FeatureName }[] = [
  { id: "users", label: "Users" },
  { id: "userTypes", label: "User Types" },
  { id: "teams", label: "Teams", feature: "AdminDashboard" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminDashboard() {
  const [tab, setTab] = useState<TabId>("users");
  const { features } = useFeatures();

  const visibleTabs = TABS.filter((t) => !t.feature || features.has(t.feature));
  // If the grant behind the active tab disappears mid-session, fall back to
  // the first visible one rather than rendering a panel with no tab selected.
  const activeTab = visibleTabs.some((t) => t.id === tab) ? tab : (visibleTabs[0]?.id ?? "users");

  // The auth redirect, loading, lookup-failure and denial states all live in
  // FeatureGate now, shared with the dashboard. Note this gate is the polite
  // half only — /api/admin/* re-checks the same grant server-side, so the
  // panels below would get 403s even if this were bypassed.
  return (
    <FeatureGate feature="AdminPage" label="the admin page">
      <div className="relative flex h-full flex-col overflow-hidden p-4 sm:p-6">
        <AmbientBackground intensity={0.85} />

        <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-6">
          <Card className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-4">
            <div className="mb-4 shrink-0">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setTab(String(key) as TabId)}
                aria-label="Admin sections"
              >
                <Tabs.ListContainer>
                  <Tabs.List>
                    {visibleTabs.map((t) => (
                      <Tabs.Tab key={t.id} id={t.id} className="px-3 py-1.5 text-sm">
                        {t.label}
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </Tabs.ListContainer>
                {/* Panels stay empty and the active section renders below —
                    same approach as WeeklyTrendChart/ListBoxComponent, which use
                    Tabs purely as a selector. */}
                {visibleTabs.map((t) => (
                  <Tabs.Panel key={t.id} id={t.id} className="hidden">
                    {null}
                  </Tabs.Panel>
                ))}
              </Tabs>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* `enabled` defers each panel's fetch until its tab is actually
                  opened, so landing on Admin doesn't pull every dataset. */}
              {activeTab === "users" && <AdminUsersPanel enabled />}
              {activeTab === "userTypes" && <AdminUserTypesPanel enabled />}
              {activeTab === "teams" && <AdminTeamsPanel enabled />}
            </div>
          </Card>
        </div>
      </div>
    </FeatureGate>
  );
}

export default AdminDashboard;
