// A ticket's identity color: validation, presets, and the derived shades the
// UI actually renders.
//
// Everything a component needs is here rather than inline at each call site,
// because two of these rules are the kind that break quietly if each widget
// reimplements them:
//
//   1. A stored color is untrusted. Ticket.color is plain text with no
//      database constraint (Data Connect offers no CHECK), so a malformed
//      value can reach the client. Feeding one to CSS color-mix() doesn't
//      degrade to "no tint" — the whole declaration is dropped, which can take
//      a background or a border with it. Every read goes through
//      normalizeTicketColor() first.
//
//   2. A raw ticket color is far too saturated to sit behind text. The row
//      tint has to be a heavily muted derivative, mixed in OKLCH against the
//      theme's own surface token so it stays legible in light and dark
//      without two hardcoded palettes — the same approach
//      chartColor.ts's sequential ramp already uses.

/** "#rrggbb", lowercase. The only shape ever written to the database. */
export type TicketColor = string;

const HEX_PATTERN = /^#[0-9a-f]{6}$/;

/**
 * Coerces a stored value into a safe "#rrggbb", or null if it isn't one.
 *
 * Accepts the shorthand "#abc" and uppercase so a hand-edited database row or
 * a pasted value still works, but always returns the canonical long lowercase
 * form so equality checks and swatch-selected state don't turn into
 * case-sensitivity bugs.
 */
export function normalizeTicketColor(value: string | null | undefined): TicketColor | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();

  // #abc -> #aabbcc
  const shorthand = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(trimmed);
  if (shorthand) {
    const [, r, g, b] = shorthand;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return HEX_PATTERN.test(trimmed) ? trimmed : null;
}

export function isValidTicketColor(value: string | null | undefined): boolean {
  return normalizeTicketColor(value) !== null;
}

/**
 * The swatches offered in the picker.
 *
 * Chosen to stay distinguishable from each other at the small sizes these
 * appear at (a 10px dot, a faint row tint) and to hold up against both the
 * light and dark surface tokens. Deliberately mid-saturation: fully saturated
 * hues muddy into each other once mixed down to a 12% tint, which is the form
 * most of these are actually seen in.
 *
 * A preset list rather than only a free color input, because picking an
 * arbitrary hex per ticket produces a set that clashes — offering a curated
 * row makes the common case one click and still allows a custom value.
 */
export const TICKET_COLOR_PRESETS: readonly { hex: TicketColor; name: string }[] = [
  { hex: "#e11d48", name: "Rose" },
  { hex: "#ea580c", name: "Orange" },
  { hex: "#d97706", name: "Amber" },
  { hex: "#65a30d", name: "Lime" },
  { hex: "#059669", name: "Emerald" },
  { hex: "#0891b2", name: "Cyan" },
  { hex: "#0284c7", name: "Sky" },
  { hex: "#4f46e5", name: "Indigo" },
  { hex: "#7c3aed", name: "Violet" },
  { hex: "#c026d3", name: "Fuchsia" },
  { hex: "#78716c", name: "Stone" },
];

// --- Automatic colors -----------------------------------------------------
//
// Every ticket has a color whether or not anyone chose one. Without this the
// whole feature is invisible on a real database: nothing tints until each
// ticket is hand-colored, so the Ticket Colors switch appears to do nothing.
//
// Hues are spread by the golden angle (137.5°) rather than by dividing the
// circle into N slots, because the ticket count isn't known in advance. Each
// successive number lands in the largest remaining gap, so the palette stays
// well-separated at any size — and, usefully here, consecutive ticket numbers
// (which is what a day of related work looks like) come out maximally far
// apart rather than nearly identical.
const GOLDEN_ANGLE_DEG = 137.508;

// Mid saturation and lightness on purpose. These get mixed down to ~12%
// against the theme's surface, and fully saturated hues turn muddy and
// indistinguishable at that strength, while pale ones vanish entirely.
const AUTO_SATURATION = 0.6;
const AUTO_LIGHTNESS = 0.5;

const autoColorCache = new Map<number, TicketColor>();

/**
 * The color a ticket has when nobody has picked one.
 *
 * Derived purely from the ticket number, so it is stable forever and
 * identical in every view — unlike chartColor.ts's rotation, which is indexed
 * by position within whatever list is being rendered and therefore gives the
 * same ticket different colors in different tables.
 */
export function autoTicketColor(ticketNumber: number): TicketColor {
  const key = Math.abs(Math.trunc(ticketNumber));
  const cached = autoColorCache.get(key);
  if (cached) return cached;

  const hue = (key * GOLDEN_ANGLE_DEG) % 360;
  const hex = hslToHex(hue, AUTO_SATURATION, AUTO_LIGHTNESS);
  autoColorCache.set(key, hex);
  return hex;
}

/**
 * A ticket's color: what someone chose, else the derived one.
 *
 * Null only for "no ticket at all" — that has no identity to color, and
 * tinting it would imply one.
 */
export function effectiveTicketColor(
  stored: string | null | undefined,
  ticketNumber: number | null | undefined
): TicketColor | null {
  const explicit = normalizeTicketColor(stored);
  if (explicit) return explicit;
  if (ticketNumber === null || ticketNumber === undefined || !Number.isFinite(ticketNumber)) {
    return null;
  }
  return autoTicketColor(ticketNumber);
}

function hslToHex(h: number, s: number, l: number): TicketColor {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] :
    hp < 2 ? [x, c, 0] :
    hp < 3 ? [0, c, x] :
    hp < 4 ? [0, x, c] :
    hp < 5 ? [x, 0, c] :
             [c, 0, x];
  const m = l - c / 2;
  const to255 = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to255(r1)}${to255(g1)}${to255(b1)}`;
}

/**
 * Faint background wash for a table row.
 *
 * Mixed toward `--surface` rather than toward transparent so the result sits
 * on the theme's own background in both light and dark mode. Mixing toward
 * transparent would let whatever is behind the table (the AmbientBackground,
 * a translucent Card) bleed through and shift the tint unpredictably —
 * cardOpacity is user-adjustable, so "behind the table" is not a fixed color.
 */
export function ticketRowTint(color: TicketColor, percent = 12): string {
  return `color-mix(in oklch, ${color} ${percent}%, var(--surface))`;
}

/** Slightly stronger wash, for a hovered or selected row. */
export function ticketRowTintStrong(color: TicketColor): string {
  return ticketRowTint(color, 22);
}

/**
 * Left-edge accent for a tinted row.
 *
 * A 12% wash alone is close to invisible for a dark or desaturated color like
 * Stone. A solid rule at full strength keeps every ticket's color readable at
 * a glance regardless of how well its hue survives being mixed down.
 */
export function ticketRowAccent(color: TicketColor): string {
  return color;
}
