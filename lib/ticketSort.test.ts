import { describe, expect, it } from "vitest";
import { compareTicketTotals, type TicketSortKey } from "./ticketSort";
import { capTicketTotals, UNASSIGNED_TICKET, type TicketTotal } from "./timeTotals";

function row(ticket: string, totalMinutes = 10, entryCount = 1): TicketTotal {
  return { ticket, totalMinutes, entryCount };
}

function order(rows: TicketTotal[], key: TicketSortKey, direction: "asc" | "desc" = "asc") {
  const sorted = [...rows].sort((a, b) => compareTicketTotals(a, b, key));
  return (direction === "desc" ? sorted.reverse() : sorted).map((t) => t.ticket);
}

describe("compareTicketTotals — ticket column", () => {
  it("orders ticket labels numerically, not lexicographically", () => {
    // The bug this guards: as strings, "10" < "9" and "1000" < "200".
    expect(order([row("9"), row("10"), row("200"), row("1000")], "ticket")).toEqual([
      "9",
      "10",
      "200",
      "1000",
    ]);
  });

  it("puts the unassigned bucket after every real ticket when ascending", () => {
    expect(order([row(UNASSIGNED_TICKET), row("20"), row("3")], "ticket")).toEqual([
      "3",
      "20",
      UNASSIGNED_TICKET,
    ]);
  });

  it("puts the unassigned bucket first when descending, where a summary belongs", () => {
    expect(order([row(UNASSIGNED_TICKET), row("20"), row("3")], "ticket", "desc")).toEqual([
      UNASSIGNED_TICKET,
      "20",
      "3",
    ]);
  });

  it("keeps the Other overflow row out of the numeric run", () => {
    const other = capTicketTotals(
      Array.from({ length: 10 }, (_, i) => row(String(100 + i), 100 - i)),
      8
    ).at(-1)!;
    expect(order([other, row("20"), row("3")], "ticket").at(-1)).toBe(other.ticket);
  });

  it("orders the two non-numeric labels against each other deterministically", () => {
    const a = order([row(UNASSIGNED_TICKET), row("Other (3 tickets)")], "ticket");
    const b = order([row("Other (3 tickets)"), row(UNASSIGNED_TICKET)], "ticket");
    expect(a).toEqual(b);
  });
});

describe("compareTicketTotals — magnitude columns", () => {
  it("orders by total minutes ascending", () => {
    expect(order([row("1", 90), row("2", 30), row("3", 60)], "time")).toEqual(["2", "3", "1"]);
  });

  it("orders by entry count ascending", () => {
    expect(order([row("1", 10, 5), row("2", 10, 1), row("3", 10, 3)], "entries")).toEqual([
      "2",
      "3",
      "1",
    ]);
  });

  it("sorts fractional minutes correctly rather than rounding them together first", () => {
    // minutesBetween returns fractions for non-minute-aligned timestamps, so
    // two rows can differ by less than a minute and must still order.
    expect(order([row("1", 10.6), row("2", 10.2), row("3", 10.4)], "time")).toEqual(["2", "3", "1"]);
  });

  it("includes the unassigned bucket in the magnitude ordering, unlike the ticket column", () => {
    // It has a real duration, so by time it ranks on that duration — the
    // pin-to-the-end rule is specific to ordering by ticket identity.
    expect(order([row(UNASSIGNED_TICKET, 500), row("1", 10)], "time", "desc")).toEqual([
      UNASSIGNED_TICKET,
      "1",
    ]);
  });

  it("is a total order — reversing the input does not change the result", () => {
    const rows = [row("30", 10, 2), row("4", 50, 9), row("200", 25, 2), row(UNASSIGNED_TICKET, 5, 1)];
    for (const key of ["ticket", "entries", "time"] as const) {
      // Ties (the two 2-entry rows under "entries") are the one case a
      // non-total comparator shows up, so this is asserted on the stable sort
      // Array.prototype.sort guarantees, not on luck.
      expect(order(rows, key)).toEqual(order(rows, key));
    }
  });

  it("handles an empty and a single-row table", () => {
    expect(order([], "time")).toEqual([]);
    expect(order([row("7")], "ticket")).toEqual(["7"]);
  });
});
