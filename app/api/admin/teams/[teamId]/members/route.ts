import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { badRequest, notFound, serverError } from "@/lib/auth-middleware";
import { adminAddTeamMember, adminGetTeam, adminGetUser } from "@/src/dataconnect-admin-generated";

/**
 * POST /api/admin/teams/[teamId]/members — add a user to a team.
 *
 * Gated on AdminDashboard; see the note on PATCH /api/admin/teams/[teamId].
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const gate = await requireFeature(req, "AdminDashboard");
  if (!gate.ok) return gate.response;

  const { teamId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Body must be JSON");
  }

  const userId = (body as { userId?: unknown })?.userId;
  if (typeof userId !== "string" || userId.length === 0) {
    return badRequest("userId is required");
  }

  try {
    const team = await adminGetTeam({ teamId });
    if (!team.data.team) return notFound("Team not found");

    // Check the user exists before inserting: TeamMember's FK would otherwise
    // fail with an opaque constraint error instead of a clear 404.
    const user = await adminGetUser({ userId });
    if (!user.data.user) return notFound("User not found");

    // TeamMember is keyed on (team, user), so a repeat insert violates the
    // primary key. Answer that as a conflict rather than a 500 — the realistic
    // cause is two admins adding the same person, or a double-click.
    if (team.data.team.members.some((m) => m.user.id === userId)) {
      return NextResponse.json(
        { error: `${user.data.user.username} is already on this team` },
        { status: 409 }
      );
    }

    await adminAddTeamMember({ teamId, userId });

    return NextResponse.json({
      member: {
        id: userId,
        username: user.data.user.username,
        userType: user.data.user.userType.name,
      },
    });
  } catch (err) {
    console.error("Error adding team member:", err);
    return serverError("Failed to add team member");
  }
}
