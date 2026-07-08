"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@heroui/react";
import DashboardCard from "./DashboardCard";
import TimeEntryForm from "./TimeEntryForm";

function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    const savePageState = () => {
        const inputs = Array.from(
            document.querySelectorAll<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >("input, textarea, select")
        );

        const pageState: Record<string, unknown> = {};

        inputs.forEach((input, index) => {
            const key = input.name || input.id || `field_${index}`;

            pageState[key] =
                input instanceof HTMLInputElement &&
                (input.type === "checkbox" || input.type === "radio")
                    ? input.checked
                    : input.value;
        });

        console.log(pageState);
    };

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
                <Button
                    className="bg-blue-600 text-white"
                    onPress={() => savePageState()}
                >
                    Save
                </Button>
            </div>

            <DashboardCard />

            <TimeEntryForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
            />
        </div>
    );
}

export default DashboardPage;
