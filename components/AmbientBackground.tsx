"use client";

// Shared ambient blob/dot-grid layer used behind page content.
// Only visible in dark mode, matching the landing page's original design.
export default function AmbientBackground() {
    return (
        <>
            <style>{`
                :root {
                    --vignette:        #f4f3ff;
                    --dot-color:       rgba(0,0,0,0.07);
                    --orb1-opacity:    0.30;
                    --orb2-opacity:    0.25;
                    --orb3-opacity:    0.20;
                    --orb4-opacity:    0.22;
                    --orb5-opacity:    0.18;
                }

                .dark {
                    --vignette:        #06060f;
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

            <div className="pointer-events-none ambient-bg fixed inset-0 z-0" aria-hidden="true">
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

                    <circle cx="15%" cy="20%" r="380" fill="#7c3aed" filter="url(#blob-blur)"
                        style={{ opacity: "var(--orb1-opacity)", animation: "drift1 18s ease-in-out infinite alternate" }} />
                    <circle cx="80%" cy="10%" r="320" fill="#4f46e5" filter="url(#blob-blur)"
                        style={{ opacity: "var(--orb2-opacity)", animation: "drift2 22s ease-in-out infinite alternate" }} />
                    <circle cx="70%" cy="55%" r="280" fill="#0891b2" filter="url(#blob-blur)"
                        style={{ opacity: "var(--orb3-opacity)", animation: "drift3 26s ease-in-out infinite alternate" }} />
                    <circle cx="20%" cy="80%" r="350" fill="#a21caf" filter="url(#blob-blur)"
                        style={{ opacity: "var(--orb4-opacity)", animation: "drift4 20s ease-in-out infinite alternate" }} />
                    <circle cx="50%" cy="45%" r="160" fill="#6d28d9" filter="url(#blob-blur)"
                        style={{ opacity: "var(--orb5-opacity)", animation: "drift5 14s ease-in-out infinite alternate" }} />

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
