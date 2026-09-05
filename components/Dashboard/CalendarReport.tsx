"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Skeleton } from "@heroui/react";
import { useTimeEntriesByDateRange, type RangeTimeEntry } from "@/hooks/useTimeEntriesByDateRange";
import { useWorkLogs } from "@/hooks/useWorkLogs";
import { useSelectedWorkLog } from "@/context/SelectedWorkLogContext";
import { useBorders } from "@/context/BordersContext";
import { useTickets } from "@/context/TicketsContext";
import { useTicketColors } from "@/hooks/useTicketColors";
import { groupByTicket, formatDuration, buildTicketTitleMap, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { getSeriesColor, NEUTRAL_SERIES_COLOR, type SeriesColor } from "./chartColor";
import { startOfMonth, buildMonthGrid, type MonthGridDay } from "@/lib/monthBuckets";
import { normalizeDayKey } from "@/lib/dayKeys";
import { ChartTooltip, useChartTooltip } from "./ChartTooltip";
import { MonthSelector } from "./MonthSelector";
import { TicketTitleSuffix } from "./TicketTitleSuffix";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TOP_TICKETS_PER_DAY = 5;
const HIDE_WEEKENDS_STORAGE_KEY = "calendar-hide-weekends";

// Same neutral-vs-rotated slice convention as TicketBreakdown.tsx, kept as
// its own small copy here since the two live in different report widgets.
function sliceStyle(ticket: string, colorIndex: number): SeriesColor {
  if (ticket === UNASSIGNED_TICKET) return NEUTRAL_SERIES_COLOR;
  return getSeriesColor(colorIndex);
}

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

interface TicketShare {
  ticket: string;
  totalMinutes: number;
  pct: number;
  color: string;
  filter?: string;
}

interface DayTotal {
  totalMinutes: number;
  topTickets: TicketShare[];
  overflowCount: number;
}

// colorFor is threaded in rather than read from a hook, so this stays a pure
// function of its inputs and the day cells keep memoizing cleanly.
function summarizeDay(
  entries: RangeTimeEntry[],
  colorFor: (ticket: string) => string | null
): DayTotal {
  const totals = groupByTicket(entries).sort((a, b) => b.totalMinutes - a.totalMinutes);
  const totalMinutes = totals.reduce((sum, t) => sum + t.totalMinutes, 0);
  const topTickets = totals.slice(0, TOP_TICKETS_PER_DAY).map((t, i) => {
    const assigned = colorFor(t.ticket);
    return {
      ticket: t.ticket,
      totalMinutes: t.totalMinutes,
      pct: totalMinutes > 0 ? Math.round((t.totalMinutes / totalMinutes) * 100) : 0,
      ...(assigned ? { color: assigned } : sliceStyle(t.ticket, i)),
    };
  });
  return { totalMinutes, topTickets, overflowCount: Math.max(0, totals.length - TOP_TICKETS_PER_DAY) };
}

export function CalendarReport() {
  const router = useRouter();
  const { bordersEnabled } = useBorders();
  const { setSelectedWorkLogId, setFocusEntryId } = useSelectedWorkLog();
  const { tooltip, showAt, hide } = useChartTooltip<{ day: MonthGridDay; summary: DayTotal }>();

  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));

  // Client-only preference (view-scoped, not per-account), mirrored to
  // localStorage the same lightweight way PerformanceModeContext does —
  // read after mount to avoid an SSR/hydration mismatch on window.
  const [hideWeekends, setHideWeekends] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHideWeekends(window.localStorage.getItem(HIDE_WEEKENDS_STORAGE_KEY) === "true");
  }, []);

  function toggleHideWeekends() {
    setHideWeekends((prev) => {
      const next = !prev;
      window.localStorage.setItem(HIDE_WEEKENDS_STORAGE_KEY, String(next));
      return next;
    });
  }

  const grid = useMemo(() => buildMonthGrid(monthStart), [monthStart]);
  const visibleGrid = useMemo(
    () => (hideWeekends ? grid.filter((day) => day.date.getDay() !== 0 && day.date.getDay() !== 6) : grid),
    [grid, hideWeekends]
  );
  const gridColsClass = hideWeekends ? "grid-cols-5" : "grid-cols-7";
  const firstDay = grid[0].date;
  const lastDay = grid[grid.length - 1].date;
  const { startDate, endDate } = useMemo(
    () => ({ startDate: isoLocalMidnight(firstDay), endDate: isoLocalMidnight(lastDay) }),
    [firstDay, lastDay]
  );

  const { entries, loading: entriesLoading, error } = useTimeEntriesByDateRange(startDate, endDate);
  const { workLogs, loading: workLogsLoading } = useWorkLogs();
  const { tickets } = useTickets();
  const ticketTitleByNumber = useMemo(() => buildTicketTitleMap(tickets), [tickets]);
  const ticketColors = useTicketColors();

  const entriesByDay = useMemo(() => {
    const map = new Map<string, RangeTimeEntry[]>();
    for (const entry of entries) {
      const key = normalizeDayKey(entry.date);
      const bucket = map.get(key);
      if (bucket) bucket.push(entry);
      else map.set(key, [entry]);
    }
    return map;
  }, [entries]);

  // A day can in principle have more than one work log; the earliest-created
  // one wins so the click target stays stable rather than flip-flopping as
  // new logs are added for the same date.
  const workLogIdByDate = useMemo(() => {
    const sorted = [...workLogs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const map = new Map<string, string>();
    for (const log of sorted) {
      const key = normalizeDayKey(log.workLogDate);
      if (!map.has(key)) map.set(key, log.id);
    }
    return map;
  }, [workLogs]);

  const loading = entriesLoading || workLogsLoading;

  function goToDay(dayKey: string) {
    const workLogId = workLogIdByDate.get(dayKey);
    if (!workLogId) return;
    setSelectedWorkLogId(workLogId);
    setFocusEntryId(null);
    router.push("/worklogs");
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center justify-between gap-3">
        <MonthSelector monthStart={monthStart} onChange={setMonthStart} />
        <Button
          variant={hideWeekends ? "primary" : "outline"}
          size="sm"
          aria-pressed={hideWeekends}
          onClick={toggleHideWeekends}
        >
          {hideWeekends ? "Show weekends" : "Hide weekends"}
        </Button>
      </div>

      <Card className="p-4">
        <div className={`mb-2 grid ${gridColsClass} gap-1.5 text-center text-xs font-medium text-foreground/50`}>
          {(hideWeekends ? WEEKDAY_LABELS.slice(0, 5) : WEEKDAY_LABELS).map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {loading ? (
          <div className={`grid ${gridColsClass} gap-1.5`}>
            {Array.from({ length: visibleGrid.length }, (_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className={`relative grid ${gridColsClass} gap-1.5`}>
            {visibleGrid.map((day) => {
              const dayEntries = entriesByDay.get(day.dayKey) ?? [];
              const summary = summarizeDay(dayEntries, ticketColors.colorFor);
              const workLogId = workLogIdByDate.get(day.dayKey);
              const clickable = day.isCurrentMonth && !!workLogId;

              return (
                <button
                  key={day.dayKey}
                  type="button"
                  disabled={!clickable}
                  onClick={() => goToDay(day.dayKey)}
                  onPointerEnter={(e) => day.isCurrentMonth && showAt(e, { day, summary })}
                  onPointerLeave={hide}
                  className={`flex h-32 w-full flex-col items-stretch gap-1 rounded-lg p-1.5 text-left transition-colors ${
                    day.isCurrentMonth ? "" : "opacity-30"
                  } ${bordersEnabled ? "border border-default-200" : ""} ${
                    clickable ? "cursor-pointer hover:bg-accent-soft" : "cursor-default"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-[11px] tabular-nums text-foreground/60">{day.date.getDate()}</span>
                    {day.isCurrentMonth && summary.totalMinutes > 0 && (
                      <span className="truncate text-[10px] tabular-nums text-foreground/40">
                        {formatDuration(summary.totalMinutes)}
                      </span>
                    )}
                  </div>

                  {day.isCurrentMonth && (
                    <div className="flex min-h-0 flex-1 flex-col justify-start gap-0.5 overflow-hidden">
                      {summary.topTickets.length === 0 ? (
                        <span className="text-[10px] text-foreground/30">No hours</span>
                      ) : (
                        <>
                          {summary.topTickets.map((t) => (
                            <div key={t.ticket} className="flex min-w-0 items-center gap-1 text-[10px] leading-tight">
                              <span
                                className="size-1.5 shrink-0 rounded-full"
                                style={{ backgroundColor: t.color, filter: t.filter }}
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 truncate text-foreground/80">
                                {t.ticket}
                                <TicketTitleSuffix
                                  title={t.ticket !== UNASSIGNED_TICKET ? ticketTitleByNumber.get(Number(t.ticket)) : null}
                                />
                              </span>
                              <span className="shrink-0 tabular-nums text-foreground/50">{t.pct}%</span>
                            </div>
                          ))}
                          {summary.overflowCount > 0 && (
                            <span className="text-[10px] text-foreground/30">+{summary.overflowCount} more</span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {tooltip && (
              <ChartTooltip x={tooltip.x} y={tooltip.y}>
                <div className="font-medium text-foreground">
                  {tooltip.data.day.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="text-foreground/60">
                  {tooltip.data.summary.totalMinutes > 0
                    ? formatDuration(tooltip.data.summary.totalMinutes)
                    : "No hours logged"}
                </div>
                {!workLogIdByDate.get(tooltip.data.day.dayKey) && (
                  <div className="mt-0.5 text-[11px] text-foreground/40">No work log for this day</div>
                )}
              </ChartTooltip>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default CalendarReport;
