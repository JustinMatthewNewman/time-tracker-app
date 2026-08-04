"use client";

import {
    Card,
    Skeleton,
    Button,
} from "@heroui/react";
import { useState } from "react";
import type { User } from "firebase/auth";
import { logout } from "@/lib/auth";
import {
    Key,
    Globe,
    Calendar,
    ClockArrowRotateLeft,
    Bell,
    ArrowRightFromSquare,
} from "@gravity-ui/icons";

// ─────────────────────────────────────────────
// Preferences (mocked, local only)
// No settings backend exists yet, so these toggles just hold local state
// until account preferences are wired up.
// ─────────────────────────────────────────────

const DEFAULT_PREFERENCES = [
    { key: "emailSummaries", label: "Email summaries", description: "Weekly recap of logged hours", defaultOn: true },
    { key: "weeklyDigest", label: "Weekly digest", description: "Highlights sent every Monday", defaultOn: false },
    { key: "productUpdates", label: "Product updates", description: "New features and announcements", defaultOn: false },
];

// ─────────────────────────────────────────────
// Auth Section
// ─────────────────────────────────────────────

function ProfileAuthSection({
    user,
    loading,
}: {
    user: User | null;
    loading: boolean;
}) {
    const [preferences, setPreferences] = useState<Record<string, boolean>>(
        Object.fromEntries(DEFAULT_PREFERENCES.map((p) => [p.key, p.defaultOn]))
    );

    if (loading) {
        return <Skeleton className="w-full h-40 rounded-xl" />;
    }

    if (!user) {
        return (
            <Card className="max-w-md p-6">
                <p className="text-center text-foreground/60">Not signed in</p>
                <p className="text-center text-sm text-foreground/40 mt-2">
                    Please log in to view your profile
                </p>
            </Card>
        );
    }

    const details = [
        { label: "User ID", value: user.uid, icon: Key, mono: true },
        {
            label: "Provider",
            value: user.providerData?.[0]?.providerId === "google.com"
                ? "Google"
                : user.providerData?.map((p) => p.providerId).join(", ") || "Unknown",
            icon: Globe,
        },
        {
            label: "Created",
            value: user.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : "Unknown",
            icon: Calendar,
        },
        {
            label: "Last Login",
            value: user.metadata?.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                : "Unknown",
            icon: ClockArrowRotateLeft,
        },
    ];

    return (
        <Card className="w-full p-6">
            {/* Account details */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {details.map(({ label, value, icon: Icon, mono }) => (
                        <div key={label} className="flex items-start gap-3 p-3 bg-default-100 rounded-lg">
                            <Icon className="size-4 mt-0.5 shrink-0 text-foreground/50" />
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">{label}</p>
                                <p className={`text-sm text-foreground mt-1 break-all ${mono ? "font-mono" : ""}`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-default-200 my-6"></div>

            {/* Preferences (mocked) */}
            <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell className="size-4" /> Preferences
                </h2>
                {/* <div className="flex flex-col gap-3">
                    {DEFAULT_PREFERENCES.map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between gap-4 p-3 bg-default-100 rounded-lg">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{label}</p>
                                <p className="text-xs text-foreground/60">{description}</p>
                            </div>
                            <Switch
                                isSelected={preferences[key]}
                                onChange={(isSelected) => setPreferences((prev) => ({ ...prev, [key]: isSelected }))}
                                aria-label={label}
                            >
                                <Switch.Content>
                                    <Switch.Control>
                                        <Switch.Thumb />
                                    </Switch.Control>
                                </Switch.Content>
                            </Switch>
                        </div>
                    ))}
                </div> */}
            </div>

            <div className="border-t border-default-200 my-6"></div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    className="flex-1"
                    variant="danger"
                    onPress={logout}
                >
                    <ArrowRightFromSquare /> Logout
                </Button>
            </div>
        </Card>
    );
}

export default ProfileAuthSection;
