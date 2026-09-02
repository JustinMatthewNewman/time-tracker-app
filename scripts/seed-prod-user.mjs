import { initializeApp, cert } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { v5 as uuidv5 } from "uuid";
import { USER_TYPE_NAMES } from "../lib/userTypes.ts";
import { FEATURE_NAMES, FEATURE_DEFINITIONS } from "../lib/features.ts";
import { adminListUsers } from "../src/dataconnect-admin-generated/index.cjs.js";

// Ensure emulator vars do not override production calls
delete process.env.DATA_CONNECT_EMULATOR_HOST;
delete process.env.FIREBASE_AUTH_EMULATOR_HOST;

const CONNECTOR = { connector: "example", location: "us-east4", serviceId: "ecs-time-tracker-app-service" };
const targetEmail = process.argv[2] || "cswithjustin@gmail.com";

const ID_NAMESPACE = "9b1f7c3a-9d34-4c6e-8f5a-2f6f2e1d7a10";
const YEARS_BACK = Number(process.env.SEED_YEARS ?? 2);
const RNG_SEED = Number(process.env.SEED_RNG_SEED ?? 20260723);

const TICKET_CHUNK = 100;
const WORKLOG_CHUNK = 100;
const ENTRY_CHUNK = 250;

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(RNG_SEED);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const chance = (p) => rand() < p;

function id(...parts) {
  return uuidv5(parts.join(":"), ID_NAMESPACE);
}

const OFFICES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const APPS = ["PRODAppX", "BreakPro", "DMC", "React UI", "ECSBreakPro API", "Ethel"];
const TEAMS = ["technical support", "engineering", "QA", "the office team"];
const BASE_TICKETS = [15875, 18977, 19620, 19636, 19777, 20043];

const TICKETED_TEMPLATES = [
  () => `Verified fix was picked up in ${pick(APPS)}`,
  () => `Emailed user confirmation resolution`,
  () => `Pulled up PROD to double check if we still have the issue before looking deeper`,
  () => `Sending back to ${pick(TEAMS)}`,
  () => `Checked out PROD to see if the changes were approved`,
  () => `Followed up, sending back to ${pick(TEAMS)} teams`,
  () => `Checked current cases in PROD`,
  () => `Reviewed prior tickets and compared results from running the script locally`,
  () => `Documented the input parameters used for future requests`,
  () => `Attached report and sending back to ${pick(TEAMS)} teams`,
  () => `Investigated further to determine root cause`,
  () => `Debugging and tracing through ${pick(APPS)} to determine where the issue originates`,
  () => `Detailed ticket summary written to explain this issue`,
  () => `Pulling latest in ${pick(APPS)}`,
  () => `Verifying local setup is configured correctly`,
  () => `Started looking back into this`,
  () => `Reproduced the issue locally in BreakPro`,
  () => `Reviewed logs to narrow down when the regression was introduced`,
  () => `Paired with teammate to walk through the reported behavior`,
  () => `Updated ticket with findings and next steps`,
];

const UNTICKETED_TEMPLATES = [
  () => `Reviewing incoming emails`,
  () => `Team stand-up meeting`,
  () => `Administrative tasks`,
  () => `Planning next tasks`,
  () => ``,
];

function buildTicketPool() {
  const count = 160;
  const pool = [];
  for (let i = 0; i < count; i++) {
    const num = BASE_TICKETS[i % BASE_TICKETS.length] + Math.floor(i / BASE_TICKETS.length) * 10;
    pool.push({
      ticketNumber: num,
      office: pick(OFFICES),
      ticketTitle: `${pick(APPS)}: ${pick(TICKETED_TEMPLATES)()}`,
      ticketLink: `https://tracker.local/ticket/${num}`,
      createdAt: new Date().toISOString(),
    });
  }
  return pool;
}

function generateWorkLogsAndEntries(userRowId, ticketPool) {
  const endDate = new Date(2026, 7, 19);
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - YEARS_BACK);

  const workLogs = [];
  const timeEntries = [];

  const cur = new Date(startDate);
  while (cur <= endDate) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const yearStr = cur.getFullYear();
      const monthStr = String(cur.getMonth() + 1).padStart(2, "0");
      const dayStr = String(cur.getDate()).padStart(2, "0");
      const isoDateStr = `${yearStr}-${monthStr}-${dayStr}`;

      const wlId = id("worklog", userRowId, isoDateStr);
      const logTime = new Date(Date.UTC(cur.getFullYear(), cur.getMonth(), cur.getDate(), 9, 0, 0));

      workLogs.push({
        id: wlId,
        userId: userRowId,
        name: `Work Log — ${isoDateStr}`,
        description: `Daily work log for ${isoDateStr}`,
        workLogDate: logTime.toISOString(),
        createdAt: logTime.toISOString(),
        isDeleted: false,
      });

      const entryCount = 15 + Math.floor(rand() * 10);
      let curMinutes = 9 * 60;

      for (let e = 0; e < entryCount; e++) {
        const durationMin = Math.max(5, Math.floor(10 + rand() * 40));
        const startMin = curMinutes;
        const endMin = curMinutes + durationMin;
        curMinutes = endMin;

        const startH = String(Math.floor(startMin / 60)).padStart(2, "0");
        const startM = String(startMin % 60).padStart(2, "0");
        const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
        const endM = String(endMin % 60).padStart(2, "0");

        const startIso = `${isoDateStr}T${startH}:${startM}:00.000Z`;
        const endIso = `${isoDateStr}T${endH}:${endM}:00.000Z`;

        const isTicketed = chance(0.75);
        const ticket = isTicketed ? pick(ticketPool) : null;
        const descTemplate = isTicketed ? pick(TICKETED_TEMPLATES) : pick(UNTICKETED_TEMPLATES);

        const entryId = id("entry", userRowId, isoDateStr, e.toString());

        timeEntries.push({
          id: entryId,
          userId: userRowId,
          workLogId: wlId,
          startTime: startIso,
          endTime: endIso,
          date: isoDateStr,
          description: descTemplate(),
          ticketTicketNumber: ticket ? ticket.ticketNumber : null,
          officeNumber: ticket ? ticket.office : pick(OFFICES),
          createdAt: startIso,
        });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }

  return { workLogs, timeEntries };
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

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
    console.error(`❌ User "${targetEmail}" not found in production database. Sign in to the app first.`);
    process.exit(1);
  }

  const userRowId = matchedUser.id;
  console.log(`Found User: ${matchedUser.username} (${matchedUser.email}) [ID: ${userRowId}]`);

  // 1. System Seeds
  console.log("\n🌱 Seeding System Tiers and Features...");
  await dc.upsertMany("UserType", USER_TYPE_NAMES.map((name) => ({ name, createdAt: new Date().toISOString() })));
  await dc.upsertMany("Feature", FEATURE_NAMES.map((name) => ({
    name,
    description: FEATURE_DEFINITIONS[name].description,
    createdAt: new Date().toISOString(),
  })));

  const grants = FEATURE_NAMES.flatMap((name) =>
    FEATURE_DEFINITIONS[name].defaultTiers.map((userTypeName) => ({
      userTypeName,
      featureName: name,
      createdAt: new Date().toISOString(),
    }))
  );
  await dc.upsertMany("UserTypeFeature", grants);

  // 2. Generate WorkLogs, Tickets, TimeEntries
  console.log("\n📊 Generating realistic work logs, tickets, and time entries (2 years)...");
  const ticketPool = buildTicketPool();
  const { workLogs, timeEntries } = generateWorkLogsAndEntries(userRowId, ticketPool);

  console.log(`Generated ${workLogs.length} work logs, ${timeEntries.length} entries across ${ticketPool.length} tickets.`);

  // 3. Upsert Tickets
  console.log(`Uploading ${ticketPool.length} Tickets...`);
  for (const c of chunk(ticketPool, TICKET_CHUNK)) {
    await dc.upsertMany("Ticket", c);
  }

  // 4. Upsert WorkLogs
  console.log(`Uploading ${workLogs.length} WorkLogs...`);
  let wlIdx = 1;
  const wlChunks = chunk(workLogs, WORKLOG_CHUNK);
  for (const c of wlChunks) {
    await dc.upsertMany("WorkLog", c);
    if (wlIdx % 2 === 0 || wlIdx === wlChunks.length) console.log(` WorkLogs chunk ${wlIdx}/${wlChunks.length}`);
    wlIdx++;
  }

  // 5. Upsert TimeEntries
  console.log(`Uploading ${timeEntries.length} TimeEntries...`);
  let teIdx = 1;
  const teChunks = chunk(timeEntries, ENTRY_CHUNK);
  for (const c of teChunks) {
    await dc.upsertMany("TimeEntry", c);
    if (teIdx % 10 === 0 || teIdx === teChunks.length) console.log(` TimeEntries chunk ${teIdx}/${teChunks.length}`);
    teIdx++;
  }

  console.log(`\n🎉 PRODUCTION SEED COMPLETE! Successfully populated ${targetEmail} with 2 years of work logs & time entries!`);
}

main().catch((err) => {
  console.error("❌ Failed to seed production data:", err);
  process.exit(1);
});
