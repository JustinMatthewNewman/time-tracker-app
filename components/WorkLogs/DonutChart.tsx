"use client";

import { useState } from "react";
import { useBorders } from "@/context/BordersContext";

export interface DonutChartSlice {
  label: string;
  value: number;
  color: string;
  // Optional CSS filter (e.g. a hue-rotate) applied on top of `color` so
  // callers can derive a set of distinct slice colors from a single theme
  // token (--accent) instead of hardcoding hex values that could clash with
  // the active color scheme.
  filter?: string;
}

interface DonutChartProps {
  data: DonutChartSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSubLabel?: string;
  /** Formats a slice's own value for the hover readout. Defaults to the raw number. */
  formatValue?: (value: number) => string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

// Annulus-sector path (donut slice) rather than the stroke-dasharray-on-a-
// circle trick: a dashed stroke can't take its own per-segment outline in
// SVG (a border only applies to the whole circle), so each slice needs to
// be its own filled shape to be individually bordered.
function describeDonutSlice(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

// Angular gap between neighbouring slices, in radians.
//
// This replaced a 3px `var(--border)` stroke on every slice, which was the
// main thing making this chart look muddy: a stroke straddles the path, so on
// a thin slice the two borders met in the middle and the slice rendered as a
// line of border colour rather than as its own hue. A gap separates slices by
// *absence*, which can't overpaint them however narrow they get.
const SLICE_GAP = 0.018;
// Rounds each slice's corners by stroking it in its own fill colour with a
// round linejoin — the broadcast-graphic look, and cheaper than building
// rounded geometry into the path. Half of it eats into the slice, which is
// why it is kept small relative to the ring thickness.
const CORNER_ROUNDING = 3;
// A slice narrower than roughly two gaps would be consumed entirely by them
// and vanish. Below this it is drawn gapless instead, so a sliver stays a
// visible sliver rather than disappearing from a part-of-whole chart.
const MIN_GAPPED_SWEEP = SLICE_GAP * 3;
// How far the hovered slice grows, in user units, on each side of the ring.
// Both radii move, so the slice keeps its thickness and pops out of the ring
// rather than appearing to fatten.
const HOVER_POP = 4;

// Hand-rolled SVG donut rather than pulling in a charting library for one
// chart — matches AmbientBackground's existing pattern of raw SVG elsewhere
// in this app.
export function DonutChart({
  data,
  size = 160,
  thickness = 18,
  centerLabel,
  centerSubLabel,
  formatValue,
}: DonutChartProps) {
  const { bordersEnabled } = useBorders();
  const [hovered, setHovered] = useState<string | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;

  // Inset the drawing rather than letting it run to the viewBox edge.
  //
  // The rounding stroke straddles the path: half its width falls *outside* the
  // geometry. With the outer radius at exactly size/2 that half lands past the
  // viewBox and gets clipped flat, so the donut shows shaved edges at the four
  // points where the circle meets its bounding box. The extra pixel covers
  // antialiasing, which bleeds a fraction further still — and the hover pop
  // below needs headroom of its own.
  const pad = CORNER_ROUNDING / 2 + 1 + HOVER_POP;
  const outerRadius = size / 2 - pad;
  // Guards a degenerate negative radius if a caller ever passes a thickness
  // greater than the available radius.
  const innerRadius = Math.max(0, outerRadius - thickness);
  const trackRadius = (outerRadius + innerRadius) / 2;

  const visibleSlices = data.filter((d) => d.value > 0);
  const hoveredSlice = visibleSlices.find((d) => d.label === hovered) ?? null;

  let angle = -Math.PI / 2; // start at the top, sweep clockwise

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        // Curved edges at this size are visibly faceted under the default
        // speed-biased rasterizer; the cost is negligible for a handful of paths.
        shapeRendering="geometricPrecision"
        className="block overflow-visible"
        onPointerLeave={() => setHovered(null)}
      >
        {/* Recessive track under the ring, so a part-of-whole chart still
            reads as a ring when one slice dominates — and so an empty state
            is visibly "nothing logged" rather than a blank box. Kept for the
            populated case too: with gaps between slices it is what the gaps
            are cut out of. */}
        <circle
          cx={cx}
          cy={cy}
          r={trackRadius}
          fill="none"
          stroke="var(--default)"
          strokeWidth={Math.max(1, outerRadius - innerRadius)}
          opacity={total > 0 ? 0.5 : 1}
        />

        {total > 0 &&
          visibleSlices.map((slice) => {
            const fraction = slice.value / total;
            // A single 100% slice needs a hair of a gap — an exact full
            // circle arc (start === end point) is degenerate and some
            // renderers draw nothing for it.
            const sweep =
              visibleSlices.length === 1
                ? Math.min(fraction * 2 * Math.PI, 2 * Math.PI - 0.001)
                : fraction * 2 * Math.PI;
            const startAngle = angle;
            const endAngle = angle + sweep;
            angle = endAngle;

            const gap = sweep > MIN_GAPPED_SWEEP && visibleSlices.length > 1 ? SLICE_GAP / 2 : 0;
            const isHovered = hovered === slice.label;
            const dimmed = hovered !== null && !isHovered;
            const pop = isHovered ? HOVER_POP : 0;

            return (
              <path
                key={slice.label}
                d={describeDonutSlice(
                  cx,
                  cy,
                  Math.max(0, innerRadius - pop),
                  outerRadius + pop,
                  startAngle + gap,
                  endAngle - gap
                )}
                fill={slice.color}
                // Stroked in its own fill colour purely to round the corners
                // (see CORNER_ROUNDING). Deliberately NOT a contrasting
                // outline — slices are separated by the gap instead, which is
                // why `bordersEnabled` only widens this slightly rather than
                // switching an outline on and off.
                stroke={slice.color}
                strokeWidth={bordersEnabled ? CORNER_ROUNDING : CORNER_ROUNDING / 2}
                strokeLinejoin="round"
                opacity={dimmed ? 0.35 : 1}
                style={{
                  filter: slice.filter,
                  // Opacity only. The pop is a `d` *attribute* change, which
                  // CSS transitions don't animate (only the `d` presentation
                  // property does), so listing it here would be a lie.
                  transition: "opacity 150ms ease",
                }}
                onPointerEnter={() => setHovered(slice.label)}
              />
            );
          })}
      </svg>

      {(centerLabel || centerSubLabel || hoveredSlice) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {hoveredSlice ? (
            <>
              <span className="w-full truncate text-sm font-semibold text-foreground">
                {formatValue ? formatValue(hoveredSlice.value) : hoveredSlice.value}
              </span>
              <span className="w-full truncate text-[11px] text-foreground/50">{hoveredSlice.label}</span>
            </>
          ) : (
            <>
              {centerLabel && (
                <span className="w-full truncate text-base font-semibold tabular-nums text-foreground">
                  {centerLabel}
                </span>
              )}
              {centerSubLabel && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">
                  {centerSubLabel}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default DonutChart;
