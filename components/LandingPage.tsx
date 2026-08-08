"use client";

import { Button } from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle } from "@/lib/auth";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// Google "G" mark, for the sign-in CTA
// ─────────────────────────────────────────────

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" />
            <path fill="#FBBC05" d="M3.96 10.71A5.4 5.4 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.65 3.58 9 3.58z" />
        </svg>
    );
}

export default function LandingPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handlePrimaryCTA = async () => {
        if (user) {
            router.push("/dashboard");
            return;
        }
        await loginWithGoogle();
        router.push("/worklogs");
    };

    return (
        <main className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
            {/* ── Hero ── */}
            <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
                <h1 className="max-w-3xl text-4xl leading-[1.15] font-medium tracking-tight sm:text-5xl md:text-6xl">
                    Track time with precision and simplicity.
                </h1>

                <p className="mt-6 max-w-md text-base text-foreground/60">
                    Built for developers who want to capture every billable minute without the usual admin friction.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    {loading ? (
                        <div className="h-10 w-44 animate-pulse rounded-3xl bg-default" />
                    ) : (
                        <Button size="lg" variant="primary" className="gap-2 px-6" onClick={handlePrimaryCTA}>
                            {!user && <GoogleIcon />}
                            {user ? "Go to dashboard" : "Sign in with Google"}
                        </Button>
                    )}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-border">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
                    <span className="text-sm font-semibold text-foreground">
                        Time Tracker <span className="text-foreground/50">Pro</span>
                    </span>
                    <span className="text-xs text-foreground/50">
                        © {new Date().getFullYear()} Time Tracker Pro. All rights reserved.
                    </span>
                </div>
            </footer>
        </main>
    );
}
