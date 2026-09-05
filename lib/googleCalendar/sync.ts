import { listTimeEntriesByDateRange } from "@/src/dataconnect-admin-generated";
import { fetchAllPages } from "@/lib/dataconnectPagination";
import { normalizeDayKey, parseDayKey, toDayKey, type DayKey } from "@/lib/dayKeys";
import { deleteEvent, insertEvent, listManagedEvents, updateEvent } from "./api";
import { buildEventBody, buildSyncBlocks, planSync, type SyncSourceEntry } from "./events";
import { getAccessToken, markSynced, type StoredConnection } from "./store";

// Orchestration for one "Sync now": read the range's entries, read what's
// already on the calendar, diff, and apply. The interesting decisions live in
// events.ts (what to write) and api.ts (how to talk to Google); this file is
// about bounding the work and reporting honestly on what it did.

/**
 * The widest range one request will sync.
 *
 * The range picker offers presets well under this; the cap exists for the
 * custom range, where "backfill everything" against ~9,900 entries is a
 * plausible thing to type. A year at a time keeps the entry fetch bounded and
 * gives the user a progress story rather than one request that either works or
 * times out with no indication of how far it got.
 */
export const MAX_RANGE_DAYS = 366;

/**
 * The most calendar writes one request will perform.
 *
 * Serverless platforms cap request duration, and a first-time backfill can
 * legitimately want thousands of writes. Rather than racing that limit and
 * dying with the work half-done and unreported, a sync stops at this many
 * writes and says so — `truncated` in the result. Because the whole design is
 * idempotent, "run it again" genuinely resumes: already-written events come
 * back `unchanged` and cost nothing, so each subsequent run makes progress.
 */
export const MAX_WRITES_PER_SYNC = 500;

/**
 * Concurrent calendar writes.
 *
 * Kept low on purpose. Google rate-limits per user, and writes to a single
 * calendar contend with each other; pushing concurrency higher mostly buys
 * more 403 rateLimitExceeded responses and more backoff. Three is fast enough
 * that the round-trip latency stops dominating without provoking the limiter.
 */
const WRITE_CONCURRENCY = 3;

export interface SyncRange {
  start: DayKey;
  end: DayKey;
}

export interface SyncResult {
  range: SyncRange;
  entriesConsidered: number;
  blocks: number;
  created: number;
  updated: number;
  unchanged: number;
  preserved: number;
  deleted: number;
  /** Writes skipped because MAX_WRITES_PER_SYNC was hit — run again to continue. */
  remaining: number;
  truncated: boolean;
  errors: string[];
}

export class SyncRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SyncRangeError";
  }
}

/** Validates a requested range and returns the day keys it covers. */
export function daysInRange(range: SyncRange): DayKey[] {
  const start = parseDayKey(range.start);
  const end = parseDayKey(range.end);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new SyncRangeError("Start and end must be yyyy-mm-dd dates");
  }
  if (end < start) throw new SyncRangeError("End date must not be before start date");

  const days: DayKey[] = [];
  // Stepped with setDate on a local-midnight Date rather than by adding
  // 86_400_000ms, so a DST transition inside the range doesn't shift every
  // subsequent day by an hour and start skipping or repeating one.
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push(toDayKey(cursor));
    if (days.length > MAX_RANGE_DAYS) {
      throw new SyncRangeError(
        `Range is longer than ${MAX_RANGE_DAYS} days — sync it in smaller chunks`
      );
    }
  }
  return days;
}

export async function runSync(
  userId: string,
  connection: StoredConnection,
  range: SyncRange
): Promise<SyncResult> {
  const days = daysInRange(range);
  const daysInScope = new Set(days);

  const entries = (await fetchAllPages(
    async (vars) => {
      const { data } = await listTimeEntriesByDateRange(vars);
      return data.timeEntries;
    },
    { userId, startDate: range.start, endDate: range.end }
  )) as SyncSourceEntry[];

  const blocks = buildSyncBlocks(entries, connection.prefs.mergeConsecutive);

  const accessToken = await getAccessToken(connection);

  // Padded by two days on each side. The Calendar query is in absolute time
  // while the range is in the user's calendar days, and no timezone is more
  // than 14 hours from UTC — so a couple of days of slack guarantees every
  // event belonging to an in-scope day is seen. Anything outside the range that
  // this drags in is filtered out again by the DAY_KEY check in planSync, so
  // over-fetching here cannot cause an out-of-range deletion.
  const timeMin = shiftDays(days[0], -2);
  const timeMax = shiftDays(days[days.length - 1], 2);

  const existing = await listManagedEvents(accessToken, connection.calendarId, timeMin, timeMax);

  const plan = planSync(blocks, existing, connection.prefs, daysInScope);

  // Writes first, deletions last. If the cap truncates a run, the useful half
  // of the work (getting the user's actual time onto the calendar) has
  // happened, and pruning stale events is what waits for the next run.
  const writes = plan.actions.filter((a) => a.kind === "insert" || a.kind === "update");
  const deletes = plan.actions.filter((a) => a.kind === "delete");
  const ordered = [...writes, ...deletes];

  const toApply = ordered.slice(0, MAX_WRITES_PER_SYNC);
  const remaining = ordered.length - toApply.length;
  const errors: string[] = [];

  let created = 0;
  let updated = 0;
  let deleted = 0;

  await inParallel(toApply, WRITE_CONCURRENCY, async (action) => {
    try {
      if (action.kind === "insert") {
        await insertEvent(
          accessToken,
          connection.calendarId,
          action.block.eventId,
          buildEventBody(action.block, connection.prefs)
        );
        created += 1;
      } else if (action.kind === "update") {
        await updateEvent(
          accessToken,
          connection.calendarId,
          action.block.eventId,
          buildEventBody(action.block, connection.prefs)
        );
        updated += 1;
      } else if (action.kind === "delete") {
        await deleteEvent(accessToken, connection.calendarId, action.eventId);
        deleted += 1;
      }
    } catch (err) {
      // One bad event must not abandon the rest of the range. Failures are
      // collected and reported; because the sync is idempotent, a rerun retries
      // exactly the ones that failed and leaves the successes alone.
      const message = err instanceof Error ? err.message : String(err);
      if (errors.length < 10) errors.push(message);
    }
  });

  // Only stamp a sync that actually finished its planned work. Leaving
  // lastSyncedAt alone on a truncated or partly-failed run keeps the settings
  // card from claiming the calendar is up to date when it isn't.
  if (!remaining && errors.length === 0) {
    await markSynced(userId);
  }

  return {
    range,
    entriesConsidered: entries.length,
    blocks: blocks.length,
    created,
    updated,
    unchanged: plan.counts.unchanged,
    preserved: plan.counts.preserved,
    deleted,
    remaining,
    truncated: remaining > 0,
    errors,
  };
}

/** Day key shifted by whole days, rendered as an RFC3339 instant for Calendar queries. */
function shiftDays(day: DayKey, delta: number): string {
  const date = parseDayKey(normalizeDayKey(day));
  date.setDate(date.getDate() + delta);
  return date.toISOString();
}

/** Runs `worker` over `items` with at most `limit` in flight. */
async function inParallel<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index]);
    }
  });
  await Promise.all(runners);
}
