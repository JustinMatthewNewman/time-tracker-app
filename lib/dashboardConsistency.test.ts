import { describe, expect, it } from "vitest";
import { minutesBetween } from "./timeTotals";
import { weekKey, groupByWeek } from "./weekBuckets";

// These tests encode aggregation invariants that the dashboard widgets rely
// on but that aren't enforced anywhere in the type system. Each widget
// groups the *same* underlying TimeEntry rows by "which day/week does this
// belong to" — but they don't all derive that key the same way:
//
//   - CalendarHeatmap (components/Dashboard/CalendarHeatmap.tsx) buckets by
//     the entry's own `date` field: `entry.date.slice(0, 10)`. That's also
//     what the server-side range filter (ListTimeEntriesByDateRange in
//     dataconnect/example/queries.gql) scopes on.
//   - WeeklyTrendChart, MonthlyHoursBar, and WeeklyStatTiles instead
//     re-derive the day/week from `new Date(entry.startTime)` in whatever
//     timezone the browser is running in.
//
// For every entry the app creates today (hooks/useWorkLogs.ts, the
// CreateWorkLog mutation's fixed 15-min segments, and
// scripts/seed-stress-test.mjs), `date` is local midnight of the work log's
// day and `startTime`/`endTime` are that same midnight plus a same-day
// minute offset, so the two keys always agree in practice — but nothing
// guarantees that. If it's ever violated, these widgets will silently
// disagree about which day/week an entry's minutes count toward, which is
// exactly the "totals don't line up" symptom this suite exists to catch.

function localDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface EntryFixture {
  date: string; // TimeEntry.date, "yyyy-mm-dd..."
  startTime: string;
  endTime: string;
}

function sumByDateField(entries: EntryFixture[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const key = e.date.slice(0, 10);
    totals.set(key, (totals.get(key) ?? 0) + minutesBetween(e.startTime, e.endTime));
  }
  return totals;
}

function sumByLocalStartTime(entries: EntryFixture[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const key = localDateKey(e.startTime);
    totals.set(key, (totals.get(key) ?? 0) + minutesBetween(e.startTime, e.endTime));
  }
  return totals;
}

describe("day-key consistency: entry.date field vs. local calendar date of startTime", () => {
  it("agree for entries shaped like the app's real creation paths (local midnight + same-day minute offsets)", () => {
    // Mirrors CreateWorkLog's fixed 15-min segments and the parsed-upload
    // flow in hooks/useWorkLogs.ts: `date` is the work log's local midnight,
    // `startTime`/`endTime` are that midnight plus a 0-1439 minute offset.
    const workLogMidnightLocal = new Date(2026, 7, 9); // Aug 9, 2026, local midnight
    const dateField = "2026-08-09";
    const entries: EntryFixture[] = [
      {
        date: dateField,
        startTime: new Date(workLogMidnightLocal.getTime() + 8 * 60 * 60_000).toISOString(), // 8am
        endTime: new Date(workLogMidnightLocal.getTime() + (8 * 60 + 15) * 60_000).toISOString(),
      },
      {
        date: dateField,
        startTime: new Date(workLogMidnightLocal.getTime() + 16 * 60 * 60_000 - 60_000).toISOString(), // 3:59pm
        endTime: new Date(workLogMidnightLocal.getTime() + 16 * 60 * 60_000).toISOString(), // 4:00pm
      },
    ];

    for (const e of entries) {
      expect(localDateKey(e.startTime)).toBe(e.date.slice(0, 10));
    }

    const byDateField = sumByDateField(entries);
    const byLocalStart = sumByLocalStartTime(entries);
    expect(byLocalStart).toEqual(byDateField);
  });

  // Regression pin: this documents the *current*, fragile behavior rather
  // than a desired one. If `date` and the local calendar date of `startTime`
  // ever disagree for a stored entry (a timezone edge case in how the
  // server casts Timestamp -> Date, a future feature allowing entries to
  // span midnight, a manual data fix, etc.), CalendarHeatmap attributes that
  // entry's minutes to a different day than WeeklyTrendChart/MonthlyHoursBar/
  // WeeklyStatTiles do — so the dashboard shows two different totals for
  // what a user would consider "the same day". Fixing this means picking one
  // canonical key (`entry.date`, since that's also what the server-side
  // range filter uses) and using it everywhere instead of re-deriving from
  // `startTime` client-side.
  it("currently diverge when an entry's date field disagrees with its startTime's local calendar day", () => {
    const mismatched: EntryFixture = {
      date: "2026-08-09",
      // Local calendar date of this instant depends on the runtime's
      // timezone; the fixture only needs *some* offset that lands on a
      // different local day than the `date` field claims.
      startTime: "2026-08-10T04:30:00.000Z",
      endTime: "2026-08-10T05:00:00.000Z",
    };

    const byDateField = sumByDateField([mismatched]);
    const byLocalStart = sumByLocalStartTime([mismatched]);

    // Same total minutes overall — nothing is lost — but attributed to two
    // different calendar days depending on which widget you're looking at.
    const totalA = [...byDateField.values()].reduce((a, b) => a + b, 0);
    const totalB = [...byLocalStart.values()].reduce((a, b) => a + b, 0);
    expect(totalA).toBe(totalB);

    expect(byDateField.has("2026-08-09")).toBe(true);
    // This assertion is what should start failing once the widgets are
    // unified on a single day key — at that point this whole "currently
    // diverge" test should be deleted along with the fragility it pins.
    expect(byLocalStart.has("2026-08-09")).toBe(false);
  });
});

describe("weekly current/previous split (WeeklyStatTiles) doesn't lose or double-count minutes", () => {
  // Mirrors components/Dashboard/WeeklyStatTiles.tsx: fetch a 2-week window,
  // then split it into "this week" vs. "last week" by weekKey(startTime).
  function splitCurrentPrevious(entries: EntryFixture[], currentWeekStart: Date) {
    const currentKey = weekKey(currentWeekStart);
    const current = entries.filter((e) => weekKey(new Date(e.startTime)) === currentKey);
    const previous = entries.filter((e) => weekKey(new Date(e.startTime)) !== currentKey);
    return { current, previous };
  }

  it("current + previous minutes reconcile with the flat total over the fetched window", () => {
    const currentWeekStart = new Date(2026, 7, 3); // Monday, Aug 3 2026
    const entries: EntryFixture[] = [
      { date: "2026-08-03", startTime: "2026-08-03T12:00:00.000Z", endTime: "2026-08-03T13:00:00.000Z" },
      { date: "2026-08-05", startTime: "2026-08-05T12:00:00.000Z", endTime: "2026-08-05T12:45:00.000Z" },
      { date: "2026-07-28", startTime: "2026-07-28T12:00:00.000Z", endTime: "2026-07-28T14:00:00.000Z" },
      { date: "2026-07-30", startTime: "2026-07-30T12:00:00.000Z", endTime: "2026-07-30T12:20:00.000Z" },
    ];

    const { current, previous } = splitCurrentPrevious(entries, currentWeekStart);
    expect(current).toHaveLength(2);
    expect(previous).toHaveLength(2);

    const flatTotal = entries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0);
    const splitTotal =
      current.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0) +
      previous.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0);
    expect(splitTotal).toBe(flatTotal);
  });
});

describe("per-work-log weekly subtotal (WorkLogListBox sidebar) matches the flat entry sum", () => {
  // Mirrors components/Utilities/ListBoxComponent.tsx: work logs are grouped
  // into weeks by their own `workLogDate`, then each week's total is the sum
  // of its work logs' entries (looked up by workLogId), not a direct sum
  // over entries grouped by their own date. The two only agree if every
  // entry's actual date falls in the same week as its parent work log's date.
  interface WorkLogFixture {
    id: string;
    date: Date;
  }
  interface TimeEntryFixture {
    workLogId: string;
    startTime: string;
    endTime: string;
  }

  function weeklyTotalsViaWorkLogs(workLogs: WorkLogFixture[], entries: TimeEntryFixture[]) {
    const minutesByWorkLog = new Map<string, number>();
    for (const e of entries) {
      minutesByWorkLog.set(
        e.workLogId,
        (minutesByWorkLog.get(e.workLogId) ?? 0) + minutesBetween(e.startTime, e.endTime)
      );
    }
    const grouped = groupByWeek(workLogs, (w) => w.date);
    const totals = new Map<string, number>();
    for (const [key, logs] of grouped) {
      totals.set(
        key,
        logs.reduce((sum, log) => sum + (minutesByWorkLog.get(log.id) ?? 0), 0)
      );
    }
    return totals;
  }

  function weeklyTotalsViaEntries(entries: TimeEntryFixture[]) {
    const totals = new Map<string, number>();
    for (const e of entries) {
      const key = weekKey(new Date(e.startTime));
      totals.set(key, (totals.get(key) ?? 0) + minutesBetween(e.startTime, e.endTime));
    }
    return totals;
  }

  it("agree when every entry's startTime falls in the same week as its work log's date", () => {
    const workLogs: WorkLogFixture[] = [
      { id: "log-mon", date: new Date(2026, 7, 3) },
      { id: "log-fri", date: new Date(2026, 7, 7) },
    ];
    const entries: TimeEntryFixture[] = [
      { workLogId: "log-mon", startTime: "2026-08-03T12:00:00.000Z", endTime: "2026-08-03T13:00:00.000Z" },
      { workLogId: "log-fri", startTime: "2026-08-07T12:00:00.000Z", endTime: "2026-08-07T12:30:00.000Z" },
    ];

    expect(weeklyTotalsViaWorkLogs(workLogs, entries)).toEqual(weeklyTotalsViaEntries(entries));
  });

  it("diverge if a work log's date and its entries' actual dates land in different weeks", () => {
    // An entry attached to a work log dated in one week, but whose own
    // startTime falls in the next week — e.g. a late addition to an older
    // work log. The sidebar (grouped by work log date) puts these minutes
    // in the older week; a widget grouping by entry date would put them in
    // the newer week.
    const workLogs: WorkLogFixture[] = [{ id: "log-mon", date: new Date(2026, 7, 3) }];
    const entries: TimeEntryFixture[] = [
      { workLogId: "log-mon", startTime: "2026-08-10T12:00:00.000Z", endTime: "2026-08-10T13:00:00.000Z" },
    ];

    const viaWorkLogs = weeklyTotalsViaWorkLogs(workLogs, entries);
    const viaEntries = weeklyTotalsViaEntries(entries);

    expect(viaWorkLogs.get("2026-08-03")).toBe(60);
    expect(viaEntries.get("2026-08-03")).toBeUndefined();
    expect(viaEntries.get("2026-08-10")).toBe(60);
  });
});
