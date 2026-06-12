import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { createUserFromGoogle } from "@/src/dataconnect-admin-generated"; 


export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    const decoded = await adminAuth.verifyIdToken(idToken);

    const firebaseUid = decoded.uid;
    const email = decoded.email ?? null;
    const username = decoded.name ?? email?.split("@")[0] ?? "User";
  
    await createUserFromGoogle({
    googleUid: firebaseUid,  
    username: username,
    email: email ?? "",
    createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("SQL Connect Sync Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}