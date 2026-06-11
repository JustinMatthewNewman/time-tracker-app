"use client";

import { useMemo } from "react";
import { ListBox, Button, Label } from "@heroui/react";

function formatDate(date) {
  return date.toISOString().split("T")[0]; // yyyy-mm-dd
}

function getDateLabel(date, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Yesterday";
  return formatDate(date);
}

function generateDates(daysBack = 7) {
  const today = new Date();
  return Array.from({ length: daysBack }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d;
  });
}

export function DateListBox() {
  const items = useMemo(() => {
    return generateDates(10).map((date, index) => ({
      id: date.toISOString(),
      date,
      label: getDateLabel(date, index),
    }));
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <ListBox aria-label="Dates" className="w-[260px]" selectionMode="single">
        {items.map((item, index) => (
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
          const exportData = items.map((i) => i.date.toISOString());
          console.log("Export:", exportData);

          // you can replace with real export logic (CSV, API, etc.)
        }}
      >
        Export
      </Button>
    </div>
  );
}

export default DateListBox;