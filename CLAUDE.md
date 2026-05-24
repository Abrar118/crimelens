# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrimeLens is a crime reporting and community verification platform built for the NSU WebXtreme Hackathon 2025. Users report crimes with evidence (images/videos), and the community verifies reports through upvotes, downvotes, and proof-attached comments. Features include AI-generated image descriptions, OTP-based verification, crime heatmaps, leaderboards, anonymous reporting, and an admin panel.

## Commands

### Frontend (root directory)
```bash
npm run dev          # Start Vite dev server (default port 5173)
npm run host         # Start dev server with --host (LAN access)
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run preview      # Preview production build
```

### Backend (`crimelens_server/`)
```bash
cd crimelens_server && npm run dev   # Start Hono server with tsx watch (port 3000)
```

Both servers must run simultaneously for local development. No test framework is configured.

## Architecture

### Monorepo Layout
- **Root** — React SPA frontend (Vite + React 18 + TypeScript)
- **`crimelens_server/`** — Hono.js REST API backend
- **`models/`** — Shared TypeScript types imported by both frontend and backend (e.g., `User` type)

### Frontend Stack
- **Router:** React Router v7 (`src/router.tsx`) — nested route tree with `ProtectedRoute` wrapper
- **State:** Zustand with persistence (`src/lib/store.ts`) — `useAuthStore` (auth/token) and `useSidebarStore` (UI)
- **UI:** shadcn/ui (New York style) + Radix UI primitives + Tailwind CSS + Lucide icons
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios instance at `src/apis/axios.ts` — base URL `http://localhost:3000/api/v1`
- **Maps:** Leaflet + React Leaflet (heatmap, location display)
- **Charts:** Recharts
- **Path alias:** `@` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`)

### Backend Stack
- **Framework:** Hono.js on Node.js (`@hono/node-server`)
- **Database:** MongoDB Atlas (native driver, not Mongoose) — collections: `users`, `posts`
- **Auth:** JWT (access token 1h + refresh token 7d in cookies), bcrypt password hashing
- **File storage:** Cloudinary (profile images, crime scene uploads)
- **Email:** EmailJS (OTP delivery)
- **Entry:** `crimelens_server/src/index.ts` — mounts all routes under `/api/v1`

### Auth Flow
1. Register → OTP sent via EmailJS → verify OTP → login
2. Login returns `accessToken` (localStorage) + `refreshToken` (cookie)
3. `useAuthStore` attempts token refresh on app rehydration
4. Protected routes use `<ProtectedRoute>` checking `isAuthenticated` from Zustand
5. Backend `authMiddleware` validates Bearer token, sets `c.set("user", decoded)`

### Route Structure
- `/` — Login
- `/signup` — Registration
- `/profile/*` — Protected user area (dashboard, report crime, crime feed, profile info, notifications, emergency contacts, heatmap, leaderboard)
- `/admin/*` — Admin panel (dashboard, users, alerts, security, settings)

### Key Integrations
- **AI image description:** Google Generative AI (Gemini 1.5 Flash) in `src/lib/AIGenerate.ts` — analyzes crime scene images and generates descriptions
- **Location data:** Bangladesh divisions/districts from static JSON in `src/lib/data/`
- **Deployment:** Firebase Hosting configured (`.firebaserc`, `firebase.json`) — serves from `dist/`

### API Layer
All API functions live in `src/apis/userApis.ts`. Backend routes are mounted at `/api/v1/user` via the single controller `crimelens_server/src/controllers/userController.ts`.

### Environment Variables
The backend requires these in a `.env` file inside `crimelens_server/`:
```
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
```

### User Roles
- **Unverified:** Can view posts only
- **Verified:** Can post, comment (with proof attachment), upvote/downvote
- **Admin:** Full access — manage users, remove posts/comments, ban users

## Conventions

- shadcn/ui components live in `src/components/ui/` — add new ones with `npx shadcn@latest add <component>`
- Dark mode is class-based via `next-themes` ThemeProvider (default theme: dark)
- API error handling uses switch statements on `error.response.status`
- Sidebar navigation groups: General, My Profile, Alert & Update, Survey
