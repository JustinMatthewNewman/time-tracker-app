import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-middleware";
import { getCallerAccess, type CallerAccess } from "@/lib/featureAccess";
import { isConfigured, isMissingConfigError } from "./config";

// The gate every /api/google-calendar route (except the OAuth callback) runs
// through.
//
// Deliberately NOT requireFeature(). The admin routes gate on a Feature grant
// because they expose other people's data and are a privilege-escalation
// surface; this integration is a personal preference — the same category as
// picking a color scheme — that every signed-in user should be able to use.
// Introducing a "GoogleCalendarSync" Feature would mean a seed migration plus
// an explicit grant to all five tiers just to restore the status quo, and
// would leave a real chance of an environment where nobody holds it.
//
// The security boundary that does matter here is ownership, and it is
// structural rather than checked: every route derives userId from the verified
// ID token via getCallerAccess and never reads a user id from the request, so
// there is no parameter a caller could tamper with to reach another user's
// connection.

type RequireUserResult =
  | { ok: true; access: CallerAccess; response?: never }
  | { ok: false; access?: never; response: NextResponse };

export async function requireUser(req: NextRequest): Promise<RequireUserResult> {
  const auth = await verifyAuthToken(req);
  if (!auth.authorized || !auth.userId) {
    return { ok: false, response: NextResponse.json({ error: auth.error }, { status: 401 }) };
  }

  const access = await getCallerAccess(auth.userId);
  // Same reasoning as requireFeature: a verified token with no user row means
  // sync-user hasn't completed yet. A transient state, not a server fault.
  if (!access) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No user record for this account" }, { status: 403 }),
    };
  }

  return { ok: true, access };
}

/**
 * 503 with an actionable message when the server has no Google credentials.
 *
 * Distinguished from a 500 on purpose: a clone of this repo without a Google
 * Cloud project is unconfigured, not broken, and the settings card renders
 * setup instructions rather than an error when it sees this.
 */
export function requireConfigured(): NextResponse | null {
  if (isConfigured()) return null;
  return NextResponse.json(
    {
      error: "Google Calendar integration is not configured on this server.",
      code: "not_configured",
    },
    { status: 503 }
  );
}

/** Maps a thrown error to a response, keeping credential details out of the body. */
export function googleErrorResponse(err: unknown, fallback: string): NextResponse {
  if (isMissingConfigError(err)) {
    return NextResponse.json({ error: err.message, code: "not_configured" }, { status: 503 });
  }
  console.error(`[google-calendar] ${fallback}:`, err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
