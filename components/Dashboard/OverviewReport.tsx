"use client";

import { useMemo, useState } from "react";
import { Switch } from "@heroui/react";
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
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        {/* Control and Content are SIBLINGS: `.switch` is the row
            (inline-flex items-center gap-3) while `.switch__content` is a
            COLUMN meant for a label over a description. Nesting Control
            inside Content stacks the track above the label. */}
        <Switch
          isSelected={showWeekends}
          onChange={setShowWeekends}
          size="sm"
          aria-label="Show weekends in the weekday breakdown"
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <span className="text-sm text-foreground/70">Show weekends</span>
          </Switch.Content>
        </Switch>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyTicketColumns entries={weekEntries} loading={weekLoading} weekStart={weekStart} />
        <TicketsByOffice entries={weekEntries} loading={weekLoading} weekStart={weekStart} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyTrendChart
          entries={longEntries}
          loading={longLoading}
          window={trendWindow}
          onWindowChange={setTrendWindow}
        />
        <CalendarHeatmap entries={longEntries} loading={longLoading} />
      </div>

      <MonthlyHoursBar entries={longEntries} loading={longLoading} year={longRange.year} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="Total hours logged" value={formatDuration(totalMinutes)} loading={allLoading} />
        <StatTile label="Total time entries" value={String(allEntries.length)} loading={allLoading} />
      </div>
    </div>
  );
}

export default OverviewReport;
