import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { badRequest, notFound, serverError } from "@/lib/auth-middleware";
import { isUserTypeName } from "@/lib/userTypes";
import { setUserType, adminGetUser } from "@/src/dataconnect-admin-generated";

/**
 * PATCH /api/admin/users/[userId] — change a user's tier.
 *
 * Gated on UserTypeControl rather than AdminPage: seeing the user list and
 * rewriting people's permissions are different privileges, and this endpoint
 * is the privilege-escalation path — whoever can call it can mint admins.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const gate = await requireFeature(req, "UserTypeControl");
  if (!gate.ok) return gate.response;

  // Next.js 16 async params, as in app/api/entries/[id]/route.ts.
  const { userId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be JSON");
  }

  const userTypeName = (body as { userTypeName?: unknown })?.userTypeName;
  if (typeof userTypeName !== "string") {
    return badRequest("userTypeName is required");
  }

  // Validate against the known tiers rather than passing the string through.
  // Without this a bad value reaches the FK and surfaces as an opaque 500
  // instead of a clear 400 — and the set of tiers is closed, so there's no
  // reason to let arbitrary input near the database.
  if (!isUserTypeName(userTypeName)) {
    return badRequest(`Unknown user type "${userTypeName}"`);
  }

  // Lockout guard. Nothing else in this system can restore a lost grant
  // through the UI: demote the only account holding UserTypeControl and the
  // sole remaining fix is a direct database write. Refusing self-edits blocks
  // the realistic version of that mistake while still letting two admins
  // manage each other.
  if (userId === gate.access.userId) {
    return badRequest(
      "You can't change your own tier — ask another user with UserTypeControl to do it."
    );
  }

  try {
    // Confirm the target exists first: user_update on a missing id is a no-op,
    // which would otherwise report success for a user that was never changed.
    const existing = await adminGetUser({ userId });
    if (!existing.data.user) return notFound("User not found");

    await setUserType({ userId, userTypeName });

    return NextResponse.json({
      user: {
        id: userId,
        username: existing.data.user.username,
        userType: userTypeName,
      },
    });
  } catch (err) {
    console.error("Error updating user type:", err);
    return serverError("Failed to update user type");
  }
}
