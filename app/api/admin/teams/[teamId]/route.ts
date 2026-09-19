import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { badRequest, notFound, serverError } from "@/lib/auth-middleware";
import { adminDeleteTeam, adminGetTeam, adminUpdateTeam } from "@/src/dataconnect-admin-generated";
import { normalizeTicketColor } from "@/lib/ticketColor";

const NAME_MAX = 80;
const DESCRIPTION_MAX = 500;
// A week of continuous time is 168h; anything at or beyond that is a typo, not
// a target. Zero is allowed and means "no target" the same way null does.
const WEEKLY_TARGET_MAX = 168;

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

  const { name, description, color, weeklyTargetHours } = (body ?? {}) as {
    name?: unknown;
    description?: unknown;
    color?: unknown;
    weeklyTargetHours?: unknown;
  };

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

  // Reuses the ticket colour validator: same "#rrggbb" convention, and it
  // rejects anything else rather than letting an arbitrary string reach a
  // style attribute.
  let normalizedColor: string | null = null;
  if (color != null && color !== "") {
    if (typeof color !== "string") return badRequest("color must be a string");
    normalizedColor = normalizeTicketColor(color);
    if (!normalizedColor) return badRequest(`"${color}" is not a valid #rrggbb color`);
  }

  let target: number | null = null;
  if (weeklyTargetHours != null && weeklyTargetHours !== "") {
    const n = Number(weeklyTargetHours);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      return badRequest("weeklyTargetHours must be a whole number of hours, or null");
    }
    if (n > WEEKLY_TARGET_MAX) {
      return badRequest(`weeklyTargetHours must be ${WEEKLY_TARGET_MAX} or fewer`);
    }
    // 0 and null both mean "no target"; stored as null so there is one empty
    // state rather than two that render differently.
    target = n === 0 ? null : n;
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
      color: normalizedColor,
      weeklyTargetHours: target,
    });

    return NextResponse.json({
      team: {
        id: teamId,
        name: name.trim(),
        description: trimmedDescription || null,
        color: normalizedColor,
        weeklyTargetHours: target,
      },
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


/**
 * DELETE /api/admin/teams/[teamId] — delete a team.
 *
 * Drops the team and, by the cascade on TeamMember.team, its memberships.
 * Users and their time entries are untouched: a TimeEntry has no team
 * reference, so no time data can be lost this way. The response says how many
 * memberships went with it, so the caller can report what actually happened
 * rather than a bare success.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const gate = await requireFeature(req, "AdminDashboard");
  if (!gate.ok) return gate.response;

  const { teamId } = await params;

  try {
    // team_delete on a missing id is a no-op, which would report success for a
    // team that never existed.
    const existing = await adminGetTeam({ teamId });
    if (!existing.data.team) return notFound("Team not found");

    const removedMemberships = existing.data.team.members.length;
    await adminDeleteTeam({ teamId });

    return NextResponse.json({
      deleted: { id: teamId, name: existing.data.team.name, removedMemberships },
    });
  } catch (err) {
    console.error("Error deleting team:", err);
    return serverError("Failed to delete team");
  }
}
