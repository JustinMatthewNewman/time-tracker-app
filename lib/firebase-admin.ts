// lib/firebase-admin.ts

import admin from "firebase-admin";

//@ts-ignore
if (!admin.apps.length) {
  admin.initializeApp({
    //@ts-ignore
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

export default admin;