import { describe, expect, it } from "vitest";
import { toDayKey, todayDayKey, normalizeDayKey, parseDayKey, formatDayKey } from "./dayKeys";

describe("toDayKey", () => {
  it("formats a local Date as yyyy-mm-dd", () => {
    expect(toDayKey(new Date(2026, 7, 9))).toBe("2026-08-09");
  });

  it("zero-pads single-digit months and days", () => {
    expect(toDayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("uses the local calendar date, not the UTC one", () => {
    // 11:30pm local on Aug 9 is already Aug 10 in UTC for any timezone behind
    // UTC — the key must still say Aug 9, since that's the day the user is in.
    const lateEvening = new Date(2026, 7, 9, 23, 30);
    expect(toDayKey(lateEvening)).toBe("2026-08-09");
  });
});

describe("todayDayKey", () => {
  it("matches toDayKey of the current local date", () => {
    expect(todayDayKey()).toBe(toDayKey(new Date()));
  });

  it("is a well-formed day key", () => {
    expect(todayDayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("normalizeDayKey", () => {
  it("passes a plain yyyy-mm-dd through unchanged", () => {
    expect(normalizeDayKey("2026-08-09")).toBe("2026-08-09");
  });

  it("trims a full ISO timestamp down to its date part", () => {
    expect(normalizeDayKey("2026-08-09T04:00:00.000Z")).toBe("2026-08-09");
  });
});

describe("parseDayKey", () => {
  it("parses at local midnight, not UTC midnight", () => {
    expect(parseDayKey("2026-08-09")).toEqual(new Date(2026, 7, 9));
  });

  it("round-trips with toDayKey", () => {
    for (const key of ["2026-01-01", "2026-08-09", "2026-12-31"]) {
      expect(toDayKey(parseDayKey(key))).toBe(key);
    }
  });

  it("accepts a full ISO timestamp via normalization", () => {
    expect(parseDayKey("2026-08-09T04:00:00.000Z")).toEqual(new Date(2026, 7, 9));
  });
});

describe("formatDayKey", () => {
  // Regression: TicketPage's old formatDayHeading did
  // `new Date("2026-08-09").toLocaleDateString(...)`, which parses as UTC
  // midnight and rendered "Saturday, Aug 8, 2026" for any user behind UTC —
  // every day heading on the ticket page was off by one.
  it("renders the same calendar day the key names", () => {
    const formatted = formatDayKey("2026-08-09");
    expect(formatted).toContain("Aug");
    expect(formatted).toContain("9");
    expect(formatted).not.toContain("8,");
  });

  it("never drifts to the previous day for any date in a year", () => {
    const cursor = new Date(2026, 0, 1);
    while (cursor.getFullYear() === 2026) {
      const key = toDayKey(cursor);
      const rendered = formatDayKey(key, { day: "numeric", month: "numeric", year: "numeric" });
      // Re-parsing the rendered date must land back on the same day key.
      expect(toDayKey(new Date(rendered))).toBe(key);
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  it("honors custom Intl options", () => {
    expect(formatDayKey("2026-08-09", { year: "numeric" })).toBe("2026");
  });
});
