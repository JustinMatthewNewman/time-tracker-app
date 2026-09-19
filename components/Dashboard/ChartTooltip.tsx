"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

// Shared hover-tooltip primitive for every chart in components/Dashboard and
// components/WorkLogs. This app's charts had zero hover tooltips before this
// (a bare `title=` attribute only) — the visual floating panel here
// supplements that native fallback rather than replacing it, so keyboard/
// no-JS/assistive-tech users still get the same information.
//
// Positioned via fixed coordinates supplied by the caller (usually the
// pointer position from a chart's onPointerEnter/onPointerMove), not CSS
// hover — SVG shapes need JS-computed data (nearest point on a line, a bar's
// value) anyway, so the caller already has to track hover state itself.
export function useChartTooltip<T>() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: T } | null>(null);

  const showAt = useCallback((e: { clientX: number; clientY: number }, data: T) => {
    setTooltip({ x: e.clientX, y: e.clientY, data });
  }, []);

  const hide = useCallback(() => setTooltip(null), []);

  return { tooltip, showAt, hide };
}

interface ChartTooltipProps {
  x: number;
  y: number;
  children: React.ReactNode;
}

// Translucent blurred floating panel, matching Navbar.tsx's
// bg-background/80 backdrop-blur-md visual language rather than a plain
// browser tooltip. Offset up-and-right of the pointer so the cursor never
// covers its own tooltip; pointer-events-none so it never steals the hover
// it's reporting on.
//
// Portalled to <body>, and that is load-bearing rather than tidiness.
// `position: fixed` resolves against the viewport only while no ancestor
// establishes a containing block — and every Card in this app carries
// `backdrop-filter: blur(var(--card-blur, 0px))` (globals.css). A
// backdrop-filter of *any* value, `blur(0px)` included, makes the element a
// containing block for fixed descendants, so before this the coordinates were
// measured from the card instead of the viewport and tooltips landed far from
// the pointer — commonly outside the viewport entirely, which reads as "the
// tooltip doesn't work" rather than "the tooltip is in the wrong place".
// Every chart in components/Dashboard and components/WorkLogs uses this.
//
// Fixing the 0px case in CSS would not be enough: --card-blur is a user
// setting, so a non-zero value would reintroduce it. Escaping the subtree is
// the only fix that holds.
export function ChartTooltip({ x, y, children }: ChartTooltipProps) {
  // Only ever rendered from a pointer handler, so document exists by then;
  // the guard is for safety, not a real SSR path.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg border border-default-200 bg-surface/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
      style={{ left: x, top: y }}
    >
      {children}
    </div>,
    document.body
  );
}
