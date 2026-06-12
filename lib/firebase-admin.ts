import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const apps = getApps();

if (!apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // 1. Explicitly check for missing environment variables
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "❌ Critical Firebase Admin environment variables are missing. " +
      "Check your .env.local file."
    );
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // 2. Safe to replace now because we know it's a string
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = getAuth();