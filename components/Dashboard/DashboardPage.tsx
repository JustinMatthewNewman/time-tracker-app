"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Switch } from "@heroui/react";
import DashboardCard from "./DashboardCard";
import TimeEntryForm from "./TimeEntryForm";

function DashboardPage() {
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
        <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-end">
                <Switch isSelected={showBreakdown} onChange={setShowBreakdown}>
                <Switch.Content>
                    <Switch.Control>
                    <Switch.Thumb />
                    </Switch.Control>
                    {showBreakdown ? "Ticket Breakdown" : "Time Card"}
                </Switch.Content>
                </Switch>
            </div>

            <DashboardCard showBreakdown={showBreakdown} />

            <TimeEntryForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
            />
        </div>
    );
}

export default DashboardPage;
