import { describe, expect, it } from "vitest";
import { shiftEntryToDate } from "./workLogDuplicate";

// Everything here is asserted on *local* components rather than on a literal
// ISO string, deliberately: these assertions then hold in every timezone the
// suite might run in (CI, a laptop, the emulator box), while still being
// exactly the property that matters — the entry keeps its wall-clock time and
// lands on the intended calendar day.

function localMidnightIso(y: number, m: number, d: number) {
  return new Date(y, m - 1, d).toISOString();
}

function localIso(y: number, m: number, d: number, h: number, min = 0) {
  return new Date(y, m - 1, d, h, min).toISOString();
}

describe("shiftEntryToDate", () => {
  it("keeps the time of day when moving to another date", () => {
    const result = new Date(
      shiftEntryToDate(
        localIso(2026, 10, 5, 8, 30),
        localMidnightIso(2026, 10, 5),
        localMidnightIso(2026, 10, 7)
      )
    );
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9);
    expect(result.getDate()).toBe(7);
  });

  it("is a no-op when the target date is the source date", () => {
    const iso = localIso(2026, 10, 5, 13, 15);
    expect(shiftEntryToDate(iso, localMidnightIso(2026, 10, 5), localMidnightIso(2026, 10, 5))).toBe(iso);
  });

  it("moves an entry backwards in time as readily as forwards", () => {
    const result = new Date(
      shiftEntryToDate(
        localIso(2026, 10, 7, 16, 45),
        localMidnightIso(2026, 10, 7),
        localMidnightIso(2026, 9, 30)
      )
    );
    expect(result.getMonth()).toBe(8); // September
    expect(result.getDate()).toBe(30);
    expect(result.getHours()).toBe(16);
    expect(result.getMinutes()).toBe(45);
  });

  it("keeps an entry that ran past midnight one day ahead of the target date", () => {
    const result = new Date(
      shiftEntryToDate(
        // 00:30 on the 6th — the tail of a shift that started on the 5th.
        localIso(2026, 10, 6, 0, 30),
        localMidnightIso(2026, 10, 5),
        localMidnightIso(2026, 10, 20)
      )
    );
    expect(result.getDate()).toBe(21);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(30);
  });

  it("crosses a month boundary", () => {
    const result = new Date(
      shiftEntryToDate(
        localIso(2026, 10, 31, 9, 0),
        localMidnightIso(2026, 10, 31),
        localMidnightIso(2026, 11, 1)
      )
    );
    expect(result.getMonth()).toBe(10); // November
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(9);
  });

  it("crosses a year boundary", () => {
    const result = new Date(
      shiftEntryToDate(
        localIso(2026, 12, 31, 17, 0),
        localMidnightIso(2026, 12, 31),
        localMidnightIso(2027, 1, 1)
      )
    );
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(17);
  });

  // The regression this function exists for. A millisecond-delta shift across
  // one of these boundaries moves every entry by an hour; reconstructing from
  // local components does not. The assertion holds in a zone without DST too,
  // where it is simply the ordinary case.
  it.each([
    ["spring forward (US)", [2026, 3, 6] as const, [2026, 3, 9] as const],
    ["fall back (US)", [2026, 10, 30] as const, [2026, 11, 2] as const],
    ["spring forward (EU)", [2026, 3, 27] as const, [2026, 3, 30] as const],
    ["fall back (EU)", [2026, 10, 23] as const, [2026, 10, 26] as const],
  ])("preserves the wall clock across a %s boundary", (_label, from, to) => {
    const [sy, sm, sd] = from;
    const [ty, tm, td] = to;
    for (const hour of [0, 8, 12, 16, 23]) {
      const result = new Date(
        shiftEntryToDate(
          localIso(sy, sm, sd, hour),
          localMidnightIso(sy, sm, sd),
          localMidnightIso(ty, tm, td)
        )
      );
      expect(result.getHours()).toBe(hour);
      expect(result.getDate()).toBe(td);
      expect(result.getMonth()).toBe(tm - 1);
    }
  });

  it("preserves the duration of an entry whose two ends shift together", () => {
    const start = localIso(2026, 10, 5, 8, 0);
    const end = localIso(2026, 10, 5, 9, 30);
    const source = localMidnightIso(2026, 10, 5);
    const target = localMidnightIso(2026, 10, 7);
    const shiftedStart = new Date(shiftEntryToDate(start, source, target));
    const shiftedEnd = new Date(shiftEntryToDate(end, source, target));
    expect(shiftedEnd.getTime() - shiftedStart.getTime()).toBe(90 * 60_000);
  });
});
