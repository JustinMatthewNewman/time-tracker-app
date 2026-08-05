"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket as TicketIcon } from "@gravity-ui/icons";
import { Card, Spinner } from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { TicketBreakdown } from "@/components/WorkLogs/TicketBreakdown";
import AmbientBackground from "@/components/AmbientBackground";

export function TicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { entries, loading, error } = useMyTimeEntries();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner aria-label="Loading" />
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6">
      <AmbientBackground intensity={0.85} />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <TicketIcon className="size-6 text-accent" />
          <h1 className="text-2xl font-bold">Tickets</h1>
        </div>

        <Card className="p-4">
          <TicketBreakdown
            hasSelection
            entries={entries}
            loading={loading}
            error={error}
            loadingMessage="Loading tickets..."
            emptyMessage="No time entries yet — tickets will show up here once you log time against one."
          />
        </Card>
      </div>
    </div>
  );
}

export default TicketsPage;
