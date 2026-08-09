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
      <div className="flex h-full items-center justify-center">
        <Spinner aria-label="Loading" />
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return (
    <div className="relative flex h-full flex-col overflow-hidden p-4 sm:p-6">
      <AmbientBackground intensity={0.85} />
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-6">
        <Card className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-4">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TicketBreakdown
              hasSelection
              entries={entries}
              loading={loading}
              error={error}
              emptyMessage="No time entries yet — tickets will show up here once you log time against one."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TicketsPage;
