import { NextRequest, NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/auth-middleware";
import { googleErrorResponse, requireUser } from "@/lib/googleCalendar/routeAuth";
import { loadConnection, savePrefs, toPublicConnection } from "@/lib/googleCalendar/store";
import type { EventPrefs } from "@/lib/googleCalendar/events";

const PREF_KEYS = [
  "mergeConsecutive",
  "overwriteExisting",
  "pruneOrphans",
  "markAsFree",
  "includeDescription",
] as const satisfies readonly (keyof EventPrefs)[];

/**
 * PATCH /api/google-calendar/settings — update sync preferences.
 *
 * Partial by name but total on the wire: whichever keys are present are
 * applied over the *stored* values, and all five are written together, because
 * the underlying mutation sets all five. Merging over what's in the database
 * rather than over defaults is what keeps flipping one switch from silently
 * resetting the other four.
 *
 * Cannot touch the credential columns — UpdateGoogleCalendarSyncPrefs doesn't
 * name them — so no bug in this handler can corrupt the stored token.
 */
export async function PATCH(req: NextRequest) {
  const gate = await requireUser(req);
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be JSON");
  }

  const input = (body ?? {}) as Record<string, unknown>;
  for (const key of PREF_KEYS) {
    if (key in input && typeof input[key] !== "boolean") {
      return badRequest(`${key} must be a boolean`);
    }
  }

  try {
    const stored = await loadConnection(gate.access.userId);
    if (!stored) return notFound("Google Calendar is not connected");

    const prefs: EventPrefs = { ...stored.prefs };
    for (const key of PREF_KEYS) {
      if (key in input) prefs[key] = input[key] as boolean;
    }

    await savePrefs(gate.access.userId, prefs);
    return NextResponse.json(toPublicConnection({ ...stored, prefs }));
  } catch (err) {
    return googleErrorResponse(err, "Failed to update Google Calendar settings");
  }
}
