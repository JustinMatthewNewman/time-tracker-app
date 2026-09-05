import { beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";

// Set before importing: the modules read the key lazily per call, but keeping
// this ordering makes the dependency explicit for anyone editing the file.
beforeAll(() => {
  process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

const load = async () => import("./crypto");

describe("sealToken / openToken", () => {
  it("round-trips a refresh token", async () => {
    const { sealToken, openToken } = await load();
    const token = "1//0abcdefgHIJKLMNOP-qrstuvwxyz_0123456789";
    expect(openToken(sealToken(token))).toBe(token);
  });

  it("produces different ciphertext each time (random IV)", async () => {
    const { sealToken } = await load();
    expect(sealToken("same-token")).not.toBe(sealToken("same-token"));
  });

  it("rejects tampered ciphertext instead of returning garbage", async () => {
    const { sealToken, openToken } = await load();
    const sealed = sealToken("secret");
    const [v, iv, tag, ct] = sealed.split(".");
    // Flip a character in the ciphertext body.
    const tampered = [v, iv, tag, ct.slice(0, -1) + (ct.at(-1) === "A" ? "B" : "A")].join(".");
    expect(() => openToken(tampered)).toThrow();
  });

  it("rejects an unrecognized format", async () => {
    const { openToken } = await load();
    expect(() => openToken("not-a-sealed-token")).toThrow(/recognized format/);
  });

  it("cannot be opened with a different key", async () => {
    const { sealToken, openToken } = await load();
    const sealed = sealToken("secret");
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    expect(() => openToken(sealed)).toThrow();
  });
});

describe("signState / verifyState", () => {
  beforeAll(() => {
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  it("round-trips the uid and nonce", async () => {
    const { signState, verifyState, newNonce } = await load();
    const nonce = newNonce();
    const state = signState({ uid: "firebase-uid-1", nonce, iat: Date.now() });

    const payload = verifyState(state, 600_000);
    expect(payload?.uid).toBe("firebase-uid-1");
    expect(payload?.nonce).toBe(nonce);
  });

  it("rejects a state whose payload was edited to name another user", async () => {
    // The attack this exists to stop: binding an attacker's Google account to
    // someone else's app account by rewriting the uid.
    const { signState, verifyState } = await load();
    const state = signState({ uid: "victim", nonce: "n", iat: Date.now() });
    const [, sig] = state.split(".");
    const forgedBody = Buffer.from(
      JSON.stringify({ uid: "attacker", nonce: "n", iat: Date.now() }),
      "utf8"
    ).toString("base64url");

    expect(verifyState(`${forgedBody}.${sig}`, 600_000)).toBeNull();
  });

  it("rejects an expired state", async () => {
    const { signState, verifyState } = await load();
    const state = signState({ uid: "u", nonce: "n", iat: Date.now() - 60_000 });
    expect(verifyState(state, 30_000)).toBeNull();
  });

  it("rejects a malformed state", async () => {
    const { verifyState } = await load();
    expect(verifyState("garbage", 600_000)).toBeNull();
    expect(verifyState("a.b.c", 600_000)).toBeNull();
  });
});

describe("nonceEquals", () => {
  it("matches identical nonces and rejects different ones", async () => {
    const { nonceEquals } = await load();
    expect(nonceEquals("abc123", "abc123")).toBe(true);
    expect(nonceEquals("abc123", "abc124")).toBe(false);
  });

  it("returns false rather than throwing on length mismatch", async () => {
    // timingSafeEqual throws on differing lengths — the guard must come first.
    const { nonceEquals } = await load();
    expect(nonceEquals("short", "much-longer-value")).toBe(false);
  });
});
