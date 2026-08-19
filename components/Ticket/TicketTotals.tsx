"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ListBox, Select, Skeleton } from "@heroui/react";
import { ChevronDown, Copy, CopyCheck } from "@gravity-ui/icons";
import { formatDecimalHours, formatDuration, minutesBetween } from "@/lib/timeTotals";
import { formatDayKey, todayDayKey, type DayKey } from "@/lib/dayKeys";
import type { TicketTimeEntry } from "@/hooks/useTimeEntriesByTicket";

interface TicketTotalsProps {
  // Takes the page's already-bucketed map rather than the flat entry list so
  // these readouts and the day-by-day accordion below them can never disagree
  // about which day an entry belongs to — they read the exact same buckets.
  entriesByDay: Map<DayKey, TicketTimeEntry[]>;
  /** Day keys, newest first (the page's existing sort order). */
  days: DayKey[];
  loading?: boolean;
}

const DAY_OPTION_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
};

const COPIED_RESET_MS = 1500;

// Matches the "Office" field's label treatment in TicketPage, so these read as
// peers of it in the header rather than as transplanted dashboard tiles.
const FIELD_LABEL = "text-xs font-medium uppercase tracking-wide text-foreground/50";

// The decimal-hours readout is the number that gets pasted into a timesheet,
// so it carries the copy affordance — same pairing (and icon swap) as the
// Hours column in components/WorkLogs/TicketBreakdown.tsx.
function ValueRow({ minutes, copyLabel }: { minutes: number; copyLabel: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clears on unmount so a pending reset can't fire against a gone component
  // (this unmounts as soon as an entries refetch flips back to loading).
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const decimal = formatDecimalHours(minutes);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(decimal);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-base font-semibold tabular-nums text-foreground">
        {formatDuration(minutes)}
      </span>
      <span className="text-sm tabular-nums text-foreground/50">= {decimal}</span>
      <button
        type="button"
        aria-label={copyLabel}
        onClick={handleCopy}
        className="flex size-6 shrink-0 items-center justify-center rounded text-foreground/40 hover:bg-default hover:text-foreground"
      >
        {copied ? <CopyCheck className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

export function TicketTotals({ entriesByDay, days, loading }: TicketTotalsProps) {
  const today = todayDayKey();

  const minutesByDay = useMemo(() => {
    const totals = new Map<DayKey, number>();
    for (const [day, dayEntries] of entriesByDay) {
      totals.set(
        day,
        dayEntries.reduce((sum, entry) => sum + minutesBetween(entry.startTime, entry.endTime), 0)
      );
    }
    return totals;
  }, [entriesByDay]);

  const totalMinutes = useMemo(
    () => [...minutesByDay.values()].reduce((sum, minutes) => sum + minutes, 0),
    [minutesByDay]
  );

  // Today is always offered, even with nothing logged against this ticket
  // today — this picker absorbed the old standalone "Today" readout, so today
  // has to stay reachable rather than vanishing from the list.
  const dayOptions = useMemo(
    () => (days.includes(today) ? days : [...days, today].sort((a, b) => b.localeCompare(a))),
    [days, today]
  );

  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null);

  // Resolved at render rather than synced into state by an effect: `days` is
  // empty until the entries finish loading, and a selected day can vanish on a
  // refetch (its last entry re-pointed at another ticket). Falling back to
  // today here covers both without a set-state-in-effect.
  const effectiveDay = selectedDay && dayOptions.includes(selectedDay) ? selectedDay : today;
  const dayLabel = (day: DayKey) => (day === today ? "Today" : formatDayKey(day, DAY_OPTION_FORMAT));

  if (loading) {
    return (
      <div className="flex flex-wrap items-start gap-8 sm:justify-end">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-8 sm:justify-end">
      <div className="flex flex-col items-end gap-1">
        {/* h-9 matches the Select trigger's own min-height beside it, so the
            plain label and the trigger share a baseline — otherwise the two
            value rows underneath sit at different heights. */}
        <span className={`flex h-9 items-center ${FIELD_LABEL}`}>Total time on ticket</span>
        <ValueRow minutes={totalMinutes} copyLabel="Copy total hours on ticket" />
      </div>

      <div className="flex flex-col items-end gap-1">
        <Select
          selectedKey={effectiveDay}
          onSelectionChange={(key) => setSelectedDay(String(key))}
          aria-label="Show total for day"
        >
          {/* The indicator is absolutely positioned (inset-inline-end: 0.5rem),
              and HeroUI reserves room for it with padding-inline-end: 1.75rem
              on the trigger — so set the left padding only. A blanket `px-*`
              overwrites that reserved space and the arrow lands on the text.
              pe-9 widens the gutter to clear the larger chevron below. */}
          <Select.Trigger
            className={`w-fit rounded-md border-none bg-transparent ps-2 pe-9 shadow-none hover:bg-default ${FIELD_LABEL}`}
          >
            <Select.Value />
            {/* Passing an explicit icon rather than sizing the default one:
                `.select__indicator[data-slot=select-default-indicator]` pins
                it to size-4 at a specificity a utility class can't beat. */}
            <Select.Indicator>
              <ChevronDown className="size-5" />
            </Select.Indicator>
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {dayOptions.map((day) => (
                <ListBox.Item key={day} id={day} textValue={dayLabel(day)}>
                  <span className="flex w-full items-center justify-between gap-6 py-0.5">
                    <span>{dayLabel(day)}</span>
                    <span className="tabular-nums text-foreground/50">
                      {formatDuration(minutesByDay.get(day) ?? 0)}
                    </span>
                  </span>
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <ValueRow
          minutes={minutesByDay.get(effectiveDay) ?? 0}
          copyLabel={`Copy hours for ${dayLabel(effectiveDay)}`}
        />
      </div>
    </div>
  );
}

export default TicketTotals;
