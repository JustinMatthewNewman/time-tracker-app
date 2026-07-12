// app/providers.tsx
"use client";

import "@/lib/dataconnectEmulator";
import { SidebarProvider } from "@/context/SideBarContext";
import { TimeRangeProvider } from "@/context/TimeRangeContext";
import { SelectedWorkLogProvider } from "@/context/SelectedWorkLogContext";
import { ThemeSelectionProvider } from "@/context/ThemeSelectionContext";
import { TicketsProvider } from "@/context/TicketsContext";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import DbThemeApplier from "@/components/Utilities/DbThemeApplier";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <ThemeSelectionProvider>
            <TicketsProvider>
              <SidebarProvider>
                <TimeRangeProvider>
                  <SelectedWorkLogProvider>
                    <DbThemeApplier />
                    {children}
                  </SelectedWorkLogProvider>
                </TimeRangeProvider>
              </SidebarProvider>
            </TicketsProvider>
          </ThemeSelectionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}