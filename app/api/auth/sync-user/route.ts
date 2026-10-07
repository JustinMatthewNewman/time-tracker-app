// app/api/auth/sync-user/route.ts
import { NextRequest, NextResponse } from "next/server";
// Import the dynamic function instead of the static adminAuth constant
import { getAdminAuth } from "@/lib/firebase-admin";
import { createUserFromGoogle } from "@/src/dataconnect-admin-generated"; 

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    
    // 1. Initialize Firebase Admin dynamically at runtime
    const adminAuth = await getAdminAuth();
    
    // 2. Safely verify the token now that adminAuth is initialized
    const decoded = await adminAuth.verifyIdToken(idToken);
    
    const firebaseUid = decoded.uid;
    const email = decoded.email ?? null;
    const username = decoded.name ?? email?.split("@")[0] ?? "User";

    try {
      // 1. Try to create the user record (Works perfectly for first-time sign-ups)
      await createUserFromGoogle({
        googleUid: firebaseUid,
        username: username,
        email: email ?? "",
        createdAt: new Date().toISOString()
      });
    } catch (dbErr: any) {
      // 2. Intercept the unique constraint check for returning users
      const errMsg = dbErr.message || "";
      if (errMsg.includes("user_googleUid_uidx") || errMsg.includes("unique constraint")) {
        console.log(`[Sync] Returning user logged in: ${username} (${firebaseUid}).`);
        // We gracefully swallow this error because the user already exists!
      } else {
        // If it's a completely different database error, raise the alarm
        throw dbErr;
      }
    }

    return NextResponse.json({ success: true, message: "Auth sync completed" });
  } catch (err: any) {
    // Logged in full server-side, but deliberately NOT echoed to the client.
    // This handler also catches verifyIdToken failures, and the messages on
    // that path describe the token and the project; the database errors it
    // catches name tables, columns and constraints. Both are free
    // reconnaissance for an unauthenticated caller — this route is reachable
    // before any token is verified, since the token arrives in the body.
    console.error("SQL Connect Sync Error:", err);
    // 401 rather than 500 when the token itself is the problem: an invalid or
    // expired token is the caller's, and reporting it as a server fault sends
    // the client retrying against something that will never succeed.
    const isAuthError = typeof err?.code === "string" && err.code.startsWith("auth/");
    return NextResponse.json(
      { error: isAuthError ? "Invalid or expired ID token" : "Internal Server Error" },
      { status: isAuthError ? 401 : 500 }
    );
  }
}