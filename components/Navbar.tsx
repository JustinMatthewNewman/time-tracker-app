"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { House, ClockFill, Ticket, Person, Gear } from "@gravity-ui/icons";
import AuthSection from "./AuthSection";

import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle, logout } from "@/lib/auth";
import { GlobalSearch } from "@/components/Search/GlobalSearch";
import { usePerformanceMode } from "@/context/PerformanceModeContext";

// ─────────────────────────────────────────────
// Nav Links
// ─────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
  icon: typeof House;
  authRequired?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", icon: House, authRequired: true },
  { label: "Work Logs", href: "/worklogs", icon: ClockFill, authRequired: true },
  { label: "Tickets", href: "/tickets", icon: Ticket, authRequired: true },
  { label: "Profile", href: "/profile", icon: Person, authRequired: true },
  { label: "Settings", href: "/settings", icon: Gear, authRequired: true },
];

// ─────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ─────────────────────────────────────────────
// Brand
// ─────────────────────────────────────────────

function Brand({ href, className = "" }: { href: string; className?: string }) {
  return (
    <a href={href} className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <ClockFill className="size-4" aria-hidden />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-semibold text-foreground">Time Tracker</span>
        <span className="text-xs text-foreground/50">Pro</span>
      </span>
    </a>
  );
}

// ─────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────

export default function AppNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { performanceMode } = usePerformanceMode();

  const handleLogin = async () => {
    await loginWithGoogle();
    router.push("/worklogs");
  };

  const handleAction = async (key: string) => {
    if (key === "logout") return logout();

    const routes: Record<string, string> = {
      dashboard: "/dashboard",
      worklogs: "/worklogs",
      settings: "/settings",
      profile: "/profile",
    };

    const route = routes[key];
    if (route) router.push(route);
  };

  const filteredLinks = NAV_LINKS.filter((link) => {
    if (!link.authRequired) return true;
    return !!user;
  });

  const isLinkActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // Whether to visually group the theme toggle with the auth control in a
  // shared pill — only once AuthSection is rendering an avatar or its
  // loading skeleton, not the signed-out Sign in/Get started CTA buttons,
  // which read better as standalone buttons than boxed into a utility pill.
  const showUtilityPill = loading || !!user;

  return (
    <header
      data-glass={performanceMode ? undefined : "surface"}
      className={`sticky top-0 z-50 w-full border-b border-border ${
        // Translucent + blurred normally, driven by the Settings page's
        // card opacity/blur sliders via data-glass (see globals.css).
        // Performance mode drops both instead — a see-through header with
        // no blur just looks like a rendering glitch — by omitting
        // data-glass entirely rather than relying on backdrop-filter's
        // perf-mode override alone, which only zeroes the blur, not the
        // translucency.
        performanceMode ? "bg-background" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Row 1: Brand (left) + search (desktop only — it lives in the
            drawer on mobile instead). The mobile menu toggle sits on top
            via absolute positioning so it doesn't disturb this row's flex
            flow. */}
        <div className="relative flex h-14 items-center gap-4">
          <Brand href={user ? "/worklogs" : "/"} />

          {user && (
            <div className="hidden md:flex flex-1 justify-center translate-y-[2px]">
              <GlobalSearch />
            </div>
          )}

          <button
            className="md:hidden absolute right-0 rounded-full p-2 text-foreground/70 hover:bg-default"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Row 2: Nav tabs (left), utility pill (right) */}
        <div className="hidden md:flex h-14 items-center justify-between gap-4">
          <nav className="flex items-center gap-1 -ml-4 sm:-ml-6 lg:-ml-8">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-foreground text-foreground"
                      : "border-transparent text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {showUtilityPill ? (
              <div className="flex items-center gap-1 rounded-full border border-border p-1">
                <ThemeToggle />
                <span className="h-4 w-px bg-border" aria-hidden />
                <AuthSection
                  user={user}
                  loading={loading}
                  onLogin={handleLogin}
                  onAction={handleAction}
                />
              </div>
            ) : (
              <>
                <ThemeToggle />
                <AuthSection
                  user={user}
                  loading={loading}
                  onLogin={handleLogin}
                  onAction={handleAction}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav — row 2's content collapses in here since it's hidden
          on mobile, plus the utility controls that would otherwise have no
          home outside row 2. */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3">
          {user && (
            <div className="pb-3">
              <GlobalSearch />
            </div>
          )}

          <nav className="flex flex-col">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-default ${
                    active ? "text-foreground" : "text-foreground/70"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <ThemeToggle />
            <AuthSection
              user={user}
              loading={loading}
              onLogin={handleLogin}
              onAction={handleAction}
            />
          </div>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────
// Theme Toggle
// ─────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full p-2 text-foreground/70 transition hover:bg-default hover:text-foreground"
      aria-label="Toggle Theme"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
