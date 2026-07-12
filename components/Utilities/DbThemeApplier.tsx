"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useThemeSelection, getVariant, type ThemeVariant } from "@/context/ThemeSelectionContext";

const VARIANT_CSS_VARS: (keyof Omit<ThemeVariant, "id" | "isDark">)[] = [
  "background",
  "foreground",
  "surface",
  "surfaceForeground",
  "overlay",
  "overlayForeground",
  "muted",
  "default",
  "defaultForeground",
  "accent",
  "accentForeground",
  "border",
  "separator",
];

// Applies the signed-in user's selected color scheme by overriding HeroUI's
// base CSS variables (see @heroui/styles themes/default/variables.css) with
// the variant matching the current next-themes light/dark state. Toggling
// dark mode re-applies this effect with the other variant of the same
// scheme, so the color scheme and the light/dark switch work together
// instead of the switch fighting the selection. With no scheme selected,
// HeroUI's own built-in default theme keeps driving the colors as before.
export function DbThemeApplier() {
  const { selectedScheme } = useThemeSelection();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const variant = resolvedTheme ? getVariant(selectedScheme, resolvedTheme === "dark") : null;

    for (const key of VARIANT_CSS_VARS) {
      const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      if (variant) {
        root.style.setProperty(cssVar, variant[key]);
      } else {
        root.style.removeProperty(cssVar);
      }
    }
  }, [selectedScheme, resolvedTheme]);

  return null;
}

export default DbThemeApplier;
