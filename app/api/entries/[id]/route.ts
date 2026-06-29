import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, badRequest, serverError, notFound } from "@/lib/auth-middleware";
import { TimeEntryUpdateSchema, TimeEntryIdSchema } from "@/lib/schemas";
import { getTimeEntryById, updateTimeEntry, deleteTimeEntry } from "@/lib/db-helpers";
import { ZodError } from "zod";

/**
 * GET /api/entries/[id] - Get a specific time entry
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // Resolve params for Next.js 16 async params
    const { id } = await params;

    // Validate ID
    TimeEntryIdSchema.parse({ id });

    // Get entry from database
    const entry = await getTimeEntryById(auth.userId!, id);

    if (!entry) {
      return notFound("Time entry not found");
    }

    return NextResponse.json(entry);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = (error as any).issues?.map((e: any) => e.message).join(", ") || "Validation failed";
      return badRequest(`Validation error: ${messages}`);
    }

    console.error("Error getting time entry:", error);
    return serverError("Failed to get time entry");
  }
}

/**
 * PUT /api/entries/[id] - Update a time entry
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // Resolve params for Next.js 16 async params
    const { id } = await params;

    // Validate ID
    TimeEntryIdSchema.parse({ id });

    // Parse request body
    const body = await req.json();

    // Validate input (partial update)
    const validatedData = TimeEntryUpdateSchema.partial().parse(body);

    // Update entry in database
    const updatedEntry = await updateTimeEntry(auth.userId!, id, validatedData);

    if (!updatedEntry) {
      return notFound("Time entry not found");
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = (error as any).issues?.map((e: any) => e.message).join(", ") || "Validation failed";
      return badRequest(`Validation error: ${messages}`);
    }

    console.error("Error updating time entry:", error);
    return serverError("Failed to update time entry");
  }
}

/**
 * DELETE /api/entries/[id] - Delete a time entry
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = await verifyAuthToken(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // Resolve params for Next.js 16 async params
    const { id } = await params;

    // Validate ID
    TimeEntryIdSchema.parse({ id });

    // Delete entry from database
    const deleted = await deleteTimeEntry(auth.userId!, id);

    if (!deleted) {
      return notFound("Time entry not found");
    }

    return NextResponse.json({ success: true, message: "Time entry deleted" });
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = (error as any).issues?.map((e: any) => e.message).join(", ") || "Validation failed";
      return badRequest(`Validation error: ${messages}`);
    }

    console.error("Error deleting time entry:", error);
    return serverError("Failed to delete time entry");
  }
}
