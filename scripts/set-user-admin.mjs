import { initializeApp, cert } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { adminListUsers, setUserType } from "../src/dataconnect-admin-generated/index.cjs.js";

// Ensure emulator vars do not override production calls when targeting prod
delete process.env.DATA_CONNECT_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

const CONNECTOR = { connector: "example", location: "us-east4", serviceId: "ecs-time-tracker-app-service" };

const targetEmail = process.argv[2] || "cswithjustin@gmail.com";
const targetTier = process.argv[3] || "Admin";

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

  console.log(`🔍 Searching production database for user with email: ${targetEmail}...`);
  const usersRes = await adminListUsers(dc);
  const users = usersRes.data.users || [];

  const matchedUser = users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());

  if (!matchedUser) {
    console.error(`❌ User with email "${targetEmail}" not found in production database.`);
    console.log("\nExisting users registered in production:");
    if (users.length === 0) {
      console.log(" (No users found in production database yet. Please sign into the app once first so your user account is created via sync-user.)");
    } else {
      users.forEach((u) => console.log(` - ${u.username} (${u.email}) [ID: ${u.id}] [Tier: ${u.userType?.name}]`));
    }
    process.exit(1);
  }

  console.log(`Found user: ${matchedUser.username} (${matchedUser.email}) [ID: ${matchedUser.id}], current tier: ${matchedUser.userType?.name}`);
  console.log(`Updating tier to "${targetTier}"...`);

  await setUserType(dc, { userId: matchedUser.id, userTypeName: targetTier });

  console.log(`\n🎉 Successfully updated ${targetEmail} to "${targetTier}" in production!`);
}

main().catch((err) => {
  console.error("❌ Failed to update user tier in production:", err);
  process.exit(1);
});
