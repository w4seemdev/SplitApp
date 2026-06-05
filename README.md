# 🏋️ SplitApp

A science-based **workout planner & tracker**. Pick a proven training split, choose your
exercises for each day, and track every set — with your progress saved per account.

Built with **React + Vite**. Light/dark themes, no backend required (data persists in the
browser).

---

## ✨ Features

- **Choose a split** — Full Body, Upper/Lower, Push/Pull/Legs, or Bro Split, each built from
  evidence-based hypertrophy research (train each muscle ~2×/week, 10–20 sets/week, 6–12 reps).
- **Build your plan** — pick exactly which exercises you want on each day; rename, reorder,
  delete days, and drop in **rest days**.
- **Day-by-day tracker** — log weight × reps per set, watch live volume, and when you finish a
  day it tells you what's next ("✓ Chest done — tomorrow is Back").
- **Progress memory** — every exercise shows "last time you did X kg" so you can beat it
  (progressive overload).
- **Rest timer** — built-in countdown (60/90/120/180s) with a beep.
- **Accounts** — sign up / log in; each user gets their own private program & history.
- **Exercise library** — 45+ exercises across 9 muscle groups with sets/reps guidance.
- **Light & dark themes** — Tailwind-inspired palette with a toggle.

## 🧰 Tech stack

- [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- [React Router](https://reactrouter.com/) for navigation
- `localStorage` for persistence (program, history, accounts)
- Web Crypto API for password hashing (SHA-256)
- Plain CSS with custom properties (theme variables)

## 🚀 Getting started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# build for production
npm run build

# preview the production build
npm run preview
```

## 📁 Project structure

```
src/
├─ data/         exercises.js · splits.js      ← the fitness knowledge base
├─ lib/          program.js · auth.js          ← program model + auth helpers
├─ context/      AuthContext.jsx               ← login state
├─ hooks/        useLocalStorage · useUserStorage
├─ components/   Navbar · Footer · RestTimer · ThemeToggle · ProtectedRoute
├─ pages/        Home · Splits · Plan · Exercises · Tracker · Login
└─ index.css     global theme (light + dark)
themes/          theme-dark-gym.css            ← alternate "gym" theme backup
```

## ⚠️ Note on authentication

Accounts are stored **in the browser** (localStorage) for demo purposes — passwords are hashed,
but data lives on the device, not a secure server. For real multi-device accounts you'd add a
backend (database + server-side auth).

---

