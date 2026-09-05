/** Name of the httpOnly cookie holding the OAuth CSRF nonce. */
export const OAUTH_STATE_COOKIE = "gcal_oauth_state";

/**
 * How long an authorization attempt stays valid.
 *
 * Long enough to pick a Google account and read a consent screen, short enough
 * that a `state` captured from a browser history, a referrer, or a proxy log
 * is useless by the time anyone finds it.
 */
export const STATE_TTL_MS = 10 * 60 * 1000;
