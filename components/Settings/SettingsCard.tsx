"use client";

import { Card, Switch, Button, Tooltip } from '@heroui/react'
import { useTheme } from 'next-themes'
import TimeRangeSettings from '../TimeRangeSettings'
import { useEffect, useState } from 'react'
import { useThemeSelection, getVariant } from '@/context/ThemeSelectionContext'
import { usePerformanceMode } from '@/context/PerformanceModeContext'
import {
  Gear,
  Bell,
  Sun,
  Moon,
  Paintbrush,
  Thunderbolt,
  CircleInfo,
  ShieldKeyhole,
  ArrowUpRightFromSquare,
  TrashBin,
} from '@gravity-ui/icons'

const APP_VERSION = "1.0.0";

function SettingsCard() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoBreakReminder, setAutoBreakReminder] = useState(true)
  const { resolvedTheme, setTheme } = useTheme()
  const { schemes, selectedScheme, selectScheme, clearScheme } = useThemeSelection()
  const { performanceMode, setPerformanceMode } = usePerformanceMode()

  // next-themes only knows the real theme after mount (it reads from
  // localStorage/media query client-side), so the switch stays hidden
  // until then to avoid a flash of the wrong state.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Gear className="size-6" /> Settings
        </h1>
        <p className="mt-1 text-sm text-foreground/60">Customize your time tracking experience</p>
      </div>

      {/* Working Hours
      <TimeRangeSettings /> */}

      {/* Notifications */}
      {/* <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Bell className="size-4" /> Notifications
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-default-100 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Enable notifications</p>
              <p className="text-xs text-foreground/60">Get reminders for your time entries</p>
            </div>
            <Switch
              isSelected={notificationsEnabled}
              onChange={setNotificationsEnabled}
              aria-label="Enable notifications"
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Content>
            </Switch>
          </div>

          {notificationsEnabled && (
            <div className="ml-4 flex items-center justify-between gap-4 rounded-lg bg-default-100 p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Break reminders</p>
                <p className="text-xs text-foreground/60">Remind me to take breaks every 2 hours</p>
              </div>
              <Switch
                isSelected={autoBreakReminder}
                onChange={setAutoBreakReminder}
                aria-label="Break reminders"
              >
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            </div>
          )}
        </div>
      </Card> */}

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          {resolvedTheme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />} Appearance
        </h2>
        <div className="flex items-center justify-between gap-4 rounded-lg bg-default-100 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Dark mode</p>
            <p className="text-xs text-foreground/60">Switch between light and dark themes</p>
          </div>
          {mounted && (
            <Switch
              isSelected={resolvedTheme === "dark"}
              onChange={(isDark) => setTheme(isDark ? "dark" : "light")}
              aria-label="Dark mode"
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Content>
            </Switch>
          )}
        </div>

        {schemes.length > 0 && (
          <div className="mt-3 rounded-lg bg-default-100 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Paintbrush className="size-4" />
              <p className="text-sm font-medium text-foreground">Color theme</p>
            </div>
            <p className="mb-3 text-xs text-foreground/60">
              Each scheme has its own light and dark look — the switch above still toggles between them.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                key="__default"
                variant={selectedScheme === null ? "primary" : "outline"}
                size="sm"
                onPress={() => clearScheme()}
              >
                Default
              </Button>
              {schemes.map((scheme) => {
                const previewVariant = getVariant(scheme, resolvedTheme === "dark") ?? scheme.variants[0];
                return (
                  <Tooltip key={scheme.id}>
                    <Tooltip.Trigger>
                      <Button
                        variant={selectedScheme?.id === scheme.id ? "primary" : "outline"}
                        size="sm"
                        onPress={() => selectScheme(scheme.id)}
                      >
                        <span
                          className="size-3 rounded-full border-2"
                          style={{
                            backgroundColor: previewVariant?.background,
                            borderColor: previewVariant?.accent,
                          }}
                        />
                        {scheme.name}
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      {scheme.name} · {resolvedTheme === "dark" ? "Dark" : "Light"} variant
                    </Tooltip.Content>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-4 rounded-lg bg-default-100 p-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Thunderbolt className="size-4" /> Performance mode
            </p>
            <p className="text-xs text-foreground/60">
              Turns off animated backgrounds and blur effects for a smoother, less CPU-intensive
              experience on older devices.
            </p>
          </div>
          <Switch
            isSelected={performanceMode}
            onChange={setPerformanceMode}
            aria-label="Performance mode"
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>
      </Card>

      {/* Data & Privacy (mocked) */}
      {/* <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ShieldKeyhole className="size-4" /> Data & Privacy
        </h2>
        <div className="flex flex-wrap gap-2">
          <Tooltip>
            <Tooltip.Trigger>
              <Button variant="outline">
                <ArrowUpRightFromSquare /> Export my data
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Coming soon</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger>
              <Button variant="danger-soft">
                <TrashBin /> Delete account
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Coming soon</Tooltip.Content>
          </Tooltip>
        </div>
      </Card> */}

      {/* About */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <CircleInfo className="size-4" /> About
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-default-100 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">App Version</p>
            <p className="mt-1 font-mono text-sm text-foreground">{APP_VERSION}</p>
          </div>
          <div className="rounded-lg bg-default-100 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Last Updated</p>
            <p className="mt-1 text-sm text-foreground">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SettingsCard
