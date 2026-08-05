"use client";

import { Button } from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AmbientBackground from "@/components/AmbientBackground";

export default function LandingPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const handlePrimaryCTA = async () => {
        if (user) {
            router.push("/dashboard");
        } else {
            await loginWithGoogle();
            router.push("/worklogs");
        }
    };

    return (
        <main className="
            min-h-screen overflow-hidden relative
            bg-[--bg] text-[--fg]
            transition-colors duration-300
        ">
            {/* ── CSS custom properties for both modes ── */}
            <style>{`
                /* ── Light mode tokens ── */
                :root {
                    --bg:              #f4f3ff;
                    --fg:              #1e1b4b;
                    --fg-muted:        rgba(30,27,75,0.52);
                    --fg-faint:        rgba(30,27,75,0.32);
                    --glass-bg:        rgba(255,255,255,0.55);
                    --glass-bg-hover:  rgba(255,255,255,0.80);
                    --glass-border:    rgba(109,40,217,0.15);
                    --glass-border-hv: rgba(109,40,217,0.35);
                    --pill-bg:         rgba(109,40,217,0.10);
                    --pill-border:     rgba(109,40,217,0.22);
                    --pill-fg:         #6d28d9;
                }

                /* ── Dark mode tokens ── */
                .dark {
                    --bg:              #06060f;
                    --fg:              #ffffff;
                    --fg-muted:        rgba(255,255,255,0.52);
                    --fg-faint:        rgba(255,255,255,0.30);
                    --glass-bg:        rgba(255,255,255,0.04);
                    --glass-bg-hover:  rgba(255,255,255,0.07);
                    --glass-border:    rgba(255,255,255,0.09);
                    --glass-border-hv: rgba(167,139,250,0.35);
                    --pill-bg:         rgba(124,58,237,0.18);
                    --pill-border:     rgba(167,139,250,0.28);
                    --pill-fg:         #a78bfa;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                .fade-up   { animation: fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both; }
                .fade-up-1 { animation-delay: 0.05s; }
                .fade-up-2 { animation-delay: 0.15s; }
                .fade-up-3 { animation-delay: 0.28s; }
                .fade-up-4 { animation-delay: 0.42s; }

                @media (prefers-reduced-motion: reduce) {
                    .fade-up { animation: none !important; }
                }

                .glass-card {
                    background:              var(--glass-bg);
                    border:                  1px solid var(--glass-border);
                    backdrop-filter:         blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-radius:           20px;
                    transition:              border-color .25s, background .25s, transform .25s;
                }
                .glass-card:hover {
                    background:   var(--glass-bg-hover);
                    border-color: var(--glass-border-hv);
                    transform:    translateY(-3px);
                }

                .pill {
                    display:        inline-flex;
                    align-items:    center;
                    gap:            6px;
                    padding:        4px 14px;
                    border-radius:  999px;
                    background:     var(--pill-bg);
                    border:         1px solid var(--pill-border);
                    font-size:      0.78rem;
                    font-weight:    600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color:          var(--pill-fg);
                }

                .btn-primary {
                    background:     linear-gradient(135deg, #7c3aed, #4f46e5);
                    border-radius:  12px;
                    font-weight:    700;
                    letter-spacing: 0.02em;
                    box-shadow:     0 0 0 0 rgba(124,58,237,.5);
                    transition:     box-shadow .25s, transform .2s;
                }
                .btn-primary:hover {
                    box-shadow: 0 0 28px 4px rgba(124,58,237,.45);
                    transform:  translateY(-1px);
                }
                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor:  not-allowed;
                    transform: none;
                }
                .btn-ghost {
                    background:    var(--glass-bg);
                    border:        1px solid var(--glass-border);
                    border-radius: 12px;
                    font-weight:   600;
                    color:         var(--fg);
                    transition:    background .2s, border-color .2s;
                }
                .btn-ghost:hover {
                    background:   var(--glass-bg-hover);
                    border-color: var(--glass-border-hv);
                }

                .stat-bar {
                    height:       3px;
                    border-radius:99px;
                    margin-top:   16px;
                    background:   linear-gradient(90deg, #7c3aed, #0891b2);
                    opacity:      0.5;
                }

                .gradient-divider {
                    height:     1px;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(124,58,237,.4)  30%,
                        rgba(8,145,178,.4)   70%,
                        transparent
                    );
                }

                /* ── Auth bar ── */
                .auth-bar {
                    display:         flex;
                    align-items:     center;
                    gap:             10px;
                    padding:         6px 14px;
                    border-radius:   999px;
                    background:      var(--glass-bg);
                    border:          1px solid var(--glass-border);
                    backdrop-filter: blur(12px);
                    font-size:       0.82rem;
                    color:           var(--fg-muted);
                }
                .auth-avatar {
                    width:         28px;
                    height:        28px;
                    border-radius: 50%;
                    object-fit:    cover;
                    border:        1px solid var(--glass-border-hv);
                }
                .auth-avatar-placeholder {
                    width:           28px;
                    height:          28px;
                    border-radius:   50%;
                    background:      linear-gradient(135deg, #7c3aed, #4f46e5);
                    display:         flex;
                    align-items:     center;
                    justify-content: center;
                    font-size:       0.7rem;
                    font-weight:     700;
                    color:           white;
                }
                .btn-logout {
                    background:    none;
                    border:        none;
                    cursor:        pointer;
                    color:         var(--fg-faint);
                    font-size:     0.78rem;
                    padding:       2px 6px;
                    border-radius: 6px;
                    transition:    color .2s;
                }
                .btn-logout:hover { color: var(--fg); }

                /* ── Loading skeleton pulse ── */
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50%       { opacity: 0.8; }
                }
                .skeleton {
                    border-radius: 12px;
                    background:    var(--glass-bg);
                    animation:     pulse 1.4s ease-in-out infinite;
                }
            `}</style>

            <AmbientBackground />

            {/* ── Hero ── */}
            <section className="relative z-10 container mx-auto flex flex-col items-center justify-center px-6 py-24 text-center">
                <div className="pill fade-up fade-up-1 mb-6">
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                        <circle cx="3.5" cy="3.5" r="3.5" fill="var(--pill-fg)" />
                    </svg>
                    Now in open beta
                </div>

                <h1
                    className="fade-up fade-up-2 max-w-4xl text-5xl md:text-7xl font-black leading-[1.05]"
                    style={{ letterSpacing: "-0.03em", color: "var(--fg)" }}
                >
                    Track Your Time.
                    <span
                        className="block"
                        style={{
                            background: "linear-gradient(120deg, #a78bfa 0%, #60a5fa 50%, #34d399 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Own Your Day.
                    </span>
                </h1>

                <p
                    className="fade-up fade-up-3 mt-7 max-w-xl text-lg leading-relaxed"
                    style={{ color: "var(--fg-muted)" }}
                >
                    Precision time-tracking for tickets, projects, and work logs.
                    Built for engineers who care about where every hour goes.
                </p>

                <div className="fade-up fade-up-4 mt-10 flex flex-wrap gap-3 justify-center">
                    {loading ? (
                        <div className="skeleton w-44 h-12" />
                    ) : (
                        <>
                            <Button
                                size="lg"
                                className="btn-primary px-8 text-white"
                                onClick={handlePrimaryCTA}
                            >
                                {user ? "Go to Dashboard →" : "Get Started Free"}
                            </Button>
                        </>
                    )}
                </div>

                <p className="mt-8 text-sm fade-up fade-up-4" style={{ color: "var(--fg-faint)" }}>
                    Trusted by 12,000+ engineers at 800+ companies
                </p>
            </section>

            {/* ── Feature Cards ── */}
            <section className="relative z-10 container mx-auto px-6 pb-24">
                <div className="grid gap-5 md:grid-cols-3">

                    <div className="glass-card p-7">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                            style={{ background: "rgba(124,58,237,0.14)", border: "1px solid rgba(167,139,250,0.22)" }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <rect x="2" y="4" width="16" height="13" rx="2" stroke="#a78bfa" strokeWidth="1.6" />
                                <path d="M6 2v4M14 2v4M2 9h16" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Ticket Tracking</h3>
                        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                            Log hours directly against JIRA, Linear, or GitHub issues with one click.
                        </p>
                        <div className="stat-bar" style={{ width: "72%" }} />
                    </div>

                    <div className="glass-card p-7">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                            style={{ background: "rgba(8,145,178,0.12)", border: "1px solid rgba(103,232,249,0.2)" }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M3 14l4-5 3 3 3-4 4 6" stroke="#67e8f9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="1" y="1" width="18" height="18" rx="3" stroke="#67e8f9" strokeWidth="1.6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Daily Reports</h3>
                        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                            Generate shareable summaries for standups or timesheets in a single keystroke.
                        </p>
                        <div className="stat-bar" style={{ width: "88%", background: "linear-gradient(90deg, #0891b2, #6d28d9)" }} />
                    </div>

                    <div className="glass-card p-7">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                            style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.2)" }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="8" stroke="#34d399" strokeWidth="1.6" />
                                <path d="M10 5v5l3 3" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold" style={{ color: "var(--fg)" }}>Analytics</h3>
                        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                            Visualize focus time vs meetings, spot patterns, and reclaim lost hours.
                        </p>
                        <div className="stat-bar" style={{ width: "60%", background: "linear-gradient(90deg, #34d399, #0891b2)" }} />
                    </div>
                </div>
            </section>

            {/* ── CTA Footer ── */}
            <div className="gradient-divider relative z-10 mx-6" />
            <section className="relative z-20 py-20">
                <div className="container mx-auto px-6 text-center">
                    {!user && <p className="pill mx-auto mb-5">No credit card required</p>}

                    <h2
                        className="text-4xl md:text-5xl font-black tracking-tight"
                        style={{ letterSpacing: "-0.02em", color: "var(--fg)" }}
                    >
                        {user ? "Welcome back 👋" : "Ready to start tracking?"}
                    </h2>

                    <p className="mt-4 text-base" style={{ color: "var(--fg-muted)" }}>
                        {user
                            ? `Logged in as ${user.email}. Head to your dashboard to pick up where you left off.`
                            : "Join thousands of engineers managing their time with precision."
                        }
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3 justify-center">
                        {loading ? (
                            <div className="skeleton w-52 h-12" />
                        ) : (
                            <>
                                <Button
                                    size="lg"
                                    className="btn-primary px-8 text-white"
                                    onClick={handlePrimaryCTA}
                                >
                                    {user ? "Go to Dashboard →" : "Continue with Google"}
                                </Button>
                                {user && (
                                    <Button
                                        size="lg"
                                        className="btn-ghost px-8"
                                        onClick={logout}
                                    >
                                        Sign out
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}