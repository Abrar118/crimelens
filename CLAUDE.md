# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrimeLens is a crime reporting and community verification platform built for the NSU WebXtreme Hackathon 2025. Users report crimes with evidence (images/videos), and the community verifies reports through upvotes, downvotes, and proof-attached comments. Features include AI-generated image descriptions, phone OTP verification, crime heatmaps, leaderboards, anonymous reporting, and an admin panel.

## Commands

```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

Single command — no separate backend server needed. API routes run as serverless functions within Next.js.

## Architecture

### Single Next.js 15 App Router Project
- **Framework:** Next.js 15 with App Router, deployed on Vercel
- **Auth:** Firebase Auth (email/password + phone OTP), session cookies via `middleware.ts`
- **Database:** MongoDB Atlas (native driver, not Mongoose)
- **Storage:** Firebase Storage (client-side direct uploads)
- **AI:** Google Gemini 1.5 Flash for crime scene image descriptions
- **State:** Zustand (`lib/store.ts`) — `useAuthStore` (Firebase user) and `useSidebarStore` (UI)
- **UI:** shadcn/ui (New York style) + Radix UI + Tailwind CSS + Lucide icons
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios with Firebase token interceptor (`lib/api/client.ts`)
- **Maps:** Leaflet + React Leaflet (SSR-disabled via `next/dynamic`)
- **Charts:** Recharts
- **Path alias:** `@/*` maps to project root

### Auth Flow
1. Register via Firebase `createUserWithEmailAndPassword` → profile saved to MongoDB
2. Phone verification via Firebase Phone Auth OTP
3. Login via Firebase `signInWithEmailAndPassword`
4. Session cookie set via `POST /api/v1/auth/session` (Firebase Admin `createSessionCookie`)
5. `middleware.ts` checks session cookie for route protection
6. API routes verify Firebase ID token via `lib/auth.ts` → `verifyAuth(request)`
7. User roles stored as Firebase custom claims: `{ role: "unverified" | "verified" | "admin" }`

### Route Structure
- `/` — Login
- `/signup` — Registration
- `/(dashboard)/*` — Protected user area with sidebar layout
  - `/dashboard`, `/report`, `/crime-feed`, `/profile`, `/profile/my-reports`
  - `/notifications`, `/emergency`, `/heatmap`, `/leaderboard`
- `/admin/*` — Admin panel with separate layout
  - `/admin/dashboard`, `/admin/users`, `/admin/alerts`, `/admin/security`, `/admin/settings`

### API Routes (`app/api/v1/`)
| Route | Methods | Auth |
|-------|---------|------|
| `/api/v1/auth/session` | POST, DELETE | Public |
| `/api/v1/posts` | GET, POST | Public / Verified |
| `/api/v1/posts/[id]` | GET, DELETE | Public / Owner+Admin |
| `/api/v1/posts/[id]/vote` | POST | Verified |
| `/api/v1/posts/[id]/comments` | GET, POST | Public / Verified |
| `/api/v1/posts/[id]/comments/[commentId]` | DELETE | Owner+Admin |
| `/api/v1/users/me` | GET, POST, PUT | Authenticated |
| `/api/v1/users/[id]` | GET | Public |
| `/api/v1/users/[id]/posts` | GET | Public |
| `/api/v1/admin/users` | GET | Admin |
| `/api/v1/admin/users/[id]/ban` | POST | Admin |
| `/api/v1/admin/posts/[id]` | DELETE | Admin |
| `/api/v1/admin/comments/[id]` | DELETE | Admin |
| `/api/v1/ai/describe` | POST | Verified |

### MongoDB Collections
- `users` — profiles keyed by Firebase UID (not ObjectId)
- `posts` — crime reports with images, location, verification scores
- `comments` — comments with mandatory proof attachments
- `votes` — upvote/downvote tracking (one per user per post)

### Environment Variables (`.env.local`)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=
MONGODB_URI=
GOOGLE_AI_API_KEY=
```

### User Roles (Firebase Custom Claims)
- **Unverified:** Can view posts only
- **Verified:** Can post, comment (with proof attachment), upvote/downvote
- **Admin:** Full access — manage users, remove posts/comments, ban users

## Conventions

- shadcn/ui components in `components/ui/` — add with `npx shadcn@latest add <component>`
- Client components must have `"use client"` directive
- Dark mode is class-based via ThemeProvider (default: dark)
- API client functions in `lib/api/` (posts.ts, comments.ts, users.ts, admin.ts)
- Server-side auth verification via `verifyAuth()` and `requireRole()` from `lib/auth.ts`
- Location data: Bangladesh divisions/districts from static JSON in `lib/data/`
- Sidebar navigation groups: General, My Profile, Alert & Update, Survey
- Leaflet maps must use `next/dynamic` with `ssr: false`
