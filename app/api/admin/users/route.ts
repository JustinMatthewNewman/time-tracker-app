import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { serverError } from "@/lib/auth-middleware";
import { adminListUsers } from "@/src/dataconnect-admin-generated";

/**
 * GET /api/admin/users — every user and their tier.
 *
 * The underlying AdminListUsers query is NO_ACCESS, so it is unreachable from
 * the browser; this route is the only door, and requireFeature() is its lock.
 */
export async function GET(req: NextRequest) {
  const gate = await requireFeature(req, "AdminPage");
  if (!gate.ok) return gate.response;

  try {
    const { data } = await adminListUsers();
    return NextResponse.json({
      users: data.users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email ?? null,
        userType: u.userType.name,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error listing users for admin dashboard:", err);
    return serverError("Failed to list users");
  }
}
