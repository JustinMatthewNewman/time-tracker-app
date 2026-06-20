// app/providers.tsx
"use client";

import { SidebarProvider } from "@/context/SideBarContext";
import { TimeRangeProvider } from "@/context/TimeRangeContext";
import { ThemeProvider } from "next-themes";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

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
          <SidebarProvider>
            <TimeRangeProvider>
              {children}
            </TimeRangeProvider>
          </SidebarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}