import { NextRequest, NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/auth-middleware";
import { googleErrorResponse, requireConfigured, requireUser } from "@/lib/googleCalendar/routeAuth";
import { hasCalendarScope, isReauthRequired, loadConnection } from "@/lib/googleCalendar/store";
import { runSync, SyncRangeError } from "@/lib/googleCalendar/sync";
import { normalizeDayKey } from "@/lib/dayKeys";

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/google-calendar/sync — the "Sync now" button.
 *
 * Body: { start: "yyyy-mm-dd", end: "yyyy-mm-dd" }
 *
 * The range is required rather than defaulted. Syncing writes to something the
 * user owns outside this app, and a default range would mean a mis-click could
 * push a scope of history nobody chose. The UI always sends an explicit range.
 *
 * Long-running by nature — a first sync of a busy month is hundreds of calls to
 * Google — so the work is bounded inside runSync (MAX_WRITES_PER_SYNC) and the
 * response says whether anything was left over, rather than the request
 * quietly hitting a platform timeout.
 */
export async function POST(req: NextRequest) {
  const unconfigured = requireConfigured();
  if (unconfigured) return unconfigured;

  const gate = await requireUser(req);
  if (!gate.ok) return gate.response;

  let body: { start?: unknown; end?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be JSON");
  }

  const { start, end } = body;
  if (typeof start !== "string" || !DAY_KEY_PATTERN.test(start)) {
    return badRequest("start must be a yyyy-mm-dd date");
  }
  if (typeof end !== "string" || !DAY_KEY_PATTERN.test(end)) {
    return badRequest("end must be a yyyy-mm-dd date");
  }

  try {
    const stored = await loadConnection(gate.access.userId);
    if (!stored) return notFound("Google Calendar is not connected");

    // Checked before any work: a token missing the calendar scope fails every
    // write, and finding that out after building a plan wastes a round trip and
    // produces a worse message.
    if (!hasCalendarScope(stored.scope)) {
      return NextResponse.json(
        {
          error: "This connection wasn't granted calendar access. Reconnect and allow it.",
          code: "scope_missing",
        },
        { status: 403 }
      );
    }

    const result = await runSync(gate.access.userId, stored, {
      start: normalizeDayKey(start),
      end: normalizeDayKey(end),
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SyncRangeError) return badRequest(err.message);

    // A dead refresh token is the user's to fix, not a server fault — say so
    // with a code the card can turn into a "Reconnect" prompt.
    if (isReauthRequired(err)) {
      return NextResponse.json(
        {
          error: "Google access has expired or been revoked. Reconnect to keep syncing.",
          code: "reauth_required",
        },
        { status: 401 }
      );
    }

    return googleErrorResponse(err, "Failed to sync to Google Calendar");
  }
}
