import {
  CALENDAR_DESCRIPTION,
  CALENDAR_SUMMARY,
  OAUTH_SCOPE_PARAM,
  type GoogleOAuthConfig,
} from "./config";
import { DAY_KEY, MANAGED_KEY, MANAGED_VALUE, type CalendarEventBody, type ExistingEvent } from "./events";

// Thin REST client for the Google OAuth and Calendar v3 endpoints.
//
// Written against `fetch` rather than pulling in `googleapis`. That package is
// a ~50MB generated client covering every Google API; this integration touches
// six endpoints, all of them plain JSON over HTTPS. The dependency would cost
// more in install size and cold-start time than the ~150 lines it saves, and
// it would be the single largest thing in a project whose dependency list is
// otherwise deliberately short.

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";

/** A Google API call that failed. Carries the status so callers can branch. */
export class GoogleApiError extends Error {
  constructor(
    readonly status: number,
    readonly reason: string,
    message: string
  ) {
    super(message);
    this.name = "GoogleApiError";
  }

  /** The stored refresh token is dead — revoked, expired, or from another client. */
  get isAuthFailure(): boolean {
    return this.status === 401 || this.reason === "invalid_grant";
  }
}

export function buildAuthUrl(config: GoogleOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPE_PARAM,
    // Required for a refresh token to be issued at all — without it Google
    // returns only a one-hour access token and the integration would break an
    // hour after connecting.
    access_type: "offline",
    // Google issues a refresh token only on a user's *first* consent for a
    // client unless consent is re-prompted. Reconnecting (after a revoke, or
    // to fix a bad token) would otherwise succeed while returning no refresh
    // token, leaving a connection that cannot refresh. Forcing the prompt
    // makes reconnect reliably repair itself.
    prompt: "consent",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export async function exchangeCodeForTokens(
  config: GoogleOAuthConfig,
  code: string
): Promise<TokenResponse> {
  return tokenRequest({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });
}

export async function refreshAccessToken(
  config: GoogleOAuthConfig,
  refreshToken: string
): Promise<TokenResponse> {
  return tokenRequest({
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
  });
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}) as Record<string, unknown>);
  if (!res.ok) {
    const reason = String(json.error ?? "token_request_failed");
    throw new GoogleApiError(
      res.status,
      reason,
      // Never interpolate the response wholesale — an error body from the token
      // endpoint can echo request parameters, and this string ends up in logs.
      `Google token request failed (${res.status} ${reason})`
    );
  }
  return json as TokenResponse;
}

/**
 * Best-effort revocation of a refresh token at disconnect.
 *
 * Deleting the local row stops *this app* using the credential, but the grant
 * would stay live in the user's Google account until they revoked it by hand.
 * Telling Google to drop it is the difference between "we stopped" and "it's
 * gone".
 *
 * Never throws: an already-revoked or already-expired token answers 400, and a
 * disconnect that fails because the credential was *extra* dead would be a
 * confusing thing to show someone.
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch(REVOKE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }).toString(),
      cache: "no-store",
    });
  } catch (err) {
    console.warn("[google-calendar] token revocation failed (continuing):", err);
  }
}

/**
 * Reads the email claim out of an ID token, for display only.
 *
 * The signature is deliberately not verified. Google's own guidance is that a
 * token received straight from the token endpoint over TLS needs no
 * verification — the transport already establishes who sent it. Verifying
 * would mean fetching and caching Google's JWKS to gain nothing. This value is
 * only ever rendered as "Connected as ..."; no authorization decision reads it.
 */
export function emailFromIdToken(idToken: string | undefined): string | null {
  if (!idToken) return null;
  const payload = idToken.split(".")[1];
  if (!payload) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof claims.email === "string" ? claims.email : null;
  } catch {
    return null;
  }
}

// --- Calendar v3 ----------------------------------------------------------

const MAX_ATTEMPTS = 5;

/** Google's standard JSON error envelope, as far as this client reads it. */
interface GoogleErrorEnvelope {
  error?: {
    message?: string;
    status?: string;
    errors?: { reason?: string }[];
  };
}

/**
 * One Calendar API call, with retries on the failures that are worth retrying.
 *
 * Google answers rate limiting with either 429 or — confusingly — a 403 whose
 * `reason` is rateLimitExceeded/userRateLimitExceeded, which is otherwise the
 * same status as a permanent permission denial. Branching on the reason rather
 * than the status is what keeps a burst of writes from aborting a sync that
 * would have succeeded a second later, without silently retrying a genuine
 * "you don't have access" forever.
 */
async function calendarFetch<T>(
  accessToken: string,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  let lastError: GoogleApiError | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const res = await fetch(`${CALENDAR_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
    });

    if (res.ok) {
      // 204 on delete — no body to parse.
      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    }

    const body = (await res.json().catch(() => ({}))) as GoogleErrorEnvelope;
    const reason = body.error?.errors?.[0]?.reason ?? body.error?.status ?? "unknown";
    const message = body.error?.message ?? res.statusText;
    lastError = new GoogleApiError(res.status, reason, `Google Calendar API: ${message} (${res.status} ${reason})`);

    const retryable =
      res.status === 429 ||
      res.status >= 500 ||
      (res.status === 403 && /rateLimitExceeded|userRateLimitExceeded|quotaExceeded/i.test(reason));

    if (!retryable || attempt === MAX_ATTEMPTS - 1) throw lastError;

    // Exponential backoff with full jitter, which is what Google's own
    // retry guidance prescribes: a fixed backoff makes concurrent workers
    // retry in lockstep and re-trigger the same limit.
    const delay = Math.min(2 ** attempt * 500, 8000) * (0.5 + Math.random() / 2);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw lastError!;
}

export interface CalendarResource {
  id: string;
  summary?: string;
}

export async function createCalendar(accessToken: string, timeZone?: string): Promise<CalendarResource> {
  return calendarFetch<CalendarResource>(accessToken, "/calendars", {
    method: "POST",
    body: JSON.stringify({
      summary: CALENDAR_SUMMARY,
      description: CALENDAR_DESCRIPTION,
      ...(timeZone ? { timeZone } : {}),
    }),
  });
}

/** Confirms the stored calendar still exists (the user can delete it in Google). */
export async function getCalendar(accessToken: string, calendarId: string): Promise<CalendarResource> {
  return calendarFetch<CalendarResource>(accessToken, `/calendars/${encodeURIComponent(calendarId)}`);
}

export async function deleteCalendar(accessToken: string, calendarId: string): Promise<void> {
  await calendarFetch<void>(accessToken, `/calendars/${encodeURIComponent(calendarId)}`, {
    method: "DELETE",
  });
}

/**
 * Every app-created event on the calendar between two instants.
 *
 * Filtered server-side by the MANAGED_KEY private property, so events the user
 * added to this calendar themselves never enter the diff and can never be
 * overwritten or pruned by it.
 *
 * `showDeleted` is on because a cancelled event still owns its id: the diff has
 * to know it exists to choose update-and-revive over an insert that would 409.
 * `singleEvents` stays off — nothing here writes recurring events, and
 * expanding them would return instances whose ids don't match what was written.
 */
export async function listManagedEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<ExistingEvent[]> {
  const events: ExistingEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      showDeleted: "true",
      singleEvents: "false",
      maxResults: "2500",
      privateExtendedProperty: `${MANAGED_KEY}=${MANAGED_VALUE}`,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const page = await calendarFetch<{ items?: ExistingEvent[]; nextPageToken?: string }>(
      accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
    );

    events.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);

  return events;
}

export async function insertEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  body: CalendarEventBody
): Promise<void> {
  await calendarFetch<unknown>(accessToken, `/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    // The client-chosen id is what makes this idempotent — see deriveEventId.
    body: JSON.stringify({ id: eventId, ...body }),
  });
}

/**
 * Full replace (PUT), not PATCH.
 *
 * PATCH would leave fields this app no longer writes in whatever state a
 * previous version left them — a description that should now be empty because
 * the user turned `includeDescription` off would simply persist. PUT makes the
 * event match what the app currently intends, which is the whole meaning of
 * "overwrite existing items".
 *
 * `status: "confirmed"` is explicit so the same call also revives an event the
 * user deleted in Google Calendar, rather than silently no-op'ing on a
 * cancelled one.
 */
export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  body: CalendarEventBody
): Promise<void> {
  await calendarFetch<unknown>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "PUT", body: JSON.stringify({ ...body, status: "confirmed" }) }
  );
}

export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  try {
    await calendarFetch<void>(
      accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: "DELETE" }
    );
  } catch (err) {
    // Already gone is the outcome this asked for. Google answers 410 for an
    // event deleted since the list call, and 404 if it never existed.
    if (err instanceof GoogleApiError && (err.status === 410 || err.status === 404)) return;
    throw err;
  }
}

/** Re-exported so callers building day-scoped queries don't import two modules. */
export { DAY_KEY };
