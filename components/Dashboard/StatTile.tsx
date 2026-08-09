import { Card } from "@heroui/react";
import { deltaColorClass, type DeltaDirection } from "./chartColor";

interface StatTileDelta {
  /** Formatted for display, e.g. "12%" — sign/direction comes from `direction`. */
  value: string;
  direction: DeltaDirection;
}

interface StatTileProps {
  label: string;
  value: string;
  delta?: StatTileDelta;
}

const DELTA_GLYPH: Record<DeltaDirection, string> = { up: "▲", down: "▼", flat: "—" };

export function StatTile({ label, value, delta }: StatTileProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-foreground/60">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
        {delta && (
          <span className={`flex items-center gap-1 text-xs font-medium tabular-nums ${deltaColorClass(delta.direction)}`}>
            <span aria-hidden>{DELTA_GLYPH[delta.direction]}</span>
            {delta.value}
          </span>
        )}
      </div>
    </Card>
  );
}

export default StatTile;
