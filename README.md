This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:


```bash
npm run dev
 
firebase dataconnect:sdk:generate 
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Local Google Sign-In (Auth Emulator)

Google sign-in uses Firebase Authentication, and a successful sign-in immediately calls `/api/auth/sync-user` ([app/api/auth/sync-user/route.ts](app/api/auth/sync-user/route.ts)), which writes the user via Data Connect. So to develop the sign-in flow locally without hitting the real project, you need **both** the Auth emulator and the Data Connect emulator running, not just Auth — starting Auth alone gets you past the sign-in popup but then fails with `ECONNREFUSED 127.0.0.1:9399` when it tries to sync the user.

1. Make sure the Firebase CLI is installed and you're logged in:

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. In `.env.local`, make sure these are set:

   ```bash
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
   DATA_CONNECT_EMULATOR_HOST=127.0.0.1:9399
   ```

   - `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` makes [lib/firebase.ts](lib/firebase.ts) and [lib/dataconnectEmulator.ts](lib/dataconnectEmulator.ts) point the *browser* client at the local Auth (`9099`) and Data Connect (`9399`) emulators instead of the live project.
   - `FIREBASE_AUTH_EMULATOR_HOST` and `DATA_CONNECT_EMULATOR_HOST` do the same for the *server-side* Admin SDK calls in [lib/firebase-admin.ts](lib/firebase-admin.ts) and the generated Data Connect admin client used by `sync-user`.

3. Start both emulators together (configured in [firebase.json](firebase.json)):

   ```bash
   firebase emulators:start --only auth,dataconnect
   ```

   Emulator UI: [http://127.0.0.1:4000](http://127.0.0.1:4000) (Auth at `/auth`; Data Connect runs a local Postgres instance backing `dataconnect/.dataconnect/pgliteData`, no UI panel).

4. In another terminal, start the app as usual:

   ```bash
   npm run dev
   ```

5. Click "Sign in with Google" in the app. The emulator intercepts the popup and shows its own sign-in dialog — no real Google account or OAuth credentials needed. You can type any name/email to create a fake test user, or pick one you've already created from the Emulator UI's **Authentication** tab. On success, the app calls `sync-user`, which creates/updates the row in the local emulated database.

Set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false` (or remove it, along with the two `*_EMULATOR_HOST` vars) to go back to signing in against the real Firebase project.

## Seeding Stress-Test Data (Reports Development)

[scripts/seed-stress-test.mjs](scripts/seed-stress-test.mjs) populates the local emulator with ~2 years of realistic weekday work logs (~500 work logs, ~10k time entries, 160 tickets) under one dedicated test account, so weekly/monthly/yearly report views have real volume to develop against. It talks straight to the Auth + Data Connect emulators via the Admin SDK — no browser involved — so it seeds in seconds. Generation is deterministic (fixed RNG seed), so re-running it is a no-op unless you change `SEED_RNG_SEED` or `SEED_YEARS`.

With both emulators running (see above):

```bash
npm run seed:stress-test:dry-run   # generate + print counts only, no emulator calls — safe to run anytime
npm run seed:stress-test           # actually seed (idempotent, safe to re-run)
npm run seed:stress-test:reset     # wipe this account's work logs/entries first, then reseed
```

It refuses to run unless `FIREBASE_AUTH_EMULATOR_HOST` and `DATA_CONNECT_EMULATOR_HOST` both point at `localhost`/`127.0.0.1`, so there's no path to it touching the real project.

When it finishes, it prints a login for the seeded account:

```
email:    stress.test@local.dev
password: stress-test-password-123
```

Sign in with that via the emulator's Google sign-in popup (pick it from the existing-accounts list, or just retype the email) to see the generated data in the app.

## Google Calendar Sync

Pushes your tracked time into a **dedicated "Time Tracker" calendar** in Google, so your day fills in with what you actually worked on. Manual "Sync now" over a date range you choose — there is no background job and no API call in the entry-save path.

Configured from **Settings → Google Calendar** ([components/Settings/GoogleCalendarCard.tsx](components/Settings/GoogleCalendarCard.tsx)). The integration is inert until the four environment variables below are set; without them the card shows a setup hint rather than a broken button.

### One-time Google Cloud setup

Claude can't provision these for you — they have to be created in your own Google account.

Use the **existing `ecs-time-tracker-app` project** — a Firebase project *is* a Google Cloud project, so the one backing Firebase Auth already exists and already has a consent screen configured by Firebase. A second project would just mean a second consent screen to maintain.

> The consent screen pages were reorganized in 2025. What used to live under *APIs & Services → OAuth consent screen* is now **Google Auth Platform**, split into Branding / Audience / Clients / Data Access.

1. **Enable the API.** [APIs & Services → Library](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) → **Google Calendar API** → Enable.
2. **Check the audience.** [Google Auth Platform → Audience](https://console.cloud.google.com/auth/audience). Firebase will have set this up already; what matters is the publishing status:
   - **Testing** — refresh tokens [expire after 7 days](https://developers.google.com/identity/protocols/oauth2#expiration), so you reconnect weekly. (The documented exception covers only name/email/profile scopes, which doesn't apply here.) Add your Google account under **Test users**.
   - **In production** — tokens last indefinitely. Unverified apps show a one-time "Google hasn't verified this app" interstitial (Advanced → Go to…), and are capped at 100 users. **For personal use this is the better trade.**
   - A refresh token also dies on revocation, six months of disuse, or exceeding 100 live tokens per client. All surface as a `reauth_required` error with a reconnect prompt, never a silent failure.
3. **Register the scope** (optional in Testing, required for verification): [Data Access](https://console.cloud.google.com/auth/scopes) → Add or remove scopes → `https://www.googleapis.com/auth/calendar.app.created`.
4. **Create the client.** [Google Auth Platform → Clients](https://console.cloud.google.com/auth/clients) → **Create client** → **Web application**.
   - Name it something like `Time Tracker — Calendar Sync`. Create a *new* client rather than editing the Firebase-managed one, so an accidental change can't break sign-in.
   - **Authorized redirect URIs** → `http://localhost:3000/api/google-calendar/callback`, plus your deployed equivalent. Must match `GOOGLE_OAUTH_REDIRECT_URI` **exactly** — scheme, case, and trailing slash all count.
   - Leave *Authorized JavaScript origins* empty; the browser never calls Google directly here.
5. **Copy the secret immediately.** Since June 2025 the client secret is [shown only once, at creation](https://support.google.com/cloud/answer/15549257). If you lose it, add a new secret on the client's detail page (max two).

### Environment variables

All server-side — none are `NEXT_PUBLIC_`, and none may become so. The browser never sees the client id, the secret, or any Google token.

```bash
GOOGLE_OAUTH_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback
# 32 random bytes, base64. Generate with: openssl rand -base64 32
GOOGLE_TOKEN_ENCRYPTION_KEY=...
```

`GOOGLE_TOKEN_ENCRYPTION_KEY` encrypts the stored refresh token at rest and signs the OAuth `state` parameter (two HKDF-derived subkeys — see [lib/googleCalendar/crypto.ts](lib/googleCalendar/crypto.ts)). **Rotating it invalidates every existing connection**; users just reconnect.

### What it can and can't touch

The only calendar scope requested is [`calendar.app.created`](https://developers.google.com/workspace/calendar/api/auth), which permits creating secondary calendars and managing events **only on calendars this app itself created**. Your primary calendar is unreachable — not by convention, but because Google rejects those requests at the token level. `openid`/`email` are also requested, purely so the settings card can show which account is connected.

### Sync behavior

| Setting | Default | Effect |
| --- | --- | --- |
| Merge consecutive entries | on | Back-to-back entries on the same ticket become one event, so a day is a few blocks rather than ~20 fifteen-minute slivers. |
| Overwrite existing events | on | Re-syncing rewrites events this app created. Off preserves manual edits made in Google Calendar. |
| Remove orphaned events | on | Deletes in-range events whose time entry is gone, making the calendar a true mirror of that range. |
| Show as Free | on | Events are `transparent`, so logging past work doesn't retroactively blank out your availability. |
| Include entry notes | on | Copies entry notes into the event body. |

Two properties make this safe to re-run:

- **Idempotent.** A Google event id is derived from the source TimeEntry's UUID (dashes stripped — hex is a subset of the base32hex alphabet Google requires), so re-syncing addresses the same event instead of duplicating it. No mapping table exists or is needed. A merged block keys on its *first* entry, so extending a block updates the event in place rather than churning it.
- **Only ever touches its own events.** Every written event carries a private `ttManaged=1` extended property, and the sync lists events filtered on it. An event you add to the Time Tracker calendar by hand is invisible to the diff and can never be overwritten or pruned.

Bounded per request: at most **366 days** of range and **500 writes**. A large first backfill reports what it left over — press Sync now again, and already-synced events come back "unchanged" for free.

### Local development

The OAuth flow talks to the real Google, so it can't be exercised against the emulators. The rest works locally with `GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback` and your account added as a test user.

Sync logic is covered by unit tests that need no network — merging, idempotency, the insert/update/skip/prune diff, and the crypto:

```bash
npx vitest run lib/googleCalendar
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
