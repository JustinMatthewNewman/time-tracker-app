import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { badRequest, serverError } from "@/lib/auth-middleware";
import { adminCreateTeam, adminListTeams } from "@/src/dataconnect-admin-generated";

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
        color: t.color ?? null,
        weeklyTargetHours: t.weeklyTargetHours ?? null,
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


const NAME_MAX = 80;
const DESCRIPTION_MAX = 500;

/**
 * POST /api/admin/teams — create a team.
 *
 * Name only (plus an optional description): colour and target are set from the
 * team's own settings afterwards, so creating a team is one decision rather
 * than a form.
 */
export async function POST(req: NextRequest) {
  const gate = await requireFeature(req, "AdminDashboard");
  if (!gate.ok) return gate.response;

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

  const trimmedDescription = typeof description === "string" ? description.trim() : "";

  try {
    const { data } = await adminCreateTeam({
      name: name.trim(),
      description: trimmedDescription === "" ? null : trimmedDescription,
    });
    return NextResponse.json(
      { team: { id: data.team_insert.id, name: name.trim(), description: trimmedDescription || null } },
      { status: 201 }
    );
  } catch (err) {
    // Team.name is @unique, so a clash is a user error, not a server fault.
    const message = err instanceof Error ? err.message : "";
    if (/unique|duplicate/i.test(message)) {
      return badRequest(`A team named "${name.trim()}" already exists`);
    }
    console.error("Error creating team:", err);
    return serverError("Failed to create team");
  }
}
