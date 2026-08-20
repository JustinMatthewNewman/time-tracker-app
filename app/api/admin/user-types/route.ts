import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { serverError } from "@/lib/auth-middleware";
import { adminListUserTypes, adminListFeatures } from "@/src/dataconnect-admin-generated";

/**
 * GET /api/admin/user-types — every tier with its granted features, plus the
 * full feature catalogue so the UI can show what a tier is *missing* as well
 * as what it has.
 *
 * Both underlying queries are NO_ACCESS and unreachable from the browser;
 * requireFeature() is the gate.
 */
export async function GET(req: NextRequest) {
  const gate = await requireFeature(req, "AdminPage");
  if (!gate.ok) return gate.response;

  try {
    // Independent reads — run them together rather than serially.
    const [userTypesRes, featuresRes] = await Promise.all([
      adminListUserTypes(),
      adminListFeatures(),
    ]);

    return NextResponse.json({
      userTypes: userTypesRes.data.userTypes.map((t) => ({
        id: t.id,
        name: t.name,
        features: t.features.map((f) => f.name),
      })),
      features: featuresRes.data.features.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description ?? null,
      })),
    });
  } catch (err) {
    console.error("Error listing user types for admin dashboard:", err);
    return serverError("Failed to list user types");
  }
}
