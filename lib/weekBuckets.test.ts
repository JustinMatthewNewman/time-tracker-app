import { describe, expect, it } from "vitest";
import { startOfWeek, endOfWeek, weekKey, weekLabel, getRelativeWeekLabel, isSameWeek, groupByWeek } from "./weekBuckets";

// 2026-08-09 is a Sunday, so its Monday-start week runs 2026-08-03..2026-08-09.
const SUNDAY = new Date(2026, 7, 9);
const MONDAY_OF_WEEK = new Date(2026, 7, 3);
const SATURDAY_OF_WEEK = new Date(2026, 7, 8);

describe("startOfWeek", () => {
  it("returns the same Monday for every day in that week", () => {
    for (let d = 3; d <= 9; d++) {
      expect(startOfWeek(new Date(2026, 7, d))).toEqual(MONDAY_OF_WEEK);
    }
  });

  it("treats Sunday as the last day of the *previous* Monday's week, not the next", () => {
    expect(startOfWeek(SUNDAY)).toEqual(MONDAY_OF_WEEK);
  });
});

describe("endOfWeek", () => {
  it("returns the Sunday six days after startOfWeek", () => {
    expect(endOfWeek(SATURDAY_OF_WEEK)).toEqual(SUNDAY);
  });
});

describe("weekKey", () => {
  it("is stable for every day within the same week", () => {
    const keys = new Set([3, 4, 5, 6, 7, 8, 9].map((d) => weekKey(new Date(2026, 7, d))));
    expect(keys.size).toBe(1);
    expect([...keys][0]).toBe("2026-08-03");
  });

  it("differs between adjacent weeks (Sunday vs. the following Monday)", () => {
    const sundayKey = weekKey(new Date(2026, 7, 9));
    const nextMondayKey = weekKey(new Date(2026, 7, 10));
    expect(sundayKey).not.toBe(nextMondayKey);
  });
});

describe("weekLabel", () => {
  it("formats a week within a single month", () => {
    expect(weekLabel(MONDAY_OF_WEEK)).toBe("Aug 3 – Aug 9, 2026");
  });

  it("formats a week that crosses a month boundary", () => {
    expect(weekLabel(new Date(2026, 6, 27))).toBe("Jul 27 – Aug 2, 2026");
  });

  it("formats a week that crosses a year boundary", () => {
    expect(weekLabel(new Date(2026, 11, 28))).toBe("Dec 28 – Jan 3, 2027");
  });
});

describe("getRelativeWeekLabel", () => {
  const referenceDate = new Date(2026, 8, 5); // Saturday, Sep 5, 2026 (Week of Aug 31)

  it("labels current week as 'This week'", () => {
    expect(getRelativeWeekLabel(new Date(2026, 7, 31), referenceDate)).toBe("This week");
    expect(getRelativeWeekLabel(new Date(2026, 8, 2), referenceDate)).toBe("This week");
  });

  it("labels 1 week ago as 'Last week'", () => {
    expect(getRelativeWeekLabel(new Date(2026, 7, 24), referenceDate)).toBe("Last week");
  });

  it("labels 2 weeks ago in same month as '2 weeks ago'", () => {
    expect(getRelativeWeekLabel(new Date(2026, 7, 17), referenceDate)).toBe("2 weeks ago");
  });

  it("labels previous month as 'Last Month'", () => {
    expect(getRelativeWeekLabel(new Date(2026, 6, 27), referenceDate)).toBe("Last Month");
  });

  it("labels 2 months ago as '2 Months Ago'", () => {
    expect(getRelativeWeekLabel(new Date(2026, 5, 29), referenceDate)).toBe("2 Months Ago");
  });

  it("labels 1 year ago as 'Last Year'", () => {
    expect(getRelativeWeekLabel(new Date(2025, 7, 25), referenceDate)).toBe("Last Year");
  });

  it("labels 2 years ago as '2 Years Ago'", () => {
    expect(getRelativeWeekLabel(new Date(2024, 7, 26), referenceDate)).toBe("2 Years Ago");
  });
});

describe("isSameWeek", () => {
  it("is true for two dates in the same Mon-Sun week", () => {
    expect(isSameWeek(MONDAY_OF_WEEK, SUNDAY)).toBe(true);
  });

  it("is false across a week boundary", () => {
    expect(isSameWeek(SUNDAY, new Date(2026, 7, 10))).toBe(false);
  });
});

describe("groupByWeek", () => {
  it("buckets items by their Monday-start week key", () => {
    const items = [
      { id: "a", date: new Date(2026, 7, 3) }, // Mon, week of Aug 3
      { id: "b", date: new Date(2026, 7, 9) }, // Sun, same week
      { id: "c", date: new Date(2026, 7, 10) }, // Mon, next week
    ];
    const grouped = groupByWeek(items, (item) => item.date);

    expect(grouped.size).toBe(2);
    expect(grouped.get("2026-08-03")?.map((i) => i.id)).toEqual(["a", "b"]);
    expect(grouped.get("2026-08-10")?.map((i) => i.id)).toEqual(["c"]);
  });

  it("preserves insertion order within a bucket", () => {
    const items = [
      { id: "second", date: new Date(2026, 7, 5) },
      { id: "first", date: new Date(2026, 7, 4) },
    ];
    const grouped = groupByWeek(items, (item) => item.date);
    expect(grouped.get("2026-08-03")?.map((i) => i.id)).toEqual(["second", "first"]);
  });
});
