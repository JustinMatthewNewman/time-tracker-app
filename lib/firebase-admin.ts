// Remove the static top-level imports! They are what trigger the build/runtime crash.

/**
 * Dynamically initializes Firebase Admin and returns the Auth instance.
 * This completely bypasses the Next.js/Turbopack compilation phase error.
 */
export async function getAdminAuth() {
  // 1. Dynamically import the modules only when this function is actually executed
  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");

  const apps = getApps();

  if (!apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "❌ Firebase Admin environment variables are missing at runtime. " +
        "Please check your Vercel project settings."
      );
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  return getAuth();
}