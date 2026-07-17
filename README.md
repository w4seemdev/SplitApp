# SplitApp

**A science-based workout split planner and tracker that keeps every set you log safe in the cloud: built for lifters who want a plan, not a spreadsheet.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&labelColor=20232a)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&labelColor=20232a)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Sync-3FCF8E?logo=supabase&logoColor=white&labelColor=20232a)](https://supabase.com/)
[![React Router](https://img.shields.io/badge/React%20Router-6-CA4245?logo=reactrouter&logoColor=white&labelColor=20232a)](https://reactrouter.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white&labelColor=20232a)](https://web.dev/progressive-web-apps/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?logo=vercel&logoColor=white)](https://split-app-tawny.vercel.app)

## Live Demo

**[split-app-tawny.vercel.app](https://split-app-tawny.vercel.app)**

Create a free account, pick a split, and start logging sets in under a minute.

## Why This Exists

Most lifters either follow a random routine or lose their training log in a notes app. SplitApp turns evidence-based hypertrophy guidelines (train each muscle ~2x/week, 10-20 sets/week, 6-12 reps) into a concrete weekly plan, then tracks every set against it. Data is local-first for instant load and offline use, and syncs to Supabase per account, so a lifter can log on their phone at the gym and review progress on their laptop at home.

## Key Features

- **Proven training splits**: choose Full Body, Upper/Lower, Push/Pull/Legs, or a Bro Split, each built from hypertrophy research rather than guesswork.
- **Custom plan builder**: pick exactly which exercises go on each day; rename, reorder, and delete days, or drop in rest days.
- **Set-by-set workout tracker**: log weight x reps per set with live volume totals, and get told what's next when a day is done.
- **Progressive overload memory**: every exercise shows what you lifted last session, so beating it is the default.
- **Progress dashboard**: total volume, weekly volume, training streaks, a recent-session bar chart, and per-muscle volume breakdown.
- **Built-in rest timer**: 60/90/120/180s presets with an audio cue; keeps accurate time even when the phone is locked or backgrounded.
- **Cloud accounts**: email/password sign-up, login, and a full password-reset flow; each user's program and history follow them across devices.
- **Works offline**: installable PWA with a local-first data layer; sets logged without a connection are kept locally and never lost.
- **kg / lb support**: switch units in Settings; all history and volume stats convert on the fly.
- **Exercise library**: 45+ exercises across 9 muscle groups, each with sets/reps guidance.
- **Light & dark themes**: one-tap toggle, consistent across the whole app.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6 |
| Build tooling | Vite 5, vite-plugin-pwa (Workbox service worker) |
| Backend | Supabase (Postgres + Auth), `@supabase/supabase-js` |
| Data layer | Local-first `localStorage` cache with debounced write-through cloud sync |
| Security | Row-Level Security on every table, hardened HTTP headers via `vercel.json` |
| Styling | Hand-written CSS with custom properties (light/dark theme variables) |
| Hosting | Vercel (SPA rewrites + security headers) |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Production build / preview
npm run build
npm run preview
```

**Environment variables** (optional: the app ships pointed at its production Supabase project; set these to use your own):

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

The anon key is safe to expose in a frontend, every database row is protected server-side by Row-Level Security.

## Engineering Highlights

- **Row-Level Security done right**: user data lives in a `user_data (user_id, key, value jsonb)` table where RLS restricts every row to its owner. The client holds only the public anon key; the database enforces access, not the frontend.
- **Local-first sync engine** (`src/lib/cloudStore.js`): a write-through cache with per-key debouncing (500ms) so rapid set-logging doesn't spam the network, plus automatic flush on `visibilitychange`/`pagehide` so switching apps mid-workout never drops the last sets.
- **Conflict-safe hydration** (`src/hooks/useUserStorage.js`): cloud data is fetched once per session behind a shared promise; a dirty-flag guard guarantees a fresh device's defaults can never overwrite data another device already saved, and legacy local accounts migrate to the cloud automatically.
- **Mobile-correct timing**: the rest timer derives remaining time from a target timestamp instead of counting intervals, so it stays accurate through browser throttling in backgrounded or locked tabs.
- **Accessibility built in**: skip-to-content link, `aria-live` announcements for timer milestones, focus management on route change, and a global error boundary.
- **Production hygiene**: security headers (`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`), SPA rewrites, Open Graph tags, `robots.txt` + `sitemap.xml`, and an auto-updating service worker.

## What This Project Demonstrates

- **React architecture**: clean separation of data (`src/data`), domain logic (`src/lib`), reusable hooks (`src/hooks`), and presentation (`src/pages`, `src/components`), with a single shared program model driving both the planner and the tracker.
- **Full-stack auth**: Supabase email/password authentication with session handling, protected routes, and an end-to-end password-reset flow.
- **Offline-first product thinking**: designed for the real gym environment: flaky connections, backgrounded tabs, and multi-device users.
- **Security awareness**: RLS-based authorization, hardened HTTP headers, and secrets kept out of source control.
- **Shipping to production**: PWA packaging, SEO metadata, error boundaries, and a live Vercel deployment.

## Project Structure

```
src/
├─ data/         exercises.js · splits.js         ← the fitness knowledge base
├─ lib/          program.js · cloudStore.js       ← program model + cloud sync engine
│                supabase.js · units.js
├─ context/      AuthContext.jsx                  ← Supabase session state
├─ hooks/        useLocalStorage · useUserStorage · usePageTitle
├─ components/   Navbar · Footer · RestTimer · ThemeToggle
│                ProtectedRoute · ErrorBoundary · ConfirmDialog
├─ pages/        Home · Splits · Plan · Exercises · Tracker
│                Progress · Settings · Login · ResetPassword
└─ index.css     global theme (light + dark)
```

---

Built by **Waseem Abu Fares**, [github.com/w4seemdev](https://github.com/w4seemdev)
