// app/providers.tsx
"use client";

import { TimeRangeProvider } from "@/context/TimeRangeContext";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <TimeRangeProvider>
      {children}
      </TimeRangeProvider>
    </ThemeProvider>
  );
}