import { initializeApp, cert } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { adminListUsers } from "../src/dataconnect-admin-generated/index.cjs.js";

// Ensure emulator vars do not override production calls
delete process.env.DATA_CONNECT_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

const CONNECTOR = { connector: "example", location: "us-east4", serviceId: "ecs-time-tracker-app-service" };
const targetEmail = process.argv[2] || "cswithjustin@gmail.com";

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID || "ecs-time-tracker-app";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  let appOptions = { projectId };
  if (clientEmail && privateKey) {
    appOptions.credential = cert({ projectId, clientEmail, privateKey });
  }

  console.log(`\n🚀 Initializing Admin SDK for PRODUCTION Cloud SQL project: ${projectId}...`);
  const app = initializeApp(appOptions);
  const dc = getDataConnect(CONNECTOR, app);

  console.log(`🔍 Locating user in production database: ${targetEmail}...`);
  const usersRes = await adminListUsers(dc);
  const users = usersRes.data.users || [];
  const matchedUser = users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());

  if (!matchedUser) {
    console.error(`❌ User "${targetEmail}" not found in production database.`);
    process.exit(1);
  }

  const userRowId = matchedUser.id;
  console.log(`Found User: ${matchedUser.username} (${matchedUser.email}) [ID: ${userRowId}]`);

  console.log(`\n🗑️ Deleting all TimeEntries for ${targetEmail} from production...`);
  const deleteEntriesRes = await dc.executeGraphql(
    `mutation RollbackEntries { timeEntry_deleteMany(where: { userId: { eq: "${userRowId}" } }) }`
  );
  console.log("Delete TimeEntries result:", deleteEntriesRes.data);

  console.log(`\n🗑️ Deleting all WorkLogs for ${targetEmail} from production...`);
  const deleteWorkLogsRes = await dc.executeGraphql(
    `mutation RollbackWorkLogs { workLog_deleteMany(where: { userId: { eq: "${userRowId}" } }) }`
  );
  console.log("Delete WorkLogs result:", deleteWorkLogsRes.data);

  console.log(`\n✅ ROLLBACK COMPLETE! Successfully removed all seeded work logs & time entries for ${targetEmail} from production.`);
}

main().catch((err) => {
  console.error("❌ Failed to rollback production data:", err);
  process.exit(1);
});
