import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "./auth-middleware";
import { getUserAccessByGoogleUid } from "@/src/dataconnect-admin-generated";
import type { FeatureName } from "./features";
import type { UserTypeName } from "./userTypes";

// THE security boundary for feature-gated capabilities.
//
// hooks/useFeatures.ts decides what the UI renders, but that value round-trips
// through the browser and is therefore worthless as a guard — a user can edit
// it, or just call the API directly and never load the UI at all. Every
// privileged route must call requireFeature() and trust nothing from the
// request body about who the caller is.
//
// The chain of trust: verify the Firebase ID token (yielding a uid the client
// cannot forge) -> look the uid's tier and grants up in the database
// -> compare. Nothing client-supplied enters that path.

export interface CallerAccess {
  userId: string;
  googleUid: string;
  username: string;
  userType: UserTypeName;
  features: Set<string>;
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** Resolves a *already-verified* Firebase uid to its tier and granted features. */
export async function getCallerAccess(googleUid: string): Promise<CallerAccess | null> {
  const { data } = await getUserAccessByGoogleUid({ googleUid });
  const user = data.user;
  if (!user) return null;

  return {
    userId: user.id,
    googleUid,
    username: user.username,
    userType: user.userType.name as UserTypeName,
    features: new Set(user.userType.features.map((f) => f.name)),
  };
}

type RequireFeatureResult =
  | { ok: true; access: CallerAccess; response?: never }
  | { ok: false; access?: never; response: NextResponse };

/**
 * Gate for a route handler. Returns the caller's access on success, or the
 * response to return on failure.
 *
 *   const gate = await requireFeature(req, "AdminPage");
 *   if (!gate.ok) return gate.response;
 *   // ...gate.access is trustworthy from here
 */
export async function requireFeature(
  req: NextRequest,
  feature: FeatureName
): Promise<RequireFeatureResult> {
  const auth = await verifyAuthToken(req);
  if (!auth.authorized || !auth.userId) {
    return { ok: false, response: NextResponse.json({ error: auth.error }, { status: 401 }) };
  }

  const access = await getCallerAccess(auth.userId);
  // A verified token with no user row means sync-user hasn't run yet. Treated
  // as forbidden rather than 500 — it's a legitimate transient state, and
  // "no row" must never be read as "no restrictions".
  if (!access) return { ok: false, response: forbidden("No user record for this account") };

  // Deliberately not "or is an Admin": Admin's access comes from holding the
  // grant in UserTypeFeature, not from a hardcoded tier check here. That's the
  // whole point of the xref — one code path, permissions live in data.
  if (!access.features.has(feature)) {
    return { ok: false, response: forbidden(`Requires the ${feature} feature`) };
  }

  return { ok: true, access };
}
