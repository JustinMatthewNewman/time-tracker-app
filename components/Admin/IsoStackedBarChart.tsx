"use client";

import { useMemo } from "react";
import { effectiveTicketColor } from "@/lib/ticketColor";
import { formatDuration } from "@/lib/timeTotals";
import type { MemberDay } from "@/lib/adminTeamMetrics";

/**
 * Isometric stacked bar chart — one bar per day, one segment per ticket.
 *
 * Drawn as projected SVG rather than with three.js (which this project already
 * depends on, for ParticleBlob). Real 3D would mean a WebGL context per member
 * chart, text labels that fight the projection, and nothing testable; the
 * projection here is deterministic geometry that renders identically every
 * time, prints crisp labels, and costs nothing when several are on screen.
 *
 * A note on the format, since it is worth knowing: depth makes bars *less*
 * precisely comparable, because the eye reads the projected top face as part of
 * the height. That is mitigated here by printing each day's total above its
 * bar, so the exact value never depends on judging the geometry.
 */

export interface IsoStackedBarChartProps {
  days: MemberDay[];
  /** Height of the tallest bar, in user units. */
  maxBarHeight?: number;
  className?: string;
}

const BAR_WIDTH = 34;
const DEPTH_X = 12;
const DEPTH_Y = 8;
// Must be at least DEPTH_X, or the next bar's front face paints over the
// previous bar's side face.
const GAP = DEPTH_X + 8;
const PAD = 16;
const LABEL_BAND = 34;
const VALUE_BAND = 18;

/** Lit top face and shaded side, so the solid reads as one object. */
function topFace(color: string) {
  return `color-mix(in oklch, ${color} 82%, white)`;
}
function sideFace(color: string) {
  return `color-mix(in oklch, ${color} 78%, black)`;
}

function segmentColor(ticketNumber: number | null, color: string | null): string {
  // Ticket identity colors rather than the categorical palette: that palette is
  // capped at CATEGORICAL_HUE_COUNT and explicitly must not cycle, and a week
  // of work routinely touches more tickets than that. Every ticket already has
  // a stable derived color, so the chart borrows it.
  if (ticketNumber == null) return "var(--muted)";
  // Null only when there is no ticket identity at all, which the guard above
  // already covers — the fallback is belt and braces.
  return effectiveTicketColor(color, ticketNumber) ?? "var(--muted)";
}

function dayLabel(dayKey: string): { weekday: string; day: string } {
  // Parsed as UTC to match the day keys, which are produced in UTC.
  const d = new Date(`${dayKey}T00:00:00Z`);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" }),
    day: String(d.getUTCDate()),
  };
}

export function IsoStackedBarChart({
  days,
  maxBarHeight = 130,
  className,
}: IsoStackedBarChartProps) {
  const maxMinutes = useMemo(
    () => days.reduce((max, d) => Math.max(max, d.totalMinutes), 0),
    [days]
  );

  const width = PAD * 2 + days.length * BAR_WIDTH + Math.max(0, days.length - 1) * GAP + DEPTH_X;
  const height = PAD * 2 + maxBarHeight + DEPTH_Y + LABEL_BAND + VALUE_BAND;
  const baseline = PAD + VALUE_BAND + DEPTH_Y + maxBarHeight;

  if (days.length === 0) return null;

  if (maxMinutes === 0) {
    return <p className="text-sm text-foreground/60">No time logged in this period.</p>;
  }

  const total = days.reduce((sum, d) => sum + d.totalMinutes, 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      // Scales down on narrow screens but never up: stretched to a wide card,
      // a ~400-unit viewBox doubles in size and takes the label text with it.
      style={{ maxWidth: width }}
      className={`block h-auto w-full overflow-visible ${className ?? ""}`}
      shapeRendering="geometricPrecision"
      role="img"
      aria-label={`Tickets per day, ${days.length} days, ${formatDuration(total)} total`}
    >
      {days.map((day, i) => {
        const x = PAD + i * (BAR_WIDTH + GAP);
        const label = dayLabel(day.date);

        // Stack from the baseline up; `cursor` is the top edge of the stack so
        // far, which is where the next segment's front face starts.
        let cursor = baseline;
        const faces = day.segments.map((seg, s) => {
          const h = (seg.minutes / maxMinutes) * maxBarHeight;
          const y = cursor - h;
          cursor = y;
          const base = segmentColor(seg.ticketNumber, seg.color);
          const title = `${label.weekday} ${label.day} · ${
            seg.ticketNumber == null ? "No ticket" : `#${seg.ticketNumber}`
          }${seg.ticketTitle ? ` ${seg.ticketTitle}` : ""} · ${formatDuration(seg.minutes)}`;
          return (
            <g key={s}>
              <title>{title}</title>
              {/* Side first, so the front face overlaps its shared edge. */}
              <polygon
                points={`${x + BAR_WIDTH},${y} ${x + BAR_WIDTH + DEPTH_X},${y - DEPTH_Y} ${x + BAR_WIDTH + DEPTH_X},${y + h - DEPTH_Y} ${x + BAR_WIDTH},${y + h}`}
                fill={sideFace(base)}
              />
              <rect x={x} y={y} width={BAR_WIDTH} height={h} fill={base} />
            </g>
          );
        });

        // Only the topmost segment shows a top face — the others are covered by
        // the segment stacked on them, and drawing them anyway would make each
        // band look like a separate floating solid.
        const topY = cursor;

        return (
          <g key={day.date}>
            {faces}
            <polygon
              points={`${x},${topY} ${x + BAR_WIDTH},${topY} ${x + BAR_WIDTH + DEPTH_X},${topY - DEPTH_Y} ${x + DEPTH_X},${topY - DEPTH_Y}`}
              fill={topFace(segmentColor(
                day.segments[day.segments.length - 1]?.ticketNumber ?? null,
                day.segments[day.segments.length - 1]?.color ?? null
              ))}
            />

            {/* The printed total is what makes the value readable — the
                projection alone is not precise enough to read off. */}
            <text
              x={x + BAR_WIDTH / 2 + DEPTH_X / 2}
              y={topY - DEPTH_Y - 6}
              textAnchor="middle"
              className="fill-foreground/70 text-[10px] tabular-nums"
            >
              {formatDuration(day.totalMinutes)}
            </text>

            <text
              x={x + BAR_WIDTH / 2}
              y={baseline + 16}
              textAnchor="middle"
              className="fill-foreground/60 text-[10px]"
            >
              {label.weekday}
            </text>
            <text
              x={x + BAR_WIDTH / 2}
              y={baseline + 28}
              textAnchor="middle"
              className="fill-foreground/40 text-[10px] tabular-nums"
            >
              {label.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default IsoStackedBarChart;
