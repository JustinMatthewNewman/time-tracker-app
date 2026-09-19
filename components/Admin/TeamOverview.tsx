"use client";

import { useMemo } from "react";
import { Card, EmptyState, Skeleton } from "@heroui/react";
import { Persons } from "@gravity-ui/icons";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { useTicketColorsSetting } from "@/context/TicketColorsContext";
import { formatDuration } from "@/lib/timeTotals";
import type { MemberMetrics, TeamMetrics } from "@/lib/adminTeamMetrics";
import { TeamStat, TicketChip } from "./TeamStats";
import { isRangeInvalid, resolveRange, type TeamRange } from "./teamRange";

interface TeamMetricsResponse {
  team: { id: string; name: string; description: string | null; createdAt: string };
  range: { start: string; end: string };
  totals: TeamMetrics;
  members: MemberMetrics[];
}

interface TeamOverviewProps {
  teamId: string;
  range: TeamRange;
}

function MemberCard({ member, enabled }: { member: MemberMetrics; enabled: boolean }) {
  const inactive = member.entryCount === 0;
  return (
    <Card className={`flex flex-col gap-3 p-4 ${inactive ? "opacity-60" : ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{member.username}</p>
          <p className="truncate text-xs text-foreground/50">{member.email ?? "No email"}</p>
        </div>
        <span className="shrink-0 rounded-full bg-default-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-foreground/60">
          {member.userType}
        </span>
      </div>

      <div>
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {formatDuration(member.totalMinutes)}
        </p>
        {/* Stated rather than left to be inferred from a row of zeroes — an
            admin scanning cards needs "logged nothing" to be unmistakable. */}
        {inactive && <p className="text-xs text-foreground/50">No time logged in this period</p>}
      </div>

      {!inactive && (
        <>
          <dl className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt className="text-foreground/50">Entries</dt>
              <dd className="tabular-nums text-foreground">{member.entryCount}</dd>
            </div>
            <div>
              <dt className="text-foreground/50">Days</dt>
              <dd className="tabular-nums text-foreground">{member.activeDays}</dd>
            </div>
            <div>
              <dt className="text-foreground/50">Tickets</dt>
              <dd className="tabular-nums text-foreground">{member.ticketCount}</dd>
            </div>
          </dl>
          {member.topTicket && (
            <div className="min-w-0">
              <p className="mb-1 text-xs text-foreground/50">Most time on</p>
              <TicketChip ticket={member.topTicket} enabled={enabled} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export function TeamOverview({ teamId, range }: TeamOverviewProps) {
  const { ticketColorsEnabled } = useTicketColorsSetting();
  const invalid = isRangeInvalid(range);
  const { start, end } = resolveRange(range);

  // The URL is the cache key useAdminFetch refetches on, so building it in a
  // memo keyed on the resolved dates is what makes changing the range reload.
  const path = useMemo(
    () => `/api/admin/teams/${teamId}/metrics?start=${start}&end=${end}`,
    [teamId, start, end]
  );

  const { data, loading, error } = useAdminFetch<TeamMetricsResponse>(path, !invalid);

  if (invalid) {
    return (
      <p className="p-3 text-sm text-foreground/60">
        Choose a valid date range to see this team&apos;s totals.
      </p>
    );
  }

  if (error) {
    return <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>;
  }

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Skeleton className="h-64 w-full rounded-lg lg:col-span-1" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3 xl:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const { totals, members } = data;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {/* Team totals — one quarter of the container, full width when stacked. */}
      <Card className="flex h-fit flex-col gap-4 p-4 lg:col-span-1">
        {/* Labels the column rather than repeating the team name and range,
            both of which the card header above already carries. */}
        <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">
          Team totals
        </p>

        <TeamStat label="Total logged" value={formatDuration(totals.totalMinutes)} />
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
            <p className="mb-1 text-xs text-foreground/60">Team&apos;s top ticket</p>
            <TicketChip ticket={totals.topTicket} enabled={ticketColorsEnabled} />
          </div>
        )}
      </Card>

      {/* Member cards — the remaining three quarters. */}
      <div className="lg:col-span-3">
        {members.length === 0 ? (
          <EmptyState className="p-8">
            <Persons className="size-8 text-foreground/40" />
            <p className="text-sm text-foreground/60">This team has no members yet.</p>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} enabled={ticketColorsEnabled} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamOverview;
