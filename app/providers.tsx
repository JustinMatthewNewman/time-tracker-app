// app/providers.tsx
"use client";

import "@/lib/dataconnectEmulator";
import { SidebarProvider } from "@/context/SideBarContext";
import { TimeRangeProvider } from "@/context/TimeRangeContext";
import { SelectedWorkLogProvider } from "@/context/SelectedWorkLogContext";
import { ThemeSelectionProvider } from "@/context/ThemeSelectionContext";
import { TicketsProvider } from "@/context/TicketsContext";
import { UserSettingsProvider } from "@/context/UserSettingsContext";
import { PerformanceModeProvider } from "@/context/PerformanceModeContext";
import { BackgroundOpacityProvider } from "@/context/BackgroundOpacityContext";
import { CardStyleProvider } from "@/context/CardStyleContext";
import { BordersProvider } from "@/context/BordersContext";
import { TicketColorsProvider } from "@/context/TicketColorsContext";
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
          <UserSettingsProvider>
            <PerformanceModeProvider>
              <BackgroundOpacityProvider>
                <CardStyleProvider>
                  <BordersProvider>
                    <ThemeSelectionProvider>
                      <TicketsProvider>
                        <TicketColorsProvider>
                        <SidebarProvider>
                          <TimeRangeProvider>
                            <SelectedWorkLogProvider>
                              <DbThemeApplier />
                              {children}
                            </SelectedWorkLogProvider>
                          </TimeRangeProvider>
                        </SidebarProvider>
                        </TicketColorsProvider>
                      </TicketsProvider>
                    </ThemeSelectionProvider>
                  </BordersProvider>
                </CardStyleProvider>
              </BackgroundOpacityProvider>
            </PerformanceModeProvider>
          </UserSettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}