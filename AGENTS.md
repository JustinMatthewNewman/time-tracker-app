<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Browser-driven verification (Playwright)

`playwright` is installed in `node_modules` (deliberately **not** in `package.json`/`package-lock.json` — installed with `npm install --no-save playwright` so it doesn't become a project dependency; `npx playwright install chromium` has already downloaded the browser binary). Use it to actually drive the app end-to-end for UI/frontend changes rather than only typechecking/linting — see the top-level `run` skill for the general pattern; this section covers what's specific to this app.

**Start the stack in one shell command** (this sandbox reaps background processes started across separate tool calls — run emulators + seed + dev server + the verification script all in a single `Bash` invocation, backgrounded within that same command, not `&`-launched across multiple calls):

```bash
firebase emulators:start --only auth,dataconnect > /tmp/emu.log 2>&1 &
EMU_PID=$!
# poll curl http://127.0.0.1:9099 and :9399 until both respond, then:
npm run seed:stress-test   # idempotent; see README's "Seeding Stress-Test Data"
npm run dev > /tmp/nextdev.log 2>&1 &
DEV_PID=$!
# poll curl http://localhost:3000 until it responds, then run your Playwright script
kill $EMU_PID $DEV_PID
```

**Logging in as the seeded test account** (`stress.test@local.dev`) via the real "Sign in with Google" button opens the Auth emulator's popup. That account is a **password**-provider user (created via Admin SDK in `scripts/seed-stress-test.mjs`), not a **google.com**-provider one, so it will NOT appear in the popup's existing-accounts picker the first time — Firebase's Google-provider picker only lists accounts that already have a google.com identity linked. Fix: click **"Add new account"**, fill only the **Email** field with `stress.test@local.dev` (leave the rest blank), and submit. Because this project has "One account per email address" behavior, that links a google.com identity onto the *same* `stress-test-local-uid` rather than creating a duplicate — after this first run, the account shows up directly in the picker on subsequent logins. Wait for the popup to actually **close** (`popup.waitForEvent("close")`) rather than a fixed timeout before navigating — navigating too early races the `onAuthStateChanged`/`sync-user` handshake and silently fails to log in.

With ~9,900 seeded time entries, pages that fetch all-time data (`useMyTimeEntries`, the worklogs sidebar's per-week subtotals) take several seconds to finish their paginated fetch — give the page time to settle before asserting on computed values like weekly hour subtotals, not just on the DOM existing.
