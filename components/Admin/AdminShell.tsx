"use client";

import type { ReactNode } from "react";
import { Card } from "@heroui/react";
import { Bars, ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import AmbientBackground from "@/components/AmbientBackground";
import FeatureGate from "@/components/FeatureGate";
import { useSidebar } from "@/context/SideBarContext";
import { useBorders } from "@/context/BordersContext";
import type { FeatureName } from "@/lib/features";

interface AdminShellProps {
  feature: FeatureName;
  gateLabel: string;
  /** Sidebar contents — a <nav> supplied by the page. */
  nav: ReactNode;
  heading: string;
  description: string;
  /** Extra header row under the title, e.g. the team range toggle. */
  headerExtra?: ReactNode;
  children: ReactNode;
}

/**
 * The sidebar-plus-card frame shared by the two admin pages, mirroring
 * DashboardLayout's.
 *
 * Extracted when Admin and Admin Dashboard became separate nav items: the two
 * pages differ only in their sidebar, heading and body, and duplicating the
 * responsive/mobile-toggle scaffolding for that would mean fixing every layout
 * bug twice.
 *
 * The FeatureGate here is the polite half only — /api/admin/* re-checks the
 * same grants server-side, so the panels inside would get 403s even if this
 * were bypassed.
 */
export function AdminShell({
  feature,
  gateLabel,
  nav,
  heading,
  description,
  headerExtra,
  children,
}: AdminShellProps) {
  const { isOpen, toggle: toggleSidebar } = useSidebar();
  const { bordersEnabled } = useBorders();

  return (
    <FeatureGate feature={feature} label={gateLabel}>
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
            <div className="h-full w-full bg-default-50 p-4 md:w-88">{nav}</div>
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
                {headerExtra}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
            </Card>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

export default AdminShell;
