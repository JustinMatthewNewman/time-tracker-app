import {
    Card,

    Skeleton,
} from "@heroui/react";

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
            <div className="text-sm text-foreground/60">
                Not signed in
            </div>
        );
    }

    return (
        <Card className="max-w-md">
 
                {/* Header */}
                <div className="flex items-center gap-3">
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="avatar"
                            className="h-12 w-12 rounded-full"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-default-200 flex items-center justify-center text-sm">
                            {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                        </div>
                    )}

                    <div>
                        <div className="font-semibold">
                            {user.displayName ?? "No display name"}
                        </div>
                        <div className="text-xs text-foreground/60">
                            {user.email}
                        </div>
                    </div>
                </div>

 
                {/* Profile Details */}
                <div className="text-sm space-y-2">
                    <div>
                        <span className="text-foreground/60">UID:</span>{" "}
                        <span className="font-mono text-xs">{user.uid}</span>
                    </div>

                    <div>
                        <span className="text-foreground/60">Email Verified:</span>{" "}
                        <span>{user.emailVerified ? "Yes" : "No"}</span>
                    </div>

                    <div>
                        <span className="text-foreground/60">Provider:</span>{" "}
                        <span>
                            {user.providerData?.map((p: any) => p.providerId).join(", ") || "Unknown"}
                        </span>
                    </div>

                    <div>
                        <span className="text-foreground/60">Last Login:</span>{" "}
                        <span>
                            {user.metadata?.lastSignInTime
                                ? new Date(user.metadata.lastSignInTime).toLocaleString()
                                : "Unknown"}
                        </span>
                    </div>

                    <div>
                        <span className="text-foreground/60">Created:</span>{" "}
                        <span>
                            {user.metadata?.creationTime
                                ? new Date(user.metadata.creationTime).toLocaleString()
                                : "Unknown"}
                        </span>
                    </div>
                </div>
         </Card>
    );
}

export default ProfileAuthSection;