import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, badRequest, serverError } from "@/lib/auth-middleware";
import { TimeEntryCreateSchema, TimeRangeFilterSchema } from "@/lib/schemas";
import { createTimeEntry, listTimeEntries } from "@/lib/db-helpers";
import { ZodError } from "zod";

/**
 * POST /api/entries - Create a new time entry
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const validatedData = TimeEntryCreateSchema.parse(body);

    // Create entry in database
    const entry = await createTimeEntry(auth.userId!, validatedData);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(`Validation error: ${error.errors.map((e) => e.message).join(", ")}`);
    }

    console.error("Error creating time entry:", error);
    return serverError("Failed to create time entry");
  }
}

/**
 * GET /api/entries - List user's time entries with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // Parse query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      category: searchParams.get("category") || undefined,
      tags: searchParams.getAll("tags") || undefined,
    };

    // Validate filters
    const validatedFilters = TimeRangeFilterSchema.parse(filters);

    // List entries from database
    const entries = await listTimeEntries(auth.userId!, validatedFilters);

    return NextResponse.json(entries);
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(`Validation error: ${error.errors.map((e) => e.message).join(", ")}`);
    }

    console.error("Error listing time entries:", error);
    return serverError("Failed to list time entries");
  }
}
