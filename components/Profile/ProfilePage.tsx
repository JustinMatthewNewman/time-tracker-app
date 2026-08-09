"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@heroui/react";
import ProfileCard from "./ProfileCard";
import AmbientBackground from "@/components/AmbientBackground";

function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner aria-label="Loading profile" />
            </div>
        );
    }

    if (!user) return null; // redirect in flight

    return (
        <div className="relative flex h-full flex-col overflow-hidden p-4 sm:p-6">
            <AmbientBackground intensity={0.85} />
            <div className="relative z-10 mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto pb-8">
                <ProfileCard />
            </div>
        </div>
    );
}

export default ProfilePage;
