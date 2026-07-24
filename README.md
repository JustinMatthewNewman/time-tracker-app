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
