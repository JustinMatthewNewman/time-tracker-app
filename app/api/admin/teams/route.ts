import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { serverError } from "@/lib/auth-middleware";
import { adminListTeams } from "@/src/dataconnect-admin-generated";

/**
 * GET /api/admin/teams — every team with its members.
 *
 * Gated on AdminDashboard rather than AdminPage: opening the admin page and
 * seeing team rosters are separate grants, so a tier can be given one without
 * the other. AdminListTeams itself is NO_ACCESS and unreachable from the
 * browser.
 */
export async function GET(req: NextRequest) {
  const gate = await requireFeature(req, "AdminDashboard");
  if (!gate.ok) return gate.response;

  try {
    const { data } = await adminListTeams();
    return NextResponse.json({
      teams: data.teams.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? null,
        createdAt: t.createdAt,
        members: t.members.map((m) => ({
          id: m.user.id,
          username: m.user.username,
          email: m.user.email ?? null,
          userType: m.user.userType.name,
        })),
      })),
    });
  } catch (err) {
    console.error("Error listing teams for admin dashboard:", err);
    return serverError("Failed to list teams");
  }
}
