"use client";

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

// Hand-rolled SVG donut rather than pulling in a charting library for one
// chart — matches AmbientBackground's existing pattern of raw SVG elsewhere
// in this app.
export function DonutChart({ data, size = 140, thickness = 30, centerLabel, centerSubLabel }: DonutChartProps) {
  const { bordersEnabled } = useBorders();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  // Slice outlines are an SVG stroke, not a CSS `border`, so the global
  // .no-borders rules (which target the `border` property) can't reach
  // them — this has to gate the stroke itself.
  const borderWidth = bordersEnabled ? 3 : 0;

  // Inset the drawing rather than letting it run to the viewBox edge.
  //
  // An SVG stroke straddles the path: half its width falls *outside* the
  // geometry. With the outer radius at exactly size/2 that half landed past
  // the viewBox and got clipped flat, so the donut showed shaved edges at the
  // top, bottom, left and right — the four points where the circle meets its
  // bounding box. The extra pixel covers antialiasing, which bleeds a
  // fraction further still.
  //
  // Insetting keeps the component's footprint exactly `size` (callers lay out
  // against that) and gives back a hair of radius instead, which is invisible;
  // growing the viewBox would have scaled the donut down by the same amount
  // anyway.
  const pad = borderWidth / 2 + 1;
  const outerRadius = size / 2 - pad;
  // Guards a degenerate negative radius if a caller ever passes a thickness
  // greater than the available radius.
  const innerRadius = Math.max(0, outerRadius - thickness);

  const visibleSlices = data.filter((d) => d.value > 0);

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
      >
        {total <= 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={(outerRadius + innerRadius) / 2}
            fill="none"
            stroke="var(--default)"
            strokeWidth={Math.min(thickness, outerRadius - innerRadius)}
          />
        )}

        {total > 0 &&
          visibleSlices.map((slice) => {
            const fraction = slice.value / total;
            // A single 100% slice needs a hair of a gap — an exact full
            // circle arc (start === end point) is degenerate and some
            // renderers draw nothing for it.
            const sweep = visibleSlices.length === 1 ? Math.min(fraction * 2 * Math.PI, 2 * Math.PI - 0.001) : fraction * 2 * Math.PI;
            const startAngle = angle;
            const endAngle = angle + sweep;
            angle = endAngle;

            return (
              <path
                key={slice.label}
                d={describeDonutSlice(cx, cy, innerRadius, outerRadius, startAngle, endAngle)}
                fill={slice.color}
                stroke="var(--border)"
                strokeWidth={borderWidth}
                strokeLinejoin="round"
                style={slice.filter ? { filter: slice.filter } : undefined}
              />
            );
          })}
      </svg>

      {(centerLabel || centerSubLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && <span className="text-sm font-semibold text-foreground">{centerLabel}</span>}
          {centerSubLabel && <span className="text-[11px] text-foreground/50">{centerSubLabel}</span>}
        </div>
      )}
    </div>
  );
}

export default DonutChart;
