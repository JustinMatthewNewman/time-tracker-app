// Populates the LOCAL Firebase emulator suite with a couple of years of
// realistic WorkLog/TimeEntry/Ticket data under one dedicated test account,
// so weekly/monthly/yearly report views have something non-trivial to chew
// on. Talks directly to the Auth + Data Connect emulators via the Admin SDK
// (bypasses @auth entirely — emulator-only "owner" token) rather than
// simulating browser clicks, so ~10k rows insert in seconds instead of
// minutes.
//
// Usage (from repo root, emulators already running via
// `firebase emulators:start --only auth,dataconnect`):
//
//   node --env-file=.env.local scripts/seed-stress-test.mjs --dry-run   # generate + print counts, no network calls
//   node --env-file=.env.local scripts/seed-stress-test.mjs             # seed (idempotent, safe to re-run)
//   node --env-file=.env.local scripts/seed-stress-test.mjs --reset     # wipe this account's rows first, then reseed
//
// Or via the npm scripts: `npm run seed:stress-test[:dry-run|:reset]`.
//
// Refuses to run unless FIREBASE_AUTH_EMULATOR_HOST and
// DATA_CONNECT_EMULATOR_HOST both point at localhost — see assertLocalOnly().

import { v5 as uuidv5 } from "uuid";
import { USER_TYPE_NAMES } from "../lib/userTypes.ts";
import { FEATURE_NAMES, FEATURE_DEFINITIONS } from "../lib/features.ts";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const RESET = args.has("--reset");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CONNECTOR = { location: "us-east4", serviceId: "ecs-time-tracker-app-service" };

const TEST_USER_UID = "stress-test-local-uid";
const TEST_USER_EMAIL = "stress.test@local.dev";
const TEST_USER_PASSWORD = "stress-test-password-123";
const TEST_USER_NAME = "Stress Test User";

// Admin rather than the "Regular" default every real signup gets: this is the
// one account local development runs as, so it needs to reach the admin page
// and any other tier-gated feature without a manual promotion step after each
// reset. Only ever applied to this hardcoded local-emulator uid — see
// assertLocalOnly(), which refuses to run against anything but localhost.
const TEST_USER_TYPE = "Admin";

// Fixed, arbitrary namespace UUID used to derive stable ids from human-readable
// keys (uuidv5), so re-running this script upserts the exact same rows instead
// of piling up duplicates. Composing this from `Math.random()` once and
// hardcoding it here would have worked just as well — the only requirement is
// that it never changes between runs.
const ID_NAMESPACE = "9b1f7c3a-9d34-4c6e-8f5a-2f6f2e1d7a10";

// Teammates for the admin team dashboard. The test user alone made every team
// a single-card page, which is useless for judging a layout built around
// comparing people. These get a much shorter history than the test user
// (TEAMMATE_DAYS, not YEARS_BACK) — the dashboard reads a date range, so depth
// buys nothing here and costs seed time on every reset.
//
// They are Auth-less User rows on purpose: nobody signs in as them, they exist
// to be counted. Volume is varied per teammate so the member cards differ
// enough to show whether the layout actually ranks and compares.
const TEAMMATES = [
  { key: "dana",  username: "Dana Whitfield",  email: "dana@local.dev",  tier: "Regular", load: 1.0 },
  { key: "elias", username: "Elias Bergstrom", email: "elias@local.dev", tier: "Regular", load: 0.8 },
  { key: "farrah", username: "Farrah Nasser",  email: "farrah@local.dev", tier: "Admin",  load: 1.15 },
  { key: "gus",   username: "Gus Okafor",      email: "gus@local.dev",   tier: "Regular", load: 0.55 },
  { key: "hana",  username: "Hana Lindqvist",  email: "hana@local.dev",  tier: "Regular", load: 0.95 },
  { key: "ivan",  username: "Ivan Petrov",     email: "ivan@local.dev",  tier: "Regular", load: 0.3 },
  // Deliberately logs nothing: the member cards must show an inactive member
  // rather than silently omitting them.
  { key: "jo",    username: "Jo Ramirez",      email: "jo@local.dev",    tier: "Regular", load: 0 },
];

const TEAMMATE_DAYS = Number(process.env.SEED_TEAMMATE_DAYS ?? 60);

// Membership is deliberately overlapping — a user can be on several teams, and
// the dashboard's per-team totals must not assume otherwise.
const TEAM_DEFS = [
  {
    key: "local-dev",
    name: "Local Dev",
    description: "Sample team seeded for local development.",
    color: "#2F6FEB",
    weeklyTargetHours: 120,
    members: ["__TEST_USER__", "dana", "elias", "jo"],
  },
  {
    key: "engineering",
    name: "Engineering",
    description: "Builds and maintains the product.",
    color: "#1F9D55",
    weeklyTargetHours: 160,
    members: ["farrah", "gus", "hana", "dana"],
  },
  {
    key: "technical-support",
    name: "Technical Support",
    // No color or target on purpose: the Department panel and the team stats
    // both have to read correctly for a team that has set neither.
    color: null,
    weeklyTargetHours: null,
    members: ["__TEST_USER__", "ivan", "hana"],
  },
];

const YEARS_BACK = Number(process.env.SEED_YEARS ?? 2);
const RNG_SEED = Number(process.env.SEED_RNG_SEED ?? 20260723);

const TICKET_CHUNK = 100;
const WORKLOG_CHUNK = 100;
const ENTRY_CHUNK = 250;

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) — same seed always produces the same
// dataset, so re-running with --reset gives you back an identical fixture
// instead of new random noise every time.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Content pools — flavored after the sample work log text (ECS/BreakPro-style
// tickets: PROD verification, tracing through internal apps, report requests)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Ticket pool
// ---------------------------------------------------------------------------

function buildTicketPool() {
  const numbers = new Set(BASE_TICKETS);
  while (numbers.size < 160) {
    numbers.add(15000 + Math.floor(rand() * 6000));
  }
  return [...numbers].map((ticketNumber) => ({
    ticketNumber,
    office: pick(OFFICES),
  }));
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

function isWeekday(date) {
  const d = date.getDay();
  return d !== 0 && d !== 6;
}

// Local-midnight Date construction (not `new Date("yyyy-mm-dd")`, which
// parses as UTC and would shift the 8am-4pm blocks by the local UTC offset —
// see the same fix in NewWorkLogDialog.tsx).
function localMidnight(year, month, day) {
  return new Date(year, month, day);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function* weekdaysBetween(start, end) {
  const cur = new Date(start);
  while (cur <= end) {
    if (isWeekday(cur)) yield new Date(cur);
    cur.setDate(cur.getDate() + 1);
  }
}

// All ways to split a 60-minute block into 15-minute-multiple chunks
// (matches workLogParser's "duration must be a multiple of 15 minutes" rule).
const BLOCK_PATTERNS = [
  [60],
  [45, 15],
  [15, 45],
  [30, 30],
  [30, 15, 15],
  [15, 30, 15],
  [15, 15, 30],
  [15, 15, 15, 15],
];

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------

function generateWorkLogsAndEntries(userId, ticketPool) {
  const today = new Date();
  const start = localMidnight(today.getFullYear() - YEARS_BACK, today.getMonth(), today.getDate());
  const end = localMidnight(today.getFullYear(), today.getMonth(), today.getDate());

  const workLogs = [];
  const timeEntries = [];

  for (const day of weekdaysBetween(start, end)) {
    // ~3% of weekdays are PTO/holidays with no log at all.
    if (chance(0.03)) continue;

    const dateKey = day.toISOString().slice(0, 10);
    const workLogId = id("worklog", dateKey);
    const dayStart = addMinutes(day, 8 * 60); // 8:00 AM local
    const isoDate = day.toISOString();

    // 90% full 8-hour day (8am-4pm), 10% a shorter day.
    const numBlocks = chance(0.9) ? 8 : 5 + Math.floor(rand() * 3);

    workLogs.push({
      id: workLogId,
      userId,
      name: `Daily Work Log - ${dateKey}`,
      workLogDate: isoDate,
      createdAt: dayStart.toISOString(),
      isDeleted: false,
    });

    let lastTicket = null;
    let entryIndex = 0;

    for (let block = 0; block < numBlocks; block++) {
      const blockStart = addMinutes(dayStart, block * 60);
      const pattern = pick(BLOCK_PATTERNS);

      let offset = 0;
      for (const duration of pattern) {
        const entryStart = addMinutes(blockStart, offset);
        const entryEnd = addMinutes(entryStart, duration);
        offset += duration;

        const hasTicket = chance(0.85);
        let ticketNumber = null;
        let description;

        if (hasTicket) {
          // Bias toward continuing the same ticket as the previous entry,
          // like the sample text does across consecutive bullets.
          ticketNumber =
            lastTicket != null && chance(0.4) ? lastTicket : pick(ticketPool).ticketNumber;
          lastTicket = ticketNumber;
          description = pick(TICKETED_TEMPLATES)();
        } else {
          lastTicket = null;
          description = pick(UNTICKETED_TEMPLATES)();
        }

        timeEntries.push({
          id: id("entry", dateKey, entryIndex++),
          userId,
          workLogId,
          startTime: entryStart.toISOString(),
          endTime: entryEnd.toISOString(),
          date: isoDate,
          // Data Connect's bulk upsertMany builds one uniform column list for
          // the whole batch, so every row must carry the same keys — `null`
          // for "no value", never `undefined` (which drops the key and
          // throws "misaligned columns" as soon as one row in the batch
          // differs from the rest).
          description: description || null,
          ticketTicketNumber: ticketNumber ?? null,
          createdAt: entryStart.toISOString(),
        });
      }
    }
  }

  return { workLogs, timeEntries };
}

// A lighter version of generateWorkLogsAndEntries for teammates: a short
// window, and every id namespaced by the teammate's key.
//
// That namespacing is the whole reason this is a separate function rather than
// a parameter on the original — that one derives ids from the date alone
// (`id("worklog", dateKey)`), which is fine for one user and silently collides
// the moment a second one shares a date.
function generateTeammateData(mate, userId, ticketPool) {
  const workLogs = [];
  const timeEntries = [];
  if (mate.load <= 0) return { workLogs, timeEntries };

  const today = new Date();
  const end = localMidnight(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - TEAMMATE_DAYS);

  for (const day of weekdaysBetween(start, end)) {
    // Higher-load teammates also show up more often, not just for longer.
    if (chance(0.12 / Math.max(mate.load, 0.25))) continue;

    const dateKey = day.toISOString().slice(0, 10);
    const workLogId = id("worklog", mate.key, dateKey);
    const dayStart = addMinutes(day, 8 * 60);
    const isoDate = day.toISOString();

    const numBlocks = Math.max(1, Math.round((chance(0.85) ? 8 : 5) * mate.load));

    workLogs.push({
      id: workLogId,
      userId,
      name: `Daily Work Log - ${dateKey}`,
      workLogDate: isoDate,
      createdAt: dayStart.toISOString(),
      isDeleted: false,
    });

    let lastTicket = null;
    let entryIndex = 0;

    for (let block = 0; block < numBlocks; block++) {
      const blockStart = addMinutes(dayStart, block * 60);
      let offset = 0;
      for (const duration of pick(BLOCK_PATTERNS)) {
        const entryStart = addMinutes(blockStart, offset);
        const entryEnd = addMinutes(entryStart, duration);
        offset += duration;

        let ticketNumber = null;
        let description;
        if (chance(0.85)) {
          ticketNumber =
            lastTicket != null && chance(0.4) ? lastTicket : pick(ticketPool).ticketNumber;
          lastTicket = ticketNumber;
          description = pick(TICKETED_TEMPLATES)();
        } else {
          lastTicket = null;
          description = pick(UNTICKETED_TEMPLATES)();
        }

        timeEntries.push({
          id: id("entry", mate.key, dateKey, entryIndex++),
          userId,
          workLogId,
          startTime: entryStart.toISOString(),
          endTime: entryEnd.toISOString(),
          date: isoDate,
          // Same uniform-column-list rule as the main generator: null, never
          // undefined.
          description: description || null,
          ticketTicketNumber: ticketNumber ?? null,
          createdAt: entryStart.toISOString(),
        });
      }
    }
  }

  return { workLogs, timeEntries };
}

// ---------------------------------------------------------------------------
// Safety guardrails — this must never run against a real project.
// ---------------------------------------------------------------------------

function assertLocalOnly() {
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const dcHost = process.env.DATA_CONNECT_EMULATOR_HOST;
  const isLocal = (h) => !!h && /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(h);

  if (!isLocal(authHost) || !isLocal(dcHost)) {
    console.error(
      "Refusing to run: FIREBASE_AUTH_EMULATOR_HOST and DATA_CONNECT_EMULATOR_HOST must both be " +
        "set to a localhost/127.0.0.1 address before running this script.\n" +
        `  FIREBASE_AUTH_EMULATOR_HOST=${authHost ?? "(unset)"}\n` +
        `  DATA_CONNECT_EMULATOR_HOST=${dcHost ?? "(unset)"}\n\n` +
        "Start the emulators first (firebase emulators:start --only auth,dataconnect), then run:\n" +
        "  node --env-file=.env.local scripts/seed-stress-test.mjs"
    );
    process.exit(1);
  }
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const userRowId = id("user", TEST_USER_UID);
  const ticketPool = buildTicketPool();
  const { workLogs, timeEntries } = generateWorkLogsAndEntries(userRowId, ticketPool);

  console.log(`Generated ${workLogs.length} work logs and ${timeEntries.length} time entries ` +
    `across ${ticketPool.length} tickets (${YEARS_BACK} years back from today, weekdays only, seed=${RNG_SEED}).`);

  // Teammates, each with their own short history, appended to the same batches
  // so the existing chunked upserts cover them without a second write path.
  const teammateRows = TEAMMATES.map((mate) => {
    const mateId = id("user", `teammate:${mate.key}`);
    const generated = generateTeammateData(mate, mateId, ticketPool);
    workLogs.push(...generated.workLogs);
    timeEntries.push(...generated.timeEntries);
    return { mate, id: mateId, entryCount: generated.timeEntries.length };
  });
  console.log(
    `Teammates: ${teammateRows.length} users, ` +
    `${teammateRows.reduce((n, r) => n + r.entryCount, 0)} entries over ${TEAMMATE_DAYS} days ` +
    `(${teammateRows.filter((r) => r.entryCount === 0).length} with none, on purpose).`
  );

  if (DRY_RUN) {
    console.log("--dry-run: no emulator calls made. Sample day:");
    console.log(JSON.stringify(workLogs[0], null, 2));
    console.log(JSON.stringify(timeEntries.slice(0, 4), null, 2));
    return;
  }

  assertLocalOnly();

  const { initializeApp } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const { getDataConnect } = await import("firebase-admin/data-connect");

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID) must be set in .env.local");
  }

  const app = initializeApp({ projectId });
  const auth = getAuth(app);
  const dc = getDataConnect(CONNECTOR, app);

  // 1. Get-or-create the Auth emulator user so it shows up as a selectable
  // account in the "Sign in with Google" emulator popup.
  try {
    await auth.getUser(TEST_USER_UID);
    console.log(`Auth emulator user ${TEST_USER_EMAIL} already exists.`);
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;
    await auth.createUser({
      uid: TEST_USER_UID,
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      displayName: TEST_USER_NAME,
      emailVerified: true,
    });
    console.log(`Created auth emulator user ${TEST_USER_EMAIL}.`);
  }

  // 2. Optionally wipe this account's existing WorkLog/TimeEntry rows first
  // (child table before parent, per FK order) for a clean re-seed.
  if (RESET) {
    console.log("Resetting existing stress-test rows...");
    await dc.executeGraphql(
      `mutation { timeEntry_deleteMany(where: { userId: { eq: "${userRowId}" } }) }`
    );
    await dc.executeGraphql(
      `mutation { workLog_deleteMany(where: { userId: { eq: "${userRowId}" } }) }`
    );
  }

  // 3. Account tiers — must land before the User row, since User.userTypeName
  // is a NOT NULL foreign key into this table. Same rows SeedUserTypes writes
  // in dataconnect/seed_data.gql, seeded here too so this script stands alone
  // rather than silently depending on that file having been run by hand first.
  await dc.upsertMany(
    "UserType",
    USER_TYPE_NAMES.map((name) => ({ name, createdAt: new Date().toISOString() }))
  );
  console.log(`UserTypes: ${USER_TYPE_NAMES.length} rows`);

  // 4. Features, then the tier grants that reference them (FK order). Mirrors
  // SeedFeatures in dataconnect/seed_data.gql; seeded here too so a reset
  // leaves a fully working environment rather than one where the test user is
  // an Admin holding no grants — which looks exactly like the gating is broken.
  await dc.upsertMany(
    "Feature",
    FEATURE_NAMES.map((name) => ({
      name,
      description: FEATURE_DEFINITIONS[name].description,
      createdAt: new Date().toISOString(),
    }))
  );

  const grants = FEATURE_NAMES.flatMap((name) =>
    FEATURE_DEFINITIONS[name].defaultTiers.map((userTypeName) => ({
      userTypeName,
      featureName: name,
      createdAt: new Date().toISOString(),
    }))
  );
  await dc.upsertMany("UserTypeFeature", grants);
  console.log(`Features: ${FEATURE_NAMES.length} rows, ${grants.length} tier grants`);

  // 5. User row (upsert by id, so reruns are no-ops).
  await dc.upsertMany("User", [
    {
      id: userRowId,
      googleUid: TEST_USER_UID,
      username: TEST_USER_NAME,
      email: TEST_USER_EMAIL,
      userTypeName: TEST_USER_TYPE,
      createdAt: new Date().toISOString(),
    },
  ]);

  // 5b. Teammate User rows. No Auth accounts — nobody signs in as these; they
  // exist so the admin team dashboard has more than one person to compare.
  await dc.upsertMany(
    "User",
    teammateRows.map(({ mate, id: mateId }) => ({
      id: mateId,
      googleUid: `teammate-${mate.key}-local-uid`,
      username: mate.username,
      email: mate.email,
      userTypeName: mate.tier,
      createdAt: new Date().toISOString(),
    }))
  );

  // 6. Teams and memberships. Ids derive from fixed keys (like every other id
  // here) so reruns upsert the same rows. Rosters overlap deliberately — see
  // TEAM_DEFS.
  const userIdForKey = new Map(teammateRows.map(({ mate, id: mateId }) => [mate.key, mateId]));
  userIdForKey.set("__TEST_USER__", userRowId);

  await dc.upsertMany(
    "Team",
    TEAM_DEFS.map((team) => ({
      id: id("team", team.key),
      name: team.name,
      // Uniform column list across the batch — null, never undefined (see the
      // note in the entry generator).
      description: team.description ?? null,
      color: team.color ?? null,
      weeklyTargetHours: team.weeklyTargetHours ?? null,
      createdAt: new Date().toISOString(),
    }))
  );
  const memberships = TEAM_DEFS.flatMap((team) =>
    team.members.map((memberKey) => ({
      teamId: id("team", team.key),
      userId: userIdForKey.get(memberKey),
      createdAt: new Date().toISOString(),
    }))
  );
  await dc.upsertMany("TeamMember", memberships);
  console.log(`Teams: ${TEAM_DEFS.length} rows, ${memberships.length} memberships`);

  // 7. Tickets (parent table before TimeEntry references them).
  for (const [i, batch] of chunk(ticketPool, TICKET_CHUNK).entries()) {
    await dc.upsertMany(
      "Ticket",
      batch.map((t) => ({ ...t, createdAt: new Date().toISOString() }))
    );
    console.log(`Tickets: chunk ${i + 1} (${batch.length} rows)`);
  }

  // 8. Work logs (parent table before TimeEntry references them).
  for (const [i, batch] of chunk(workLogs, WORKLOG_CHUNK).entries()) {
    await dc.upsertMany("WorkLog", batch);
    console.log(`WorkLogs: chunk ${i + 1}/${Math.ceil(workLogs.length / WORKLOG_CHUNK)} (${batch.length} rows)`);
  }

  // 9. Time entries.
  for (const [i, batch] of chunk(timeEntries, ENTRY_CHUNK).entries()) {
    await dc.upsertMany("TimeEntry", batch);
    console.log(`TimeEntries: chunk ${i + 1}/${Math.ceil(timeEntries.length / ENTRY_CHUNK)} (${batch.length} rows)`);
  }

  console.log("\nDone. Sign in locally with:");
  console.log(`  email:    ${TEST_USER_EMAIL}`);
  console.log(`  password: ${TEST_USER_PASSWORD}`);
  console.log("(pick it from the emulator sign-in popup's existing-accounts list, or type the email again).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
