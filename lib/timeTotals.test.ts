import { describe, expect, it } from "vitest";
import {
  buildTicketColorMap,
  minutesBetween,
  groupByTicket,
  formatDuration,
  formatDecimalHours,
  UNASSIGNED_TICKET,
} from "./timeTotals";

describe("minutesBetween", () => {
  it("returns whole minutes for minute-aligned timestamps", () => {
    expect(minutesBetween("2026-08-09T08:00:00.000Z", "2026-08-09T09:30:00.000Z")).toBe(90);
  });

  it("returns fractional minutes when timestamps aren't minute-aligned", () => {
    expect(minutesBetween("2026-08-09T08:00:00.000Z", "2026-08-09T08:00:36.000Z")).toBeCloseTo(0.6);
  });

  it("returns 0 for a zero-length entry", () => {
    expect(minutesBetween("2026-08-09T08:00:00.000Z", "2026-08-09T08:00:00.000Z")).toBe(0);
  });
});

describe("formatDuration", () => {
  it("formats whole hours with no remainder", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(150)).toBe("2h 30m");
  });

  it("formats under an hour as minutes only", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats zero minutes", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  // Regression: independently flooring hours and rounding the remainder
  // (Math.floor(479.6/60)=7, Math.round(479.6%60)=60) used to render as the
  // nonsensical "7h 60m" instead of rolling over to "8h 0m" / "8h". This is
  // exactly the kind of total a user would flag as "not lining up" against
  // another total for the same underlying minutes.
  it("rolls a rounded remainder of 60 over into the next hour", () => {
    expect(formatDuration(479.6)).toBe("8h");
  });

  it("rolls over even when the result still has a remainder", () => {
    // 89.6 -> naive: floor(1.49)=1h, round(29.6)=30 -> "1h 30m" (no bug here);
    // pick a value where the remainder itself rounds up to 60.
    expect(formatDuration(119.6)).toBe("2h");
  });

  it("never renders a two-digit minute value equal to 60", () => {
    for (let m = 0; m < 2000; m += 0.4) {
      const formatted = formatDuration(m);
      const match = formatted.match(/(\d+)m$/);
      if (match) {
        expect(Number(match[1])).toBeLessThan(60);
      }
    }
  });
});

describe("formatDecimalHours", () => {
  it("converts minutes to a 2-decimal hour string", () => {
    expect(formatDecimalHours(90)).toBe("1.5");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatDecimalHours(100)).toBe("1.67");
  });

  it("handles zero", () => {
    expect(formatDecimalHours(0)).toBe("0");
  });
});

describe("groupByTicket", () => {
  const entry = (ticketNumber: number | null, start: string, end: string) => ({
    ticket: ticketNumber != null ? { ticketNumber } : null,
    startTime: start,
    endTime: end,
  });

  it("sums minutes and counts per ticket", () => {
    const totals = groupByTicket([
      entry(101, "2026-08-09T08:00:00.000Z", "2026-08-09T09:00:00.000Z"),
      entry(101, "2026-08-09T09:00:00.000Z", "2026-08-09T09:30:00.000Z"),
      entry(202, "2026-08-09T10:00:00.000Z", "2026-08-09T10:15:00.000Z"),
    ]);

    const t101 = totals.find((t) => t.ticket === "101");
    const t202 = totals.find((t) => t.ticket === "202");
    expect(t101).toMatchObject({ entryCount: 2, totalMinutes: 90 });
    expect(t202).toMatchObject({ entryCount: 1, totalMinutes: 15 });
  });

  it("buckets entries with no ticket under UNASSIGNED_TICKET", () => {
    const totals = groupByTicket([entry(null, "2026-08-09T08:00:00.000Z", "2026-08-09T08:30:00.000Z")]);
    expect(totals).toHaveLength(1);
    expect(totals[0].ticket).toBe(UNASSIGNED_TICKET);
  });

  it("sorts descending by total minutes", () => {
    const totals = groupByTicket([
      entry(1, "2026-08-09T08:00:00.000Z", "2026-08-09T08:15:00.000Z"),
      entry(2, "2026-08-09T08:00:00.000Z", "2026-08-09T10:00:00.000Z"),
    ]);
    expect(totals.map((t) => t.ticket)).toEqual(["2", "1"]);
  });

  it("the sum of all per-ticket totals equals the flat total across all entries", () => {
    const entries = [
      entry(1, "2026-08-09T08:00:00.000Z", "2026-08-09T08:45:00.000Z"),
      entry(2, "2026-08-09T09:00:00.000Z", "2026-08-09T09:20:00.000Z"),
      entry(null, "2026-08-09T10:00:00.000Z", "2026-08-09T10:10:00.000Z"),
      entry(1, "2026-08-09T11:00:00.000Z", "2026-08-09T11:05:00.000Z"),
    ];
    const flatTotal = entries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0);
    const groupedTotal = groupByTicket(entries).reduce((sum, t) => sum + t.totalMinutes, 0);
    expect(groupedTotal).toBe(flatTotal);
  });
});

describe("buildTicketColorMap", () => {
  it("maps ticket number to color", () => {
    const map = buildTicketColorMap([
      { ticketNumber: 42, color: "#0891b2" },
      { ticketNumber: 43, color: "#e11d48" },
    ]);
    expect(map.get(42)).toBe("#0891b2");
    expect(map.get(43)).toBe("#e11d48");
  });

  it("omits tickets with no color, so callers fall back to the rotation", () => {
    const map = buildTicketColorMap([
      { ticketNumber: 42, color: null },
      { ticketNumber: 43 },
      { ticketNumber: 44, color: "#0891b2" },
    ]);
    expect(map.has(42)).toBe(false);
    expect(map.has(43)).toBe(false);
    expect(map.get(44)).toBe("#0891b2");
  });

  it("returns an empty map for no tickets", () => {
    expect(buildTicketColorMap([]).size).toBe(0);
  });
});
