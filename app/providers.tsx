// app/providers.tsx
"use client";

import { SidebarProvider } from "@/context/SideBarContext";
import { TimeRangeProvider } from "@/context/TimeRangeContext";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <SidebarProvider>
      <TimeRangeProvider>
      {children}
      </TimeRangeProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}