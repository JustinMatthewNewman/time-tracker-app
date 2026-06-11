"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Button,
  Dropdown,
  Skeleton,
} from "@heroui/react";

import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle, logout } from "@/lib/auth";

// ─────────────────────────────────────────────
// Nav Links
// ─────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
  authRequired?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", authRequired: true },
  { label: "Profile", href: "/profile", authRequired: true },
  { label: "Settings", href: "/settings", authRequired: true },
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
// Navbar
// ─────────────────────────────────────────────

export default function AppNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleAction = async (key: string) => {
    if (key === "logout") return logout();

    const routes: Record<string, string> = {
      dashboard: "/dashboard",
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-2">
            {filteredLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-foreground/70 hover:bg-default-100 hover:text-foreground transition"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <AuthSection
              user={user}
              loading={loading}
              onLogin={loginWithGoogle}
              onAction={handleAction}
            />

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-foreground/70"
              onClick={() => setMenuOpen((p) => !p)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-divider bg-background px-4 py-2">
          {filteredLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-default-100"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────
// Auth Section
// ─────────────────────────────────────────────

function AuthSection({
  user,
  loading,
  onLogin,
  onAction,
}: {
  user: any;
  loading: boolean;
  onLogin: () => Promise<any>;
  onAction: (key: string) => void;
}) {
  if (loading) {
    return <Skeleton className="w-8 h-8 rounded-full" />;
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button size="sm" onPress={onLogin}>
          Sign in
        </Button>
        <Button size="sm" onPress={onLogin}>
          Get started
        </Button>
      </div>
    );
  }

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="h-7 w-7 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-default-200 flex items-center justify-center text-xs">
              {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
            </div>
          )}

          <span className="hidden sm:block">
            {user.displayName ?? user.email}
          </span>
        </div>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu onAction={(key) => onAction(String(key))}>
          {/* <Dropdown.Item id="profile">Profile</Dropdown.Item>
          <Dropdown.Item id="dashboard">Dashboard</Dropdown.Item>
          <Dropdown.Item id="settings">Settings</Dropdown.Item> */}
          <Dropdown.Item id="logout">Sign out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
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
      className="text-foreground/70 hover:text-foreground transition"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}