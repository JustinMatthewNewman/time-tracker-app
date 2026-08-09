"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { Button, ToggleButtonGroup, ToggleButton } from "@heroui/react";
import {
  House,
  ClockFill,
  Ticket,
  Person,
  Gear,
  Calendar,
  ChartLine,
  ChevronDown,
  Persons,
  CreditCard,
  Rocket,
  Shield,
  Book,
  FileText,
  PlugConnection,
} from "@gravity-ui/icons";
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

const SunIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
  </svg>
);

const MoonIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ─────────────────────────────────────────────
// Marketing mega-menus (signed-out nav only)
// ─────────────────────────────────────────────

interface MegaMenuItem {
  icon: typeof House;
  title: string;
  description: string;
  // Renders a "Soon" badge next to the title — for capabilities the app
  // doesn't actually have yet, so the panel never overclaims. Only Features
  // (all shipped) and Pricing's Free tier (real, matches the hero's "no
  // credit card required" copy) omit this.
  comingSoon?: boolean;
}

interface MegaMenuDef {
  label: string;
  heading: string;
  description: string;
  items: MegaMenuItem[];
}

// Mirrors the three highlights that used to live in the landing page's
// Features section — reused here as descriptive rows rather than links,
// since the app has no standalone page per feature to send visitors to.
const MEGA_MENUS: MegaMenuDef[] = [
  {
    label: "Features",
    heading: "Everything you need to stay on track",
    description: "No spreadsheets, no guesswork — just a fast, precise record of where your day went.",
    items: [
      {
        icon: Ticket,
        title: "Ticket Tracking",
        description: "Log hours directly against JIRA, Linear, or GitHub issues with one click.",
      },
      {
        icon: Calendar,
        title: "Daily Reports",
        description: "Generate shareable summaries for standups or timesheets in a single keystroke.",
      },
      {
        icon: ChartLine,
        title: "Analytics",
        description: "Visualize focus time vs meetings, spot patterns, and reclaim lost hours.",
      },
    ],
  },
  {
    label: "Admin",
    heading: "Manage your whole team",
    description:
      "A dedicated admin dashboard for teams — invite people, assign roles, and see usage across your org.",
    items: [
      {
        icon: Persons,
        title: "Team Roles & Permissions",
        description: "Invite teammates and control who can view or edit each project.",
        comingSoon: true,
      },
      {
        icon: ChartLine,
        title: "Team Usage Insights",
        description: "See hours logged across your whole team at a glance.",
        comingSoon: true,
      },
      {
        icon: CreditCard,
        title: "Centralized Billing",
        description: "One invoice for your whole team instead of per-seat billing.",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Pricing",
    heading: "Simple, transparent pricing",
    description: "Time Tracker Pro is free during the open beta. Paid plans are on the way.",
    items: [
      {
        icon: Rocket,
        title: "Free",
        description: "Full access during the open beta — no credit card required.",
      },
      {
        icon: Persons,
        title: "Team",
        description: "Shared billing and centralized admin controls.",
        comingSoon: true,
      },
      {
        icon: Shield,
        title: "Enterprise",
        description: "SSO, audit logs, and dedicated support.",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Docs",
    heading: "Guides & reference",
    description: "Documentation is on the way — for now, sign in and explore the app directly.",
    items: [
      {
        icon: Book,
        title: "Getting Started",
        description: "A quick tour of tickets, work logs, and time entries.",
        comingSoon: true,
      },
      {
        icon: FileText,
        title: "API Reference",
        description: "Programmatic access to your time tracking data.",
        comingSoon: true,
      },
      {
        icon: PlugConnection,
        title: "Integrations",
        description: "Connect JIRA, Linear, and GitHub to your workflow.",
        comingSoon: true,
      },
    ],
  },
];

function MarketingNav({ onSignIn }: { onSignIn: () => void }) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // A short delay on close (not on open) so moving the cursor from a trigger
  // down into the panel — or sideways into another trigger — doesn't close
  // it the instant it leaves the trigger's own hitbox.
  const cancelHide = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };
  const show = (label: string) => {
    cancelHide();
    setOpenLabel(label);
  };
  const scheduleHide = () => {
    closeTimeout.current = setTimeout(() => setOpenLabel(null), 150);
  };

  useEffect(() => {
    if (!openLabel) return;

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenLabel(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenLabel(null);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openLabel]);

  const activeMenu = MEGA_MENUS.find((menu) => menu.label === openLabel);

  return (
    // No `relative` here — deliberately left as a static-positioned box so
    // the panel below (which needs to be positioned relative to the header,
    // not this row of triggers) skips it while walking up the
    // containing-block chain and lands on the header itself (position:
    // sticky further up still counts as positioned). That's what lets
    // `inset-x-0` below span the header's full width. `onMouseLeave` here
    // (rather than per-trigger) only fires once the cursor leaves the whole
    // nav+panel area — moving between triggers re-fires each one's
    // `onMouseEnter` instead, swapping `openLabel` instantly with no flicker
    // since every menu shares this one panel. `h-full` matters too: the
    // trigger row is vertically centered in the header's h-14, so without
    // this the container's own hit-box would only be as tall as the button
    // text — leaving a dead strip below it (before the panel starts at the
    // header's bottom edge) where the cursor briefly isn't over any
    // descendant of this container, firing a real mouseleave mid-transition
    // into the panel. `onMouseEnter={cancelHide}` is the backstop for that
    // same gap in case anything still slips through it.
    <div ref={containerRef} className="flex h-full items-center" onMouseEnter={cancelHide} onMouseLeave={scheduleHide}>
      <nav className="flex items-center gap-1">
        {MEGA_MENUS.map((menu) => (
          <button
            key={menu.label}
            type="button"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
              openLabel === menu.label
                ? "bg-default text-foreground"
                : "text-foreground/70 hover:bg-default hover:text-foreground"
            }`}
            aria-expanded={openLabel === menu.label}
            onMouseEnter={() => show(menu.label)}
            onClick={() => setOpenLabel((p) => (p === menu.label ? null : menu.label))}
          >
            {menu.label}
            <ChevronDown
              className={`size-3.5 transition-transform ${openLabel === menu.label ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        ))}
      </nav>

      {activeMenu && (
        <div className="absolute inset-x-0 top-full z-50 rounded-b-2xl border-x border-b border-border bg-overlay shadow-lg">
          <div className="px-4 py-6 sm:px-6 md:w-2/3 lg:px-8">
            <div className="grid grid-cols-[1fr_1.3fr] gap-2">
              <div className="flex flex-col justify-between rounded-xl bg-default-100 p-5">
                <div>
                  <h3 className="text-base font-medium text-foreground">{activeMenu.heading}</h3>
                  <p className="mt-2 text-sm text-foreground/60">{activeMenu.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4 w-fit"
                  onClick={() => {
                    setOpenLabel(null);
                    onSignIn();
                  }}
                >
                  Get started
                </Button>
              </div>

              <div className="flex flex-col gap-1 p-1">
                {activeMenu.items.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-lg p-3 transition hover:bg-default"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <item.icon className="size-4" aria-hidden />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {item.title}
                        {item.comingSoon && (
                          <span className="rounded-full bg-default px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-foreground/50 uppercase">
                            Soon
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-foreground/55">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Brand
// ─────────────────────────────────────────────

function Brand({ href, className = "" }: { href: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
        <ClockFill className="size-4" aria-hidden />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-semibold text-foreground">Time Tracker</span>
        <span className="text-xs text-foreground/50">Pro</span>
      </span>
    </Link>
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

  // Signed-out visitors (the landing page) have no nav links to show — every
  // NAV_LINKS entry is authRequired — so the two-row layout below would
  // render a second row containing nothing but the Sign in/Get started
  // buttons. Collapse to a single row in that case instead of shipping an
  // empty tab strip.
  const hasNavLinks = filteredLinks.length > 0;

  // Signing out (or in) flips `hasNavLinks`, swapping which branch below
  // renders the header. The mobile menu block further down is a sibling of
  // that branch gated only by `menuOpen`, so leaving it open across the flip
  // left a stale copy on screen alongside the newly-rendered branch's own
  // controls — doubling up ThemeToggle/AuthSection until manually closed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [hasNavLinks]);

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
        {loading ? (
          // Auth hasn't resolved yet — render a neutral shell instead of
          // committing to either the signed-out marketing header or the
          // authenticated tab strip. Picking either one here is what causes
          // the wrong nav to flash before flipping once `user` is known.
          <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-4">
            <Brand href="/" />
            <div />
            <div className="flex shrink-0 items-center gap-3">
              <ThemeToggle />
              <AuthSection
                user={user}
                loading={loading}
                onLogin={handleLogin}
                onAction={handleAction}
              />
            </div>
          </div>
        ) : !hasNavLinks ? (
          <div className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-4">
            <Brand href="/" />
            <div className="hidden self-stretch md:block">
              <MarketingNav onSignIn={handleLogin} />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <ThemeToggle />
              <AuthSection
                user={user}
                loading={loading}
                onLogin={handleLogin}
                onAction={handleAction}
              />
            </div>
          </div>
        ) : (
          <>
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
                <Link
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
                </Link>
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
          </>
        )}
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
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-default ${
                    active ? "text-foreground" : "text-foreground/70"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {link.label}
                </Link>
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
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <ToggleButtonGroup
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[resolvedTheme ?? "light"]}
      onSelectionChange={(keys) => {
        const next = Array.from(keys)[0];
        if (typeof next === "string") setTheme(next);
      }}
      size="sm"
      aria-label="Theme"
    >
      <ToggleButton id="light" isIconOnly aria-label="Light theme">
        <SunIcon size={14} />
      </ToggleButton>
      <ToggleButton id="dark" isIconOnly aria-label="Dark theme">
        <MoonIcon size={14} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
