import { NextRequest, NextResponse } from "next/server";
import { requireFeature } from "@/lib/featureAccess";
import { badRequest, serverError } from "@/lib/auth-middleware";
import { fetchAllPages } from "@/lib/dataconnectPagination";
import { listTimeEntriesForTicket } from "@/src/dataconnect-admin-generated";
import type {
  ListTimeEntriesForTicketData,
  ListTimeEntriesForTicketVariables,
} from "@/src/dataconnect-admin-generated";

/**
 * GET /api/tickets/[ticket_number]/entries — every user's time on one ticket.
 *
 * Gated on TicketAllUsers. The ticket page falls back to its own-only Data
 * Connect query when the caller doesn't hold the grant, so a 403 here is an
 * ordinary outcome rather than an error state.
 *
 * ListTimeEntriesForTicket is NO_ACCESS and unreachable from a browser, so
 * this gate is the only way in — not a second opinion on top of a
 * client-callable query. Same rule the time-entry IDOR fix established.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticket_number: string }> }
) {
  const gate = await requireFeature(req, "TicketAllUsers");
  if (!gate.ok) return gate.response;

  // Next.js 16 async params, as in app/api/admin/teams/[teamId]/metrics/route.ts.
  const { ticket_number } = await params;
  const ticketNumber = Number(ticket_number);
  if (!Number.isInteger(ticketNumber)) {
    return badRequest("ticket_number must be an integer");
  }

  try {
    const entries = await fetchAllPages<
      Omit<ListTimeEntriesForTicketVariables, "limit" | "offset">,
      ListTimeEntriesForTicketData["timeEntries"][number]
    >((vars) => listTimeEntriesForTicket(vars).then((r) => r.data.timeEntries), { ticketNumber });

    const viewerId = gate.access.userId;

    return NextResponse.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        // Whether a row is the viewer's is decided here, from the verified
        // token, rather than by shipping user ids and letting the client
        // compare — see the note on ListTimeEntriesForTicket. The username is
        // all the UI needs to name someone else's row.
        isMine: entry.user.id === viewerId,
        username: entry.user.username,
        startTime: entry.startTime,
        endTime: entry.endTime,
        date: entry.date,
        description: entry.description ?? null,
        // A work log is only ever openable by its owner (ListWorkLogs binds to
        // auth.uid), so the link target is withheld for everyone else's rows
        // rather than rendering a control that would land on an empty page.
        workLog: entry.user.id === viewerId && entry.workLog
          ? { id: entry.workLog.id, name: entry.workLog.name }
          : null,
        // Still shown for other people's rows, so a row reads as "someone's
        // work log" rather than as an entry with no log at all.
        workLogName: entry.workLog?.name ?? null,
        createdAt: entry.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error listing ticket time entries:", err);
    return serverError("Failed to load time entries for this ticket");
  }
}
