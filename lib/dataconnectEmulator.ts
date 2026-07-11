import { connectDataConnectEmulator, getDataConnect } from "firebase/data-connect";
import { connectorConfig } from "@/src/dataconnect-generated";
import "@/lib/firebase"; // ensures the default Firebase app exists before getDataConnect runs

// Companion to lib/firebase.ts's Auth emulator wiring: same opt-in flag
// points the generated Data Connect hooks at the local emulator instead of
// the live Cloud SQL-backed service. Import this once for its side effect
// before any generated query/mutation hook runs (see app/providers.tsx).
declare global {
  var __dataConnectEmulatorConnected: boolean | undefined;
}

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" && !globalThis.__dataConnectEmulatorConnected) {
  const dc = getDataConnect(connectorConfig);
  connectDataConnectEmulator(dc, "127.0.0.1", 9399);
  globalThis.__dataConnectEmulatorConnected = true;
}
