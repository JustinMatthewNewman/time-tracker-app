"use client";

import {
    Card,
    Skeleton,
    Button,
} from "@heroui/react";
import { logout } from "@/lib/auth";

// ─────────────────────────────────────────────
// Auth Section
// ─────────────────────────────────────────────

function ProfileAuthSection({
    user,
    loading,
}: {
    user: any;
    loading: boolean;
}) {
    if (loading) {
        return <Skeleton className="w-full h-40 rounded-xl" />;
    }

    if (!user) {
        return (
            <Card className="max-w-md p-6">
                <p className="text-center text-foreground/60">
                    👤 Not signed in
                </p>
                <p className="text-center text-sm text-foreground/40 mt-2">
                    Please log in to view your profile
                </p>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl w-full">
            <div className="p-6">
                {/* Header - Avatar and Basic Info */}
                <div className="flex items-center gap-4 mb-6">
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="avatar"
                            className="h-20 w-20 rounded-full border-2 border-primary"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-semibold text-white">
                            {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                        </div>
                    )}

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">
                            {user.displayName ?? "User"}
                        </h2>
                        <p className="text-foreground/60 text-sm mt-1">
                            {user.email}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {user.emailVerified ? "✓ Verified" : "⚠️ Unverified"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-default-200 my-4"></div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-default-100 rounded-lg">
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">User ID</p>
                        <p className="font-mono text-sm text-foreground mt-1 break-all">{user.uid}</p>
                    </div>

                    <div className="p-3 bg-default-100 rounded-lg">
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Provider</p>
                        <p className="text-sm text-foreground mt-1">
                            {user.providerData?.[0]?.providerId === "google.com" ? "🔵 Google" : user.providerData?.map((p: any) => p.providerId).join(", ") || "Unknown"}
                        </p>
                    </div>

                    <div className="p-3 bg-default-100 rounded-lg">
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Created</p>
                        <p className="text-sm text-foreground mt-1">
                            {user.metadata?.creationTime
                                ? new Date(user.metadata.creationTime).toLocaleDateString()
                                : "Unknown"}
                        </p>
                    </div>

                    <div className="p-3 bg-default-100 rounded-lg">
                        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Last Login</p>
                        <p className="text-sm text-foreground mt-1">
                            {user.metadata?.lastSignInTime
                                ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                                : "Unknown"}
                        </p>
                    </div>
                </div>

                <div className="border-t border-default-200 my-4"></div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        className="flex-1 bg-red-600 text-white border border-red-600"
                        onPress={logout}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default ProfileAuthSection;