"use client";

import { useEffect } from "react";
import { useThemeSelection } from "@/context/ThemeSelectionContext";

// Applies the signed-in user's selected DB theme by overriding the
// --background/--foreground CSS variables app/globals.css defines for
// next-themes' light/dark classes. With no theme selected, those classes
// keep driving the colors as before.
export function DbThemeApplier() {
  const { selectedTheme } = useThemeSelection();

  useEffect(() => {
    const root = document.documentElement;

    if (selectedTheme) {
      root.style.setProperty("--background", selectedTheme.background);
      root.style.setProperty("--foreground", selectedTheme.foreground);
    } else {
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
    }
  }, [selectedTheme]);

  return null;
}

export default DbThemeApplier;
