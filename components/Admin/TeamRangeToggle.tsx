"use client";

import { Button } from "@heroui/react";
import {
  RANGE_PRESETS,
  describeRange,
  isRangeInvalid,
  type TeamRange,
} from "./teamRange";

interface TeamRangeToggleProps {
  value: TeamRange;
  onChange: (next: TeamRange) => void;
}

/**
 * The header control: previous day vs a date range.
 *
 * Preset buttons mirror components/Settings/GoogleCalendarCard.tsx rather than
 * introducing a second date-range idiom — same labels, same custom From/To
 * pair, same `variant` convention for the selected one.
 */
export function TeamRangeToggle({ value, onChange }: TeamRangeToggleProps) {
  const invalid = isRangeInvalid(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1" role="group" aria-label="Totals period">
          <Button
            size="sm"
            variant={value.mode === "day" ? "primary" : "outline"}
            onPress={() => onChange({ ...value, mode: "day" })}
          >
            Previous day
          </Button>
          <Button
            size="sm"
            variant={value.mode === "range" ? "primary" : "outline"}
            onPress={() => onChange({ ...value, mode: "range" })}
          >
            Date range
          </Button>
        </div>

        {value.mode === "range" && (
          <div className="flex flex-wrap gap-1" role="group" aria-label="Date range preset">
            {RANGE_PRESETS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant={value.preset === p.id ? "primary" : "outline"}
                onPress={() => onChange({ ...value, preset: p.id })}
              >
                {p.label}
              </Button>
            ))}
            <Button
              size="sm"
              variant={value.preset === "custom" ? "primary" : "outline"}
              onPress={() => onChange({ ...value, preset: "custom" })}
            >
              Custom
            </Button>
          </div>
        )}
      </div>

      {value.mode === "range" && value.preset === "custom" ? (
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-foreground/60">
            From
            <input
              type="date"
              value={value.customStart}
              onChange={(e) => onChange({ ...value, customStart: e.target.value })}
              className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-foreground/60">
            To
            <input
              type="date"
              value={value.customEnd}
              onChange={(e) => onChange({ ...value, customEnd: e.target.value })}
              className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>
      ) : (
        <p className="text-xs tabular-nums text-foreground/60">{describeRange(value)}</p>
      )}

      {invalid && <p className="text-sm text-danger">End date must not be before start date.</p>}
    </div>
  );
}

export default TeamRangeToggle;
