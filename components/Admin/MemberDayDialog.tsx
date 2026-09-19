"use client";

import { Button, Card } from "@heroui/react";
import { formatDuration } from "@/lib/timeTotals";
import type { MemberDay } from "@/lib/adminTeamMetrics";
import { TicketChip } from "./TeamStats";

interface MemberDayDialogProps {
  isOpen: boolean;
  memberName: string;
  /** True when the charted member is the signed-in user. */
  isSelf: boolean;
  day: MemberDay | null;
  ticketColorsEnabled: boolean;
  onClose: () => void;
  /** Only offered when the day is the viewer's own and has a work log. */
  onOpenWorkLog?: () => void;
}

function dayHeading(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * A day's breakdown for one team member.
 *
 * This exists because "open the work log for this day" cannot be done for
 * anyone but yourself: ListWorkLogs binds to auth.uid, so /worklogs only ever
 * shows the signed-in user's logs. Rather than leave a teammate's axis inert —
 * which reads as a broken link — every day opens this, and the viewer's own
 * days additionally offer the real page.
 *
 * Deliberately per-ticket totals and nothing more. The admin metrics query
 * never fetches entry descriptions, and this is not the place to start: an
 * admin looking at how a teammate's day was split has no need for the text of
 * what they wrote.
 */
export function MemberDayDialog({
  isOpen,
  memberName,
  isSelf,
  day,
  ticketColorsEnabled,
  onClose,
  onOpenWorkLog,
}: MemberDayDialogProps) {
  if (!isOpen || !day) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{dayHeading(day.date)}</h2>
            <p className="text-sm text-foreground/60">
              {memberName} · {formatDuration(day.totalMinutes)} logged
            </p>
          </div>

          {day.segments.length === 0 ? (
            <p className="text-sm text-foreground/60">Nothing logged on this day.</p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {day.segments.map((seg, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    {seg.ticketNumber == null ? (
                      <span className="text-sm text-foreground/60">No ticket</span>
                    ) : (
                      <TicketChip
                        ticket={{
                          ticketNumber: seg.ticketNumber,
                          ticketTitle: seg.ticketTitle,
                          color: seg.color,
                          totalMinutes: seg.minutes,
                        }}
                        enabled={ticketColorsEnabled}
                      />
                    )}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-foreground">
                    {formatDuration(seg.minutes)}
                    <span className="ml-2 text-xs text-foreground/50">
                      {Math.round((seg.minutes / day.totalMinutes) * 100)}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2">
            {isSelf && day.workLogId && onOpenWorkLog && (
              <Button size="sm" variant="primary" onPress={onOpenWorkLog}>
                Open in Work Logs
              </Button>
            )}
            {!isSelf && (
              // Said rather than left as an absence, so the missing button
              // reads as a rule and not as something that failed to load.
              <span className="text-xs text-foreground/50">
                Work logs are private to their owner, so {memberName}&apos;s cannot be opened here.
              </span>
            )}
            <Button size="sm" variant="outline" className="ml-auto" onPress={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default MemberDayDialog;
