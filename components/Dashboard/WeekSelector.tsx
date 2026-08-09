"use client";

import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { startOfWeek, weekKey, weekLabel } from "@/lib/weekBuckets";

interface WeekSelectorProps {
  weekStart: Date;
  onChange: (weekStart: Date) => void;
}

export function WeekSelector({ weekStart, onChange }: WeekSelectorProps) {
  const currentWeekStart = startOfWeek(new Date());
  const isCurrentWeek = weekKey(weekStart) === weekKey(currentWeekStart);

  function shiftWeeks(delta: number) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    onChange(next);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Previous week"
        onClick={() => shiftWeeks(-1)}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>

      <span className="min-w-[11rem] text-center text-sm font-medium tabular-nums">
        {weekLabel(weekStart)}
      </span>

      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Next week"
        isDisabled={isCurrentWeek}
        onClick={() => shiftWeeks(1)}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>

      {!isCurrentWeek && (
        <Button variant="outline" size="sm" className="ml-1" onClick={() => onChange(currentWeekStart)}>
          This week
        </Button>
      )}
    </div>
  );
}

export default WeekSelector;
