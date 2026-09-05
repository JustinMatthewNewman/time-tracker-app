import { NextRequest, NextResponse } from "next/server";
import { CALENDAR_WRITE_SCOPE, getOAuthConfig, isConfigured } from "@/lib/googleCalendar/config";
import {
  createCalendar,
  emailFromIdToken,
  exchangeCodeForTokens,
  getCalendar,
} from "@/lib/googleCalendar/api";
import { nonceEquals, verifyState } from "@/lib/googleCalendar/crypto";
import { OAUTH_STATE_COOKIE, STATE_TTL_MS } from "@/lib/googleCalendar/oauthCookie";
import { getCallerAccess } from "@/lib/featureAccess";
import { hasCalendarScope, loadConnection, saveConnection } from "@/lib/googleCalendar/store";

/**
 * GET /api/google-calendar/callback — where Google sends the user back.
 *
 * This is the one route in the integration that cannot authenticate the caller
 * the normal way. It is a top-level browser navigation from
 * accounts.google.com, so there is no Authorization header and no Firebase ID
 * token to verify — yet it is about to store a credential *against a specific
 * user account*, which is precisely the kind of decision that must not be
 * guessable or forgeable.
 *
 * Identity therefore comes from two things that have to agree:
 *
 *   1. the HMAC-signed `state` (see crypto.ts signState), which names the uid
 *      and cannot be forged without the server key; and
 *   2. an httpOnly nonce cookie set when the flow started, which an attacker
 *      cannot set from another origin.
 *
 * Either alone is insufficient. The signature alone would let a captured state
 * be replayed in someone else's browser; the cookie alone carries no uid.
 * Together they establish that the browser finishing this flow is the same one
 * that started it, on behalf of the uid the server itself signed.
 *
 * Every failure path redirects to /settings with a message instead of
 * rendering JSON — a human is looking at this URL, not a fetch call.
 */
export async function GET(req: NextRequest) {
  // Errors are reported through the UI, so a failure here must still land the
  // user somewhere sensible even before config is known to be valid.
  const settingsUrl = (params: Record<string, string>) => {
    const base = isConfigured()
      ? new URL(getOAuthConfig().redirectUri).origin
      : req.nextUrl.origin;
    const url = new URL("/settings", base);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    return url;
  };

  const finish = (params: Record<string, string>) => {
    const response = NextResponse.redirect(settingsUrl(params));
    // One-shot: the nonce has done its job the moment it is checked, and
    // leaving it set would allow a second callback to reuse it.
    response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/google-calendar" });
    return response;
  };

  if (!isConfigured()) {
    return finish({ gcal: "error", reason: "not_configured" });
  }

  const params = req.nextUrl.searchParams;

  // The user pressed "Cancel" on Google's consent screen, or Google refused.
  // Not an error worth logging — it's a decision.
  const oauthError = params.get("error");
  if (oauthError) {
    return finish({ gcal: "cancelled", reason: oauthError });
  }

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) {
    return finish({ gcal: "error", reason: "missing_code" });
  }

  const payload = verifyState(state, STATE_TTL_MS);
  if (!payload) {
    return finish({ gcal: "error", reason: "bad_state" });
  }

  const cookieNonce = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!cookieNonce || !nonceEquals(cookieNonce, payload.nonce)) {
    return finish({ gcal: "error", reason: "state_mismatch" });
  }

  try {
    // Resolve the signed uid to a user row. If the account vanished mid-flow
    // there is nothing to attach the credential to.
    const access = await getCallerAccess(payload.uid);
    if (!access) return finish({ gcal: "error", reason: "no_user" });

    const config = getOAuthConfig();
    const tokens = await exchangeCodeForTokens(config, code);

    // Granular consent: the user can approve sign-in and decline calendar
    // access. Storing that token would produce a "connected" state that fails
    // every sync, so it is rejected here where the cause can still be named.
    if (!hasCalendarScope(tokens.scope ?? "")) {
      return finish({ gcal: "error", reason: "scope_denied" });
    }

    // access_type=offline + prompt=consent should always yield one. If it
    // somehow doesn't, storing the connection would leave something that works
    // for an hour and then silently dies.
    if (!tokens.refresh_token) {
      return finish({ gcal: "error", reason: "no_refresh_token" });
    }

    const googleEmail = emailFromIdToken(tokens.id_token);

    // Reuse the existing calendar when reconnecting, so a repaired connection
    // keeps every event already synced instead of orphaning a whole calendar
    // and starting again. A reconnect against a *different* Google account
    // can't see the old calendar, and the 404 falls through to creating one —
    // which is the correct outcome, since the old one isn't theirs.
    const existing = await loadConnection(access.userId);
    let calendarId: string | null = null;
    if (existing) {
      try {
        calendarId = (await getCalendar(tokens.access_token, existing.calendarId)).id;
      } catch {
        calendarId = null;
      }
    }
    if (!calendarId) {
      calendarId = (await createCalendar(tokens.access_token)).id;
    }

    await saveConnection({
      userId: access.userId,
      calendarId,
      googleEmail,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope ?? CALENDAR_WRITE_SCOPE,
    });

    return finish({ gcal: "connected" });
  } catch (err) {
    // Never surface the raw error to the URL bar — a token-endpoint error can
    // echo request parameters.
    console.error("[google-calendar] OAuth callback failed:", err);
    return finish({ gcal: "error", reason: "exchange_failed" });
  }
}
