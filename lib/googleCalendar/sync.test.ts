import { describe, expect, it } from "vitest";
import { daysInRange, MAX_RANGE_DAYS, SyncRangeError } from "./sync";

describe("daysInRange", () => {
  it("enumerates an inclusive range", () => {
    expect(daysInRange({ start: "2026-09-01", end: "2026-09-04" })).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
    ]);
  });

  it("handles a single day", () => {
    expect(daysInRange({ start: "2026-09-04", end: "2026-09-04" })).toEqual(["2026-09-04"]);
  });

  it("crosses a month boundary", () => {
    expect(daysInRange({ start: "2026-08-31", end: "2026-09-01" })).toEqual(["2026-08-31", "2026-09-01"]);
  });

  it("crosses a leap day", () => {
    expect(daysInRange({ start: "2028-02-28", end: "2028-03-01" })).toEqual([
      "2028-02-28",
      "2028-02-29",
      "2028-03-01",
    ]);
  });

  it("does not skip or repeat a day across a DST transition", () => {
    // US DST begins 2026-03-08. Stepping by 86_400_000ms instead of setDate
    // would drift an hour here and duplicate or drop a day.
    const days = daysInRange({ start: "2026-03-07", end: "2026-03-10" });
    expect(days).toEqual(["2026-03-07", "2026-03-08", "2026-03-09", "2026-03-10"]);
    expect(new Set(days).size).toBe(days.length);
  });

  it("rejects an inverted range", () => {
    expect(() => daysInRange({ start: "2026-09-04", end: "2026-09-01" })).toThrow(SyncRangeError);
  });

  it("rejects a range longer than the cap", () => {
    expect(() => daysInRange({ start: "2024-01-01", end: "2026-01-01" })).toThrow(/smaller chunks/);
  });

  it("accepts a range exactly at the cap", () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 0, 1);
    end.setDate(end.getDate() + MAX_RANGE_DAYS - 1);
    const key = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    expect(daysInRange({ start: key(start), end: key(end) })).toHaveLength(MAX_RANGE_DAYS);
  });
});
