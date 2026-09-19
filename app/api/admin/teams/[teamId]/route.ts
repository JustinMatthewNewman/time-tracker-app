import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { badRequest, notFound, serverError } from "@/lib/auth-middleware";
import { adminGetTeam, adminUpdateTeam } from "@/src/dataconnect-admin-generated";

const NAME_MAX = 80;
const DESCRIPTION_MAX = 500;

/**
 * PATCH /api/admin/teams/[teamId] — rename a team or change its description.
 *
 * Gated on AdminDashboard, the same grant that already exposes team rosters
 * and per-member hours. Editing is a step up from reading, so a dedicated
 * write grant would be stricter — that was not added here because a new
 * Feature needs a seed migration plus grants to every tier before anyone can
 * see the page at all, and nothing in this endpoint crosses a privilege
 * boundary that AdminDashboard doesn't already cross.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const gate = await requireFeature(req, "AdminDashboard");
  if (!gate.ok) return gate.response;

  // Next.js 16 async params, as in app/api/admin/users/[userId]/route.ts.
  const { teamId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be JSON");
  }

  const { name, description } = (body ?? {}) as { name?: unknown; description?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    return badRequest("name is required");
  }
  if (name.trim().length > NAME_MAX) {
    return badRequest(`name must be ${NAME_MAX} characters or fewer`);
  }
  if (description != null && typeof description !== "string") {
    return badRequest("description must be a string or null");
  }
  if (typeof description === "string" && description.length > DESCRIPTION_MAX) {
    return badRequest(`description must be ${DESCRIPTION_MAX} characters or fewer`);
  }

  try {
    // Confirm the target exists first: team_update on a missing id is a no-op,
    // which would otherwise report success for a team that was never changed
    // (same reasoning as the user-tier route).
    const existing = await adminGetTeam({ teamId });
    if (!existing.data.team) return notFound("Team not found");

    const trimmedDescription =
      typeof description === "string" ? description.trim() : null;

    await adminUpdateTeam({
      teamId,
      name: name.trim(),
      // Empty string and "no description" are the same thing to a reader, so
      // they are stored the same way rather than as two distinct empty states.
      description: trimmedDescription === "" ? null : trimmedDescription,
    });

    return NextResponse.json({
      team: { id: teamId, name: name.trim(), description: trimmedDescription || null },
    });
  } catch (err) {
    // A duplicate name trips Team.name's @unique constraint.
    const message = err instanceof Error ? err.message : "";
    if (/unique|duplicate/i.test(message)) {
      return badRequest(`A team named "${name.trim()}" already exists`);
    }
    console.error("Error updating team:", err);
    return serverError("Failed to update team");
  }
}
