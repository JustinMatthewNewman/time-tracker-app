"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, Skeleton } from "@heroui/react";
import { useTickets } from "@/context/TicketsContext";
import { useTicketColors } from "@/hooks/useTicketColors";
import { buildTicketTitleMap, formatDuration, truncateTicketTitle, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { formatDayKey, todayDayKey } from "@/lib/dayKeys";
import { buildDayBreakdowns, buildWeekDayKeys, type DayBreakdown } from "@/lib/weekdayBreakdown";

// How many ticket rows a day column lists before folding the rest into a
// "+N more" line. Five is what the Calendar day dialog settled on for the
// same job — enough to see where the day actually went without the column
// becoming a scrolling list.
const TICKETS_PER_DAY = 5;

interface WeekdayBreakdownProps {
  /**
   * The shared week-scoped entry set (selected week + the prior one). No
   * filtering needed here: only the selected week's day keys are ever looked
   * up, so the prior week's entries go unread.
   */
  entries: Parameters<typeof buildDayBreakdowns>[0];
  loading?: boolean;
  weekStart: Date;
  showWeekends: boolean;
}

/**
 * The week's work, one column per day.
 *
 * Deliberately NOT a stacked multi-colour bar per day. Two reasons: a tiny
 * multi-colour mark in a narrow column is illegible (the Calendar widget
 * already replaced a per-day donut with a ranked list for exactly this), and
 * chartColor.ts derives its categorical hues by hue-rotating one --accent
 * token in 45° steps — fine beside a text label, but a stacked bar is the one
 * case where adjacent-segment colour discrimination carries the whole message.
 * So: a single-hue magnitude bar for cross-day comparison, and text for
 * identity.
 */
export function WeekdayBreakdown({ entries, loading, weekStart, showWeekends }: WeekdayBreakdownProps) {
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
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold">Weekday breakdown</h2>
        <span className="text-sm text-foreground/60 tabular-nums">
          {formatDuration(weekTotalMinutes)} across {showWeekends ? 7 : 5} days
        </span>
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
          other chart on this page carries. */}
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
  colorFor: (ticket: number | string | null | undefined) => string | null;
}

function DayColumn({ day, isToday, busiestMinutes, colorFor }: DayColumnProps) {
  const shown = day.tickets.slice(0, TICKETS_PER_DAY);
  const overflow = day.tickets.length - shown.length;
  const barPct = busiestMinutes > 0 ? (day.totalMinutes / busiestMinutes) * 100 : 0;

  const weekday = formatDayKey(day.dayKey, { weekday: "short" });
  const monthDay = formatDayKey(day.dayKey, { month: "short", day: "numeric" });

  return (
    <div
      role="listitem"
      className={`flex min-w-0 flex-col gap-2 rounded-lg p-2 transition-colors ${
        isToday ? "bg-accent/8 ring-1 ring-accent/30" : ""
      }`}
    >
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-foreground">
          {weekday}
          {isToday && <span className="ml-1 text-[10px] font-normal text-accent">today</span>}
        </span>
        <span className="truncate text-[11px] text-foreground/50 tabular-nums">{monthDay}</span>
      </div>

      <p className="text-xl font-semibold text-foreground tabular-nums">
        {day.totalMinutes > 0 ? formatDuration(day.totalMinutes) : <span className="text-foreground/30">—</span>}
      </p>

      {/* Single-hue magnitude bar: 4px rounded data-end, anchored to a
          recessive track so an empty day still reads as a zero rather than
          as missing. */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-default">
        <div
          className="h-full rounded-r-[4px] bg-accent"
          style={{ width: `${barPct}%` }}
          aria-hidden
        />
      </div>

      {day.tickets.length === 0 ? (
        <p className="text-[11px] text-foreground/40">No time logged</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {shown.map((t) => {
            const color = colorFor(t.ticket);
            const isUnassigned = t.ticket === UNASSIGNED_TICKET;
            return (
              <li key={t.ticket} className="flex min-w-0 items-center gap-1.5 text-[11px]">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color ?? "var(--muted)" }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate">
                  {isUnassigned ? (
                    <span className="text-foreground/50">{UNASSIGNED_TICKET}</span>
                  ) : (
                    <Link
                      href={`/ticket/${t.ticket}`}
                      className="text-foreground/80 hover:text-foreground hover:underline"
                      title={t.title ? `${t.ticket} - ${t.title}` : t.ticket}
                    >
                      {t.ticket}
                      {t.title && (
                        <span className="text-foreground/40"> {truncateTicketTitle(t.title)}</span>
                      )}
                    </Link>
                  )}
                </span>
                <span className="shrink-0 text-foreground/50 tabular-nums">
                  {Math.round(t.percentOfDay)}%
                </span>
              </li>
            );
          })}
          {overflow > 0 && (
            <li className="text-[11px] text-foreground/40">
              +{overflow} more ticket{overflow === 1 ? "" : "s"}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default WeekdayBreakdown;
