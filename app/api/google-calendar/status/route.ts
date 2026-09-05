import { NextRequest, NextResponse } from "next/server";
import { isConfigured } from "@/lib/googleCalendar/config";
import { loadConnection, toPublicConnection } from "@/lib/googleCalendar/store";
import { googleErrorResponse, requireUser } from "@/lib/googleCalendar/routeAuth";
import { MAX_RANGE_DAYS } from "@/lib/googleCalendar/sync";

/**
 * GET /api/google-calendar/status — what the settings card renders from.
 *
 * Answers 200 whether or not a connection exists; "not connected" is a normal
 * state, not an error. Never includes refreshTokenCipher — see
 * toPublicConnection.
 */
export async function GET(req: NextRequest) {
  const gate = await requireUser(req);
  if (!gate.ok) return gate.response;

  // Reported rather than enforced here, so the card can show setup guidance
  // instead of a dead "Connect" button that 503s when pressed.
  const configured = isConfigured();
  if (!configured) {
    return NextResponse.json({ configured: false, connected: false, maxRangeDays: MAX_RANGE_DAYS });
  }

  try {
    const stored = await loadConnection(gate.access.userId);
    return NextResponse.json({
      configured: true,
      maxRangeDays: MAX_RANGE_DAYS,
      ...(stored ? toPublicConnection(stored) : { connected: false }),
    });
  } catch (err) {
    return googleErrorResponse(err, "Failed to load Google Calendar connection");
  }
}
