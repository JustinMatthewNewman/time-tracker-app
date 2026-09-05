import {
  deleteGoogleCalendarConnection,
  getGoogleCalendarConnection,
  touchGoogleCalendarLastSynced,
  updateGoogleCalendarSyncPrefs,
  upsertGoogleCalendarConnection,
} from "@/src/dataconnect-admin-generated";
import { CALENDAR_WRITE_SCOPE, getOAuthConfig } from "./config";
import { openToken, sealToken } from "./crypto";
import { GoogleApiError, refreshAccessToken } from "./api";
import type { EventPrefs } from "./events";

// Database access for the Google Calendar integration, plus the boundary that
// decides what of it the browser is allowed to see.
//
// Every operation here runs through the Admin SDK against NO_ACCESS Data
// Connect operations, for the reason spelled out on GoogleCalendarConnection in
// schema.gql: the row holds a live credential and must never be readable from
// the client.

/** The stored row, credential included. Server-side only — never serialized to a response. */
export interface StoredConnection {
  calendarId: string;
  googleEmail: string | null;
  refreshTokenCipher: string;
  scope: string;
  prefs: EventPrefs;
  connectedAt: string;
  lastSyncedAt: string | null;
}

/**
 * What the settings card is allowed to know.
 *
 * A separate type rather than a `delete row.refreshTokenCipher` on the way out:
 * making the redacted shape explicit means adding a field to the table can't
 * accidentally leak it, because it has to be named here to travel.
 */
export interface PublicConnection {
  connected: true;
  calendarId: string;
  googleEmail: string | null;
  connectedAt: string;
  lastSyncedAt: string | null;
  /** False when the user granted a narrower consent than asked for. */
  hasCalendarScope: boolean;
  prefs: EventPrefs;
}

export async function loadConnection(userId: string): Promise<StoredConnection | null> {
  const { data } = await getGoogleCalendarConnection({ userId });
  const row = data.googleCalendarConnection;
  if (!row) return null;

  return {
    calendarId: row.calendarId,
    googleEmail: row.googleEmail ?? null,
    refreshTokenCipher: row.refreshTokenCipher,
    scope: row.scope,
    prefs: {
      mergeConsecutive: row.mergeConsecutive,
      overwriteExisting: row.overwriteExisting,
      pruneOrphans: row.pruneOrphans,
      markAsFree: row.markAsFree,
      includeDescription: row.includeDescription,
    },
    connectedAt: row.connectedAt,
    lastSyncedAt: row.lastSyncedAt ?? null,
  };
}

export function toPublicConnection(stored: StoredConnection): PublicConnection {
  return {
    connected: true,
    calendarId: stored.calendarId,
    googleEmail: stored.googleEmail,
    connectedAt: stored.connectedAt,
    lastSyncedAt: stored.lastSyncedAt,
    hasCalendarScope: hasCalendarScope(stored.scope),
    prefs: stored.prefs,
  };
}

/**
 * Whether the granted consent actually covers writing calendars.
 *
 * Google's granular consent lets someone approve the sign-in scopes and
 * decline the calendar one, which produces a perfectly valid token that fails
 * every Calendar call with a 403. Checking the recorded grant up front turns
 * that into "reconnect and allow calendar access" before any work starts,
 * instead of an opaque failure partway through a sync.
 */
export function hasCalendarScope(scope: string): boolean {
  return scope.split(/\s+/).includes(CALENDAR_WRITE_SCOPE);
}

export async function saveConnection(params: {
  userId: string;
  calendarId: string;
  googleEmail: string | null;
  refreshToken: string;
  scope: string;
}): Promise<void> {
  await upsertGoogleCalendarConnection({
    userId: params.userId,
    calendarId: params.calendarId,
    googleEmail: params.googleEmail,
    refreshTokenCipher: sealToken(params.refreshToken),
    scope: params.scope,
  });
}

export async function savePrefs(userId: string, prefs: EventPrefs): Promise<void> {
  await updateGoogleCalendarSyncPrefs({ userId, ...prefs });
}

export async function markSynced(userId: string): Promise<void> {
  await touchGoogleCalendarLastSynced({ userId });
}

export async function forgetConnection(userId: string): Promise<void> {
  await deleteGoogleCalendarConnection({ userId });
}

/** Recovers the plaintext refresh token. Throws if the row is unreadable. */
export function readRefreshToken(stored: StoredConnection): string {
  return openToken(stored.refreshTokenCipher);
}

/**
 * Trades the stored refresh token for a short-lived access token.
 *
 * Deliberately not cached. An access token lives an hour, so caching one would
 * save at most a single request per hour of active syncing, in exchange for
 * holding a bearer credential in process memory across requests on a server
 * that may be handling several users. The refresh call is one round trip; the
 * trade isn't worth it.
 */
export async function getAccessToken(stored: StoredConnection): Promise<string> {
  const config = getOAuthConfig();
  const refreshToken = readRefreshToken(stored);
  const tokens = await refreshAccessToken(config, refreshToken);
  return tokens.access_token;
}

/** True when the failure means the user has to reconnect, not that we should retry. */
export function isReauthRequired(err: unknown): boolean {
  return err instanceof GoogleApiError && err.isAuthFailure;
}
