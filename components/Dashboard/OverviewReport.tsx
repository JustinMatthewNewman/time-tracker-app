"use client";

import { useMemo, useState } from "react";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@heroui/react";
import { Calendar } from "@gravity-ui/icons";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { useTimeEntriesByDateRange } from "@/hooks/useTimeEntriesByDateRange";
import { useDashboardPrefs } from "@/context/DashboardPrefsContext";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";
import { startOfWeek, endOfWeek } from "@/lib/weekBuckets";
import { StatTile } from "./StatTile";
import { WeekSelector } from "./WeekSelector";
import { WeeklyStatTiles } from "./WeeklyStatTiles";
import { WeekdayBreakdown } from "./WeekdayBreakdown";
import { WeeklyTicketColumns } from "./WeeklyTicketColumns";
import { TicketsByOffice } from "./TicketsByOffice";
import { WeeklyTrendChart, MAX_TREND_WEEKS, type TrendWindow } from "./WeeklyTrendChart";
import { CalendarHeatmap } from "./CalendarHeatmap";
import { MonthlyHoursBar } from "./MonthlyHoursBar";

function isoLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

/**
 * The Overview opens on *last* week, not the current one.
 *
 * Rationale: a week in progress is always partial, so the current week reads
 * as a drop-off until Friday. The most recent *complete* week is the one worth
 * looking at by default; the selector's "This week" button is one click away.
 */
function defaultWeekStart(): Date {
  const thisWeek = startOfWeek(new Date());
  return new Date(thisWeek.getFullYear(), thisWeek.getMonth(), thisWeek.getDate() - 7);
}

/**
 * The dashboard Overview shell.
 *
 * This component owns the week selection and both fetches; every widget below
 * is presentational (entries in, chart out). That's deliberate: each widget
 * used to run its own `useTimeEntriesByDateRange`, which meant five
 * independent time scopes on one page, a dead year control, and no way to
 * render any of them for a *different* user without rewriting them.
 */
export function OverviewReport() {
  const [weekStart, setWeekStart] = useState(defaultWeekStart);
  const [trendWindow, setTrendWindow] = useState<TrendWindow>("12w");
  const { showWeekends, setShowWeekends, timelineView, setTimelineView } = useDashboardPrefs();

  // Week-scoped fetch: the selected week plus the one before it. The prior
  // week isn't displayed on its own — it's what the stat tiles compare
  // against, so fetching it here avoids a second round trip for the deltas.
  const weekRange = useMemo(() => {
    const current = startOfWeek(weekStart);
    const previous = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7);
    return { startDate: isoLocalMidnight(previous), endDate: isoLocalMidnight(endOfWeek(current)) };
  }, [weekStart]);

  const {
    entries: weekEntries,
    loading: weekLoading,
    error: weekError,
  } = useTimeEntriesByDateRange(weekRange.startDate, weekRange.endDate);

  // Long-horizon fetch: one range wide enough for every multi-month widget,
  // which each slice it down locally. MAX_TREND_WEEKS (52) reaches further
  // back than Jan 1 of the current year in every case, so it also covers the
  // heatmap's year-to-date grid and the monthly bars.
  const longRange = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - MAX_TREND_WEEKS * 7)
    );
    return { startDate: isoLocalMidnight(start), endDate: isoLocalMidnight(today), year: today.getFullYear() };
  }, []);

  const { entries: longEntries, loading: longLoading } = useTimeEntriesByDateRange(
    longRange.startDate,
    longRange.endDate
  );

  // All-time totals still need the full set. Left as-is deliberately: doing
  // this properly needs a server-side count query rather than pulling every
  // entry down to length-check it (see the note in AGENTS.md).
  const { entries: allEntries, loading: allLoading, error: allError } = useMyTimeEntries();

  const totalMinutes = useMemo(
    () => allEntries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0),
    [allEntries]
  );

  const error = weekError ?? allError;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* One filter row above the charts, holding every control that scopes
          the week-level widgets. */}
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
        {/* An icon toggle rather than a labelled switch: it sits in a row of
            icon-sized controls (the week stepper beside it), and a switch
            dragging a text label along made this row read as a settings form
            rather than as a toolbar. The label survives as the accessible
            name and the hover title, both of which state the *action* the
            press will take, so the control still says what it does. */}
        <ToggleButtonGroup
          selectionMode="multiple"
          selectedKeys={showWeekends ? ["weekends"] : []}
          onSelectionChange={(keys) => setShowWeekends(keys.has("weekends"))}
          size="sm"
          aria-label="Weekday breakdown columns"
        >
          <Tooltip>
            <Tooltip.Trigger>
              <ToggleButton
                id="weekends"
                isIconOnly
                aria-label={showWeekends ? "Hide weekends" : "Show weekends"}
              >
                <Calendar className="size-4" aria-hidden />
              </ToggleButton>
            </Tooltip.Trigger>
            <Tooltip.Content>{showWeekends ? "Hide weekends" : "Show weekends"}</Tooltip.Content>
          </Tooltip>
        </ToggleButtonGroup>
        <WeekSelector weekStart={weekStart} onChange={setWeekStart} />
      </div>

      <WeeklyStatTiles entries={weekEntries} loading={weekLoading} weekStart={weekStart} />

      <WeekdayBreakdown
        entries={weekEntries}
        loading={weekLoading}
        weekStart={weekStart}
        showWeekends={showWeekends}
        timelineView={timelineView}
        onTimelineViewChange={setTimelineView}
      />

      {/* Full width, alone on its row. Column height is the whole encoding and
          this is the widget with the most categories on the page (up to twelve
          tickets), so at half width the columns were a few pixels wide each
          while the office chart beside it — which rarely has more than three
          bars — had the same room. */}
      <WeeklyTicketColumns entries={weekEntries} loading={weekLoading} weekStart={weekStart} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TicketsByOffice entries={weekEntries} loading={weekLoading} weekStart={weekStart} />
        <WeeklyTrendChart
          entries={longEntries}
          loading={longLoading}
          window={trendWindow}
          onWindowChange={setTrendWindow}
        />
      </div>

      {/* Also full width: a year-to-date grid is 53 columns wide, so halving
          its width halves the size of every cell in it. */}
      <CalendarHeatmap entries={longEntries} loading={longLoading} />

      <MonthlyHoursBar entries={longEntries} loading={longLoading} year={longRange.year} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="Total hours logged" value={formatDuration(totalMinutes)} loading={allLoading} />
        <StatTile label="Total time entries" value={String(allEntries.length)} loading={allLoading} />
      </div>
    </div>
  );
}

export default OverviewReport;
