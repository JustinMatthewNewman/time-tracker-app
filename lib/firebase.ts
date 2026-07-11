import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};


// Prevent re-init during hot reloads
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Opt-in local dev flag (set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true in
// .env.local) so `npm run dev` can point at the Auth + Data Connect
// emulators instead of the live project. Guarded against Fast Refresh
// re-running this module and reconnecting an already-started emulator.
declare global {
  var __authEmulatorConnected: boolean | undefined;
}

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" && !globalThis.__authEmulatorConnected) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  globalThis.__authEmulatorConnected = true;
}