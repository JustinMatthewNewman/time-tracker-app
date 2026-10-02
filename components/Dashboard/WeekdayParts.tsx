"use client";

import Link from "next/link";
import { Chip } from "@heroui/react";
import { formatDuration, truncateTicketTitle, UNASSIGNED_TICKET } from "@/lib/timeTotals";
import { formatDayKey } from "@/lib/dayKeys";
import { ticketChipLeadTint, ticketChipTint } from "@/lib/ticketColor";
import type { DayTicketTotal } from "@/lib/weekdayBreakdown";

// Pieces shared by the weekday breakdown's two layouts (ranked tickets and the
// 15-minute timeline). They live here rather than in either view so neither
// has to import the other — the two would otherwise form a cycle.

export type ColorFor = (ticket: number | string | null | undefined) => string | null;

interface DayHeadingProps {
  dayKey: string;
  totalMinutes: number;
  isToday: boolean;
  /** Busiest day in the week, for scaling the magnitude bar. */
  busiestMinutes: number;
}

/** A day column's header: weekday, date, total, and a cross-day magnitude bar. */
export function DayHeading({ dayKey, totalMinutes, isToday, busiestMinutes }: DayHeadingProps) {
  const barPct = busiestMinutes > 0 ? (totalMinutes / busiestMinutes) * 100 : 0;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-foreground">
          {formatDayKey(dayKey, { weekday: "short" })}
          {isToday && <span className="ml-1 text-[10px] font-normal text-accent">today</span>}
        </span>
        <span className="truncate text-[11px] text-foreground/50 tabular-nums">
          {formatDayKey(dayKey, { month: "short", day: "numeric" })}
        </span>
      </div>

      <p className="text-xl font-semibold text-foreground tabular-nums">
        {totalMinutes > 0 ? formatDuration(totalMinutes) : <span className="text-foreground/30">—</span>}
      </p>

      {/* Single-hue magnitude bar: 4px rounded data-end, anchored to a
          recessive track so an empty day still reads as a zero rather than
          as missing. */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-default">
        <div className="h-full rounded-r-[4px] bg-accent" style={{ width: `${barPct}%` }} aria-hidden />
      </div>
    </div>
  );
}

/**
 * The shared chip shell: a real HeroUI `Chip`, two-tone, tinted per ticket.
 *
 * Not a lookalike — the chip's background is driven by a `--chip-bg` custom
 * property (see @heroui/styles chip.css), so overriding that one token gives
 * an arbitrary per-ticket color while keeping HeroUI's geometry and theming.
 *
 * The lighter leading block is a real element rather than a gradient stop, so
 * the hard split lands exactly at the end of the ticket number whatever its
 * width. Both tint strengths come from CSS custom properties, because
 * "lighter" inverts between the themes — see ticketChipTint in
 * lib/ticketColor.ts.
 */
function TicketChipShell({
  color,
  lead,
  children,
  dense,
}: {
  color: string | null;
  lead: React.ReactNode;
  children?: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <Chip
      variant="soft"
      // overflow-hidden so the leading segment is clipped to the chip's own
      // pill radius instead of needing to re-declare it.
      className={`w-full gap-0 overflow-hidden transition hover:brightness-95 dark:hover:brightness-110 ${
        dense ? "py-0" : ""
      }`}
      style={color ? ({ "--chip-bg": ticketChipTint(color) } as React.CSSProperties) : undefined}
    >
      {/* Negative margins cancel .chip's own px-2/py-0.5 so the leading block
          bleeds to the chip's edges. */}
      <span
        className={`-my-0.5 flex shrink-0 items-center gap-1.5 self-stretch -ml-2 ${dense ? "px-1.5" : "px-2"}`}
        style={color ? { backgroundColor: ticketChipLeadTint(color) } : undefined}
      >
        {color && (
          // Full-strength dot alongside the wash: a dark or desaturated color
          // mixed down this far is nearly invisible on its own.
          <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
        )}
        {lead}
      </span>
      {children}
    </Chip>
  );
}

/** One ticket in the ranked view: number, title, and share of the day. */
export function TicketChipRow({ ticket: t, color }: { ticket: DayTicketTotal; color: string | null }) {
  const isUnassigned = t.ticket === UNASSIGNED_TICKET;
  // Every ticket is listed rather than a top five, so a long day can hold
  // shares that round to "0%" — which reads as a bug, not as "a sliver".
  const pct = t.percentOfDay > 0 && t.percentOfDay < 0.5 ? "<1%" : `${Math.round(t.percentOfDay)}%`;
  const label = t.title ? `${t.ticket} - ${t.title}` : t.ticket;

  const chip = (
    <TicketChipShell
      color={color}
      lead={
        <span className={isUnassigned ? "text-foreground/50" : undefined}>
          {isUnassigned ? UNASSIGNED_TICKET : t.ticket}
        </span>
      }
    >
      <Chip.Label className="min-w-0 flex-1 truncate pl-1.5 text-left font-normal text-foreground/50">
        {t.title ? truncateTicketTitle(t.title) : ""}
      </Chip.Label>
      <span className="shrink-0 pr-0.5 text-foreground/50 tabular-nums">{pct}</span>
    </TicketChipShell>
  );

  if (isUnassigned) return chip;
  return (
    <Link href={`/ticket/${t.ticket}`} className="block" title={label} aria-label={`View ticket ${label}`}>
      {chip}
    </Link>
  );
}

/** One 15-minute slot in the timeline view: just the ticket it was booked to. */
export function TicketSlotChip({
  ticket,
  title,
  color,
  timeLabel,
}: {
  ticket: string;
  title: string | null;
  color: string | null;
  timeLabel: string;
}) {
  const isUnassigned = ticket === UNASSIGNED_TICKET;
  const described = title ? `${ticket} - ${title}` : ticket;

  const chip = (
    <TicketChipShell
      color={color}
      dense
      lead={
        <span className={`truncate text-[11px] ${isUnassigned ? "text-foreground/50" : ""}`}>
          {isUnassigned ? "—" : ticket}
        </span>
      }
    >
      {/* The title fills the remaining width when there is room for it; the
          cell truncates rather than wrapping so every slot row stays one
          line tall and the columns stay aligned. */}
      <Chip.Label className="min-w-0 flex-1 truncate pl-1.5 text-left text-[11px] font-normal text-foreground/40">
        {title ? truncateTicketTitle(title) : ""}
      </Chip.Label>
    </TicketChipShell>
  );

  if (isUnassigned) {
    return (
      <div title={`${timeLabel} · no ticket`} aria-label={`${timeLabel}, no ticket`}>
        {chip}
      </div>
    );
  }

  return (
    <Link
      href={`/ticket/${ticket}`}
      className="block"
      title={`${timeLabel} · ${described}`}
      aria-label={`${timeLabel}, ticket ${described}`}
    >
      {chip}
    </Link>
  );
}

/** An unbooked 15-minute slot — drawn, not skipped, so the axis stays true. */
export function EmptySlot({ timeLabel }: { timeLabel: string }) {
  return (
    <div
      className="flex h-[22px] items-center"
      title={`${timeLabel} · no time logged`}
      aria-label={`${timeLabel}, no time logged`}
    >
      <span className="h-px w-full bg-default" aria-hidden />
    </div>
  );
}
