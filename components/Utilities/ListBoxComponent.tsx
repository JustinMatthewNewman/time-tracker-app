"use client";

import { useMemo, useState } from "react";
import { Tabs, Button, Label } from "@heroui/react";
import type { Key } from "react-aria-components";
import { useWorkLogs } from "@/hooks/useWorkLogs";
import { useSelectedWorkLog } from "@/context/SelectedWorkLogContext";
import { NewWorkLogDialog } from "./NewWorkLogDialog";

function formatDate(isoDate: string) {
  return new Date(isoDate).toISOString().split("T")[0]; // yyyy-mm-dd
}

export function WorkLogListBox() {
  const { workLogs, loading, error, createWorkLog } = useWorkLogs();
  const { selectedWorkLogId, setSelectedWorkLogId } = useSelectedWorkLog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const items = useMemo(
    () =>
      workLogs.map((log) => ({
        id: log.id,
        label: log.name,
        date: log.workLogDate,
        description: log.description,
      })),
    [workLogs]
  );

  const handleSelectionChange = (key: Key) => {
    setSelectedWorkLogId(key != null ? String(key) : null);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading work logs...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-3">
      <Tabs
        orientation="vertical"
        className="w-full min-h-0 flex-1 overflow-hidden"
        selectedKey={selectedWorkLogId ?? undefined}
        onSelectionChange={handleSelectionChange}
      >
        <Tabs.ListContainer className="h-full w-full min-w-0">
          <Tabs.List aria-label="Work Logs" className="h-full w-full min-w-0 overflow-hidden">
            {items.map((item) => (
              <Tabs.Tab
                key={item.id}
                id={item.id}
                className="h-auto w-full min-w-0 justify-start px-3 py-2 text-left"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <Label className="truncate font-medium">{item.label}</Label>
                  <span className="truncate text-sm text-gray-500">
                    {formatDate(item.date)}
                  </span>
                </div>
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {items.map((item) => (
          <Tabs.Panel key={item.id} id={item.id} className="hidden">
            {null}
          </Tabs.Panel>
        ))}
      </Tabs>

      <div className="flex gap-2">
        <Button aria-label="New work log" onPress={() => setIsDialogOpen(true)}>
          +
        </Button>

        {/* Export Button */}
        {/* <Button
          className="flex-1"
          onPress={() => {
            const exportData = items.map((i) => ({ id: i.id, date: i.date }));
            console.log("Export:", exportData);

            // you can replace with real export logic (CSV, API, etc.)
          }}
        >
          Export
        </Button> */}
      </div>

      <NewWorkLogDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreate={async (data) => {
          const { workLogId } = await createWorkLog(data);
          setSelectedWorkLogId(workLogId);
        }}
      />
    </div>
  );
}

export default WorkLogListBox;
