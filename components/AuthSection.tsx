"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Dropdown, Skeleton, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { ArrowRightFromSquare, Gear, Moon, Paintbrush, Person, Sun } from "@gravity-ui/icons";

// Just the fields this component reads. Deliberately structural rather than
// Firebase's User: the signed-out state passes null, and widening it to the
// full SDK type would make every caller import firebase/auth for a photo URL.
interface AvatarUser {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

// ─────────────────────────────────────────────
// Auth Section
// ─────────────────────────────────────────────

/**
 * The avatar and the account menu behind it.
 *
 * The menu is in two halves on purpose. Navigation (Profile / Settings /
 * Appearance / Sign out) are menu items, because each one takes you somewhere
 * and dismissing the menu afterwards is right. The light/dark control is a
 * segmented toggle below them instead, *outside* the menu: it is a setting
 * rather than a destination, so it has to show its current state and survive
 * being used — a menu item would close the menu on every press and give no
 * indication of which mode is active.
 */
function AuthSection({
  user,
  loading,
  onLogin,
  onAction,
}: {
  user: AvatarUser | null;
  loading: boolean;
  onLogin: () => Promise<unknown>;
  onAction: (key: string) => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes only knows the real theme after mount (it reads localStorage
  // and the media query client-side), so the toggle is withheld until then
  // rather than flashing the wrong selection — same guard as SettingsCard's.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (loading) {
    return <Skeleton className="w-8 h-8 rounded-full" />;
  }

  if (!user) {
    return <div className="flex gap-2" />;
  }

  const label = user.displayName ?? user.email ?? "Account";

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt="avatar"
              className="h-7 w-7 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-default-200 flex items-center justify-center text-xs">
              {label[0].toUpperCase()}
            </div>
          )}

          <span className="hidden sm:block">{label}</span>
        </div>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end" className="min-w-60">
        {/* Identity block, rendered outside Dropdown.Menu so it isn't a
            focusable menu item — it is a caption for the menu, not an action.
            Worth showing: the Google account signed in here can differ from
            the one the calendar integration writes to, and this is the only
            place the active one is named on every page. */}
        <div className="border-b border-border px-3 py-2.5">
          <p className="truncate text-sm font-medium text-foreground">
            {user.displayName ?? "Signed in"}
          </p>
          {user.email && <p className="truncate text-xs text-foreground/50">{user.email}</p>}
        </div>

        <Dropdown.Menu onAction={(key) => onAction(String(key))}>
          <Dropdown.Item id="profile" textValue="Profile">
            <Person className="size-4 shrink-0" aria-hidden /> Profile
          </Dropdown.Item>
          <Dropdown.Item id="settings" textValue="Settings">
            <Gear className="size-4 shrink-0" aria-hidden /> Settings
          </Dropdown.Item>
          {/* Same destination as Settings today — the appearance controls
              (color scheme, card opacity, borders, corners) are the first
              section of that page. It is listed separately because it is what
              people are actually looking for when they open this menu, and a
              single "Settings" entry buries it. */}
          <Dropdown.Item id="appearance" textValue="Appearance">
            <Paintbrush className="size-4 shrink-0" aria-hidden /> Appearance
          </Dropdown.Item>
          <Dropdown.Item id="logout" textValue="Sign out">
            <ArrowRightFromSquare className="size-4 shrink-0" aria-hidden /> Sign out
          </Dropdown.Item>
        </Dropdown.Menu>

        {mounted && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
            <span className="text-xs text-foreground/50">Theme</span>
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
                <Sun className="size-3.5" aria-hidden />
              </ToggleButton>
              <ToggleButton id="dark" isIconOnly aria-label="Dark theme">
                <Moon className="size-3.5" aria-hidden />
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        )}
      </Dropdown.Popover>
    </Dropdown>
  );
}

export default AuthSection;
