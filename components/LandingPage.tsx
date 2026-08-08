"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { LogoGithub } from "@gravity-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle } from "@/lib/auth";
import { useRouter } from "next/navigation";
import ParticleBlob from "@/components/ParticleBlob";

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

// ─────────────────────────────────────────────
// Award Badges Icons (Gold/Amber accents)
// ─────────────────────────────────────────────

function LaurelStarsIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-amber-500 shrink-0">
            <path d="M12 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L12 2z" fill="currentColor" />
            <path d="M5 14c-1.5 2-1 5 1 7M19 14c1.5 2 1 5-1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" />
        </svg>
    );
}

function TrophyBadgeIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-amber-500 shrink-0">
            <path d="M7 4h10v4a5 5 0 01-10 0V4z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 5h2v3H5a2 2 0 01-2-2V5zm14 0h-2v3h2a2 2 0 002-2V5z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 13v4M9 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function ShieldSealIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-amber-500 shrink-0">
            <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4L12 7z" fill="currentColor" />
        </svg>
    );
}

export default function LandingPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isWarping, setIsWarping] = useState(false);

    const handlePrimaryCTA = async () => {
        setIsWarping(true);
        if (user) {
            await new Promise((resolve) => setTimeout(resolve, 850));
            router.push("/dashboard");
            return;
        }
        await loginWithGoogle();
        router.push("/worklogs");
    };

    // h-[calc(100vh-3.5rem)] rather than min-h-screen: the signed-out header
    // above this is a fixed h-14 (3.5rem) row living outside this <main>, so
    // min-h-screen here would make header + main add up to more than one
    // viewport and force a page scrollbar. Subtracting the header's height
    // keeps hero + footer pinned to exactly one screen.
    return (
        <main className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden bg-background text-foreground">
            {/* ── Hero ── */}
            <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
                <ParticleBlob isWarping={isWarping} />

                {/* pointer-events-none so this text doesn't block ParticleBlob's
                    hover-stir interaction underneath it — re-enabled below just
                    on the CTA button so it still stays clickable. */}
                <div className="relative z-10 flex pointer-events-none flex-col items-center">
                    <h1 className="max-w-3xl text-4xl leading-[1.15] tracking-tighter sm:text-5xl md:text-6xl">
                        <span className="font-extralight">TimeTracker</span>{" "}
                        <span className="font-[950] [-webkit-text-stroke:1.5px_currentColor]">Pro</span>
                    </h1>

                    <p className="text-xs text-foreground/50 mt-4">No credit card required.</p>


                    <div className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-3">
                        {loading ? (
                            <div className="h-10 w-44 animate-pulse rounded-3xl bg-default" />
                        ) : (
                            <Button
                                size="lg"
                                variant="primary"
                                className="group gap-2 overflow-hidden border border-border px-6 transition-opacity hover:opacity-90"
                                style={{
                                    "--button-bg": "var(--foreground)",
                                    "--button-bg-hover": "var(--foreground)",
                                    "--button-bg-pressed": "var(--foreground)",
                                    "--button-fg": "var(--background)",
                                } as React.CSSProperties}
                                onClick={handlePrimaryCTA}
                            >
                                {/* Shimmer sweep: sits off-canvas at rest, slides fully
                                    across on hover. mix-blend-overlay (rather than a
                                    fixed light/dark color) reads on both the black
                                    (light mode) and near-white (dark mode) button fill
                                    without needing to branch on theme. */}
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 ease-out mix-blend-overlay group-hover:translate-x-full"
                                    style={{
                                        background:
                                            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)",
                                    }}
                                />
                                {!user && <GoogleIcon />}
                                {user ? "Go to dashboard" : "Sign in with Google"}
                            </Button>
                        )}


                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-border py-4">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:text-left">
                    {/* ── Award Ratings Badges in Footer (Left Aligned) ── */}
                    <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
                        {/* Badge 1 */}
                        <div className="flex items-center gap-2">
                            <LaurelStarsIcon />
                            <div className="text-left">
                                <div className="flex items-center gap-1">
                                    <span className="glisten-text text-[11px] font-bold tracking-tight">5.0 RATING</span>
                                    <span className="text-[9px] text-amber-400">★★★★★</span>
                                </div>
                                <p className="text-[9px] font-medium text-foreground/50 uppercase tracking-wider">Top Rated Work Logger</p>
                            </div>
                        </div>

                        {/* Badge 2 */}
                        <div className="flex items-center gap-2">
                            <TrophyBadgeIcon />
                            <div className="text-left">
                                <span className="glisten-text text-[11px] font-bold tracking-tight">#1 GOLD AWARD</span>
                                <p className="text-[9px] font-medium text-foreground/50 uppercase tracking-wider">Best Productivity 2026</p>
                            </div>
                        </div>

                        {/* Badge 3 */}
                        <div className="flex items-center gap-2">
                            <ShieldSealIcon />
                            <div className="text-left">
                                <span className="glisten-text text-[11px] font-bold tracking-tight">VERIFIED SECURE</span>
                                <p className="text-[9px] font-medium text-foreground/50 uppercase tracking-wider">Enterprise Security</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com/JustinMatthewNewman/time-tracker-app"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View source on GitHub"
                            className="text-foreground/50 transition hover:text-foreground"
                        >
                            <LogoGithub className="size-5" aria-hidden />
                        </a>
                        <span className="text-xs text-foreground/50">
                            © {new Date().getFullYear()} Time Tracker Pro. All rights reserved.
                        </span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
