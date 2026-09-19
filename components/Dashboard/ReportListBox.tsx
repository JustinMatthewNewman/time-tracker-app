"use client";

import { SideNavListBox } from "@/components/Utilities/SideNavListBox";
import { REPORTS, type ReportId } from "./reportTypes";

interface ReportListBoxProps {
  selectedReportId: ReportId;
  onSelectReport: (id: ReportId) => void;
}

// Thin wrapper over the shared sidebar list. The markup used to live here and
// was copied into the admin pages; it moved to SideNavListBox so those match
// this by construction rather than by keeping three copies of the same
// class strings in sync.
export function ReportListBox({ selectedReportId, onSelectReport }: ReportListBoxProps) {
  return (
    <SideNavListBox
      ariaLabel="Report types"
      items={REPORTS.map((report) => ({
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
