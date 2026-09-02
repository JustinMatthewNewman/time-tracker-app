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

const JVSTINMATTHEW_ID = "110d31dcb55749f4a612e7dfadefd0ff";
const NEWMA4JM_ID = "3fb2afe45f234456bec14e2befb5ba44";

const JVSTINMATTHEW_WL_IDS = [
  "fdfd6a7b0ff44e278c7f84170db57ce0",
  "637d7cac3c4b4c468e1e6036860e2f57",
  "d3380fc3554a481887fbc7aa2bfaa9c7",
  "e9ff677e13ac43bbb3df41f4cad24355",
  "d3cecb99146240079794e716ea6c0678",
  "c0238e5609bb443c91a8d1c537b165ad",
  "cfadbd8fa8a947c1b389b2e0858dff9b",
  "abc3111903c749f4a0e9688341fae182",
  "04e68bfca98a4c84937604301cc99f88",
  "8768396b37014ec48cc516dcf83400f0",
  "7d9b91a06ccc45619a33e4146db21453",
  "e6ef94e65b404b1496524437622c9d22",
  "60af123d232b45b58588f16fd0f21d8e",
  "b5807c4e58e64fe6ab6fee7f2fa09eb1"
];

const NEWMA4JM_WL_IDS = [
  "9f194d140e7a4093b537dcece6633799",
  "6dd61509fb8b482cb1fcc1716f863ef0"
];

async function main() {
  console.log("Restoring jvstinmatthew and newma4jm work logs to original owners...");
  for (const id of JVSTINMATTHEW_WL_IDS) {
    await dc.executeGraphql(`mutation { workLog_update(id: "${id}", data: { userId: "${JVSTINMATTHEW_ID}" }) }`);
  }
  for (const id of NEWMA4JM_WL_IDS) {
    await dc.executeGraphql(`mutation { workLog_update(id: "${id}", data: { userId: "${NEWMA4JM_ID}" }) }`);
  }

  // Restore entries
  const teRes = await dc.executeGraphql(`query { timeEntries { id workLog { id } } }`);
  for (const e of teRes.data.timeEntries || []) {
    if (!e.workLog) continue;
    if (JVSTINMATTHEW_WL_IDS.includes(e.workLog.id)) {
      await dc.executeGraphql(`mutation { timeEntry_update(id: "${e.id}", data: { userId: "${JVSTINMATTHEW_ID}" }) }`);
    } else if (NEWMA4JM_WL_IDS.includes(e.workLog.id)) {
      await dc.executeGraphql(`mutation { timeEntry_update(id: "${e.id}", data: { userId: "${NEWMA4JM_ID}" }) }`);
    }
  }

  console.log("Reverted jvstinmatthew and newma4jm work logs back to their original owners.");
}

main().catch(console.error);
