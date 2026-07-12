"use client";

// Shared ambient blob/dot-grid layer used behind page content.
// Only visible in dark mode, matching the landing page's original design.
type AmbientBackgroundProps = {
    // Multiplier applied to every orb's opacity, e.g. 0.9 = 10% dimmer.
    intensity?: number;
};

export default function AmbientBackground({ intensity = 1 }: AmbientBackgroundProps) {
    return (
        <>
            <style>{`
                :root {
                    /* Tied to the active color scheme (see DbThemeApplier) rather
                       than a fixed hex, so the ambient glow re-themes with it. */
                    --vignette:        var(--background);
                    --dot-color:       rgba(0,0,0,0.07);
                    --orb1-opacity:    0.30;
                    --orb2-opacity:    0.25;
                    --orb3-opacity:    0.20;
                    --orb4-opacity:    0.22;
                    --orb5-opacity:    0.18;
                }

                .dark {
                    --dot-color:       rgba(255,255,255,0.07);
                    --orb1-opacity:    0.55;
                    --orb2-opacity:    0.45;
                    --orb3-opacity:    0.35;
                    --orb4-opacity:    0.40;
                    --orb5-opacity:    0.30;
                }

                .ambient-bg { display: none; }
                .dark .ambient-bg { display: block; }

                @keyframes drift1 {
                    0%   { transform: translate(0px,   0px)  scale(1);    }
                    100% { transform: translate(60px,  80px) scale(1.12); }
                }
                @keyframes drift2 {
                    0%   { transform: translate(0px,  0px)  scale(1);    }
                    100% { transform: translate(-80px,60px) scale(0.92); }
                }
                @keyframes drift3 {
                    0%   { transform: translate(0px,   0px)   scale(1);    }
                    100% { transform: translate(-50px,-70px)  scale(1.08); }
                }
                @keyframes drift4 {
                    0%   { transform: translate(0px, 0px)   scale(1);    }
                    100% { transform: translate(70px,-50px) scale(1.15); }
                }
                @keyframes drift5 {
                    0%   { transform: translate(0px,0px)   scale(1);    }
                    100% { transform: translate(-30px,40px) scale(0.88); }
                }

                @media (prefers-reduced-motion: reduce) {
                    circle { animation: none !important; }
                }
            `}</style>

            <div
                className="pointer-events-none ambient-bg fixed inset-0 z-0"
                aria-hidden="true"
                style={{ "--intensity": intensity } as React.CSSProperties}
            >
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <filter id="blob-blur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="80" result="blur" />
                        </filter>
                        <filter id="noise" x="0%" y="0%" width="100%" height="100%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.65"
                                numOctaves="3" stitchTiles="stitch" result="noise" />
                            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
                            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
                            <feComposite in="blended" in2="SourceGraphic" operator="in" />
                        </filter>
                        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="100%" stopColor="var(--vignette)" />
                        </radialGradient>
                    </defs>

                    {/*
                        All five orbs are the theme's --accent color; hue-rotate gives
                        them variety without hardcoding hex values that would clash
                        once a color scheme other than the original purple is picked.
                    */}
                    <circle cx="15%" cy="20%" r="380" fill="var(--accent)"
                        style={{ filter: "url(#blob-blur) hue-rotate(0deg)", opacity: "calc(var(--orb1-opacity) * var(--intensity))", animation: "drift1 18s ease-in-out infinite alternate" }} />
                    <circle cx="80%" cy="10%" r="320" fill="var(--accent)"
                        style={{ filter: "url(#blob-blur) hue-rotate(-30deg)", opacity: "calc(var(--orb2-opacity) * var(--intensity))", animation: "drift2 22s ease-in-out infinite alternate" }} />
                    <circle cx="70%" cy="55%" r="280" fill="var(--accent)"
                        style={{ filter: "url(#blob-blur) hue-rotate(45deg)", opacity: "calc(var(--orb3-opacity) * var(--intensity))", animation: "drift3 26s ease-in-out infinite alternate" }} />
                    <circle cx="20%" cy="80%" r="350" fill="var(--accent)"
                        style={{ filter: "url(#blob-blur) hue-rotate(-50deg)", opacity: "calc(var(--orb4-opacity) * var(--intensity))", animation: "drift4 20s ease-in-out infinite alternate" }} />
                    <circle cx="50%" cy="45%" r="160" fill="var(--accent)"
                        style={{ filter: "url(#blob-blur) hue-rotate(20deg)", opacity: "calc(var(--orb5-opacity) * var(--intensity))", animation: "drift5 14s ease-in-out infinite alternate" }} />

                    <rect x="0" y="0" width="100%" height="100%"
                        fill="transparent" filter="url(#noise)" opacity="0.04" />
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#vignette)" />
                </svg>

                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle, var(--dot-color) 1px, transparent 1px)`,
                        backgroundSize: "36px 36px",
                        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
                    }}
                />
            </div>
        </>
    );
}
