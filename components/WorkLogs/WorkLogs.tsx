"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Switch } from "@heroui/react";
import WorkLogTimeEntryCard from "./WorkLogTimeEntryCard";
import TimeEntryForm from "./TimeEntryForm";
import AmbientBackground from "@/components/AmbientBackground";

function WorkLogs() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="text-sm text-gray-400">Loading...</span>
            </div>
        );
    }

    if (!user) return null; // redirect in flight

    return (
        <div className="relative flex h-[calc(100vh-4rem)] flex-col gap-4 overflow-hidden p-4">
            <AmbientBackground />

            <div className="relative z-10 flex h-full min-h-0 flex-col gap-4 overflow-hidden">
                <WorkLogTimeEntryCard showBreakdown={showBreakdown} />

                <TimeEntryForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                />
                <div className="flex shrink-0 items-center justify-end">
                    <Switch isSelected={showBreakdown} onChange={setShowBreakdown}>
                    <Switch.Content>
                        <Switch.Control>
                        <Switch.Thumb />
                        </Switch.Control>
                    </Switch.Content>
                    </Switch>
                </div>
            </div>
        </div>
    );
}

export default WorkLogs;
