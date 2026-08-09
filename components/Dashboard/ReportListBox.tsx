"use client";

import { Tabs, Label } from "@heroui/react";
import type { Key } from "react-aria-components";
import { useBorders } from "@/context/BordersContext";
import { REPORTS, type ReportId } from "./reportTypes";

interface ReportListBoxProps {
  selectedReportId: ReportId;
  onSelectReport: (id: ReportId) => void;
}

export function ReportListBox({ selectedReportId, onSelectReport }: ReportListBoxProps) {
  const { bordersEnabled } = useBorders();

  const handleSelectionChange = (key: Key) => {
    if (key != null) onSelectReport(String(key) as ReportId);
  };

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-3">
      <div className="min-h-0 flex-1">
        <Tabs
          orientation="vertical"
          className="h-full w-full min-h-0"
          selectedKey={selectedReportId}
          onSelectionChange={handleSelectionChange}
        >
          <Tabs.ListContainer className="h-full w-full min-w-0">
            <Tabs.List
              aria-label="Report types"
              className={`h-full w-full min-w-0 overflow-hidden bg-surface ${
                bordersEnabled ? "border border-default-200" : ""
              }`}
              data-glass="surface"
            >
              {REPORTS.map((report) => {
                const Icon = report.icon;
                return (
                  <Tabs.Tab
                    key={report.id}
                    id={report.id}
                    className="h-auto w-full min-w-0 justify-start border-l-2 border-transparent px-3 py-2 text-left text-foreground/60 data-[selected=true]:border-accent data-[selected=true]:bg-accent-soft data-[selected=true]:text-foreground"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Label className="truncate font-medium">{report.label}</Label>
                        <span className="truncate text-sm text-gray-500">{report.description}</span>
                      </div>
                    </div>
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>
          </Tabs.ListContainer>

          {REPORTS.map((report) => (
            <Tabs.Panel key={report.id} id={report.id} className="hidden">
              {null}
            </Tabs.Panel>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default ReportListBox;
