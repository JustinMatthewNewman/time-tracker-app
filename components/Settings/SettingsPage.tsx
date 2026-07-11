"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@heroui/react";
import SettingsCard from "./SettingsCard";
import AmbientBackground from "@/components/AmbientBackground";

function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Spinner aria-label="Loading settings" />
            </div>
        );
    }

    if (!user) return null; // redirect in flight

    return (
        <div className="relative h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6">
            <AmbientBackground intensity={0.85} />
            <div className="relative z-10 mx-auto w-full max-w-4xl pb-8">
                <SettingsCard />
            </div>
        </div>
    );
}

export default SettingsPage;
