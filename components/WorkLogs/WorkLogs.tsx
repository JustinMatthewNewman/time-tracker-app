"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import WorkLogTimeEntryCard from "./WorkLogTimeEntryCard";
import TimeEntryForm from "./TimeEntryForm";
import AmbientBackground from "@/components/AmbientBackground";

function WorkLogs() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    // Opens on the ticket breakdown rather than the hour-by-hour entry list —
    // the per-ticket totals are what the page is usually opened to read. The
    // header's ToggleButtonGroup switches back to the list.
    const [showBreakdown, setShowBreakdown] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <span className="text-sm text-gray-400">Loading...</span>
            </div>
        );
    }

    if (!user) return null; // redirect in flight

    return (
        <div className="relative flex h-full flex-col gap-4 overflow-hidden p-4">
            <AmbientBackground intensity={0.85} />

            <div className="relative z-10 flex h-full min-h-0 flex-col gap-4 overflow-hidden">
                <WorkLogTimeEntryCard
                    showBreakdown={showBreakdown}
                    onToggleBreakdown={setShowBreakdown}
                />

                <TimeEntryForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                />
            </div>
        </div>
    );
}

export default WorkLogs;
