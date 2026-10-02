"use client";

import { useMemo } from "react";
import { buildWeekSlotGrid, formatSlotTime, SLOT_MINUTES } from "@/lib/weekdayBreakdown";
import type { BreakdownEntry, DayBreakdown } from "@/lib/weekdayBreakdown";
import { DayHeading, EmptySlot, TicketSlotChip, type ColorFor } from "./WeekdayParts";

interface WeekdayTimelineProps {
  entries: BreakdownEntry[];
  days: DayBreakdown[];
  ticketTitleByNumber: Map<number, string>;
  busiestMinutes: number;
  today: string;
  colorFor: ColorFor;
}

/**
 * The week laid out as consecutive 15-minute slots, one column per day.
 *
 * One shared time axis down the left rather than a time label repeated in
 * every column: the columns are narrow, and a shared gutter is what makes a
 * given row the same clock time across the whole week, so the days can be
 * compared by eye.
 *
 * Unbooked slots are drawn as a thin rule rather than skipped. Collapsing them
 * would make a fragmented day look identical to a solid one of the same total.
 */
export function WeekdayTimeline({
  entries,
  days,
  ticketTitleByNumber,
  busiestMinutes,
  today,
  colorFor,
}: WeekdayTimelineProps) {
  const dayKeys = useMemo(() => days.map((d) => d.dayKey), [days]);
  const { slotStarts, byDay } = useMemo(
    () => buildWeekSlotGrid(entries, dayKeys, ticketTitleByNumber),
    [entries, dayKeys, ticketTitleByNumber]
  );

  // One grid for headings and slots together, so a day's column and its
  // heading can never drift apart.
  const columns = `4.5rem repeat(${days.length}, minmax(7rem, 1fr))`;

  if (slotStarts.length === 0) {
    return <p className="py-10 text-center text-sm text-foreground/60">No time logged this week.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[40rem] gap-x-3" style={{ gridTemplateColumns: columns }}>
        {/* Heading row: an empty gutter cell, then one heading per day. */}
        <div aria-hidden />
        {days.map((day) => (
          <div
            key={day.dayKey}
            className={`rounded-t-lg px-2 pt-2 ${day.dayKey === today ? "bg-accent/8" : ""}`}
          >
            <DayHeading
              dayKey={day.dayKey}
              totalMinutes={day.totalMinutes}
              isToday={day.dayKey === today}
              busiestMinutes={busiestMinutes}
            />
          </div>
        ))}

        {slotStarts.map((startMinute, row) => {
          const timeLabel = formatSlotTime(startMinute);
          const isHour = startMinute % 60 === 0;
          const isLastRow = row === slotStarts.length - 1;

          return (
            <div key={startMinute} className="contents">
              {/* The hour reads full strength; the :15/:30/:45 steps between
                  are recessive so the gutter scans as hours at a glance. */}
              <div
                className={`flex h-[22px] items-center justify-end pt-1 text-[10px] tabular-nums ${
                  isHour ? "font-medium text-foreground/60" : "text-foreground/30"
                }`}
              >
                {timeLabel}
              </div>

              {days.map((day) => {
                const slot = byDay.get(day.dayKey)?.[row];
                return (
                  <div
                    key={day.dayKey}
                    className={`px-2 pt-1 ${day.dayKey === today ? "bg-accent/8" : ""} ${
                      isLastRow && day.dayKey === today ? "rounded-b-lg pb-2" : ""
                    }`}
                  >
                    {slot?.ticket ? (
                      <TicketSlotChip
                        ticket={slot.ticket}
                        title={slot.title}
                        color={colorFor(slot.ticket)}
                        timeLabel={`${timeLabel}, ${day.dayKey}`}
                      />
                    ) : (
                      <EmptySlot timeLabel={`${timeLabel}, ${day.dayKey}`} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-foreground/40">
        Each row is {SLOT_MINUTES} minutes. Rules mark time with nothing logged against it.
      </p>
    </div>
  );
}

export default WeekdayTimeline;
