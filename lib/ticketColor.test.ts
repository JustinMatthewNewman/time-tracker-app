import { describe, expect, it } from "vitest";
import {
  autoTicketColor,
  effectiveTicketColor,
  isValidTicketColor,
  normalizeTicketColor,
  ticketRowTint,
  TICKET_COLOR_PRESETS,
} from "./ticketColor";

describe("normalizeTicketColor", () => {
  it("passes through a canonical hex", () => {
    expect(normalizeTicketColor("#0891b2")).toBe("#0891b2");
  });

  it("lowercases, so swatch selected-state doesn't break on case", () => {
    expect(normalizeTicketColor("#0891B2")).toBe("#0891b2");
  });

  it("expands shorthand", () => {
    expect(normalizeTicketColor("#abc")).toBe("#aabbcc");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeTicketColor("  #0891b2 ")).toBe("#0891b2");
  });

  it("returns null for null/undefined/empty", () => {
    expect(normalizeTicketColor(null)).toBeNull();
    expect(normalizeTicketColor(undefined)).toBeNull();
    expect(normalizeTicketColor("")).toBeNull();
  });

  it("rejects values that would poison a CSS color-mix()", () => {
    // The failure this guards: an invalid color makes the browser drop the
    // whole declaration, not just the color — taking the row background with it.
    for (const bad of ["red", "0891b2", "#12345", "#1234567", "#ghijkl", "rgb(1,2,3)", "'; --x: y"]) {
      expect(normalizeTicketColor(bad)).toBeNull();
      expect(isValidTicketColor(bad)).toBe(false);
    }
  });
});

describe("TICKET_COLOR_PRESETS", () => {
  it("are all valid canonical hex values", () => {
    for (const preset of TICKET_COLOR_PRESETS) {
      expect(normalizeTicketColor(preset.hex)).toBe(preset.hex);
    }
  });

  it("has no duplicates", () => {
    const hexes = TICKET_COLOR_PRESETS.map((p) => p.hex);
    expect(new Set(hexes).size).toBe(hexes.length);
  });
});

describe("ticketRowTint", () => {
  it("mixes toward the theme surface token, not transparent", () => {
    // Toward transparent would let the AmbientBackground and the
    // user-adjustable card opacity shift the tint unpredictably.
    expect(ticketRowTint("#0891b2")).toBe("color-mix(in oklch, #0891b2 12%, var(--surface))");
  });

  it("takes a stronger percentage for hover/selected", () => {
    expect(ticketRowTint("#0891b2", 22)).toContain("22%");
  });
});

describe("autoTicketColor", () => {
  it("is stable for a ticket number", () => {
    expect(autoTicketColor(19051)).toBe(autoTicketColor(19051));
  });

  it("always produces a valid canonical hex", () => {
    for (let n = 0; n < 400; n++) {
      expect(normalizeTicketColor(autoTicketColor(n))).toBe(autoTicketColor(n));
    }
  });

  it("gives consecutive ticket numbers well-separated hues", () => {
    // The golden angle exists for exactly this: a day of related tickets
    // (19620, 19621, ...) must not come out as near-identical shades.
    const run = [19620, 19621, 19622, 19623, 19624].map(autoTicketColor);
    expect(new Set(run).size).toBe(run.length);
  });

  it("spreads a large set across many distinct colors", () => {
    const many = Array.from({ length: 100 }, (_, i) => autoTicketColor(1000 + i));
    // No hard collisions across a realistic ticket count.
    expect(new Set(many).size).toBe(100);
  });

  it("handles negative and fractional numbers without producing garbage", () => {
    expect(normalizeTicketColor(autoTicketColor(-7))).not.toBeNull();
    expect(normalizeTicketColor(autoTicketColor(12.7))).not.toBeNull();
  });
});

describe("effectiveTicketColor", () => {
  it("prefers an explicitly chosen color", () => {
    expect(effectiveTicketColor("#0891b2", 19051)).toBe("#0891b2");
  });

  it("falls back to the derived color when nothing is chosen", () => {
    expect(effectiveTicketColor(null, 19051)).toBe(autoTicketColor(19051));
  });

  it("ignores a malformed stored value rather than rendering it", () => {
    // A bad value must not reach CSS; falling back keeps the row painted.
    expect(effectiveTicketColor("not-a-color", 19051)).toBe(autoTicketColor(19051));
  });

  it("returns null when there is no ticket at all", () => {
    // "(No ticket)" has no identity to color.
    expect(effectiveTicketColor(null, null)).toBeNull();
    expect(effectiveTicketColor(null, undefined)).toBeNull();
  });
});
