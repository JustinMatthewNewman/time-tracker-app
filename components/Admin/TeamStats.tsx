"use client";

import { effectiveTicketColor, ticketRowTint } from "@/lib/ticketColor";
import { formatDuration } from "@/lib/timeTotals";
import type { MemberMetrics, TeamMetrics, TopTicket } from "@/lib/adminTeamMetrics";

/**
 * Shared presentation for the admin metrics, used by the team dashboard's
 * overview and the Teams page's stat strips.
 *
 * Extracted rather than copied for the same reason as SideNavListBox: the two
 * pages show the same numbers, and two sets of markup would drift.
 */

export function TicketChip({ ticket, enabled }: { ticket: TopTicket; enabled: boolean }) {
  const color = enabled ? effectiveTicketColor(ticket.color, ticket.ticketNumber) : null;
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
      style={color ? { backgroundColor: ticketRowTint(color, 22) } : undefined}
    >
      {color && (
        <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      )}
      <span className="truncate">
        #{ticket.ticketNumber}
        {ticket.ticketTitle ? ` · ${ticket.ticketTitle}` : ""}
      </span>
    </span>
  );
}

export function TeamStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-xs text-foreground/60">{label}</p>
      <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint && <p className="text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}

/** Team totals laid out as a horizontal strip, for a full-width container. */
export function TeamStatStrip({ totals, enabled }: { totals: TeamMetrics; enabled: boolean }) {
  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
      <TeamStat
        label="Total logged"
        value={formatDuration(totals.totalMinutes)}
        hint={
          totals.attainmentPct != null && totals.targetMinutes != null
            ? `${totals.attainmentPct}% of ${formatDuration(totals.targetMinutes)} target`
            : undefined
        }
      />
      <TeamStat
        label="Active members"
        value={`${totals.activeMembers} of ${totals.memberCount}`}
        hint={totals.activeMembers === 0 ? "Nobody logged time" : undefined}
      />
      <TeamStat
        label="Average per active member"
        value={formatDuration(totals.avgMinutesPerActiveMember)}
      />
      <TeamStat label="Days with activity" value={String(totals.activeDays)} />
      <TeamStat label="Tickets touched" value={String(totals.ticketCount)} />
      {totals.topTicket && (
        <div className="min-w-0">
          <p className="mb-1 text-xs text-foreground/60">Top ticket</p>
          <TicketChip ticket={totals.topTicket} enabled={enabled} />
        </div>
      )}
    </div>
  );
}

/** One member's totals, same strip treatment as the team's. */
export function MemberStatStrip({ member, enabled }: { member: MemberMetrics; enabled: boolean }) {
  if (member.entryCount === 0) {
    // Stated rather than shown as a row of zeroes — "logged nothing" and "no
    // data loaded" look identical otherwise.
    return <p className="text-sm text-foreground/60">No time logged in this period.</p>;
  }
  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
      <TeamStat label="Logged" value={formatDuration(member.totalMinutes)} />
      <TeamStat label="Entries" value={String(member.entryCount)} />
      <TeamStat label="Days active" value={String(member.activeDays)} />
      <TeamStat label="Tickets" value={String(member.ticketCount)} />
      <TeamStat label="Longest block" value={formatDuration(member.longestEntryMinutes)} />
      {member.topTicket && (
        <div className="min-w-0">
          <p className="mb-1 text-xs text-foreground/60">Most time on</p>
          <TicketChip ticket={member.topTicket} enabled={enabled} />
        </div>
      )}
    </div>
  );
}
