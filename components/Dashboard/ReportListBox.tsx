"use client";

import { SideNavListBox } from "@/components/Utilities/SideNavListBox";
import type { ReportDef, ReportId } from "./reportTypes";

interface ReportListBoxProps {
  /** Already filtered by grant — this component does not gate. */
  reports: ReportDef[];
  selectedReportId: ReportId;
  onSelectReport: (id: ReportId) => void;
}

// Thin wrapper over the shared sidebar list. The markup used to live here and
// was copied into the admin pages; it moved to SideNavListBox so those match
// this by construction rather than by keeping three copies of the same
// class strings in sync.
export function ReportListBox({ reports, selectedReportId, onSelectReport }: ReportListBoxProps) {
  return (
    <SideNavListBox
      ariaLabel="Report types"
      items={reports.map((report) => ({
        id: report.id,
        label: report.label,
        description: report.description,
        icon: report.icon,
      }))}
      selectedId={selectedReportId}
      onSelect={(id) => onSelectReport(id as ReportId)}
    />
  );
}

export default ReportListBox;
