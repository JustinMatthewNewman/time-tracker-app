import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";
import { getEncryptionKeyMaterial } from "./config";

// Two jobs, one master key (GOOGLE_TOKEN_ENCRYPTION_KEY):
//
//   1. Seal the Google OAuth refresh token before it goes into the database.
//      The token is a long-lived credential to a user's calendar, and unlike a
//      password there is nothing to hash — it has to be recoverable. So it's
//      encrypted at rest, which means a leaked database dump is not by itself
//      enough to reach anyone's calendar; an attacker also needs the key, which
//      lives in the environment and never in Postgres.
//
//   2. Sign the OAuth `state` parameter. See signState below for why that is a
//      security control and not just a round-trip convenience.
//
// The master key is never used directly for either. HKDF derives a separate
// subkey per purpose, so the encryption key and the signing key are unrelated
// values — cryptographic domain separation. Reusing one key for both AES-GCM
// and HMAC is the kind of thing that is usually fine and occasionally
// catastrophic, and there is no reason to take the bet when hkdfSync is in
// the standard library.

const AES_INFO = "time-tracker:gcal:token-encryption:v1";
const HMAC_INFO = "time-tracker:gcal:oauth-state:v1";

// HKDF with no salt. The master key is already 32 bytes of CSPRNG output
// (`openssl rand -base64 32`), not a low-entropy password, so the salt's job —
// stretching weak input — doesn't apply. `info` is what matters here, and it
// differs per purpose.
const NO_SALT = Buffer.alloc(0);

function subkey(info: string): Buffer {
  return Buffer.from(hkdfSync("sha256", getEncryptionKeyMaterial(), NO_SALT, Buffer.from(info), 32));
}

const CIPHER_VERSION = "v1";
const IV_BYTES = 12; // 96 bits, the size GCM is specified around

/**
 * Seals a refresh token for storage in GoogleCalendarConnection.refreshTokenCipher.
 *
 * Format: "v1.<iv>.<authTag>.<ciphertext>", each part base64url.
 *
 * AES-256-GCM rather than AES-CBC: GCM is authenticated, so openToken() fails
 * loudly on tampered ciphertext instead of returning plausible garbage that
 * would then be sent to Google as a token.
 *
 * The version prefix is here so that rotating to a different algorithm later
 * is a decode-time branch rather than a database full of ambiguous blobs.
 */
export function sealToken(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", subkey(AES_INFO), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [CIPHER_VERSION, b64u(iv), b64u(tag), b64u(ciphertext)].join(".");
}

/**
 * Opens a sealed refresh token. Throws if the key is wrong, the payload was
 * tampered with, or the format is unrecognized — all of which are the same
 * actionable situation for a caller ("this stored credential is unusable, make
 * the user reconnect"), so they deliberately aren't distinguished.
 */
export function openToken(sealed: string): string {
  const parts = sealed.split(".");
  if (parts.length !== 4 || parts[0] !== CIPHER_VERSION) {
    throw new Error("Stored Google refresh token is not in a recognized format");
  }
  const [, ivPart, tagPart, ctPart] = parts;

  const decipher = createDecipheriv("aes-256-gcm", subkey(AES_INFO), unb64u(ivPart));
  decipher.setAuthTag(unb64u(tagPart));
  return Buffer.concat([decipher.update(unb64u(ctPart)), decipher.final()]).toString("utf8");
}

export interface OAuthStatePayload {
  /** Firebase uid of the user who started the flow. */
  uid: string;
  /** Random per-request nonce — the CSRF token proper. */
  nonce: string;
  /** Issued-at, epoch ms. Enforced by verifyState's maxAge. */
  iat: number;
}

/**
 * Mints a signed OAuth `state` value.
 *
 * Why this is signed rather than a random string matched against a session:
 * the callback route is a plain top-level GET from Google's redirect. It
 * carries no Authorization header, so it cannot verify a Firebase ID token,
 * and it must still learn *which user* it is storing a credential for. Putting
 * the uid in a signed state (paired with the same value in an httpOnly cookie,
 * see the callback route) means the uid is attacker-visible but not
 * attacker-writable: forging one requires the HMAC key.
 *
 * Get this wrong and the bug is severe rather than cosmetic — an unauthenticated
 * `state` would let anyone attach *their* Google account's refresh token to
 * *someone else's* app account, or vice versa.
 */
export function signState(payload: OAuthStatePayload): string {
  const body = b64u(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${b64u(hmac(body))}`;
}

/**
 * Verifies and decodes a state value. Returns null on any failure — bad
 * format, bad signature, or too old — rather than throwing, because every
 * one of those is "reject this callback", not an exceptional condition.
 */
export function verifyState(token: string, maxAgeMs: number): OAuthStatePayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expected = hmac(body);
  const provided = unb64u(sig);
  // Constant-time: a length-sensitive or short-circuiting compare here leaks
  // the expected signature one byte at a time to a patient attacker.
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(unb64u(body).toString("utf8"));
  } catch {
    return null;
  }

  if (typeof payload?.uid !== "string" || typeof payload?.iat !== "number") return null;
  // Bounded validity, so a state captured from a browser history or a proxy
  // log can't be replayed days later.
  if (Date.now() - payload.iat > maxAgeMs) return null;

  return payload;
}

/** Fresh CSRF nonce for a new authorization attempt. */
export function newNonce(): string {
  return b64u(randomBytes(16));
}

/** Constant-time equality for two nonces of arbitrary length. */
export function nonceEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function hmac(data: string): Buffer {
  return createHmac("sha256", subkey(HMAC_INFO)).update(data).digest();
}

function b64u(buf: Buffer): string {
  return buf.toString("base64url");
}

function unb64u(value: string): Buffer {
  return Buffer.from(value, "base64url");
}
