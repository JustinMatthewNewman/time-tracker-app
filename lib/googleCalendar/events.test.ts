import { describe, expect, it } from "vitest";
import {
  buildDescription,
  buildEventBody,
  buildSummary,
  buildSyncBlocks,
  deriveEventId,
  planSync,
  DAY_KEY,
  MANAGED_KEY,
  type EventPrefs,
  type ExistingEvent,
  type SyncSourceEntry,
} from "./events";

const PREFS: EventPrefs = {
  mergeConsecutive: true,
  overwriteExisting: true,
  pruneOrphans: true,
  markAsFree: true,
  includeDescription: true,
};

// Readable stand-ins for real TimeEntry UUIDs — deriveEventId requires 32 hex
// digits, so the tests can't use "entry-1" style ids.
const uuid = (n: number) => `${String(n).padStart(8, "0")}-0000-4000-8000-000000000000`;

function entry(overrides: Partial<SyncSourceEntry> & { id: string; startTime: string; endTime: string }): SyncSourceEntry {
  return { date: "2026-09-04", ...overrides };
}

describe("deriveEventId", () => {
  it("turns a UUID into a valid base32hex Google event id", () => {
    const id = deriveEventId("0f8fad5b-d9cb-469f-a165-70867728950e");
    expect(id).toBe("tt0f8fad5bd9cb469fa16570867728950e");
    // Google's constraint: 5-1024 chars from a-v and 0-9.
    expect(id).toMatch(/^[a-v0-9]{5,1024}$/);
  });

  it("is stable across calls, which is what makes syncing idempotent", () => {
    expect(deriveEventId(uuid(1))).toBe(deriveEventId(uuid(1)));
  });

  it("rejects a non-UUID id rather than sending Google something it will refuse", () => {
    expect(() => deriveEventId("entry-1")).toThrow(/non-UUID/);
  });
});

describe("buildSyncBlocks", () => {
  it("merges back-to-back entries on the same ticket into one block", () => {
    const blocks = buildSyncBlocks(
      [
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(2), startTime: "2026-09-04T09:15:00Z", endTime: "2026-09-04T09:30:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(3), startTime: "2026-09-04T09:30:00Z", endTime: "2026-09-04T09:45:00Z", ticket: { ticketNumber: 42 } }),
      ],
      true
    );

    expect(blocks).toHaveLength(1);
    expect(blocks[0].start).toBe("2026-09-04T09:00:00Z");
    expect(blocks[0].end).toBe("2026-09-04T09:45:00Z");
    expect(blocks[0].entryCount).toBe(3);
  });

  it("keys a merged block on its FIRST entry, so extending it updates in place", () => {
    const twoEntries = buildSyncBlocks(
      [
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(2), startTime: "2026-09-04T09:15:00Z", endTime: "2026-09-04T09:30:00Z", ticket: { ticketNumber: 42 } }),
      ],
      true
    );
    const threeEntries = buildSyncBlocks(
      [
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(2), startTime: "2026-09-04T09:15:00Z", endTime: "2026-09-04T09:30:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(3), startTime: "2026-09-04T09:30:00Z", endTime: "2026-09-04T09:45:00Z", ticket: { ticketNumber: 42 } }),
      ],
      true
    );

    expect(threeEntries[0].eventId).toBe(twoEntries[0].eventId);
    expect(threeEntries[0].end).toBe("2026-09-04T09:45:00Z");
  });

  it("does not merge across a gap", () => {
    const blocks = buildSyncBlocks(
      [
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(2), startTime: "2026-09-04T10:00:00Z", endTime: "2026-09-04T10:15:00Z", ticket: { ticketNumber: 42 } }),
      ],
      true
    );
    expect(blocks).toHaveLength(2);
  });

  it("does not merge different tickets", () => {
    const blocks = buildSyncBlocks(
      [
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(2), startTime: "2026-09-04T09:15:00Z", endTime: "2026-09-04T09:30:00Z", ticket: { ticketNumber: 43 } }),
      ],
      true
    );
    expect(blocks).toHaveLength(2);
  });

  it("merges a contiguous run of unticketed entries", () => {
    const blocks = buildSyncBlocks(
      [
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z" }),
        entry({ id: uuid(2), startTime: "2026-09-04T09:15:00Z", endTime: "2026-09-04T09:30:00Z" }),
      ],
      true
    );
    expect(blocks).toHaveLength(1);
    expect(blocks[0].ticketNumber).toBeNull();
  });

  it("does not merge across a day boundary even when contiguous", () => {
    const blocks = buildSyncBlocks(
      [
        entry({ id: uuid(1), date: "2026-09-04", startTime: "2026-09-04T23:45:00Z", endTime: "2026-09-05T00:00:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(2), date: "2026-09-05", startTime: "2026-09-05T00:00:00Z", endTime: "2026-09-05T00:15:00Z", ticket: { ticketNumber: 42 } }),
      ],
      true
    );
    expect(blocks).toHaveLength(2);
  });

  it("leaves every entry as its own block when merging is off", () => {
    const blocks = buildSyncBlocks(
      [
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(2), startTime: "2026-09-04T09:15:00Z", endTime: "2026-09-04T09:30:00Z", ticket: { ticketNumber: 42 } }),
      ],
      false
    );
    expect(blocks).toHaveLength(2);
  });

  it("sorts unsorted input before merging (the source query orders DESC)", () => {
    const blocks = buildSyncBlocks(
      [
        entry({ id: uuid(2), startTime: "2026-09-04T09:15:00Z", endTime: "2026-09-04T09:30:00Z", ticket: { ticketNumber: 42 } }),
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } }),
      ],
      true
    );
    expect(blocks).toHaveLength(1);
    expect(blocks[0].eventId).toBe(deriveEventId(uuid(1)));
  });

  it("collects distinct descriptions and drops duplicates", () => {
    const blocks = buildSyncBlocks(
      [
        entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 }, description: "triage" }),
        entry({ id: uuid(2), startTime: "2026-09-04T09:15:00Z", endTime: "2026-09-04T09:30:00Z", ticket: { ticketNumber: 42 }, description: "triage" }),
        entry({ id: uuid(3), startTime: "2026-09-04T09:30:00Z", endTime: "2026-09-04T09:45:00Z", ticket: { ticketNumber: 42 }, description: "patch" }),
      ],
      true
    );
    expect(blocks[0].descriptions).toEqual(["triage", "patch"]);
  });

  it("drops zero-length entries rather than syncing an instantaneous event", () => {
    const blocks = buildSyncBlocks(
      [entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:00:00Z" })],
      true
    );
    expect(blocks).toEqual([]);
  });
});

describe("buildSummary / buildDescription", () => {
  const [block] = buildSyncBlocks(
    [entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42, ticketTitle: "Fix the login redirect loop", ticketLink: "https://tracker.example/42" }, description: "repro" })],
    true
  );

  it("titles an event with ticket number and full title, untruncated", () => {
    // Unlike ticketLabelWithTitle, which caps at 20 chars for cramped UI.
    expect(buildSummary(block)).toBe("42 - Fix the login redirect loop");
  });

  it("falls back to the unassigned label with no ticket", () => {
    const [none] = buildSyncBlocks([entry({ id: uuid(9), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z" })], true);
    expect(buildSummary(none)).toBe("(No ticket)");
  });

  it("includes the ticket link in the body", () => {
    expect(buildDescription(block, true)).toContain("https://tracker.example/42");
  });

  it("omits notes but keeps the link when includeDescription is off", () => {
    const body = buildDescription(block, false);
    expect(body).not.toContain("repro");
    expect(body).toContain("https://tracker.example/42");
  });
});

describe("buildEventBody", () => {
  const [block] = buildSyncBlocks(
    [entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } })],
    true
  );

  it("marks events Free by default so past work doesn't blank out availability", () => {
    expect(buildEventBody(block, PREFS).transparency).toBe("transparent");
    expect(buildEventBody(block, { ...PREFS, markAsFree: false }).transparency).toBe("opaque");
  });

  it("disables reminders so a backfill can't fire an alarm per event", () => {
    expect(buildEventBody(block, PREFS).reminders).toEqual({ useDefault: false, overrides: [] });
  });

  it("stamps the managed marker and source day used by pruning", () => {
    const props = buildEventBody(block, PREFS).extendedProperties.private;
    expect(props[MANAGED_KEY]).toBe("1");
    expect(props[DAY_KEY]).toBe("2026-09-04");
  });
});

describe("planSync", () => {
  const scope = new Set(["2026-09-04"]);
  const blocks = buildSyncBlocks(
    [entry({ id: uuid(1), startTime: "2026-09-04T09:00:00Z", endTime: "2026-09-04T09:15:00Z", ticket: { ticketNumber: 42 } })],
    true
  );
  const eventId = blocks[0].eventId;

  const asExisting = (overrides: Partial<ExistingEvent> = {}): ExistingEvent => ({
    id: eventId,
    status: "confirmed",
    summary: "42",
    description: "",
    transparency: "transparent",
    start: { dateTime: "2026-09-04T09:00:00Z" },
    end: { dateTime: "2026-09-04T09:15:00Z" },
    extendedProperties: { private: { [MANAGED_KEY]: "1", [DAY_KEY]: "2026-09-04" } },
    ...overrides,
  });

  it("inserts an event that doesn't exist yet", () => {
    expect(planSync(blocks, [], PREFS, scope).counts.created).toBe(1);
  });

  it("leaves an identical event alone, so a repeat sync costs nothing", () => {
    const plan = planSync(blocks, [asExisting()], PREFS, scope);
    expect(plan.counts).toMatchObject({ created: 0, updated: 0, unchanged: 1 });
  });

  it("treats an equivalent time in another offset as unchanged", () => {
    // Google echoes times back in the calendar's timezone; a string compare
    // here would rewrite every event on every sync.
    const plan = planSync(
      blocks,
      [asExisting({ start: { dateTime: "2026-09-04T05:00:00-04:00" }, end: { dateTime: "2026-09-04T05:15:00-04:00" } })],
      PREFS,
      scope
    );
    expect(plan.counts.unchanged).toBe(1);
  });

  it("updates an event whose title drifted", () => {
    expect(planSync(blocks, [asExisting({ summary: "edited by hand" })], PREFS, scope).counts.updated).toBe(1);
  });

  it("preserves a drifted event when overwrite is off", () => {
    const plan = planSync(blocks, [asExisting({ summary: "edited by hand" })], { ...PREFS, overwriteExisting: false }, scope);
    expect(plan.counts).toMatchObject({ updated: 0, preserved: 1 });
  });

  it("revives a cancelled event via update rather than a 409-ing insert", () => {
    const plan = planSync(blocks, [asExisting({ status: "cancelled" })], PREFS, scope);
    expect(plan.counts.created).toBe(0);
    expect(plan.actions).toContainEqual(expect.objectContaining({ kind: "update", reason: "revive" }));
  });

  it("leaves a cancelled event deleted when overwrite is off", () => {
    const plan = planSync(blocks, [asExisting({ status: "cancelled" })], { ...PREFS, overwriteExisting: false }, scope);
    expect(plan.counts).toMatchObject({ updated: 0, preserved: 1 });
  });

  it("prunes an in-range managed event with no matching entry", () => {
    const orphan = asExisting({ id: "tt" + "a".repeat(32) });
    const plan = planSync(blocks, [asExisting(), orphan], PREFS, scope);
    expect(plan.counts.deleted).toBe(1);
    expect(plan.actions).toContainEqual({ kind: "delete", eventId: orphan.id });
  });

  it("never prunes outside the synced range", () => {
    const outOfRange = asExisting({
      id: "tt" + "b".repeat(32),
      extendedProperties: { private: { [MANAGED_KEY]: "1", [DAY_KEY]: "2026-08-01" } },
    });
    expect(planSync(blocks, [asExisting(), outOfRange], PREFS, scope).counts.deleted).toBe(0);
  });

  it("never prunes an event with no day marker", () => {
    const unmarked = asExisting({ id: "tt" + "c".repeat(32), extendedProperties: { private: { [MANAGED_KEY]: "1" } } });
    expect(planSync(blocks, [asExisting(), unmarked], PREFS, scope).counts.deleted).toBe(0);
  });

  it("prunes nothing when pruning is off", () => {
    const orphan = asExisting({ id: "tt" + "d".repeat(32) });
    expect(planSync(blocks, [asExisting(), orphan], { ...PREFS, pruneOrphans: false }, scope).counts.deleted).toBe(0);
  });

  it("does not re-delete an already-cancelled orphan", () => {
    const orphan = asExisting({ id: "tt" + "e".repeat(32), status: "cancelled" });
    expect(planSync(blocks, [asExisting(), orphan], PREFS, scope).counts.deleted).toBe(0);
  });
});
