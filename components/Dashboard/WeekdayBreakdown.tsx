"use client";

import { useMemo } from "react";
import { Card, Skeleton, ToggleButton, ToggleButtonGroup, Tooltip } from "@heroui/react";
import { Clock } from "@gravity-ui/icons";
import { useTickets } from "@/context/TicketsContext";
import { useTicketColors } from "@/hooks/useTicketColors";
import { buildTicketTitleMap, formatDuration } from "@/lib/timeTotals";
import { formatDayKey, todayDayKey } from "@/lib/dayKeys";
import {
  buildDayBreakdowns,
  buildWeekDayKeys,
  type BreakdownEntry,
  type DayBreakdown,
} from "@/lib/weekdayBreakdown";
import { DayHeading, TicketChipRow, type ColorFor } from "./WeekdayParts";
import { WeekdayTimeline } from "./WeekdayTimeline";

interface WeekdayBreakdownProps {
  /**
   * The shared week-scoped entry set (selected week + the prior one). No
   * filtering needed here: only the selected week's day keys are ever looked
   * up, so the prior week's entries go unread.
   */
  entries: BreakdownEntry[];
  loading?: boolean;
  weekStart: Date;
  showWeekends: boolean;
  /** False = rank each day's tickets; true = 15-minute slot timeline. */
  timelineView: boolean;
  onTimelineViewChange: (value: boolean) => void;
}

/**
 * The week's work, one column per day, in one of two layouts.
 *
 * Neither layout uses a stacked multi-colour bar per day. Two reasons: a tiny
 * multi-colour mark in a narrow column is illegible (the Calendar widget
 * already replaced a per-day donut with a ranked list for exactly this), and
 * chartColor.ts derives its categorical hues by hue-rotating one --accent
 * token in 45° steps — fine beside a text label, but a stacked bar is the one
 * case where adjacent-segment colour discrimination carries the whole message.
 */
export function WeekdayBreakdown({
  entries,
  loading,
  weekStart,
  showWeekends,
  timelineView,
  onTimelineViewChange,
}: WeekdayBreakdownProps) {
  const { tickets } = useTickets();
  const ticketColors = useTicketColors();
  const ticketTitleByNumber = useMemo(() => buildTicketTitleMap(tickets), [tickets]);

  const dayKeys = useMemo(() => buildWeekDayKeys(weekStart, showWeekends), [weekStart, showWeekends]);
  const days = useMemo(
    () => buildDayBreakdowns(entries, dayKeys, ticketTitleByNumber),
    [entries, dayKeys, ticketTitleByNumber]
  );

  // Scaled against the busiest *shown* day, so the bars compare days to each
  // other rather than to an absolute workday length.
  const busiestMinutes = Math.max(0, ...days.map((d) => d.totalMinutes));
  const weekTotalMinutes = days.reduce((sum, d) => sum + d.totalMinutes, 0);
  const today = todayDayKey();

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-lg font-semibold">Weekday breakdown</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {/* Icon toggle, matching the weekend control in the filter row
              above — see the note there on why these stopped being labelled
              switches. The accessible name spells out both the layout it
              switches to and what that layout is. */}
          <ToggleButtonGroup
            selectionMode="multiple"
            selectedKeys={timelineView ? ["timeline"] : []}
            onSelectionChange={(keys) => onTimelineViewChange(keys.has("timeline"))}
            size="sm"
            aria-label="Weekday breakdown layout"
          >
            <Tooltip>
              <Tooltip.Trigger>
                <ToggleButton
                  id="timeline"
                  isIconOnly
                  aria-label={
                    timelineView
                      ? "Show each day's tickets ranked by time"
                      : "Show each day as 15-minute time slots"
                  }
                >
                  <Clock className="size-4" aria-hidden />
                </ToggleButton>
              </Tooltip.Trigger>
              <Tooltip.Content>{timelineView ? "Ranked tickets" : "Time slots"}</Tooltip.Content>
            </Tooltip>
          </ToggleButtonGroup>
          <span className="text-sm text-foreground/60 tabular-nums">
            {formatDuration(weekTotalMinutes)} across {showWeekends ? 7 : 5} days
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: showWeekends ? 7 : 5 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      ) : timelineView ? (
        <WeekdayTimeline
          entries={entries}
          days={days}
          ticketTitleByNumber={ticketTitleByNumber}
          busiestMinutes={busiestMinutes}
          today={today}
          colorFor={ticketColors.colorFor}
        />
      ) : (
        /* Scrolls inside its own container when 7 columns won't fit, so the
           page body never scrolls horizontally. */
        <div className="overflow-x-auto">
          <div
            className={`grid min-w-[36rem] gap-3 ${showWeekends ? "grid-cols-7" : "grid-cols-5"}`}
            role="list"
          >
            {days.map((day) => (
              <DayColumn
                key={day.dayKey}
                day={day}
                isToday={day.dayKey === today}
                busiestMinutes={busiestMinutes}
                colorFor={ticketColors.colorFor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Table view of the same numbers — the accessibility fallback every
          other chart on this page carries. Deliberately the per-day ticket
          summary in both layouts: the timeline's own slots are individually
          labelled, and a 7x40 slot table would bury this summary. */}
      <table className="sr-only">
        <caption>Hours and tickets per day</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Total hours</th>
            <th>Tickets</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.dayKey}>
              <td>{formatDayKey(day.dayKey)}</td>
              <td>{formatDuration(day.totalMinutes)}</td>
              <td>
                {day.tickets.length === 0
                  ? "None"
                  : day.tickets
                      .map((t) => `${t.ticket} (${formatDuration(t.totalMinutes)})`)
                      .join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

interface DayColumnProps {
  day: DayBreakdown;
  isToday: boolean;
  busiestMinutes: number;
  colorFor: ColorFor;
}

function DayColumn({ day, isToday, busiestMinutes, colorFor }: DayColumnProps) {
  return (
    <div
      role="listitem"
      // h-full so every column is as tall as the row — which the grid sizes
      // to the day with the most tickets. Without it a short day's "today"
      // highlight would stop part way down while its neighbours ran on.
      className={`flex h-full min-w-0 flex-col gap-2 rounded-lg p-2 transition-colors ${
        isToday ? "bg-accent/8 ring-1 ring-accent/30" : ""
      }`}
    >
      <DayHeading
        dayKey={day.dayKey}
        totalMinutes={day.totalMinutes}
        isToday={isToday}
        busiestMinutes={busiestMinutes}
      />

      {day.tickets.length === 0 ? (
        <p className="text-[11px] text-foreground/40">No time logged</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {day.tickets.map((t) => (
            <li key={t.ticket}>
              <TicketChipRow ticket={t} color={colorFor(t.ticket)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WeekdayBreakdown;
