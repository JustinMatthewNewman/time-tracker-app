"use client";

import { useState } from "react";
import { Card } from "@heroui/react";
import { Bars, ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { useSidebar } from "@/context/SideBarContext";
import { useFeatures } from "@/hooks/useFeatures";
import { useBorders } from "@/context/BordersContext";
import { ReportListBox } from "./ReportListBox";
import { REPORTS, type ReportId } from "./reportTypes";
import { OverviewReport } from "./OverviewReport";
import { TicketsReport } from "./TicketsReport";
import { WorkLogsReport } from "./WorkLogsReport";
import { AdminReport } from "./AdminReport";

function DashboardLayout() {
  const { isOpen, toggle: toggleSidebar } = useSidebar();
  const { bordersEnabled } = useBorders();
  const { features, loading: featuresLoading } = useFeatures();
  const [selectedReportId, setSelectedReportId] = useState<ReportId>("overview");

  // Withheld while the grant set is still loading, rather than rendered then
  // yanked — same reasoning as NAV_LINKS in Navbar.tsx. A gated report that
  // flashes in and disappears reads as a glitch.
  const visibleReports = REPORTS.filter(
    (report) => !report.feature || (!featuresLoading && features.has(report.feature))
  );

  // If the grant behind the selected report disappears mid-session, fall back
  // to the first visible one rather than rendering an empty pane.
  const selectedReport =
    visibleReports.find((report) => report.id === selectedReportId) ?? visibleReports[0] ?? REPORTS[0];
  const activeReportId = selectedReport.id;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Mobile view switcher: mirrors WorkLogTimeEntryCardLayout's — on
          narrow screens the sidebar and report content become mutually
          exclusive full-width panels, so this floating control is the
          primary way to switch between them. */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Show report" : "Show report types"}
        className="absolute right-4 bottom-4 z-20 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition hover:bg-accent-hover active:scale-95 md:hidden"
      >
        {isOpen ? <ChevronRight className="size-5" aria-hidden /> : <ChevronLeft className="size-5" aria-hidden />}
      </button>

      <div className="flex h-full min-h-0 flex-1 items-stretch overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            transition-all duration-300 overflow-hidden
            ${isOpen ? "w-full md:w-88" : "w-0"}
          `}
        >
          <div className="w-full md:w-88 h-full bg-default-50 p-4">
            <ReportListBox
              reports={visibleReports}
              selectedReportId={activeReportId}
              onSelectReport={setSelectedReportId}
            />
          </div>
        </aside>

        <div
          className={`flex h-full min-w-0 flex-1 min-h-0 flex-col text-foreground p-4 border-l transition-colors duration-300
            ${isOpen && bordersEnabled ? "border-default-200" : "border-transparent"}`}
        >
          <div className="grid h-full min-h-0 grid-cols-1 gap-4">
            <Card className="flex h-full min-h-0 flex-col overflow-hidden border border-default-200">
              <div
                className={`sticky top-0 z-10 flex shrink-0 items-center gap-3 p-3 ${
                  bordersEnabled ? "border-b border-default-200" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label={isOpen ? "Hide report types" : "Show report types"}
                  className="hidden size-8 shrink-0 items-center justify-center rounded-md text-foreground/60 hover:bg-default hover:text-foreground md:inline-flex"
                >
                  <Bars className="size-4" aria-hidden />
                </button>
                <span className="font-medium text-foreground">{selectedReport.label}</span>
                <span className="text-sm text-gray-500">{selectedReport.description}</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-3">
                {activeReportId === "overview" && <OverviewReport />}
                {activeReportId === "tickets" && <TicketsReport />}
                {activeReportId === "worklogs" && <WorkLogsReport />}
                {activeReportId === "admin" && <AdminReport />}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
