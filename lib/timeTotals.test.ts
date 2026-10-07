import { describe, expect, it } from "vitest";
import {
  buildTicketColorMap,
  minutesBetween,
  groupByTicket,
  formatDuration,
  formatDecimalHours,
  capTicketTotals,
  isOtherTicketLabel,
  UNASSIGNED_TICKET,
  type TicketTotal,
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

describe("capTicketTotals", () => {
  const totals = (n: number, opts: { unassigned?: boolean } = {}) => {
    const rows: TicketTotal[] = Array.from({ length: n }, (_, i) => ({
      ticket: String(100 + i),
      entryCount: 2,
      // Descending, matching groupByTicket's own output order, which
      // capTicketTotals assumes.
      totalMinutes: (n - i) * 10,
    }));
    if (opts.unassigned) {
      rows.push({ ticket: UNASSIGNED_TICKET, entryCount: 5, totalMinutes: 5 });
    }
    return rows;
  };

  it("returns the input untouched when it fits in the budget", () => {
    const input = totals(3);
    expect(capTicketTotals(input, 8)).toBe(input);
  });

  it("returns the input untouched when it exactly fills the budget", () => {
    const input = totals(8);
    expect(capTicketTotals(input, 8)).toBe(input);
  });

  it("keeps the largest rows and folds the rest into one Other bucket", () => {
    const result = capTicketTotals(totals(10), 8);
    expect(result).toHaveLength(9);
    expect(result.slice(0, 8).map((t) => t.ticket)).toEqual([
      "100", "101", "102", "103", "104", "105", "106", "107",
    ]);
    expect(result[8].ticket).toBe("Other (2 tickets)");
  });

  it("sums the overflow's minutes and entry counts into the bucket", () => {
    const result = capTicketTotals(totals(10), 8);
    const other = result[result.length - 1];
    // The two smallest rows: 20 and 10 minutes, 2 entries each.
    expect(other.totalMinutes).toBe(30);
    expect(other.entryCount).toBe(4);
  });

  it("conserves the grand total — nothing is dropped or double counted", () => {
    const input = totals(25, { unassigned: true });
    const sum = (rows: TicketTotal[]) => rows.reduce((acc, t) => acc + t.totalMinutes, 0);
    expect(sum(capTicketTotals(input, 8))).toBe(sum(input));
  });

  it("conserves the entry count as well as the minutes", () => {
    const input = totals(25, { unassigned: true });
    const sum = (rows: TicketTotal[]) => rows.reduce((acc, t) => acc + t.entryCount, 0);
    expect(sum(capTicketTotals(input, 8))).toBe(sum(input));
  });

  it("never folds the unassigned bucket into Other, since it costs no hue", () => {
    const result = capTicketTotals(totals(20, { unassigned: true }), 8);
    expect(result.map((t) => t.ticket)).toContain(UNASSIGNED_TICKET);
  });

  it("does not count the unassigned bucket against the hue budget", () => {
    // 8 real tickets plus the unassigned row is 9 rows but only 8 hues, so it
    // must pass through uncapped.
    const input = totals(8, { unassigned: true });
    expect(capTicketTotals(input, 8)).toBe(input);
  });

  it("emits at most one Other bucket however large the overflow", () => {
    const result = capTicketTotals(totals(200), 8);
    expect(result.filter((t) => isOtherTicketLabel(t.ticket))).toHaveLength(1);
    expect(result).toHaveLength(9);
  });

  it("handles an empty input", () => {
    expect(capTicketTotals([], 8)).toEqual([]);
  });
});

describe("isOtherTicketLabel", () => {
  it("matches the bucket capTicketTotals actually produces", () => {
    const other = capTicketTotals(
      Array.from({ length: 10 }, (_, i) => ({ ticket: String(i), entryCount: 1, totalMinutes: 10 - i })),
      8
    ).at(-1)!;
    expect(isOtherTicketLabel(other.ticket)).toBe(true);
  });

  it("does not match a plain ticket number or the unassigned label", () => {
    expect(isOtherTicketLabel("19620")).toBe(false);
    expect(isOtherTicketLabel(UNASSIGNED_TICKET)).toBe(false);
  });
});
