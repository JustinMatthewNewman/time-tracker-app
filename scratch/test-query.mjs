import { initializeApp } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { listUsers } from "../src/dataconnect-admin-generated/index.cjs.js";

const CONNECTOR = { connector: "example", location: "us-east4", serviceId: "ecs-time-tracker-app-service" };

async function run() {
  const projectId = process.env.FIREBASE_PROJECT_ID || "ecs-time-tracker-app";
  const app = initializeApp({ projectId });
  const dc = getDataConnect(CONNECTOR, app);

  try {
    console.log("\n🔍 Executing listUsers query against local Data Connect emulator...");
    const res = await listUsers(dc);
    console.log("\n✅ Query successful! Users and their UserTypes returned from local database:");
    console.dir(res.data, { depth: null });
  } catch (err) {
    console.error("❌ Error executing query:", err);
  }
}

run();
