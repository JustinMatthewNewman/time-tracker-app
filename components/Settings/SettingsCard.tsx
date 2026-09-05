"use client";

import { Card, Switch, Button, Tooltip, Slider, TextField, Input, Label } from '@heroui/react'
import { useTheme } from 'next-themes'
import TimeRangeSettings from '../TimeRangeSettings'
import GoogleCalendarCard from './GoogleCalendarCard'
import { useEffect, useState } from 'react'
import { useThemeSelection, getVariant } from '@/context/ThemeSelectionContext'
import { usePerformanceMode } from '@/context/PerformanceModeContext'
import { useBackgroundOpacity } from '@/context/BackgroundOpacityContext'
import { useCardStyle } from '@/context/CardStyleContext'
import { useBorders } from '@/context/BordersContext'
import { useUserSettings } from '@/context/UserSettingsContext'
import { useSelectMyExternalTicketLinkTemplate } from '@/src/dataconnect-generated/react'
import {
  Gear,
  Bell,
  Sun,
  Moon,
  Paintbrush,
  Thunderbolt,
  Droplet,
  Layers,
  SquareDashed,
  Square,
  Link as LinkIcon,
  CircleInfo,
  ShieldKeyhole,
  ArrowUpRightFromSquare,
  TrashBin,
} from '@gravity-ui/icons'

const APP_VERSION = "1.0.0";
const TICKET_ID_PLACEHOLDER = "{ticket_id}";

function SettingsCard() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoBreakReminder, setAutoBreakReminder] = useState(true)
  const { resolvedTheme, setTheme } = useTheme()
  const { schemes, selectedScheme, selectScheme, clearScheme } = useThemeSelection()
  const { performanceMode, setPerformanceMode } = usePerformanceMode()
  const { backgroundOpacity, setBackgroundOpacity } = useBackgroundOpacity()
  const { cardOpacity, setCardOpacity, cardBlur, setCardBlur } = useCardStyle()
  const { bordersEnabled, setBordersEnabled } = useBorders()
  const { externalTicketLinkTemplate, refetch: refetchUserSettings } = useUserSettings()
  const selectTemplateMutation = useSelectMyExternalTicketLinkTemplate()

  // next-themes only knows the real theme after mount (it reads from
  // localStorage/media query client-side), so the switch stays hidden
  // until then to avoid a flash of the wrong state.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Mirrors externalTicketLinkTemplate whenever it (re)loads — including
  // right after a save, when refetch() returns the same value just written,
  // so this never fights the user's in-progress typing.
  const [templateDraft, setTemplateDraft] = useState("")
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [templateSaving, setTemplateSaving] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemplateDraft(externalTicketLinkTemplate ?? "")
  }, [externalTicketLinkTemplate])

  const handleSaveTemplate = async () => {
    const trimmed = templateDraft.trim()
    if (trimmed && !trimmed.includes(TICKET_ID_PLACEHOLDER)) {
      setTemplateError(`Link must contain a ${TICKET_ID_PLACEHOLDER} placeholder`)
      return
    }
    setTemplateError(null)
    setTemplateSaving(true)
    try {
      await selectTemplateMutation.mutateAsync({ externalTicketLinkTemplate: trimmed || null })
      await refetchUserSettings()
    } finally {
      setTemplateSaving(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">


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

        {/* No-op with performance mode on — AmbientBackground unmounts
            entirely rather than just hiding, so there's nothing for this
            to dial in. */}
        {!performanceMode && (
          <div className="mt-3 rounded-lg bg-default-100 p-3">
            <Slider
              value={backgroundOpacity}
              onChange={(value) => setBackgroundOpacity(Array.isArray(value) ? value[0] : value)}
              minValue={0}
              maxValue={100}
              step={5}
              aria-label="Background opacity"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Droplet className="size-4" /> Background opacity
                </p>
                <Slider.Output>{`${backgroundOpacity}%`}</Slider.Output>
              </div>
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
            <p className="mt-2 text-xs text-foreground/60">
              Controls how strong the animated background glow appears across the app.
            </p>
          </div>
        )}

        {/* Card opacity/blur are no-ops with performance mode on — its
            "blur effects off" behavior overrides cardBlur back to none
            (see globals.css), and there's nothing gained from a translucent
            card once the ambient background behind it isn't rendering. */}
        {!performanceMode && (
          <>
            <div className="mt-3 rounded-lg bg-default-100 p-3">
              <Slider
                value={cardOpacity}
                onChange={(value) => setCardOpacity(Array.isArray(value) ? value[0] : value)}
                minValue={10}
                maxValue={100}
                step={5}
                aria-label="Card opacity"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Layers className="size-4" /> Card opacity
                  </p>
                  <Slider.Output>{`${cardOpacity}%`}</Slider.Output>
                </div>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
              <p className="mt-2 text-xs text-foreground/60">
                How see-through cards are — lower values let the background show through.
              </p>
            </div>

            <div className="mt-3 rounded-lg bg-default-100 p-3">
              <Slider
                value={cardBlur}
                onChange={(value) => setCardBlur(Array.isArray(value) ? value[0] : value)}
                minValue={0}
                maxValue={40}
                step={2}
                aria-label="Card background blur"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <SquareDashed className="size-4" /> Card background blur
                  </p>
                  <Slider.Output>{`${cardBlur}px`}</Slider.Output>
                </div>
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
              <p className="mt-2 text-xs text-foreground/60">
                Gaussian blur behind cards for a frosted-glass look. 0 disables it.
              </p>
            </div>
          </>
        )}

        <div className="mt-3 flex items-center justify-between gap-4 rounded-lg bg-default-100 p-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Square className="size-4" /> Show borders
            </p>
            <p className="text-xs text-foreground/60">
              Outlines cards and tables. Turn off for a cleaner, borderless look.
            </p>
          </div>
          <Switch
            isSelected={bordersEnabled}
            onChange={setBordersEnabled}
            aria-label="Show borders"
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>
      </Card>

      {/* Integrations */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <LinkIcon className="size-4" /> Integrations
        </h2>
        <div className="rounded-lg bg-default-100 p-3">
          <TextField value={templateDraft} onChange={setTemplateDraft} isDisabled={templateSaving}>
            <Label>External ticket link</Label>
            <Input placeholder={`https://www.some-random.link.com/ticket/${TICKET_ID_PLACEHOLDER}`} />
          </TextField>
          <p className="mt-2 text-xs text-foreground/60">
            Shown as a link on each ticket&apos;s page. Use{" "}
            <code className="rounded bg-default-200 px-1">{TICKET_ID_PLACEHOLDER}</code> as a
            placeholder for the ticket number.
          </p>
          {templateError && <p className="mt-1 text-sm text-danger">{templateError}</p>}
          <Button size="sm" className="mt-3" onPress={handleSaveTemplate} isDisabled={templateSaving}>
            {templateSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Card>

      {/* Google Calendar — its own Card rather than a row inside Integrations
          above: it owns a connection lifecycle, a sync action and five
          preferences, which is more than that section's single-field rows. */}
      <GoogleCalendarCard />

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
