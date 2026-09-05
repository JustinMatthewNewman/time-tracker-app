import { NextRequest, NextResponse } from "next/server";
import { getOAuthConfig } from "@/lib/googleCalendar/config";
import { buildAuthUrl } from "@/lib/googleCalendar/api";
import { newNonce, signState } from "@/lib/googleCalendar/crypto";
import { googleErrorResponse, requireConfigured, requireUser } from "@/lib/googleCalendar/routeAuth";
import { OAUTH_STATE_COOKIE, STATE_TTL_MS } from "@/lib/googleCalendar/oauthCookie";

/**
 * POST /api/google-calendar/connect — starts the OAuth flow.
 *
 * Returns the authorization URL for the browser to navigate to rather than
 * issuing a redirect itself, because this is an authenticated fetch: the
 * caller proves who it is with a Firebase ID token on the Authorization
 * header, and a header cannot be attached to a top-level navigation. So the
 * client asks for the URL here, then sets window.location to it.
 *
 * That split is also why identity has to be carried across to the callback out
 * of band — see the state cookie below.
 */
export async function POST(req: NextRequest) {
  const unconfigured = requireConfigured();
  if (unconfigured) return unconfigured;

  const gate = await requireUser(req);
  if (!gate.ok) return gate.response;

  try {
    const config = getOAuthConfig();
    const nonce = newNonce();
    const state = signState({ uid: gate.access.googleUid, nonce, iat: Date.now() });

    const response = NextResponse.json({ authUrl: buildAuthUrl(config, state) });

    // Double-submit CSRF defence. The same nonce travels two ways — inside the
    // signed `state` that round-trips through Google, and in this httpOnly
    // cookie — and the callback requires them to match. An attacker who can
    // make the victim's browser hit the callback with a state of the
    // attacker's choosing (thereby binding the attacker's Google account to the
    // victim's app account) still cannot set this cookie, so the match fails.
    response.cookies.set(OAUTH_STATE_COOKIE, nonce, {
      httpOnly: true,
      // Not "strict": the callback arrives as a cross-site top-level
      // navigation from accounts.google.com, and a strict cookie is withheld
      // on exactly that, which would break every connect attempt.
      sameSite: "lax",
      secure: config.redirectUri.startsWith("https://"),
      path: "/api/google-calendar",
      maxAge: STATE_TTL_MS / 1000,
    });

    return response;
  } catch (err) {
    return googleErrorResponse(err, "Failed to start Google Calendar authorization");
  }
}
