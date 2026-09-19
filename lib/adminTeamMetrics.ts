import { minutesBetween } from "./timeTotals";

/**
 * Aggregation for the admin team dashboard.
 *
 * Kept out of the route handler so it can be tested without a request: every
 * number the dashboard shows is computed here from a flat list of entries.
 */

export interface MetricEntry {
  id: string;
  user: { id: string };
  startTime: string;
  endTime: string;
  date: string;
  ticket?: { ticketNumber: number; ticketTitle?: string | null; color?: string | null } | null;
}

export interface TeamMemberInput {
  id: string;
  username: string;
  email: string | null;
  userType: string;
}

export interface TopTicket {
  ticketNumber: number;
  ticketTitle: string | null;
  color: string | null;
  totalMinutes: number;
}

export interface MemberMetrics extends TeamMemberInput {
  totalMinutes: number;
  entryCount: number;
  activeDays: number;
  ticketCount: number;
  /** Longest single entry, as a rough "deepest block of focus" signal. */
  longestEntryMinutes: number;
  topTicket: TopTicket | null;
}

export interface TeamMetrics {
  totalMinutes: number;
  entryCount: number;
  /** Members with at least one entry in range — not the roster size. */
  activeMembers: number;
  memberCount: number;
  /** Distinct calendar days anyone on the team logged against. */
  activeDays: number;
  ticketCount: number;
  /** Mean over *active* members only; averaging in zeroes buries the signal. */
  avgMinutesPerActiveMember: number;
  topTicket: TopTicket | null;
}

function summariseTickets(entries: MetricEntry[]): { count: number; top: TopTicket | null } {
  const byTicket = new Map<number, TopTicket>();
  for (const entry of entries) {
    if (!entry.ticket) continue;
    const minutes = minutesBetween(entry.startTime, entry.endTime);
    const existing = byTicket.get(entry.ticket.ticketNumber);
    if (existing) {
      existing.totalMinutes += minutes;
    } else {
      byTicket.set(entry.ticket.ticketNumber, {
        ticketNumber: entry.ticket.ticketNumber,
        ticketTitle: entry.ticket.ticketTitle ?? null,
        color: entry.ticket.color ?? null,
        totalMinutes: minutes,
      });
    }
  }
  let top: TopTicket | null = null;
  for (const t of byTicket.values()) {
    // Ties break on the lower ticket number so the result is stable across
    // requests rather than depending on Map insertion order.
    if (!top || t.totalMinutes > top.totalMinutes ||
        (t.totalMinutes === top.totalMinutes && t.ticketNumber < top.ticketNumber)) {
      top = t;
    }
  }
  return { count: byTicket.size, top };
}

/**
 * Per-member rollup. Every roster member gets a row, including those with no
 * entries in range — an admin needs to see who logged nothing, and dropping
 * them would make an inactive member indistinguishable from one who left the
 * team.
 */
export function aggregateMembers(
  members: TeamMemberInput[],
  entries: MetricEntry[]
): MemberMetrics[] {
  const byUser = new Map<string, MetricEntry[]>();
  for (const entry of entries) {
    const list = byUser.get(entry.user.id);
    if (list) list.push(entry);
    else byUser.set(entry.user.id, [entry]);
  }

  return members
    .map((member) => {
      const mine = byUser.get(member.id) ?? [];
      let totalMinutes = 0;
      let longestEntryMinutes = 0;
      const days = new Set<string>();
      for (const entry of mine) {
        const minutes = minutesBetween(entry.startTime, entry.endTime);
        totalMinutes += minutes;
        if (minutes > longestEntryMinutes) longestEntryMinutes = minutes;
        days.add(entry.date);
      }
      const tickets = summariseTickets(mine);
      return {
        ...member,
        totalMinutes,
        entryCount: mine.length,
        activeDays: days.size,
        ticketCount: tickets.count,
        longestEntryMinutes,
        topTicket: tickets.top,
      };
    })
    .sort((a, b) =>
      b.totalMinutes - a.totalMinutes || a.username.localeCompare(b.username)
    );
}

/**
 * Team rollup. Computed from the entries rather than by summing the member
 * rows, so team-wide distinct counts (days, tickets) are genuinely distinct
 * instead of double-counting a day or ticket two people both touched.
 */
export function aggregateTeam(
  members: TeamMemberInput[],
  entries: MetricEntry[]
): TeamMetrics {
  let totalMinutes = 0;
  const days = new Set<string>();
  const activeUsers = new Set<string>();
  for (const entry of entries) {
    totalMinutes += minutesBetween(entry.startTime, entry.endTime);
    days.add(entry.date);
    activeUsers.add(entry.user.id);
  }
  const tickets = summariseTickets(entries);
  // Only count members still on the roster: an entry from someone since
  // removed from the team would otherwise inflate activeMembers past
  // memberCount.
  const rosterIds = new Set(members.map((m) => m.id));
  const activeMembers = [...activeUsers].filter((id) => rosterIds.has(id)).length;

  return {
    totalMinutes,
    entryCount: entries.length,
    activeMembers,
    memberCount: members.length,
    activeDays: days.size,
    ticketCount: tickets.count,
    avgMinutesPerActiveMember: activeMembers === 0 ? 0 : Math.round(totalMinutes / activeMembers),
    topTicket: tickets.top,
  };
}

/** One ticket's share of one member's day. */
export interface DaySegment {
  /** null for entries with no ticket. */
  ticketNumber: number | null;
  ticketTitle: string | null;
  color: string | null;
  minutes: number;
}

export interface MemberDay {
  /** Day key, YYYY-MM-DD. */
  date: string;
  totalMinutes: number;
  /** Largest share first, so a stacked bar reads bottom-heavy. */
  segments: DaySegment[];
}

/** Every day in [start, end], inclusive, as day keys. */
export function daysInRange(start: string, end: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

/**
 * Per-member, per-day, per-ticket minutes — the shape a stacked bar chart
 * needs, one bar per day and one segment per ticket.
 *
 * Every day in the range appears for every member, including empty ones: a
 * chart that silently drops quiet days compresses the x-axis and makes a
 * four-day week look like a full one.
 *
 * Entry dates arrive as timestamps rather than bare day keys (TimeEntry.date
 * is stored as a Timestamp), so they are truncated here rather than compared
 * whole.
 */
export function aggregateDailyByMember(
  members: TeamMemberInput[],
  entries: MetricEntry[],
  start: string,
  end: string
): Record<string, MemberDay[]> {
  const days = daysInRange(start, end);
  const result: Record<string, MemberDay[]> = {};

  // userId -> dayKey -> ticketKey -> segment
  const byUser = new Map<string, Map<string, Map<string, DaySegment>>>();
  for (const entry of entries) {
    const dayKey = entry.date.slice(0, 10);
    const minutes = minutesBetween(entry.startTime, entry.endTime);
    if (minutes <= 0) continue;

    let byDay = byUser.get(entry.user.id);
    if (!byDay) byUser.set(entry.user.id, (byDay = new Map()));
    let byTicket = byDay.get(dayKey);
    if (!byTicket) byDay.set(dayKey, (byTicket = new Map()));

    const ticketKey = entry.ticket ? String(entry.ticket.ticketNumber) : "none";
    const existing = byTicket.get(ticketKey);
    if (existing) {
      existing.minutes += minutes;
    } else {
      byTicket.set(ticketKey, {
        ticketNumber: entry.ticket?.ticketNumber ?? null,
        ticketTitle: entry.ticket?.ticketTitle ?? null,
        color: entry.ticket?.color ?? null,
        minutes,
      });
    }
  }

  for (const member of members) {
    const byDay = byUser.get(member.id);
    result[member.id] = days.map((date) => {
      const segments = [...(byDay?.get(date)?.values() ?? [])].sort(
        (a, b) =>
          b.minutes - a.minutes ||
          // Stable tiebreak so the stacking order doesn't wobble between
          // requests; unticketed sorts last.
          (a.ticketNumber ?? Number.MAX_SAFE_INTEGER) - (b.ticketNumber ?? Number.MAX_SAFE_INTEGER)
      );
      return {
        date,
        totalMinutes: segments.reduce((sum, seg) => sum + seg.minutes, 0),
        segments,
      };
    });
  }

  return result;
}
