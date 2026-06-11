"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // avoid hydration mismatch

  return (
    <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      Toggle {resolvedTheme === "dark" ? "Light" : "Dark"} Mode
    </button>
  );
}