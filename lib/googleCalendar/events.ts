import { normalizeDayKey, type DayKey } from "@/lib/dayKeys";
import { UNASSIGNED_TICKET } from "@/lib/timeTotals";

// Pure mapping from this app's time entries to Google Calendar events, and the
// diff that decides what a sync actually writes. No network, no database, no
// environment — everything here is deterministic, which is what makes the
// interesting behaviour (merging, idempotency, pruning) testable without
// touching Google. See lib/googleCalendar/events.test.ts.

/** The subset of a TimeEntry this module needs — matches ListTimeEntriesByDateRange. */
export interface SyncSourceEntry {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string | null;
  ticket?: {
    ticketNumber: number;
    ticketTitle?: string | null;
    ticketLink?: string | null;
  } | null;
}

/** One or more contiguous entries that will become a single calendar event. */
export interface SyncBlock {
  /** Deterministic Google event id — see deriveEventId. */
  eventId: string;
  day: DayKey;
  start: string;
  end: string;
  entryCount: number;
  ticketNumber: number | null;
  ticketTitle: string | null;
  ticketLink: string | null;
  /** Distinct, non-empty entry descriptions in chronological order. */
  descriptions: string[];
}

export interface EventPrefs {
  mergeConsecutive: boolean;
  overwriteExisting: boolean;
  pruneOrphans: boolean;
  markAsFree: boolean;
  includeDescription: boolean;
}

// --- Extended-property markers -------------------------------------------
//
// Written onto every event this app creates, and the basis of two guarantees.
//
// MANAGED_KEY is what makes pruning safe. A sync lists events filtered by
// `privateExtendedProperty=ttManaged=1`, so an event the user added to the
// Time Tracker calendar by hand is invisible to the diff and can never be
// deleted or overwritten by it — the integration only ever touches its own
// output.
//
// DAY_KEY records which source day an event came from. Pruning needs to ask
// "is this event inside the range being synced?", and answering that from the
// event's timestamp would mean redoing timezone arithmetic that the day key
// already settles exactly. Google caps a private property value at 1024
// characters, which a 10-character day key is comfortably inside — notably
// unlike the list of source entry ids, which is why that is deliberately not
// stored here (a 7-hour merged block would overflow it).
export const MANAGED_KEY = "ttManaged";
export const MANAGED_VALUE = "1";
export const DAY_KEY = "ttDay";

/**
 * Google event id for a block, derived from the id of its earliest entry.
 *
 * This is what makes syncing idempotent without a mapping table. Google lets
 * the client choose an event id, requiring 5-1024 characters from the base32hex
 * alphabet (a-v and 0-9). A TimeEntry's UUID with its dashes stripped is 32
 * hex characters, and hex is a strict subset of that alphabet — so the source
 * row's identity *is* the event's identity, and re-syncing the same entry
 * addresses the same event instead of creating a second one.
 *
 * Keying a merged block on its *first* entry rather than on a hash of all its
 * entry ids is deliberate. Extending a block (logging another 15 minutes on the
 * same ticket) keeps the id stable, so the sync updates the event's end time in
 * place. A set-hash would change identity on every extension, turning each
 * appended entry into a delete-plus-create and making the event churn in the
 * user's calendar.
 *
 * The "tt" prefix namespaces the id (both letters are inside a-v) so these are
 * recognizable as this app's events even before reading their properties.
 */
export function deriveEventId(firstEntryId: string): string {
  const hex = firstEntryId.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    // A non-UUID entry id would silently produce an id Google rejects with an
    // opaque 400 partway through a sync. Fail here, where the cause is obvious.
    throw new Error(`Cannot derive a Google event id from non-UUID entry id "${firstEntryId}"`);
  }
  return `tt${hex}`;
}

/**
 * Groups entries into the blocks a sync will write.
 *
 * With mergeConsecutive, adjacent entries collapse when they share a day and a
 * ticket and the earlier one ends exactly where the later one starts. That
 * turns a day of 15-minute segments into a handful of readable blocks; without
 * it every entry becomes its own event.
 *
 * Two entries with no ticket count as sharing a ticket, so an unticketed run
 * merges too rather than fragmenting into slivers.
 *
 * Entries are sorted by start time first, because merging is a scan over
 * neighbours and the caller's query orders by startTime DESC.
 */
export function buildSyncBlocks(entries: SyncSourceEntry[], mergeConsecutive: boolean): SyncBlock[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const blocks: SyncBlock[] = [];

  for (const entry of sorted) {
    const day = normalizeDayKey(entry.date);
    const ticketNumber = entry.ticket?.ticketNumber ?? null;
    const previous = blocks[blocks.length - 1];

    const continues =
      mergeConsecutive &&
      previous !== undefined &&
      previous.day === day &&
      previous.ticketNumber === ticketNumber &&
      new Date(previous.end).getTime() === new Date(entry.startTime).getTime();

    if (continues) {
      previous.end = entry.endTime;
      previous.entryCount += 1;
      pushDescription(previous.descriptions, entry.description);
      // A later entry may carry ticket metadata the first one lacked (the
      // Ticket row gained a title since). Fill gaps, never overwrite.
      previous.ticketTitle ??= entry.ticket?.ticketTitle ?? null;
      previous.ticketLink ??= entry.ticket?.ticketLink ?? null;
      continue;
    }

    const descriptions: string[] = [];
    pushDescription(descriptions, entry.description);
    blocks.push({
      eventId: deriveEventId(entry.id),
      day,
      start: entry.startTime,
      end: entry.endTime,
      entryCount: 1,
      ticketNumber,
      ticketTitle: entry.ticket?.ticketTitle ?? null,
      ticketLink: entry.ticket?.ticketLink ?? null,
      descriptions,
    });
  }

  // Zero-length entries would become events Google renders as a point in time.
  // They carry no information and are almost certainly data-entry slips, so
  // they're dropped rather than synced.
  return blocks.filter((b) => new Date(b.end).getTime() > new Date(b.start).getTime());
}

function pushDescription(into: string[], value: string | null | undefined) {
  const trimmed = value?.trim();
  // Deduped: a merged block whose entries all repeat the same note should read
  // as that note once, not the same line eight times.
  if (trimmed && !into.includes(trimmed)) into.push(trimmed);
}

/**
 * Event title.
 *
 * Deliberately not lib/timeTotals.ts's ticketLabelWithTitle, despite the same
 * "number - Title" shape: that one truncates to 20 characters so a long title
 * can't distort a calendar cell or a table column. A Google Calendar event
 * title has no such constraint and gets clipped by the client anyway, so
 * truncating here would only throw away information the user can otherwise see.
 */
export function buildSummary(block: SyncBlock): string {
  if (block.ticketNumber === null) return UNASSIGNED_TICKET;
  return block.ticketTitle
    ? `${block.ticketNumber} - ${block.ticketTitle}`
    : String(block.ticketNumber);
}

export function buildDescription(block: SyncBlock, includeDescription: boolean): string {
  const lines: string[] = [];

  if (includeDescription && block.descriptions.length > 0) {
    // One note reads better as a bare line; several read better as a list.
    lines.push(
      block.descriptions.length === 1
        ? block.descriptions[0]
        : block.descriptions.map((d) => `• ${d}`).join("\n")
    );
  }

  if (block.ticketLink) {
    if (lines.length) lines.push("");
    lines.push(block.ticketLink);
  }

  return lines.join("\n");
}

/** The Google Calendar event body this app writes. */
export interface CalendarEventBody {
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
  transparency: "transparent" | "opaque";
  reminders: { useDefault: false; overrides: [] };
  extendedProperties: { private: Record<string, string> };
}

export function buildEventBody(block: SyncBlock, prefs: EventPrefs): CalendarEventBody {
  return {
    summary: buildSummary(block),
    description: buildDescription(block, prefs.includeDescription),
    // No `timeZone`: these ISO strings carry a UTC offset, which already fixes
    // the absolute instant. Supplying a timeZone alongside an offset only
    // invites the two disagreeing.
    start: { dateTime: block.start },
    end: { dateTime: block.end },
    // Free rather than Busy by default — these are records of work already
    // done, and marking them Busy would retroactively blank out the user's
    // availability for anyone who can see this calendar.
    transparency: prefs.markAsFree ? "transparent" : "opaque",
    // Never notify. Without this, syncing a month of history fires a popup for
    // every event Google considers upcoming, and a backfill becomes an alarm
    // storm.
    reminders: { useDefault: false, overrides: [] },
    extendedProperties: {
      private: { [MANAGED_KEY]: MANAGED_VALUE, [DAY_KEY]: block.day },
    },
  };
}

/** The parts of an existing Google event the diff compares against. */
export interface ExistingEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  transparency?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Record<string, string> };
}

export type SyncAction =
  | { kind: "insert"; block: SyncBlock }
  | { kind: "update"; block: SyncBlock; reason: "changed" | "revive" }
  | { kind: "unchanged"; block: SyncBlock }
  | { kind: "preserved"; block: SyncBlock }
  | { kind: "delete"; eventId: string };

export interface SyncPlan {
  actions: SyncAction[];
  counts: {
    created: number;
    updated: number;
    unchanged: number;
    preserved: number;
    deleted: number;
  };
}

/**
 * Decides what the sync writes, given the blocks it wants and the app-created
 * events already on the calendar.
 *
 * `existing` must already be filtered to this app's own events (the
 * MANAGED_KEY private property) — pruning trusts that, and it is the reason a
 * hand-made event on the Time Tracker calendar is never deleted.
 *
 * `daysInScope` bounds pruning to the range actually being synced. Without it,
 * syncing one week would delete every event outside that week, which is the
 * difference between "sync this week" and "make my calendar match this week
 * and nothing else exists".
 */
export function planSync(
  blocks: SyncBlock[],
  existing: ExistingEvent[],
  prefs: EventPrefs,
  daysInScope: ReadonlySet<DayKey>
): SyncPlan {
  const byId = new Map(existing.map((e) => [e.id, e]));
  const actions: SyncAction[] = [];
  const counts = { created: 0, updated: 0, unchanged: 0, preserved: 0, deleted: 0 };

  for (const block of blocks) {
    const current = byId.get(block.eventId);

    if (!current) {
      actions.push({ kind: "insert", block });
      counts.created += 1;
      continue;
    }

    // A cancelled event counts as existing, not absent. Re-inserting its id
    // would fail with a 409 from Google, so the only way back is an update —
    // which is also the honest reading of the preference: the user deleted this
    // event in Google Calendar, and whether the app restores it is exactly what
    // "overwrite existing items" decides.
    const cancelled = current.status === "cancelled";

    if (!prefs.overwriteExisting) {
      actions.push({ kind: "preserved", block });
      counts.preserved += 1;
      continue;
    }

    if (cancelled) {
      actions.push({ kind: "update", block, reason: "revive" });
      counts.updated += 1;
      continue;
    }

    if (eventDiffers(current, block, prefs)) {
      actions.push({ kind: "update", block, reason: "changed" });
      counts.updated += 1;
    } else {
      // Skipping identical events is what keeps a repeat sync cheap: a
      // re-sync of an unchanged month costs one list call instead of hundreds
      // of writes, which matters against Google's per-user rate limits.
      actions.push({ kind: "unchanged", block });
      counts.unchanged += 1;
    }
  }

  if (prefs.pruneOrphans) {
    const wanted = new Set(blocks.map((b) => b.eventId));
    for (const event of existing) {
      if (wanted.has(event.id)) continue;
      if (event.status === "cancelled") continue; // already gone
      const day = event.extendedProperties?.private?.[DAY_KEY];
      // An event with no day marker predates this scheme or was written by
      // something else; leave it rather than guess it belongs to this range.
      if (!day || !daysInScope.has(day)) continue;
      actions.push({ kind: "delete", eventId: event.id });
      counts.deleted += 1;
    }
  }

  return { actions, counts };
}

function eventDiffers(current: ExistingEvent, block: SyncBlock, prefs: EventPrefs): boolean {
  const body = buildEventBody(block, prefs);

  // Compared as instants, not strings. Google echoes times back in the
  // calendar's own timezone ("2026-09-04T09:00:00-04:00") regardless of the
  // offset they were written with ("2026-09-04T13:00:00Z"), so a string
  // comparison would report every event as changed on every sync and turn the
  // unchanged fast path into a full rewrite.
  if (!sameInstant(current.start?.dateTime, body.start.dateTime)) return true;
  if (!sameInstant(current.end?.dateTime, body.end.dateTime)) return true;

  if ((current.summary ?? "") !== body.summary) return true;
  if ((current.description ?? "") !== body.description) return true;
  // Google omits `transparency` entirely when it is the default "opaque".
  if ((current.transparency ?? "opaque") !== body.transparency) return true;

  return false;
}

function sameInstant(a: string | undefined, b: string): boolean {
  if (!a) return false;
  const at = new Date(a).getTime();
  const bt = new Date(b).getTime();
  return Number.isFinite(at) && Number.isFinite(bt) && at === bt;
}
