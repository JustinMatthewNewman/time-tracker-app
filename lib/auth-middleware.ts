import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "./firebase-admin";

/**
 * Middleware to verify Firebase ID token from request headers
 * Expected format: Authorization: Bearer <idToken>
 */
export async function verifyAuthToken(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        authorized: false,
        error: "Missing or invalid Authorization header",
        userId: null,
      };
    }

    const idToken = authHeader.substring(7); // Remove "Bearer " prefix

    const adminAuth = await getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);

    return {
      authorized: true,
      error: null,
      userId: decoded.uid,
      user: decoded,
    };
  } catch (error: any) {
    return {
      authorized: false,
      error: error.message || "Token verification failed",
      userId: null,
    };
  }
}

/**
 * Helper to return 401 response
 */
export function unauthorized(message: string = "Unauthorized") {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Helper to return 400 response
 */
export function badRequest(message: string = "Bad request") {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/**
 * Helper to return 404 response
 */
export function notFound(message: string = "Not found") {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  );
}

/**
 * Helper to return 500 response
 */
export function serverError(message: string = "Internal server error", details?: string) {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status: 500 }
  );
}
