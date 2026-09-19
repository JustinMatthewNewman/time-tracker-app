"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChartTooltip, useChartTooltip } from "@/components/Dashboard/ChartTooltip";
import { effectiveTicketColor } from "@/lib/ticketColor";
import { formatDuration } from "@/lib/timeTotals";
import type { DaySegment, MemberDay } from "@/lib/adminTeamMetrics";

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
  /**
   * Called when a day's axis label is activated. Omit to leave the axis inert
   * — which is the right default here, because the only page that can show a
   * day's work log shows the *signed-in user's* logs (ListWorkLogs binds to
   * auth.uid), so it cannot open a teammate's.
   */
  onDaySelect?: (day: MemberDay) => void;
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

interface HoverData {
  day: MemberDay;
  segment: DaySegment;
  weekday: string;
  dayNumber: string;
}

export function IsoStackedBarChart({
  days,
  onDaySelect,
  maxBarHeight = 130,
  className,
}: IsoStackedBarChartProps) {
  const router = useRouter();
  const { tooltip, showAt, hide } = useChartTooltip<HoverData>();

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
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        // Scales down on narrow screens but never up: stretched to a wide card,
        // a ~400-unit viewBox doubles in size and takes the label text with it.
        style={{ maxWidth: width }}
        className={`block h-auto w-full overflow-visible ${className ?? ""}`}
        shapeRendering="geometricPrecision"
        role="img"
        aria-label={`Tickets per day, ${days.length} days, ${formatDuration(total)} total`}
        onPointerLeave={hide}
      >
        {days.map((day, i) => {
          const x = PAD + i * (BAR_WIDTH + GAP);
          const label = dayLabel(day.date);

          // Stack from the baseline up; `cursor` is the top edge of the stack
          // so far, which is where the next segment's front face starts.
          let cursor = baseline;

          const segments = day.segments.map((seg, s) => {
            const h = (seg.minutes / maxMinutes) * maxBarHeight;
            const y = cursor - h;
            cursor = y;
            const base = segmentColor(seg.ticketNumber, seg.color);
            const isTop = s === day.segments.length - 1;
            const clickable = seg.ticketNumber != null;

            const ticketLabel =
              seg.ticketNumber == null
                ? "No ticket"
                : `#${seg.ticketNumber}${seg.ticketTitle ? ` ${seg.ticketTitle}` : ""}`;
            const title = `${label.weekday} ${label.day} · ${ticketLabel} · ${formatDuration(seg.minutes)}`;

            const hover = {
              onPointerEnter: (e: React.PointerEvent) =>
                showAt(e, { day, segment: seg, weekday: label.weekday, dayNumber: label.day }),
              onPointerMove: (e: React.PointerEvent) =>
                showAt(e, { day, segment: seg, weekday: label.weekday, dayNumber: label.day }),
            };

            const shapes = (
              <>
                {/* Native title kept as the no-JS / assistive fallback, as
                    ChartTooltip's own note prescribes. */}
                <title>{title}</title>
                {/* Side first, so the front face overlaps its shared edge. */}
                <polygon
                  points={`${x + BAR_WIDTH},${y} ${x + BAR_WIDTH + DEPTH_X},${y - DEPTH_Y} ${x + BAR_WIDTH + DEPTH_X},${y + h - DEPTH_Y} ${x + BAR_WIDTH},${y + h}`}
                  fill={sideFace(base)}
                />
                <rect x={x} y={y} width={BAR_WIDTH} height={h} fill={base} />
                {/* Only the topmost segment shows a top face — the others are
                    covered by the segment stacked on them. It lives inside this
                    group so it hovers and clicks with the rest of its segment
                    rather than being dead area. */}
                {isTop && (
                  <polygon
                    points={`${x},${y} ${x + BAR_WIDTH},${y} ${x + BAR_WIDTH + DEPTH_X},${y - DEPTH_Y} ${x + DEPTH_X},${y - DEPTH_Y}`}
                    fill={topFace(base)}
                  />
                )}
              </>
            );

            // A real anchor, not just an onClick: it gives keyboard focus,
            // middle-click and "open in new tab" for free, and the status bar
            // shows where the segment goes. The handler then keeps navigation
            // client-side.
            return clickable ? (
              <a
                key={s}
                href={`/ticket/${seg.ticketNumber}`}
                aria-label={`${ticketLabel}, ${formatDuration(seg.minutes)} on ${label.weekday} ${label.day}. Open ticket breakdown.`}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-accent [&:focus-visible>rect]:[stroke-width:2]"
                onClick={(e) => {
                  // Leave modified clicks to the browser.
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  hide();
                  router.push(`/ticket/${seg.ticketNumber}`);
                }}
                {...hover}
              >
                {shapes}
              </a>
            ) : (
              <g key={s} {...hover}>
                {shapes}
              </g>
            );
          });

          const topY = cursor;

          return (
            <g key={day.date}>
              {segments}

              {/* The printed total is what makes the value readable — the
                  projection alone is not precise enough to read off. */}
              <text
                x={x + BAR_WIDTH / 2 + DEPTH_X / 2}
                y={topY - DEPTH_Y - 6}
                textAnchor="middle"
                className="pointer-events-none fill-foreground/70 text-[10px] tabular-nums"
              >
                {formatDuration(day.totalMinutes)}
              </text>

              {(() => {
                const axis = (
                  <>
                    <text
                      x={x + BAR_WIDTH / 2}
                      y={baseline + 16}
                      textAnchor="middle"
                      className="pointer-events-none fill-foreground/60 text-[10px]"
                    >
                      {label.weekday}
                    </text>
                    <text
                      x={x + BAR_WIDTH / 2}
                      y={baseline + 28}
                      textAnchor="middle"
                      className="pointer-events-none fill-foreground/40 text-[10px] tabular-nums"
                    >
                      {label.day}
                    </text>
                  </>
                );

                // Only a day that actually has a work log is actionable; an
                // empty day would navigate to nothing.
                if (!onDaySelect || !day.workLogId) return axis;

                return (
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`Open the work log for ${label.weekday} ${label.day}`}
                    className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-accent [&:focus-visible>rect]:[stroke-width:2]"
                    onClick={() => onDaySelect(day)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onDaySelect(day);
                      }
                    }}
                  >
                    {/* A transparent hit area: the two labels alone are a
                        sliver of text and awkward to hit. */}
                    <rect
                      x={x - 2}
                      y={baseline + 4}
                      width={BAR_WIDTH + 4}
                      height={30}
                      rx={4}
                      fill="transparent"
                      className="hover:fill-default-100"
                    />
                    {axis}
                  </g>
                );
              })()}
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <ChartTooltip x={tooltip.x} y={tooltip.y}>
          <p className="font-medium text-foreground">
            {tooltip.data.segment.ticketNumber == null
              ? "No ticket"
              : `#${tooltip.data.segment.ticketNumber}`}
          </p>
          {tooltip.data.segment.ticketTitle && (
            <p className="max-w-56 truncate text-foreground/70">
              {tooltip.data.segment.ticketTitle}
            </p>
          )}
          <p className="mt-1 tabular-nums text-foreground/70">
            {formatDuration(tooltip.data.segment.minutes)}
            {tooltip.data.day.totalMinutes > 0 && (
              <span className="text-foreground/50">
                {" · "}
                {Math.round((tooltip.data.segment.minutes / tooltip.data.day.totalMinutes) * 100)}% of{" "}
                {tooltip.data.weekday}
              </span>
            )}
          </p>
          <p className="tabular-nums text-foreground/50">
            {tooltip.data.weekday} {tooltip.data.dayNumber} · {formatDuration(tooltip.data.day.totalMinutes)} total
          </p>
          {tooltip.data.segment.ticketNumber != null && (
            <p className="mt-1 text-foreground/40">Click to open the ticket breakdown</p>
          )}
        </ChartTooltip>
      )}
    </>
  );
}

export default IsoStackedBarChart;
