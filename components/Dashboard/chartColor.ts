// Shared color helpers for every dashboard/worklogs chart — one source of
// truth so no widget hardcodes a hex palette that could clash with the
// active ColorScheme (Ocean/Forest/Sunset/Grape) × light/dark, both applied
// at runtime via CSS custom properties by components/Utilities/DbThemeApplier.tsx.

// Categorical identity color, derived from the single --accent token via
// hue-rotation rather than a hardcoded hex palette, so it always matches
// whichever color scheme is active. Originally local to TicketBreakdown.tsx;
// promoted here so every new widget shares one rotation table instead of
// each keeping its own copy.
const SLICE_HUE_ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315];

// Fixed budget, never cycled — callers with more categories than this must
// fold the overflow into an "Other" bucket (see the dataviz color formula's
// non-negotiable: a 9th series is never a generated/repeated hue).
export const CATEGORICAL_HUE_COUNT = SLICE_HUE_ROTATIONS.length;

export interface SeriesColor {
  color: string;
  filter?: string;
}

// `index` must be < CATEGORICAL_HUE_COUNT — callers with more categories
// than that must bucket the overflow themselves (never cycle: see above).
export function getSeriesColor(index: number): SeriesColor {
  const rotation = SLICE_HUE_ROTATIONS[index % SLICE_HUE_ROTATIONS.length];
  return { color: "var(--accent)", filter: rotation === 0 ? undefined : `hue-rotate(${rotation}deg)` };
}

// Neutral slot for an "unassigned"/empty category — never takes a rotation
// slot, always reads as neutral regardless of scheme.
export const NEUTRAL_SERIES_COLOR: SeriesColor = { color: "var(--muted)" };

// Status colors (up/down/flat) are intentionally NOT derived from --accent —
// their meaning (good/bad) must stay constant no matter which color scheme
// is active, so they use HeroUI's own fixed --success/--danger tokens
// instead (see dataconnect/schema/schema.gql's comment on Theme: status
// colors are deliberately left out of the custom scheme system for this
// exact reason).
export type DeltaDirection = "up" | "down" | "flat";

export function deltaColorClass(direction: DeltaDirection): string {
  if (direction === "up") return "text-success";
  if (direction === "down") return "text-danger";
  return "text-foreground/50";
}

// Sequential (magnitude) ramp for the calendar heatmap: one hue (--accent),
// monotone lightness steps mixed toward --surface in OKLCH space (not sRGB)
// so the ramp is genuinely perceptually monotone, not just approximately so.
// --surface already differs between light/dark mode, so the "flip anchor in
// dark mode" rule from the dataviz color formula is satisfied automatically.
const SEQUENTIAL_STEPS = [20, 40, 60, 80, 100];

export function sequentialStepColor(step: number): string {
  const t = SEQUENTIAL_STEPS[Math.max(0, Math.min(step, SEQUENTIAL_STEPS.length - 1))];
  return `color-mix(in oklch, var(--accent) ${t}%, var(--surface))`;
}

export const SEQUENTIAL_STEP_COUNT = SEQUENTIAL_STEPS.length;
