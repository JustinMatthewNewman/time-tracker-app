"use client";

import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { startOfMonth, monthKey, monthLabel } from "@/lib/monthBuckets";

interface MonthSelectorProps {
  monthStart: Date;
  onChange: (monthStart: Date) => void;
}

export function MonthSelector({ monthStart, onChange }: MonthSelectorProps) {
  const currentMonthStart = startOfMonth(new Date());
  const isCurrentMonth = monthKey(monthStart) === monthKey(currentMonthStart);

  function shiftMonths(delta: number) {
    onChange(startOfMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1)));
  }

  return (
    <div className="flex items-center gap-2">
      <Button isIconOnly variant="ghost" size="sm" aria-label="Previous month" onClick={() => shiftMonths(-1)}>
        <ChevronLeft className="size-4" aria-hidden />
      </Button>

      <span className="min-w-[9rem] text-center text-sm font-medium tabular-nums">{monthLabel(monthStart)}</span>

      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Next month"
        isDisabled={isCurrentMonth}
        onClick={() => shiftMonths(1)}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>

      {!isCurrentMonth && (
        <Button variant="outline" size="sm" className="ml-1" onClick={() => onChange(currentMonthStart)}>
          This month
        </Button>
      )}
    </div>
  );
}

export default MonthSelector;
