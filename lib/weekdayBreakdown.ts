// Pure aggregation behind the dashboard Overview's weekday breakdown row and
// its two companion widgets (hours by ticket, tickets by office).
//
// Kept free of React and of the Data Connect types on purpose: every function
// here takes plain entry-shaped objects and returns plain data, so the whole
// set is unit-testable without an emulator (see weekdayBreakdown.test.ts) and
// so the same helpers can later aggregate *another* user's entries for the
// admin per-user drill-down without being re-derived.
//
// Day bucketing goes through lib/dayKeys.ts and reads `entry.date`, never
// `new Date(entry.startTime)`. That matters for two reasons: `date` is what
// the server-side range filter (ListMyTimeEntriesByDateRange) scopes on, and
// re-deriving a day from a timestamp in the browser's timezone is the drift
// lib/dashboardConsistency.test.ts exists to catch.

import { normalizeDayKey, toDayKey, type DayKey } from "./dayKeys";
import {
  minutesBetween,
  truncateTicketTitle,
  UNASSIGNED_TICKET,
  type TicketTotal,
} from "./timeTotals";
import { startOfWeek } from "./weekBuckets";

/** Label for tickets whose Ticket row carries no office. */
export const NO_OFFICE_LABEL = "(No office)";

/** The minimum an entry-shaped object needs for any aggregation here. */
export interface BreakdownEntry {
  date: string;
  startTime: string;
  endTime: string;
  ticket?: { ticketNumber: number; ticketLink?: string | null } | null;
}

export interface DayTicketTotal extends TicketTotal {
  /** Resolved from TicketsContext, not the entry — see buildTicketTitleMap. */
  title: string | null;
  /** Share of that day's total minutes, 0-100. */
  percentOfDay: number;
}

export interface DayBreakdown {
  dayKey: DayKey;
  totalMinutes: number;
  entryCount: number;
  tickets: DayTicketTotal[];
}

/**
 * The day keys of one week, Monday first.
 *
 * `includeWeekends` only controls whether Sat/Sun get their own columns — it
 * never changes which entries are counted in a week total. Weekend hours stay
 * in every aggregate either way; they just don't get a column of their own.
 */
export function buildWeekDayKeys(weekStart: Date, includeWeekends: boolean): DayKey[] {
  const monday = startOfWeek(weekStart);
  const dayCount = includeWeekends ? 7 : 5;
  return Array.from({ length: dayCount }, (_, i) => {
    // Local-midnight arithmetic via the Date constructor, never by parsing a
    // string — getDate() + i rolls over months and years correctly.
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return toDayKey(d);
  });
}

export function groupEntriesByDay<T extends BreakdownEntry>(entries: T[]): Map<DayKey, T[]> {
  const byDay = new Map<DayKey, T[]>();
  for (const entry of entries) {
    const key = normalizeDayKey(entry.date);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(entry);
    else byDay.set(key, [entry]);
  }
  return byDay;
}

export function totalMinutesOf(entries: BreakdownEntry[]): number {
  return entries.reduce((sum, e) => sum + minutesBetween(e.startTime, e.endTime), 0);
}

/**
 * Per-day totals plus each day's tickets ranked by time spent.
 *
 * Returns one entry per requested day key, including days with no time logged
 * (as a zero-total `DayBreakdown`) — the row renders those as an explicit
 * "No time logged" column rather than collapsing and misaligning the week.
 */
export function buildDayBreakdowns<T extends BreakdownEntry>(
  entries: T[],
  dayKeys: DayKey[],
  ticketTitleByNumber: Map<number, string>
): DayBreakdown[] {
  const byDay = groupEntriesByDay(entries);

  return dayKeys.map((dayKey) => {
    const dayEntries = byDay.get(dayKey) ?? [];
    const totalMinutes = totalMinutesOf(dayEntries);

    // Grouped here rather than via groupByTicket() so the title and the
    // percentage can be attached in the same pass; the ranking rule (desc by
    // minutes) is deliberately identical to groupByTicket's.
    const byTicket = new Map<string, DayTicketTotal>();
    for (const entry of dayEntries) {
      const label = entry.ticket ? String(entry.ticket.ticketNumber) : UNASSIGNED_TICKET;
      const minutes = minutesBetween(entry.startTime, entry.endTime);
      const existing = byTicket.get(label);
      if (existing) {
        existing.entryCount += 1;
        existing.totalMinutes += minutes;
      } else {
        byTicket.set(label, {
          ticket: label,
          ticketLink: entry.ticket?.ticketLink,
          entryCount: 1,
          totalMinutes: minutes,
          title: entry.ticket ? ticketTitleByNumber.get(entry.ticket.ticketNumber) ?? null : null,
          percentOfDay: 0,
        });
      }
    }

    const tickets = Array.from(byTicket.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
    // Guarded: a day can hold entries that sum to zero minutes (a mistyped
    // entry with equal start/end), which would otherwise divide by zero.
    if (totalMinutes > 0) {
      for (const t of tickets) {
        t.percentOfDay = (t.totalMinutes / totalMinutes) * 100;
      }
    }

    return { dayKey, totalMinutes, entryCount: dayEntries.length, tickets };
  });
}

export interface OfficeTotal {
  office: string;
  /** Distinct tickets seen for this office in the window — the "frequency count". */
  ticketCount: number;
  entryCount: number;
  totalMinutes: number;
}

/**
 * Distinct ticket count per office.
 *
 * Office is read from the *Ticket*, not the entry: TimeEntry.officeNumber is a
 * vestigial column that the app's mutations deliberately stopped writing (see
 * the note on UpdateTimeEntry in dataconnect/example/mutations.gql), so the
 * linked Ticket's `office` is the only field that is actually maintained.
 * `officeByTicketNumber` comes from TicketsContext, which already loads every
 * ticket with its office — so this needs no widening of the entry query.
 *
 * Entries with no ticket, and tickets whose office is null or blank, both fold
 * into one NO_OFFICE_LABEL bucket, matching how UNASSIGNED_TICKET is handled
 * elsewhere rather than silently dropping them from the total.
 */
export function groupTicketsByOffice(
  entries: BreakdownEntry[],
  officeByTicketNumber: Map<number, string | null>
): OfficeTotal[] {
  const byOffice = new Map<string, { entryCount: number; totalMinutes: number; tickets: Set<string> }>();

  for (const entry of entries) {
    const rawOffice = entry.ticket ? officeByTicketNumber.get(entry.ticket.ticketNumber) : null;
    const office = rawOffice?.trim() || NO_OFFICE_LABEL;
    // Entries with no ticket can't contribute a distinct ticket, but their
    // minutes still belong to the bucket — tracked via entryCount/minutes
    // without inflating ticketCount.
    const ticketKey = entry.ticket ? String(entry.ticket.ticketNumber) : null;

    const existing = byOffice.get(office);
    if (existing) {
      existing.entryCount += 1;
      existing.totalMinutes += minutesBetween(entry.startTime, entry.endTime);
      if (ticketKey) existing.tickets.add(ticketKey);
    } else {
      byOffice.set(office, {
        entryCount: 1,
        totalMinutes: minutesBetween(entry.startTime, entry.endTime),
        tickets: new Set(ticketKey ? [ticketKey] : []),
      });
    }
  }

  return Array.from(byOffice.entries())
    .map(([office, v]) => ({
      office,
      ticketCount: v.tickets.size,
      entryCount: v.entryCount,
      totalMinutes: v.totalMinutes,
    }))
    .sort((a, b) => b.ticketCount - a.ticketCount || b.totalMinutes - a.totalMinutes);
}

/** "1234 - Some title" for a chart axis, reusing the shared truncation rule. */
export function ticketAxisLabel(ticket: string, title: string | null): string {
  if (ticket === UNASSIGNED_TICKET) return ticket;
  return title ? `${ticket} · ${truncateTicketTitle(title)}` : ticket;
}
