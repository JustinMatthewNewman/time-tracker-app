"use client";

import { useMemo } from "react";
import { ListBox, Button, Label } from "@heroui/react";
import type { Selection } from "react-aria-components";
import { useWorkLogs } from "@/hooks/useWorkLogs";
import { useSelectedWorkLog } from "@/context/SelectedWorkLogContext";

function formatDate(isoDate: string) {
  return new Date(isoDate).toISOString().split("T")[0]; // yyyy-mm-dd
}

export function WorkLogListBox() {
  const { workLogs, loading, error } = useWorkLogs();
  const { selectedWorkLogId, setSelectedWorkLogId } = useSelectedWorkLog();

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

  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const [firstKey] = keys;
    setSelectedWorkLogId(firstKey != null ? String(firstKey) : null);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading work logs...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ListBox
        aria-label="Work Logs"
        className="w-[260px]"
        selectionMode="single"
        selectedKeys={selectedWorkLogId ? [selectedWorkLogId] : []}
        onSelectionChange={handleSelectionChange}
      >
        {items.map((item) => (
          <ListBox.Item key={item.id} id={item.id} textValue={item.label}>
            <div className="flex flex-col">
              <Label className="font-medium">{item.label}</Label>
              <span className="text-sm text-gray-500">
                {formatDate(item.date)}
              </span>
            </div>

            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>

      {/* Export Button */}
      <Button
        onPress={() => {
          const exportData = items.map((i) => ({ id: i.id, date: i.date }));
          console.log("Export:", exportData);

          // you can replace with real export logic (CSV, API, etc.)
        }}
      >
        Export
      </Button>
    </div>
  );
}

export default WorkLogListBox;
