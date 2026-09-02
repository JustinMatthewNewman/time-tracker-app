import { initializeApp, cert } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";

delete process.env.DATA_CONNECT_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

const CONNECTOR = { connector: "example", location: "us-east4", serviceId: "ecs-time-tracker-app-service" };
const projectId = process.env.FIREBASE_PROJECT_ID || "ecs-time-tracker-app";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const app = initializeApp({ projectId, credential: cert({ projectId, clientEmail, privateKey }) });
const dc = getDataConnect(CONNECTOR, app);

const TARGET_USER_ID = "a9c311e8a01a4c138ff904d71c7bcc74"; // cswithjustin@gmail.com

async function main() {
  console.log("🚀 Re-assigning all real work logs to cswithjustin@gmail.com...");

  // 1. Fetch worklogs for jvstinmatthew@gmail.com and newma4jm@gmail.com
  const wlRes = await dc.executeGraphql(`
    query {
      workLogs {
        id
        name
        user { id email }
      }
    }
  `);

  const workLogsToMove = wlRes.data.workLogs.filter(
    (w) => w.user.email === "jvstinmatthew@gmail.com" || w.user.email === "newma4jm@gmail.com"
  );

  console.log(`Found ${workLogsToMove.length} real work logs to assign to cswithjustin@gmail.com.`);

  for (const wl of workLogsToMove) {
    console.log(`Updating WorkLog [${wl.id}] "${wl.name}" (from ${wl.user.email})...`);
    await dc.executeGraphql(`
      mutation {
        workLog_update(id: "${wl.id}", data: { userId: "${TARGET_USER_ID}" })
      }
    `);
  }

  // 2. Fetch and move time entries for jvstinmatthew@gmail.com and newma4jm@gmail.com
  const teRes = await dc.executeGraphql(`
    query {
      timeEntries {
        id
        user { id email }
      }
    }
  `);

  const entriesToMove = teRes.data.timeEntries.filter(
    (e) => e.user.email === "jvstinmatthew@gmail.com" || e.user.email === "newma4jm@gmail.com"
  );

  console.log(`Found ${entriesToMove.length} time entries to assign to cswithjustin@gmail.com.`);

  for (const te of entriesToMove) {
    await dc.executeGraphql(`
      mutation {
        timeEntry_update(id: "${te.id}", data: { userId: "${TARGET_USER_ID}" })
      }
    `);
  }

  console.log("🎉 SUCCESS! All real work logs and time entries have been transferred to cswithjustin@gmail.com!");
}

main().catch((err) => {
  console.error("❌ Failed to assign work logs:", err);
  process.exit(1);
});
