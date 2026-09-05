import { describe, expect, it } from "vitest";
import {
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
