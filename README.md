# PRINCE EVENTS

Royal wedding snacks and starters website. Live data is stored in Firebase Realtime Database.

## Requirements

- **Node.js 18+** (Download from https://nodejs.org)

## Setup

```
npm install
```

Create `.env.local` (see `.env.example`) and fill in:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | 32-byte random hex used to sign admin session cookies. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_PASSWORD_HASH` | SHA-256 hash of the admin password. Generate: `node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"` |
| `FIREBASE_DATABASE_URL` | Your Realtime Database URL (optional — defaults to the live project) |

`.env.local` is git-ignored — never commit secrets.

## Run

| Platform | Command |
|----------|---------|
| **Windows** | Double-click `start-dev.bat` |
| **Windows (phone access)** | Double-click `start-mobile.bat` |
| **Mac/Linux** | `bash start.sh` |
| **Mac/Linux (phone access)** | `bash start-mobile.sh` |
| **Any (terminal)** | `npm run dev` |

Open http://localhost:3000

## Admin Panel

- URL: http://localhost:3000/admin/login
- Password: the plain-text password whose SHA-256 hash is in `ADMIN_PASSWORD_HASH`
- Sessions are JWT cookies (`httpOnly`, `Secure`, `SameSite=Lax`), signed with `JWT_SECRET`.
- Login is rate-limited (10 attempts / 15 min per IP).
- All admin write API routes require a valid session **and** a same-origin request (CSRF protection).

## API Security

- `/api/settings` GET never returns `adminPassword` (env-var only).
- All mutations (menu, orders, gallery, testimonials, settings, upload) are auth-protected server-side.
- Public order form has a honeypot field + minimum fill-time to block spam bots.
- All API inputs are validated with Zod; invalid payloads get `400`.
- Image uploads are limited to JPEG/PNG/WebP, ≤5 MB, ≤8000px per side.

## Build for Production

```
npm run build
npm run start
```

Or double-click `start-prod.bat`

## Firebase Realtime Database rules

The file `firebase.rules.json` contains hardened rules (public read for menu/gallery/testimonials/settings, writes locked).

> The server now writes through the **Firebase Admin SDK**, so it bypasses rules entirely — you must add the service-account key:
>
> 1. Firebase console → ⚙️ Project settings → **Service accounts** → *Generate new private key*.
> 2. Save the JSON as `serviceAccountKey.json` in the project root (gitignored).
> 3. Set `FIREBASE_SERVICE_ACCOUNT_KEY` to its path in `.env.local` (or rely on the default `./serviceAccountKey.json` lookup).
>
> With the key in place, admin writes (menu/gallery/testimonials/settings/orders) work through `src/lib/firebase-db.ts`
> via the Admin SDK, while the database rules keep direct public writes locked.
>
> Then publish `firebase.rules.json` in the Firebase console (Realtime Database → Rules) or via the CLI:
> `firebase deploy --only database`

## Deploy (Vercel)

`vercel.json` builds with `next build`. Set the env vars (`JWT_SECRET`, `ADMIN_PASSWORD_HASH`, `FIREBASE_DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT_KEY`) in the Vercel project dashboard.
