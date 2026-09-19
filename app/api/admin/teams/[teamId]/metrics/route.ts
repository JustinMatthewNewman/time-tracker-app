import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { badRequest, notFound, serverError } from "@/lib/auth-middleware";
import { fetchAllPages } from "@/lib/dataconnectPagination";
import { aggregateMembers, aggregateTeam, type MetricEntry } from "@/lib/adminTeamMetrics";
import { adminGetTeam, adminListTimeEntriesForUsers } from "@/src/dataconnect-admin-generated";
import type {
  AdminListTimeEntriesForUsersData,
  AdminListTimeEntriesForUsersVariables,
} from "@/src/dataconnect-admin-generated";

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Widest range the endpoint will aggregate in one request.
 *
 * This is a cost guard, not a product decision: the seeded test account alone
 * carries ~9,900 entries over two years, so an unbounded range times a team
 * roster is an easy way to make one request page through the whole table.
 */
const MAX_RANGE_DAYS = 366;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / MS_PER_DAY);
}

/**
 * GET /api/admin/teams/[teamId]/metrics?start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * Team and per-member time totals over a date range.
 *
 * Gated on AdminDashboard, matching GET /api/admin/teams — this is the same
 * cross-user visibility, with hours attached. The underlying Data Connect
 * operations are NO_ACCESS and unreachable from a browser, so this gate is the
 * only way in rather than a second opinion on top of a client-callable query.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const gate = await requireFeature(req, "AdminDashboard");
  if (!gate.ok) return gate.response;

  // Next.js 16 async params, as in app/api/admin/users/[userId]/route.ts.
  const { teamId } = await params;

  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");

  if (!start || !end || !DAY_KEY.test(start) || !DAY_KEY.test(end)) {
    return badRequest("start and end are required, as YYYY-MM-DD");
  }
  if (start > end) {
    // Day keys are zero-padded, so lexical order is chronological order.
    return badRequest("start must not be after end");
  }
  const span = daysBetween(start, end);
  if (span > MAX_RANGE_DAYS) {
    return badRequest(`Range must be ${MAX_RANGE_DAYS} days or fewer (asked for ${span})`);
  }

  try {
    const { data } = await adminGetTeam({ teamId });
    const team = data.team;
    if (!team) return notFound("Team not found");

    const members = team.members.map((m) => ({
      id: m.user.id,
      username: m.user.username,
      email: m.user.email ?? null,
      userType: m.user.userType.name,
    }));

    // `in: []` would be a pointless round trip, and an empty roster has
    // nothing to aggregate anyway.
    const entries: MetricEntry[] =
      members.length === 0
        ? []
        : await fetchAllPages<
            Omit<AdminListTimeEntriesForUsersVariables, "limit" | "offset">,
            AdminListTimeEntriesForUsersData["timeEntries"][number]
          >(
            (vars) => adminListTimeEntriesForUsers(vars).then((r) => r.data.timeEntries),
            { userIds: members.map((m) => m.id), startDate: start, endDate: end }
          );

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        description: team.description ?? null,
        createdAt: team.createdAt,
      },
      range: { start, end },
      totals: aggregateTeam(members, entries),
      members: aggregateMembers(members, entries),
    });
  } catch (err) {
    console.error("Error building team metrics:", err);
    return serverError("Failed to load team metrics");
  }
}
