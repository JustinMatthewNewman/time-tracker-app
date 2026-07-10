"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import AuthSection from "./AuthSection";
import { useSidebar } from "@/context/SideBarContext";

import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle, logout } from "@/lib/auth";
import { SearchField } from "@heroui/react";

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
  { label: "Work Logs", href: "/worklogs", authRequired: true },
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
  const { toggle } = useSidebar();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-divider bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Left Side: Sidebar Toggle & Desktop Navigation */}
          <div className="flex items-center gap-3">

            <button
              onClick={toggle}
              className="rounded-md p-2 hover:bg-default-100 transition"
              aria-label="Toggle Sidebar"
            >
              ☰
            </button>

            <nav className="hidden md:flex gap-7 items-center">
              {filteredLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-sm text-foreground/70 hover:bg-default-100 hover:text-foreground transition"
                >
                  {link.label}
                </a>
              ))}

              <SearchField name="search" aria-label="Search">
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input className="w-[280px]" placeholder="Search..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>


            </nav>
          </div>

          {/* Right Side: Theme, Auth, and Mobile Toggle */}
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
              className="md:hidden text-foreground/70 rounded-md p-2 hover:bg-default-100"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle Menu"
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
      className="text-foreground/70 hover:text-foreground transition p-2 rounded-md hover:bg-default-100"
      aria-label="Toggle Theme"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}