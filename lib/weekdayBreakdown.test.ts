import { describe, expect, it } from "vitest";
import {
  buildDayBreakdowns,
  buildWeekDayKeys,
  groupEntriesByDay,
  groupTicketsByOffice,
  NO_OFFICE_LABEL,
  totalMinutesOf,
  buildWeekSlotGrid,
  formatSlotTime,
  SLOT_MINUTES,
  type BreakdownEntry,
} from "./weekdayBreakdown";
import { UNASSIGNED_TICKET } from "./timeTotals";

// Helper mirroring how the app writes entries: `date` is local midnight of the
// work log's day and start/end are same-day offsets (see the note in
// dashboardConsistency.test.ts).
function entry(date: string, startHour: number, minutes: number, ticketNumber?: number): BreakdownEntry {
  const [y, m, d] = date.split("-").map(Number);
  const start = new Date(y, m - 1, d, startHour, 0, 0);
  const end = new Date(start.getTime() + minutes * 60000);
  return {
    date,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    ticket: ticketNumber == null ? null : { ticketNumber },
  };
}

describe("buildWeekDayKeys", () => {
  it("returns Mon-Fri by default and Mon-Sun with weekends", () => {
    // 2026-09-21 is a Monday.
    const weekStart = new Date(2026, 8, 21);
    expect(buildWeekDayKeys(weekStart, false)).toEqual([
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
    ]);
    expect(buildWeekDayKeys(weekStart, true)).toHaveLength(7);
    expect(buildWeekDayKeys(weekStart, true).at(-1)).toBe("2026-09-27");
  });

  it("normalizes any day in the week to that week's Monday", () => {
    // Thursday and Sunday of the same Monday-start week.
    const fromThursday = buildWeekDayKeys(new Date(2026, 8, 24), false);
    const fromSunday = buildWeekDayKeys(new Date(2026, 8, 27), false);
    expect(fromThursday[0]).toBe("2026-09-21");
    expect(fromSunday[0]).toBe("2026-09-21");
  });

  it("rolls over a month boundary", () => {
    // 2026-09-28 is a Monday; the week runs into October.
    expect(buildWeekDayKeys(new Date(2026, 8, 28), true)).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
  });

  it("rolls over a year boundary", () => {
    // 2026-12-28 is a Monday.
    expect(buildWeekDayKeys(new Date(2026, 11, 28), true).at(-1)).toBe("2027-01-03");
  });
});

describe("groupEntriesByDay", () => {
  it("buckets on the date field, not the derived timestamp", () => {
    const entries = [entry("2026-09-21", 9, 60), entry("2026-09-21", 14, 30), entry("2026-09-22", 9, 60)];
    const byDay = groupEntriesByDay(entries);
    expect(byDay.get("2026-09-21")).toHaveLength(2);
    expect(byDay.get("2026-09-22")).toHaveLength(1);
  });

  it("tolerates a full ISO timestamp in the date field", () => {
    const e = { ...entry("2026-09-21", 9, 60), date: "2026-09-21T00:00:00.000Z" };
    expect(groupEntriesByDay([e]).has("2026-09-21")).toBe(true);
  });
});

describe("buildDayBreakdowns", () => {
  const dayKeys = buildWeekDayKeys(new Date(2026, 8, 21), false);
  const titles = new Map([[1234, "Fix the thing"]]);

  it("returns one bucket per requested day, including empty days", () => {
    const result = buildDayBreakdowns([entry("2026-09-22", 9, 60, 1234)], dayKeys, titles);
    expect(result).toHaveLength(5);
    expect(result.map((d) => d.dayKey)).toEqual(dayKeys);

    const monday = result[0];
    expect(monday.totalMinutes).toBe(0);
    expect(monday.entryCount).toBe(0);
    expect(monday.tickets).toEqual([]);
  });

  it("sums a day's minutes and ranks its tickets by time desc", () => {
    const entries = [
      entry("2026-09-21", 9, 30, 1234),
      entry("2026-09-21", 10, 90, 5678),
      entry("2026-09-21", 13, 60, 1234),
    ];
    const [monday] = buildDayBreakdowns(entries, dayKeys, titles);

    expect(monday.totalMinutes).toBe(180);
    expect(monday.entryCount).toBe(3);
    // 1234 totals 90, 5678 totals 90 — tie, but both must be present.
    expect(monday.tickets.map((t) => t.ticket).sort()).toEqual(["1234", "5678"]);
    expect(monday.tickets.every((t, i, arr) => i === 0 || arr[i - 1].totalMinutes >= t.totalMinutes)).toBe(true);
  });

  it("gives percentages that sum to 100 for a day with time logged", () => {
    const entries = [entry("2026-09-21", 9, 60, 1), entry("2026-09-21", 10, 120, 2), entry("2026-09-21", 13, 60, 3)];
    const [monday] = buildDayBreakdowns(entries, dayKeys, new Map());
    const sum = monday.tickets.reduce((s, t) => s + t.percentOfDay, 0);
    expect(sum).toBeCloseTo(100, 6);
    // 120 of 240 minutes.
    expect(monday.tickets[0].percentOfDay).toBeCloseTo(50, 6);
  });

  it("matches the day hero number to the sum of its ticket rows", () => {
    const entries = [entry("2026-09-23", 9, 45, 1), entry("2026-09-23", 11, 75, 2), entry("2026-09-23", 14, 30)];
    const wednesday = buildDayBreakdowns(entries, dayKeys, new Map())[2];
    const rowSum = wednesday.tickets.reduce((s, t) => s + t.totalMinutes, 0);
    expect(rowSum).toBe(wednesday.totalMinutes);
    expect(wednesday.totalMinutes).toBe(150);
  });

  it("folds untickted entries into one labelled bucket rather than dropping them", () => {
    const entries = [entry("2026-09-21", 9, 60), entry("2026-09-21", 11, 30)];
    const [monday] = buildDayBreakdowns(entries, dayKeys, new Map());
    expect(monday.tickets).toHaveLength(1);
    expect(monday.tickets[0].ticket).toBe(UNASSIGNED_TICKET);
    expect(monday.tickets[0].totalMinutes).toBe(90);
  });

  it("resolves titles from the map and leaves unknown tickets untitled", () => {
    const entries = [entry("2026-09-21", 9, 60, 1234), entry("2026-09-21", 11, 30, 9999)];
    const [monday] = buildDayBreakdowns(entries, dayKeys, titles);
    expect(monday.tickets.find((t) => t.ticket === "1234")?.title).toBe("Fix the thing");
    expect(monday.tickets.find((t) => t.ticket === "9999")?.title).toBeNull();
  });

  it("does not divide by zero when a day's entries sum to no time", () => {
    const zero = entry("2026-09-21", 9, 0, 1234);
    const [monday] = buildDayBreakdowns([zero], dayKeys, titles);
    expect(monday.totalMinutes).toBe(0);
    expect(monday.entryCount).toBe(1);
    expect(monday.tickets[0].percentOfDay).toBe(0);
  });

  it("ignores entries outside the requested days", () => {
    // Saturday, with a Mon-Fri day key set.
    const result = buildDayBreakdowns([entry("2026-09-26", 9, 60, 1234)], dayKeys, titles);
    expect(result.every((d) => d.totalMinutes === 0)).toBe(true);
  });
});

describe("totalMinutesOf", () => {
  it("counts weekend entries even when weekends have no column", () => {
    // The toggle is presentational: a week total must not change with it.
    const weekEntries = [
      entry("2026-09-21", 9, 60, 1),
      entry("2026-09-26", 9, 120, 1),
      entry("2026-09-27", 9, 30, 1),
    ];
    expect(totalMinutesOf(weekEntries)).toBe(210);

    const weekdayKeys = buildWeekDayKeys(new Date(2026, 8, 21), false);
    const columnTotal = buildDayBreakdowns(weekEntries, weekdayKeys, new Map()).reduce(
      (s, d) => s + d.totalMinutes,
      0
    );
    // The columns deliberately show less than the week total when weekends
    // are hidden — the week total itself stays complete.
    expect(columnTotal).toBe(60);
  });
});

describe("groupTicketsByOffice", () => {
  const offices = new Map<number, string | null>([
    [1, "Portland"],
    [2, "Portland"],
    [3, "Seattle"],
    [4, null],
    [5, "   "],
  ]);

  it("counts distinct tickets per office, not entries", () => {
    const entries = [
      entry("2026-09-21", 9, 60, 1),
      entry("2026-09-21", 10, 60, 1), // same ticket again
      entry("2026-09-22", 9, 60, 2),
      entry("2026-09-22", 10, 60, 3),
    ];
    const result = groupTicketsByOffice(entries, offices);
    const portland = result.find((o) => o.office === "Portland")!;

    expect(portland.ticketCount).toBe(2);
    expect(portland.entryCount).toBe(3);
    expect(portland.totalMinutes).toBe(180);
    expect(result.find((o) => o.office === "Seattle")!.ticketCount).toBe(1);
  });

  it("folds null, blank, and missing offices into one bucket", () => {
    const entries = [
      entry("2026-09-21", 9, 60, 4), // office null
      entry("2026-09-21", 10, 60, 5), // office blank
      entry("2026-09-21", 11, 60, 99), // ticket absent from the office map
    ];
    const result = groupTicketsByOffice(entries, offices);
    expect(result).toHaveLength(1);
    expect(result[0].office).toBe(NO_OFFICE_LABEL);
    expect(result[0].ticketCount).toBe(3);
  });

  it("keeps untickted minutes in the no-office bucket without inflating ticketCount", () => {
    const entries = [entry("2026-09-21", 9, 60), entry("2026-09-21", 10, 30)];
    const [bucket] = groupTicketsByOffice(entries, offices);
    expect(bucket.office).toBe(NO_OFFICE_LABEL);
    expect(bucket.ticketCount).toBe(0);
    expect(bucket.entryCount).toBe(2);
    expect(bucket.totalMinutes).toBe(90);
  });

  it("sorts by distinct ticket count desc", () => {
    const entries = [
      entry("2026-09-21", 9, 60, 3), // Seattle, 1 ticket
      entry("2026-09-22", 9, 60, 1), // Portland
      entry("2026-09-22", 10, 60, 2), // Portland, 2 tickets
    ];
    expect(groupTicketsByOffice(entries, offices).map((o) => o.office)).toEqual(["Portland", "Seattle"]);
  });

  it("returns nothing for no entries", () => {
    expect(groupTicketsByOffice([], offices)).toEqual([]);
  });
});

describe("buildWeekSlotGrid", () => {
  const dayKeys = buildWeekDayKeys(new Date(2026, 8, 21), false);
  const titles = new Map([[1234, "Fix the thing"]]);

  it("builds a shared axis from first start to last end, in 15-minute steps", () => {
    const entries = [
      entry("2026-09-21", 9, 60, 1234), // 09:00-10:00
      entry("2026-09-22", 8, 30, 5678), // 08:00-08:30
    ];
    const { slotStarts } = buildWeekSlotGrid(entries, dayKeys, titles);
    // 08:00 (480) through 10:00 (600), exclusive of the end.
    expect(slotStarts[0]).toBe(8 * 60);
    expect(slotStarts.at(-1)).toBe(9 * 60 + 45);
    expect(slotStarts).toHaveLength(8);
    expect(slotStarts.every((m, i) => i === 0 || m - slotStarts[i - 1] === SLOT_MINUTES)).toBe(true);
  });

  it("gives every day the same number of slots so rows line up", () => {
    const entries = [entry("2026-09-21", 9, 60, 1234), entry("2026-09-22", 8, 30, 5678)];
    const { slotStarts, byDay } = buildWeekSlotGrid(entries, dayKeys, titles);
    expect([...byDay.keys()]).toEqual(dayKeys);
    for (const key of dayKeys) {
      expect(byDay.get(key)).toHaveLength(slotStarts.length);
    }
  });

  it("spreads a multi-slot entry across every slot it covers", () => {
    const { byDay } = buildWeekSlotGrid([entry("2026-09-21", 9, 45, 1234)], dayKeys, titles);
    const monday = byDay.get("2026-09-21")!;
    expect(monday.map((s) => s.ticket)).toEqual(["1234", "1234", "1234"]);
    expect(monday.map((s) => s.startMinute)).toEqual([540, 555, 570]);
    expect(monday[0].title).toBe("Fix the thing");
  });

  it("leaves unbooked slots null rather than dropping the row", () => {
    const entries = [
      entry("2026-09-21", 9, 15, 1234), // 09:00-09:15
      entry("2026-09-21", 10, 15, 5678), // 10:00-10:15 — 09:15-10:00 is a gap
    ];
    const monday = buildWeekSlotGrid(entries, dayKeys, titles).byDay.get("2026-09-21")!;
    expect(monday).toHaveLength(5);
    expect(monday.map((s) => s.ticket)).toEqual(["1234", null, null, null, "5678"]);
  });

  it("marks untickted time rather than treating it as a gap", () => {
    const monday = buildWeekSlotGrid([entry("2026-09-21", 9, 30)], dayKeys, titles).byDay.get("2026-09-21")!;
    expect(monday.map((s) => s.ticket)).toEqual([UNASSIGNED_TICKET, UNASSIGNED_TICKET]);
  });

  it("gives a day with no entries all-null slots, not an empty array", () => {
    const { slotStarts, byDay } = buildWeekSlotGrid([entry("2026-09-21", 9, 30, 1234)], dayKeys, titles);
    const tuesday = byDay.get("2026-09-22")!;
    expect(tuesday).toHaveLength(slotStarts.length);
    expect(tuesday.every((s) => s.ticket === null)).toBe(true);
  });

  it("returns an empty axis when the week has nothing logged", () => {
    const { slotStarts, byDay } = buildWeekSlotGrid([], dayKeys, titles);
    expect(slotStarts).toEqual([]);
    expect([...byDay.keys()]).toEqual(dayKeys);
  });

  it("ignores zero-length entries instead of stretching the axis to them", () => {
    const entries = [entry("2026-09-21", 9, 30, 1234), entry("2026-09-21", 6, 0, 5678)];
    const { slotStarts } = buildWeekSlotGrid(entries, dayKeys, titles);
    expect(slotStarts[0]).toBe(9 * 60);
    expect(slotStarts).toHaveLength(2);
  });

  it("ignores entries outside the requested days", () => {
    const { slotStarts } = buildWeekSlotGrid([entry("2026-09-26", 9, 60, 1234)], dayKeys, titles);
    expect(slotStarts).toEqual([]);
  });

  it("snaps a ragged start down and a ragged end up to the grid", () => {
    // 09:07 -> 09:00, and 09:07+20m = 09:27 -> 09:30.
    const e = entry("2026-09-21", 9, 20, 1234);
    const start = new Date(2026, 8, 21, 9, 7, 0);
    e.startTime = start.toISOString();
    e.endTime = new Date(start.getTime() + 20 * 60000).toISOString();
    const { slotStarts } = buildWeekSlotGrid([e], dayKeys, titles);
    expect(slotStarts).toEqual([540, 555]);
  });

  it("gives an overlapped slot to the earlier entry rather than double-counting", () => {
    const entries = [entry("2026-09-21", 9, 60, 1234), entry("2026-09-21", 9, 30, 5678)];
    const monday = buildWeekSlotGrid(entries, dayKeys, titles).byDay.get("2026-09-21")!;
    expect(monday.every((s) => s.ticket === "1234")).toBe(true);
  });
});

describe("formatSlotTime", () => {
  it("formats a minute-of-day as a clock time", () => {
    // Locale-dependent, so assert the shape rather than an exact string.
    expect(formatSlotTime(8 * 60)).toMatch(/\b8[:.]00/);
    expect(formatSlotTime(13 * 60 + 45)).toMatch(/\b(1|13)[:.]45/);
  });
});
