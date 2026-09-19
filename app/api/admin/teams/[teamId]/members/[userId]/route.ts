import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { notFound, serverError } from "@/lib/auth-middleware";
import { adminGetTeam, adminRemoveTeamMember } from "@/src/dataconnect-admin-generated";

/**
 * DELETE /api/admin/teams/[teamId]/members/[userId] — remove a user from a team.
 *
 * Gated on AdminDashboard; see the note on PATCH /api/admin/teams/[teamId].
 *
 * Membership only: this drops the TeamMember row and never touches the User or
 * their time entries. Deleting a user is not something this endpoint can do by
 * accident.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  const gate = await requireFeature(req, "AdminDashboard");
  if (!gate.ok) return gate.response;

  const { teamId, userId } = await params;

  try {
    const team = await adminGetTeam({ teamId });
    if (!team.data.team) return notFound("Team not found");

    // teamMember_delete on a missing key is a no-op, which would report
    // success for a membership that never existed.
    if (!team.data.team.members.some((m) => m.user.id === userId)) {
      return notFound("That user is not on this team");
    }

    await adminRemoveTeamMember({ teamId, userId });
    return NextResponse.json({ removed: { teamId, userId } });
  } catch (err) {
    console.error("Error removing team member:", err);
    return serverError("Failed to remove team member");
  }
}
