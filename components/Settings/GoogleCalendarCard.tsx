"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Spinner, Switch } from "@heroui/react";
import {
  ArrowsRotateRight,
  ArrowUpRightFromSquare,
  Calendar,
  CircleCheck,
  CircleInfo,
  LinkSlash,
  TriangleExclamation,
} from "@gravity-ui/icons";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { toDayKey } from "@/lib/dayKeys";
import { startOfMonth, endOfMonth } from "@/lib/monthBuckets";
import { startOfWeek, endOfWeek } from "@/lib/weekBuckets";
import type { EventPrefs } from "@/lib/googleCalendar/events";
import type { SyncResult } from "@/lib/googleCalendar/sync";

// The "Google Calendar" section of Settings. Mirrors the surrounding
// SettingsCard sections structurally (a Card with bg-default-100 rounded rows)
// rather than introducing its own visual language.

type PresetId = "week" | "month" | "last30" | "custom";

interface Preset {
  id: PresetId;
  label: string;
  range: () => { start: string; end: string };
}

const PRESETS: Preset[] = [
  {
    id: "week",
    label: "This week",
    range: () => ({ start: toDayKey(startOfWeek(new Date())), end: toDayKey(endOfWeek(new Date())) }),
  },
  {
    id: "month",
    label: "This month",
    range: () => ({ start: toDayKey(startOfMonth(new Date())), end: toDayKey(endOfMonth(new Date())) }),
  },
  {
    id: "last30",
    label: "Last 30 days",
    range: () => {
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return { start: toDayKey(start), end: toDayKey(new Date()) };
    },
  },
];

/** Human-readable text for each ?gcal= outcome the callback route can redirect with. */
const CALLBACK_MESSAGES: Record<string, { tone: "success" | "error"; text: string }> = {
  connected: { tone: "success", text: "Google Calendar connected." },
  cancelled: { tone: "error", text: "Authorization was cancelled — nothing was connected." },
};

const ERROR_REASONS: Record<string, string> = {
  not_configured: "This server isn't set up for Google Calendar yet.",
  missing_code: "Google didn't send an authorization code back. Try again.",
  bad_state: "The authorization request expired. Try connecting again.",
  state_mismatch: "Security check failed. Start the connection again from this page.",
  no_user: "Your account record couldn't be found. Try signing out and back in.",
  scope_denied: "Calendar access wasn't granted. Reconnect and allow it.",
  no_refresh_token: "Google didn't return a durable token. Try connecting again.",
  exchange_failed: "Couldn't complete the handshake with Google. Try again.",
};

const PREF_COPY: { key: keyof EventPrefs; title: string; description: string }[] = [
  {
    key: "mergeConsecutive",
    title: "Merge consecutive entries",
    description:
      "Back-to-back entries on the same ticket become one event, so a day reads as a few blocks instead of a wall of 15-minute slivers.",
  },
  {
    key: "overwriteExisting",
    title: "Overwrite existing events",
    description:
      "Re-syncing rewrites events this app created, so the calendar follows your entries. Off keeps anything you've edited in Google Calendar.",
  },
  {
    key: "pruneOrphans",
    title: "Remove orphaned events",
    description:
      "Deletes events in the synced range whose time entry no longer exists. Only ever touches events this app created.",
  },
  {
    key: "markAsFree",
    title: "Show as Free",
    description:
      "Marks events Free rather than Busy. These are records of work already done, so they shouldn't blank out your availability.",
  },
  {
    key: "includeDescription",
    title: "Include entry notes",
    description: "Copies each entry's notes into the event body. Off leaves events titled by ticket only.",
  },
];

export function GoogleCalendarCard() {
  const { status, loading, error, busy, connect, disconnect, updatePrefs, sync, setError } =
    useGoogleCalendar();

  const [preset, setPreset] = useState<PresetId>("month");
  const [customStart, setCustomStart] = useState(() => toDayKey(startOfMonth(new Date())));
  const [customEnd, setCustomEnd] = useState(() => toDayKey(new Date()));
  const [result, setResult] = useState<SyncResult | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [callback, setCallback] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  // Read the OAuth outcome out of the URL, then scrub it. Uses
  // window.location rather than useSearchParams so this component needs no
  // Suspense boundary, and replaceState so a refresh doesn't re-show a banner
  // about an action that already happened.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get("gcal");
    if (!outcome) return;

    const reason = params.get("reason");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCallback(
      CALLBACK_MESSAGES[outcome] ?? {
        tone: "error",
        text: (reason && ERROR_REASONS[reason]) || "Couldn't connect to Google Calendar.",
      }
    );

    params.delete("gcal");
    params.delete("reason");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);

  const range = useMemo(() => {
    if (preset === "custom") return { start: customStart, end: customEnd };
    return PRESETS.find((p) => p.id === preset)!.range();
  }, [preset, customStart, customEnd]);

  const rangeInvalid = range.end < range.start;

  const handleSync = async () => {
    setResult(null);
    const synced = await sync(range);
    if (synced) setResult(synced);
  };

  const handleDisconnect = async (deleteCalendar: boolean) => {
    setConfirmingDelete(false);
    setResult(null);
    const outcome = await disconnect(deleteCalendar);
    if (outcome?.warnings?.length) {
      setError(outcome.warnings.join(" "));
    }
  };

  return (
    <Card className="p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Calendar className="size-4" /> Google Calendar
      </h2>

      {callback && (
        <Banner tone={callback.tone} onDismiss={() => setCallback(null)}>
          {callback.text}
        </Banner>
      )}

      {error && (
        <Banner tone="error" onDismiss={() => setError(null)}>
          {error}
        </Banner>
      )}

      {loading && (
        <div className="flex items-center gap-2 rounded-lg bg-default-100 p-3 text-sm text-foreground/60">
          <Spinner aria-label="Loading Google Calendar status" /> Checking connection…
        </div>
      )}

      {!loading && status && !status.configured && <NotConfigured />}

      {!loading && status?.configured && !status.connected && (
        <div className="rounded-lg bg-default-100 p-3">
          <p className="text-sm font-medium text-foreground">Not connected</p>
          <p className="mt-1 text-xs text-foreground/60">
            Push your tracked time into a dedicated <strong>Time Tracker</strong> calendar in Google,
            so your day fills in with what you actually worked on. This app creates that calendar
            itself and can only ever touch events on it — the permission it asks for cannot read or
            change your primary calendar.
          </p>
          <Button size="sm" className="mt-3" onPress={() => connect()} isDisabled={busy}>
            {busy ? "Redirecting…" : "Connect Google Calendar"}
          </Button>
        </div>
      )}

      {!loading && status?.connected && status.prefs && (
        <div className="flex flex-col gap-3">
          <ConnectionRow
            googleEmail={status.googleEmail}
            calendarId={status.calendarId}
            lastSyncedAt={status.lastSyncedAt}
          />

          {status.hasCalendarScope === false && (
            <Banner tone="error">
              This connection wasn&apos;t granted calendar access. Reconnect and allow it.
            </Banner>
          )}

          {/* Sync */}
          <div className="rounded-lg bg-default-100 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ArrowsRotateRight className="size-4" /> Sync a date range
            </p>
            <p className="mt-1 text-xs text-foreground/60">
              Nothing is pushed until you choose a range and press Sync now.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.id}
                  size="sm"
                  variant={preset === p.id ? "primary" : "outline"}
                  onPress={() => setPreset(p.id)}
                >
                  {p.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant={preset === "custom" ? "primary" : "outline"}
                onPress={() => setPreset("custom")}
              >
                Custom
              </Button>
            </div>

            {preset === "custom" ? (
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs text-foreground/60">
                  From
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-foreground/60">
                  To
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="rounded-lg border border-default-200 px-3 py-2 text-sm text-foreground"
                  />
                </label>
              </div>
            ) : (
              <p className="mt-3 text-xs tabular-nums text-foreground/60">
                {range.start} → {range.end}
              </p>
            )}

            {rangeInvalid && <p className="mt-2 text-sm text-danger">End date must not be before start date.</p>}

            <Button
              size="sm"
              className="mt-3"
              onPress={handleSync}
              isDisabled={busy || rangeInvalid || status.hasCalendarScope === false}
            >
              {busy ? "Syncing…" : "Sync now"}
            </Button>

            {result && <SyncSummary result={result} />}
          </div>

          {/* Preferences */}
          <div className="rounded-lg bg-default-100 p-3">
            <p className="text-sm font-medium text-foreground">Sync behavior</p>
            <div className="mt-2 flex flex-col divide-y divide-default-200">
              {PREF_COPY.map(({ key, title, description }) => (
                <div key={key} className="flex items-start justify-between gap-4 py-3 first:pt-1 last:pb-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-foreground/60">{description}</p>
                  </div>
                  <Switch
                    isSelected={status.prefs![key]}
                    onChange={(value) => updatePrefs({ [key]: value })}
                    isDisabled={busy}
                    aria-label={title}
                  >
                    <Switch.Content>
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Content>
                  </Switch>
                </div>
              ))}
            </div>
          </div>

          {/* Disconnect */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onPress={() => handleDisconnect(false)} isDisabled={busy}>
              <LinkSlash className="size-4" /> Disconnect
            </Button>
            <Button
              size="sm"
              variant="danger-soft"
              onPress={() => setConfirmingDelete(true)}
              isDisabled={busy}
            >
              Disconnect &amp; delete calendar
            </Button>
          </div>
        </div>
      )}

      {confirmingDelete && (
        <ConfirmDeleteDialog
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => handleDisconnect(true)}
        />
      )}
    </Card>
  );
}

function ConnectionRow({
  googleEmail,
  calendarId,
  lastSyncedAt,
}: {
  googleEmail?: string | null;
  calendarId?: string;
  lastSyncedAt?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-default-100 p-3">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CircleCheck className="size-4 text-success" />
          Connected{googleEmail ? ` as ${googleEmail}` : ""}
        </p>
        <p className="mt-1 text-xs text-foreground/60">
          Writing to the <strong>Time Tracker</strong> calendar ·{" "}
          {lastSyncedAt ? `last synced ${new Date(lastSyncedAt).toLocaleString()}` : "never synced"}
        </p>
      </div>
      {calendarId && (
        <Button
          size="sm"
          variant="ghost"
          onPress={() =>
            window.open(
              `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
        >
          <ArrowUpRightFromSquare className="size-4" /> Open
        </Button>
      )}
    </div>
  );
}

function SyncSummary({ result }: { result: SyncResult }) {
  // "Unchanged" is reported rather than hidden on purpose: it's what tells the
  // user a second sync was cheap instead of leaving them wondering why nothing
  // appeared to happen.
  const parts = [
    result.created && `${result.created} created`,
    result.updated && `${result.updated} updated`,
    result.deleted && `${result.deleted} removed`,
    result.unchanged && `${result.unchanged} already up to date`,
    result.preserved && `${result.preserved} left alone`,
  ].filter(Boolean) as string[];

  return (
    <div className="mt-3 rounded-lg bg-default-200/50 p-3 text-xs">
      <p className="font-medium text-foreground">
        {parts.length ? parts.join(" · ") : "Nothing to sync in this range."}
      </p>
      <p className="mt-1 text-foreground/60">
        {result.entriesConsidered} entries → {result.blocks} events
      </p>
      {result.truncated && (
        <p className="mt-2 text-warning">
          Stopped after the per-sync limit with {result.remaining} left. Press Sync now again to
          continue — already-synced events are skipped.
        </p>
      )}
      {result.errors.length > 0 && (
        <div className="mt-2 text-danger">
          <p>{result.errors.length} event(s) failed:</p>
          <ul className="mt-1 list-disc pl-4">
            {result.errors.slice(0, 3).map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="rounded-lg bg-default-100 p-3">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <CircleInfo className="size-4" /> Not set up on this server
      </p>
      <p className="mt-1 text-xs text-foreground/60">
        This integration needs a Google Cloud OAuth client. See the{" "}
        <strong>Google Calendar Sync</strong> section of the project README for the four environment
        variables to set.
      </p>
    </div>
  );
}

function Banner({
  tone,
  children,
  onDismiss,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
  onDismiss?: () => void;
}) {
  const styles =
    tone === "success"
      ? "border-success/40 bg-success/10 text-success"
      : "border-danger/40 bg-danger/10 text-danger";

  return (
    <div className={`mb-3 flex items-start justify-between gap-3 rounded-lg border p-3 text-sm ${styles}`}>
      <span className="flex items-start gap-2">
        {tone === "success" ? (
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
        ) : (
          <TriangleExclamation className="mt-0.5 size-4 shrink-0" />
        )}
        {children}
      </span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 text-xs underline opacity-70">
          Dismiss
        </button>
      )}
    </div>
  );
}

/** Mirrors DeleteWorkLogDialog's overlay pattern — this action is irreversible. */
function ConfirmDeleteDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Delete Time Tracker calendar?</h2>
          <p className="text-sm text-foreground/70">
            This disconnects the integration <strong>and</strong> deletes the Time Tracker calendar in
            Google, along with every event synced to it. Your time entries in this app are not
            affected. This cannot be undone.
          </p>
          <div className="flex gap-2 pt-6">
            <Button type="button" variant="outline" className="flex-1" onPress={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="danger" className="flex-1" onPress={onConfirm}>
              Delete calendar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default GoogleCalendarCard;
