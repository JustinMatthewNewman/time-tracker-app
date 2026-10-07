import { describe, expect, it } from "vitest";
import {
  describeRange,
  filterEntriesByRange,
  isRangeInvalid,
  resolveDateRange,
  type DateRangeFilter,
} from "./entryDateFilter";

// 2026-10-07 is a Wednesday, so its Monday-start week runs Oct 5 .. Oct 11.
const NOW = new Date(2026, 9, 7, 14, 30);

function filter(partial: Partial<DateRangeFilter>): DateRangeFilter {
  return { preset: "all", customStart: "", customEnd: "", ...partial };
}

function at(y: number, m: number, d: number, h = 9, min = 0) {
  return new Date(y, m - 1, d, h, min).toISOString();
}

describe("resolveDateRange", () => {
  it("leaves both sides unbounded for 'all'", () => {
    expect(resolveDateRange(filter({ preset: "all" }), NOW)).toEqual({ startMs: null, endMs: null });
  });

  it("spans Monday through the end of Sunday for 'week'", () => {
    const { startMs, endMs } = resolveDateRange(filter({ preset: "week" }), NOW);
    expect(new Date(startMs!)).toEqual(new Date(2026, 9, 5, 0, 0, 0, 0));
    // Inclusive of the last day: one millisecond before the next Monday.
    expect(new Date(endMs!)).toEqual(new Date(2026, 9, 12, 0, 0, 0, -1));
  });

  it("spans the 1st through the end of the last day for 'month'", () => {
    const { startMs, endMs } = resolveDateRange(filter({ preset: "month" }), NOW);
    expect(new Date(startMs!)).toEqual(new Date(2026, 9, 1));
    expect(new Date(endMs!)).toEqual(new Date(2026, 10, 1, 0, 0, 0, -1));
  });

  it("counts today as one of the last 30 days, so the span is 30 and not 31", () => {
    const { startMs, endMs } = resolveDateRange(filter({ preset: "last30" }), NOW);
    expect(new Date(startMs!)).toEqual(new Date(2026, 8, 8)); // Sep 8
    expect(new Date(endMs!)).toEqual(new Date(2026, 9, 8, 0, 0, 0, -1));
    const days = Math.round((endMs! + 1 - startMs!) / 86_400_000);
    expect(days).toBe(30);
  });

  it("spans exactly 90 days for 'last90'", () => {
    const { startMs, endMs } = resolveDateRange(filter({ preset: "last90" }), NOW);
    expect(Math.round((endMs! + 1 - startMs!) / 86_400_000)).toBe(90);
  });

  it("reads a custom range as local midnight, not UTC midnight", () => {
    const { startMs } = resolveDateRange(
      filter({ preset: "custom", customStart: "2026-10-05", customEnd: "2026-10-09" }),
      NOW
    );
    // The bug this guards: `new Date("2026-10-05")` is UTC midnight, which for
    // any negative-offset zone is Oct 4 locally — silently dropping Oct 5.
    expect(new Date(startMs!)).toEqual(new Date(2026, 9, 5));
  });

  it("includes the whole of the custom end day", () => {
    const { endMs } = resolveDateRange(
      filter({ preset: "custom", customStart: "2026-10-05", customEnd: "2026-10-09" }),
      NOW
    );
    expect(new Date(endMs!)).toEqual(new Date(2026, 9, 10, 0, 0, 0, -1));
  });

  it("leaves a side unbounded when its custom date is blank", () => {
    expect(resolveDateRange(filter({ preset: "custom", customEnd: "2026-10-09" }), NOW).startMs).toBeNull();
    expect(resolveDateRange(filter({ preset: "custom", customStart: "2026-10-05" }), NOW).endMs).toBeNull();
  });

  it("rejects an impossible date rather than letting Date roll it over", () => {
    // `new Date(2026, 1, 31)` is March 3rd, which would widen the range past
    // what was typed.
    expect(resolveDateRange(filter({ preset: "custom", customStart: "2026-02-31" }), NOW).startMs).toBeNull();
  });

  it("rejects a malformed custom date", () => {
    expect(resolveDateRange(filter({ preset: "custom", customStart: "oct 5" }), NOW).startMs).toBeNull();
  });

  it("handles a single-day custom range", () => {
    const { startMs, endMs } = resolveDateRange(
      filter({ preset: "custom", customStart: "2026-10-07", customEnd: "2026-10-07" }),
      NOW
    );
    expect(endMs! - startMs!).toBe(86_400_000 - 1);
  });

  it("spans a month boundary without losing the first day of the next month", () => {
    const { endMs } = resolveDateRange(
      filter({ preset: "custom", customStart: "2026-09-28", customEnd: "2026-10-01" }),
      NOW
    );
    const entries = [{ startTime: at(2026, 10, 1, 23, 59) }];
    expect(filterEntriesByRange(entries, { startMs: null, endMs })).toHaveLength(1);
  });

  it("resolves 'month' correctly in a leap February", () => {
    const { endMs } = resolveDateRange(filter({ preset: "month" }), new Date(2028, 1, 10));
    expect(new Date(endMs!)).toEqual(new Date(2028, 2, 1, 0, 0, 0, -1));
    // 2028 is a leap year, so February has 29 days.
    expect(new Date(endMs!).getDate()).toBe(29);
  });

  it("resolves 'month' correctly in a non-leap February", () => {
    const { endMs } = resolveDateRange(filter({ preset: "month" }), new Date(2026, 1, 10));
    expect(new Date(endMs!).getDate()).toBe(28);
  });

  it("walks back across a year boundary for 'last90'", () => {
    const { startMs } = resolveDateRange(filter({ preset: "last90" }), new Date(2026, 0, 15));
    expect(new Date(startMs!).getFullYear()).toBe(2025);
  });
});

describe("filterEntriesByRange", () => {
  const entries = [
    { id: "before", startTime: at(2026, 10, 4, 23, 59) },
    { id: "first-moment", startTime: at(2026, 10, 5, 0, 0) },
    { id: "middle", startTime: at(2026, 10, 7) },
    { id: "last-moment", startTime: at(2026, 10, 11, 23, 59) },
    { id: "after", startTime: at(2026, 10, 12, 0, 0) },
  ];

  it("returns the array untouched when both bounds are null", () => {
    expect(filterEntriesByRange(entries, { startMs: null, endMs: null })).toBe(entries);
  });

  it("includes entries at both edges and excludes the ones just outside", () => {
    const range = resolveDateRange(filter({ preset: "week" }), NOW);
    expect(filterEntriesByRange(entries, range).map((e) => e.id)).toEqual([
      "first-moment",
      "middle",
      "last-moment",
    ]);
  });

  it("applies a one-sided range", () => {
    const range = resolveDateRange(filter({ preset: "custom", customStart: "2026-10-07" }), NOW);
    expect(filterEntriesByRange(entries, range).map((e) => e.id)).toEqual([
      "middle",
      "last-moment",
      "after",
    ]);
  });

  it("drops an entry whose timestamp is unparseable rather than keeping it silently", () => {
    const range = resolveDateRange(filter({ preset: "week" }), NOW);
    expect(filterEntriesByRange([{ startTime: "not a date" }], range)).toHaveLength(0);
  });

  it("classifies an entry by its start, so one spanning midnight lands in a single range", () => {
    // 23:45 on Sunday the 11th, running into Monday the 12th. It belongs to
    // the week it started in, and must not also appear in the following one.
    const spanning = [{ startTime: at(2026, 10, 11, 23, 45) }];
    const thisWeek = resolveDateRange(filter({ preset: "week" }), NOW);
    const nextWeek = resolveDateRange(filter({ preset: "week" }), new Date(2026, 9, 14));
    expect(filterEntriesByRange(spanning, thisWeek)).toHaveLength(1);
    expect(filterEntriesByRange(spanning, nextWeek)).toHaveLength(0);
  });
});

describe("isRangeInvalid", () => {
  it("is false for every preset", () => {
    for (const preset of ["all", "week", "month", "last30", "last90"] as const) {
      expect(isRangeInvalid(filter({ preset }))).toBe(false);
    }
  });

  it("is true when the custom end precedes the custom start", () => {
    expect(
      isRangeInvalid(filter({ preset: "custom", customStart: "2026-10-09", customEnd: "2026-10-05" }))
    ).toBe(true);
  });

  it("is false when the two custom dates are equal", () => {
    expect(
      isRangeInvalid(filter({ preset: "custom", customStart: "2026-10-05", customEnd: "2026-10-05" }))
    ).toBe(false);
  });

  it("is false while the custom range is still half-filled", () => {
    expect(isRangeInvalid(filter({ preset: "custom", customStart: "2026-10-09" }))).toBe(false);
  });
});

describe("describeRange", () => {
  it("names the all-time range rather than printing two dates", () => {
    expect(describeRange(filter({ preset: "all" }), NOW)).toBe("All time");
  });

  it("prints the resolved end day, not the exclusive boundary after it", () => {
    // The guard here is off-by-one in the *display*: endMs is one ms before
    // the next day, so a naive format of (end + 1) would read "Oct 12".
    expect(describeRange(filter({ preset: "week" }), NOW)).toContain("Oct 11");
  });

  it("describes a one-sided custom range without inventing the missing side", () => {
    expect(describeRange(filter({ preset: "custom", customStart: "2026-10-05" }), NOW)).toMatch(/^From /);
    expect(describeRange(filter({ preset: "custom", customEnd: "2026-10-09" }), NOW)).toMatch(/^Up to /);
  });
});
