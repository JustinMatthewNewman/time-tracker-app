// Server-side configuration for the Google Calendar integration.
//
// Everything here is read from the environment at call time rather than at
// module load. Module-level `process.env` reads run during Next's build, where
// these vars legitimately don't exist yet — the same crash lib/firebase-admin.ts
// works around by initializing Firebase Admin inside a function instead of at
// import time.
//
// None of these are NEXT_PUBLIC_. The client secret and encryption key must
// never reach the browser, and the client id has no reason to: the browser
// never builds the authorization URL itself, it asks POST /api/google-calendar/connect
// for one.

/**
 * The only scope this integration requests that touches calendar data.
 *
 * `calendar.app.created` is deliberately the narrowest scope that can do the
 * job, and picking it is a security decision, not a detail. It permits
 * creating secondary calendars and reading/writing events *on calendars this
 * app itself created* — and nothing else. Even a total compromise of the
 * stored refresh token cannot read, alter, or delete the user's primary
 * calendar or any calendar they made themselves, because Google refuses those
 * requests at the token level rather than relying on this code to behave.
 *
 * The obvious alternatives are all strictly worse here:
 *   - `calendar`            — full read/write/delete on every calendar. Wildly
 *                             more access than "write my own time entries".
 *   - `calendar.events`     — events on *all* calendars, primary included.
 *   - `calendar.events.owned` — same problem: every calendar the user owns.
 *
 * Changing this string invalidates existing consents: users must reconnect to
 * grant the new scope, and the stored `scope` column is checked before a sync
 * runs (see hasCalendarScope in store.ts) so that shows up as a clear
 * "reconnect" message instead of a 403 from Google halfway through.
 *
 * Granular consent means the user can approve a subset of what was asked for,
 * so the granted scope always has to be re-read from the token response rather
 * than assumed to equal OAUTH_SCOPES.
 */
export const CALENDAR_WRITE_SCOPE = "https://www.googleapis.com/auth/calendar.app.created";

/**
 * Scopes requested at connect time.
 *
 * `openid` + `email` are here only so the callback can learn which Google
 * account was authorized and show it on the settings card ("Connected as
 * ..."). Without it the app would hold a credential it cannot name, which is a
 * bad thing to ask someone to trust. Both are non-sensitive and need no
 * Google verification review; neither grants access to any calendar data.
 */
export const OAUTH_SCOPES = [CALENDAR_WRITE_SCOPE, "openid", "email"] as const;

export const OAUTH_SCOPE_PARAM = OAUTH_SCOPES.join(" ");

export const CALENDAR_SUMMARY = "Time Tracker";

export const CALENDAR_DESCRIPTION =
  "Work time synced from Time Tracker. Events here are managed by the app — " +
  "edits made in Google Calendar may be overwritten on the next sync.";

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

class MissingConfigError extends Error {
  constructor(names: string[]) {
    super(
      `Google Calendar integration is not configured — missing ${names.join(", ")}. ` +
        `See the "Google Calendar Sync" section of README.md.`
    );
    this.name = "MissingConfigError";
  }
}

/**
 * Throws MissingConfigError (not a bare Error) when unset, so route handlers
 * can answer 503 "not configured on this server" rather than a 500 that reads
 * like a bug. An unconfigured integration is an expected state — a fresh clone
 * has no Google Cloud project behind it — and the settings card renders a
 * setup hint instead of an error when it sees that distinction.
 */
export function getOAuthConfig(): GoogleOAuthConfig {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  const missing: string[] = [];
  if (!clientId) missing.push("GOOGLE_OAUTH_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_OAUTH_CLIENT_SECRET");
  if (!redirectUri) missing.push("GOOGLE_OAUTH_REDIRECT_URI");
  if (missing.length) throw new MissingConfigError(missing);

  return { clientId: clientId!, clientSecret: clientSecret!, redirectUri: redirectUri! };
}

/** True when every env var the integration needs is present. */
export function isConfigured(): boolean {
  try {
    getOAuthConfig();
    getEncryptionKeyMaterial();
    return true;
  } catch {
    return false;
  }
}

export function isMissingConfigError(err: unknown): err is MissingConfigError {
  return err instanceof Error && err.name === "MissingConfigError";
}

/**
 * Raw master key bytes for lib/googleCalendar/crypto.ts.
 *
 * Lives here rather than in crypto.ts so that isConfigured() can check it
 * alongside the OAuth vars in one place, and so crypto.ts stays a pure
 * key-in/bytes-out module with no environment knowledge of its own.
 */
export function getEncryptionKeyMaterial(): Buffer {
  const raw = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new MissingConfigError(["GOOGLE_TOKEN_ENCRYPTION_KEY"]);

  // base64 and base64url both decode with the "base64" decoder in Node, so a
  // key generated either way works.
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `GOOGLE_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes (got ${key.length}). ` +
        `Generate one with: openssl rand -base64 32`
    );
  }
  return key;
}
