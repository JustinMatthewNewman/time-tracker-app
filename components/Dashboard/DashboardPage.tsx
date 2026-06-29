"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@heroui/react";
import DashboardCard from "./DashboardCard";
import TimeEntryForm from "./TimeEntryForm";
import TimeEntryList from "./TimeEntryList";

function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">📊 Dashboard</h1>
                <Button
                    className="bg-blue-600 text-white"
                    onPress={() => setIsFormOpen(true)}
                >
                    + New Entry
                </Button>
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        viewMode === "grid"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => setViewMode("grid")}
                >
                    Grid View
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        viewMode === "list"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => setViewMode("list")}
                >
                    List View
                </button>
            </div>

            {viewMode === "grid" && <DashboardCard />}
            {viewMode === "list" && <TimeEntryList refreshTrigger={refreshTrigger} />}

            <TimeEntryForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />
        </div>
    );
}

export default DashboardPage;
