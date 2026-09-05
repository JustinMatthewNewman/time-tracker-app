"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Check, Xmark } from "@gravity-ui/icons";
import { normalizeTicketColor, TICKET_COLOR_PRESETS, ticketRowTint } from "@/lib/ticketColor";

interface TicketColorPickerProps {
  /** The explicitly chosen color, or null when the ticket is using the default. */
  value: string | null;
  /** The number-derived color used when nothing is chosen. */
  fallback: string;
  onSave: (color: string | null) => Promise<void>;
}

/**
 * Overrides a ticket's identity color.
 *
 * Every ticket already has one, derived from its number (see autoTicketColor),
 * so this is an override rather than an assignment — which is why the reset
 * button says "automatic" instead of "clear".
 *
 * Presets plus a custom well, rather than only one or the other: a curated row
 * makes the common case a single click and keeps a project's tickets from
 * clashing, while the native color input is there for the ticket that has to
 * match something specific.
 *
 * Saves only on an explicit Save. The obvious alternative — write on every
 * swatch click — would be a database round trip per exploratory click, and
 * each one repaints every row of every breakdown showing that ticket.
 */
export function TicketColorPicker({ value, fallback, onSave }: TicketColorPickerProps) {
  const [open, setOpen] = useState(false);
  // Opens on whatever the ticket currently *looks* like, so the picker starts
  // from the color on screen rather than from an empty state that doesn't
  // match anything the user can see.
  const [draft, setDraft] = useState<string | null>(value ?? fallback);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    setDraft(value ?? fallback);
    setError(null);
    setOpen(true);
  };

  const commit = async (next: string | null) => {
    setSaving(true);
    setError(null);
    try {
      await onSave(next);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save color");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={start}
        aria-label="Change ticket color"
        className="flex items-center gap-2 rounded px-1 py-0.5 text-sm text-foreground/60 hover:bg-default hover:text-foreground"
      >
        <span
          className="size-3.5 shrink-0 rounded-full border border-default-300"
          style={{ backgroundColor: value ?? fallback }}
          aria-hidden
        />
        {value ? "Color" : "Color (automatic)"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-default-100 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {TICKET_COLOR_PRESETS.map((preset) => {
          const selected = draft === preset.hex;
          return (
            <button
              key={preset.hex}
              type="button"
              title={preset.name}
              aria-label={preset.name}
              aria-pressed={selected}
              onClick={() => setDraft(preset.hex)}
              disabled={saving}
              className={`flex size-7 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                selected ? "ring-2 ring-foreground ring-offset-2 ring-offset-default-100" : ""
              }`}
              style={{ backgroundColor: preset.hex }}
            >
              {selected && <Check className="size-3.5 text-white" aria-hidden />}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-foreground/60">
          Custom
          <input
            type="color"
            // The native input can't express "no color", so it shows the
            // draft or a neutral placeholder; clearing is the separate button.
            value={draft ?? fallback}
            onChange={(e) => setDraft(normalizeTicketColor(e.target.value))}
            disabled={saving}
            className="size-7 cursor-pointer rounded border border-default-200 bg-transparent"
            aria-label="Custom ticket color"
          />
        </label>

        <span className="flex items-center gap-2 text-xs text-foreground/60">
          Preview
          <span
            className="rounded px-2 py-1 text-foreground"
            style={
              draft
                ? { backgroundColor: ticketRowTint(draft), boxShadow: `inset 3px 0 0 0 ${draft}` }
                : undefined
            }
          >
            {draft ?? fallback}
          </span>
        </span>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => commit(draft)} isDisabled={saving}>
          <Check className="size-4" /> {saving ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)} isDisabled={saving}>
          <Xmark className="size-4" /> Cancel
        </Button>
        {value && (
          // Clears the override rather than the color: the ticket falls back
          // to its number-derived default, it does not become colorless.
          <Button size="sm" variant="outline" onClick={() => commit(null)} isDisabled={saving}>
            Reset to automatic
          </Button>
        )}
      </div>
    </div>
  );
}

export default TicketColorPicker;
