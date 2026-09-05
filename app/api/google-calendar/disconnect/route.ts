import { NextRequest, NextResponse } from "next/server";
import { badRequest } from "@/lib/auth-middleware";
import { deleteCalendar, revokeToken } from "@/lib/googleCalendar/api";
import { googleErrorResponse, requireUser } from "@/lib/googleCalendar/routeAuth";
import {
  forgetConnection,
  getAccessToken,
  loadConnection,
  readRefreshToken,
} from "@/lib/googleCalendar/store";

/**
 * POST /api/google-calendar/disconnect
 *
 * Body: { deleteCalendar?: boolean }
 *
 * Two genuinely different intentions, kept separate rather than collapsed into
 * one destructive default:
 *
 *   deleteCalendar=false — stop syncing. The Time Tracker calendar and every
 *     event on it stay exactly where they are. This is the safe default.
 *   deleteCalendar=true  — also delete the calendar in Google, taking all
 *     synced events with it. Irreversible, so the UI confirms it explicitly.
 *
 * Ordering is deliberate: the calendar is deleted *before* the local row, and
 * the row is dropped even if that fails. A retained row pointing at a deleted
 * calendar would be a broken connection the user cannot clear; a dropped row
 * with a surviving calendar is merely an untidy calendar they can delete
 * themselves.
 */
export async function POST(req: NextRequest) {
  const gate = await requireUser(req);
  if (!gate.ok) return gate.response;

  let shouldDeleteCalendar = false;
  const raw = await req.text();
  if (raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as { deleteCalendar?: unknown };
      if (parsed.deleteCalendar !== undefined && typeof parsed.deleteCalendar !== "boolean") {
        return badRequest("deleteCalendar must be a boolean");
      }
      shouldDeleteCalendar = parsed.deleteCalendar === true;
    } catch {
      return badRequest("Body must be JSON");
    }
  }

  try {
    const stored = await loadConnection(gate.access.userId);
    // Already disconnected. Idempotent rather than a 404: the caller wanted
    // "not connected", and that is the state.
    if (!stored) return NextResponse.json({ connected: false, calendarDeleted: false });

    let calendarDeleted = false;
    const warnings: string[] = [];

    if (shouldDeleteCalendar) {
      try {
        const accessToken = await getAccessToken(stored);
        await deleteCalendar(accessToken, stored.calendarId);
        calendarDeleted = true;
      } catch (err) {
        // Reported, not fatal — see the ordering note above.
        console.error("[google-calendar] failed to delete calendar on disconnect:", err);
        warnings.push(
          "The connection was removed, but the Time Tracker calendar could not be deleted in Google. You can delete it from Google Calendar directly."
        );
      }
    }

    // Best-effort, and last: revoking tells Google to drop the grant entirely,
    // so the authorization disappears from the user's Google account settings
    // rather than lingering as something this app merely stopped using.
    try {
      await revokeToken(readRefreshToken(stored));
    } catch (err) {
      console.warn("[google-calendar] could not read stored token to revoke:", err);
    }

    await forgetConnection(gate.access.userId);

    return NextResponse.json({ connected: false, calendarDeleted, warnings });
  } catch (err) {
    return googleErrorResponse(err, "Failed to disconnect Google Calendar");
  }
}
