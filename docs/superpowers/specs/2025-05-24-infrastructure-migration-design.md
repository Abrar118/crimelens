# Infrastructure Migration Design: Vite+Hono to Next.js+Firebase Serverless

**Sub-project:** 1 of 6 (Infrastructure Migration)
**Date:** 2025-05-24
**Status:** Approved

## Overview

Migrate CrimeLens from a Vite+React Router SPA with a separate Hono.js backend (`crimelens_server/`) to a single Next.js 15 App Router project deployed on Vercel. Replace custom JWT auth with Firebase Auth, Cloudinary with Firebase Storage, and Hono endpoints with Next.js API routes. Keep MongoDB Atlas as the database and Zustand for client state.

## Decided Stack

| Concern | Current | New |
|---------|---------|-----|
| Frontend framework | Vite + React 18 + React Router v7 | Next.js 15 App Router |
| Backend | Hono.js on Node.js (port 3000) | Next.js API Routes (Vercel serverless) |
| Auth | Custom JWT + bcrypt + EmailJS OTP | Firebase Auth (email/password + phone OTP) |
| Database | MongoDB Atlas (native driver) | MongoDB Atlas (native driver, no change) |
| File storage | Cloudinary | Firebase Storage |
| AI | Google Gemini 1.5 Flash | Google Gemini (no change) |
| Realtime | None | Firebase Realtime DB (later sub-project) |
| UI | shadcn/ui + Tailwind CSS + Radix | shadcn/ui + Tailwind CSS + Radix (no change) |
| State | Zustand with persistence | Zustand with persistence (simplified auth store) |
| Deploy | Firebase Hosting | Vercel |

## 1. Next.js App Router Structure

```
crimelens/
├── app/
│   ├── layout.tsx                          # Root layout: ThemeProvider, global fonts, Toaster
│   ├── page.tsx                            # Login page (currently "/")
│   ├── signup/
│   │   └── page.tsx                        # Registration + OTP verification
│   ├── (dashboard)/                        # Route group: shared sidebar layout for authenticated users
│   │   ├── layout.tsx                      # Sidebar + header (replaces ProfileLayout)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── report/
│   │   │   └── page.tsx                    # Crime report form
│   │   ├── crime-feed/
│   │   │   └── page.tsx                    # Paginated crime feed
│   │   ├── profile/
│   │   │   ├── page.tsx                    # Profile info
│   │   │   └── my-reports/
│   │   │       └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── emergency/
│   │   │   └── page.tsx
│   │   ├── heatmap/
│   │   │   └── page.tsx
│   │   └── leaderboard/
│   │       └── page.tsx
│   ├── admin/                              # Admin area (separate layout)
│   │   ├── layout.tsx                      # Admin sidebar + navbar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── alerts/
│   │   │   └── page.tsx
│   │   ├── security/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       └── v1/
│           ├── posts/
│           │   ├── route.ts                # GET (list), POST (create)
│           │   └── [id]/
│           │       ├── route.ts            # GET (detail), DELETE
│           │       ├── vote/
│           │       │   └── route.ts        # POST (upvote/downvote)
│           │       └── comments/
│           │           ├── route.ts        # GET (list), POST (create)
│           │           └── [commentId]/
│           │               └── route.ts    # DELETE
│           ├── users/
│           │   ├── me/
│           │   │   └── route.ts            # GET, PUT (current user profile)
│           │   └── [id]/
│           │       ├── route.ts            # GET (public profile)
│           │       └── posts/
│           │           └── route.ts        # GET (user's posts)
│           ├── admin/
│           │   ├── users/
│           │   │   ├── route.ts            # GET (list all users)
│           │   │   └── [id]/
│           │   │       └── ban/
│           │   │           └── route.ts    # POST (ban user)
│           │   ├── posts/
│           │   │   └── [id]/
│           │   │       └── route.ts        # DELETE (remove post)
│           │   └── comments/
│           │       └── [id]/
│           │           └── route.ts        # DELETE (remove comment)
│           └── ai/
│               └── describe/
│                   └── route.ts            # POST (Gemini image description)
├── components/
│   ├── ui/                                 # shadcn/ui components (transfer as-is)
│   ├── theme-provider.tsx
│   ├── chart.tsx
│   └── ...                                 # Feature-specific components
├── lib/
│   ├── firebase.ts                         # Firebase client SDK init
│   ├── firebase-admin.ts                   # Firebase Admin SDK (server-only)
│   ├── mongodb.ts                          # MongoDB singleton connection
│   ├── auth.ts                             # verifyAuth() helper for API routes
│   ├── store.ts                            # Zustand stores (simplified)
│   ├── ai-generate.ts                      # Gemini integration
│   ├── utils.ts                            # cn() utility
│   └── data/
│       ├── divisions.json
│       └── districts.json
├── hooks/
│   ├── use-mobile.tsx
│   └── use-auth.ts                         # Firebase onAuthStateChanged hook
├── types/
│   └── index.ts                            # User, Post, Comment types (replaces models/)
├── middleware.ts                            # Next.js middleware: Firebase session check
├── .env.local                              # All secrets
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### Route mapping from current to new

| Current (React Router) | New (App Router) |
|------------------------|------------------|
| `/` | `/` (page.tsx) |
| `/signup` | `/signup` |
| `/profile/general/dashboard` | `/(dashboard)/dashboard` |
| `/profile/general/report` | `/(dashboard)/report` |
| `/profile/general/crime-feed` | `/(dashboard)/crime-feed` |
| `/profile/my-profile/info` | `/(dashboard)/profile` |
| `/profile/my-profile/my-reports` | `/(dashboard)/profile/my-reports` |
| `/profile/alert-update/notification` | `/(dashboard)/notifications` |
| `/profile/alert-update/emergency` | `/(dashboard)/emergency` |
| `/profile/survey/heatmap` | `/(dashboard)/heatmap` |
| `/profile/survey/leaderboard` | `/(dashboard)/leaderboard` |
| `/admin/dashboard` | `/admin/dashboard` |
| `/admin/users` | `/admin/users` |
| `/admin/alerts` | `/admin/alerts` |
| `/admin/security` | `/admin/security` |
| `/admin/settings` | `/admin/settings` |

### Key routing changes

- `<Outlet />` becomes `{children}` in `layout.tsx`
- `useNavigate()` becomes `useRouter()` from `next/navigation`
- `<Link to="...">` becomes `<Link href="...">` from `next/link`
- `ProtectedRoute` component is replaced by `middleware.ts`
- The `(dashboard)` route group provides shared layout without adding a URL segment
- `createBrowserRouter` and `router.tsx` are deleted entirely

## 2. Firebase Auth Integration

### Client-side setup

```typescript
// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Auth flows

**Registration:**
1. `createUserWithEmailAndPassword(auth, email, password)`
2. Store additional user data (name, phone, profile_image) in MongoDB `users` collection keyed by Firebase UID
3. User starts as `role: "unverified"` (custom claim)

**Phone verification:**
1. `verifyPhoneNumber(auth, phoneNumber, recaptchaVerifier)` sends SMS OTP
2. User enters OTP → `PhoneAuthProvider.credential(verificationId, otp)`
3. `linkWithCredential(auth.currentUser, credential)` links phone to account
4. API route sets custom claim `{ role: "verified" }` via Admin SDK

**Login:**
1. `signInWithEmailAndPassword(auth, email, password)`
2. Firebase SDK handles token refresh automatically

**Session management:**
- `onAuthStateChanged()` listener updates Zustand `useAuthStore`
- API requests include `Authorization: Bearer <idToken>` obtained via `getIdToken()`
- No manual token refresh needed — Firebase SDK handles it

**Admin ban:**
- Admin calls `POST /api/v1/admin/users/[id]/ban`
- API route calls `admin.auth().updateUser(uid, { disabled: true })`
- Banned user's existing session is invalidated on next token check

### Server-side verification

```typescript
// lib/auth.ts
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from './firebase-admin';

export async function verifyAuth(request: Request) {
  initAdmin();
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) throw new Error('Unauthorized');
  return getAuth().verifyIdToken(token);
}

export async function requireRole(request: Request, role: 'verified' | 'admin') {
  const decoded = await verifyAuth(request);
  if (decoded.role !== role && decoded.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return decoded;
}
```

### User roles via custom claims

| Role | Custom Claim | Capabilities |
|------|-------------|--------------|
| `unverified` | `{ role: "unverified" }` | View posts only |
| `verified` | `{ role: "verified" }` | Post, comment, vote |
| `admin` | `{ role: "admin" }` | Full access + user management |

### What gets deleted

- `crimelens_server/src/controllers/userController.ts` — all auth endpoints
- `crimelens_server/src/middleware/authMiddleware.ts` — custom JWT middleware
- `src/apis/userApis.ts` — register, login, verify, refreshToken, resendOtp
- `src/lib/send-mail.tsx` — EmailJS (Firebase handles OTP)
- Manual token storage in localStorage/cookies
- `jsonwebtoken`, `bcrypt`, `emailjs` dependencies

## 3. MongoDB Connection (Serverless Pattern)

```typescript
// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db('crimelens');
}
```

### Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User profiles (linked by Firebase UID) | `_id` (Firebase UID), `name`, `phone`, `profile_image`, `bio`, `created_at` |
| `posts` | Crime reports | `_id`, `user_id`, `title`, `description`, `division`, `district`, `images[]`, `video`, `crime_time`, `post_time`, `upvotes`, `downvotes`, `verification_score`, `is_anonymous`, `is_verified_badge` |
| `comments` | Comments with proof | `_id`, `post_id`, `user_id`, `text`, `proof_url`, `created_at` |
| `votes` | Vote tracking (prevent duplicates) | `_id`, `post_id`, `user_id`, `type` ("up"/"down") |
| `notifications` | Notification records (later sub-project) | `_id`, `user_id`, `type`, `data`, `read`, `created_at` |

Password hashes are no longer stored — Firebase Auth handles credentials. The `users` collection becomes a profile-only store.

## 4. Firebase Storage

### Upload flow

1. Client validates file type and size
2. Client uploads directly via `uploadBytesResumable(ref, file)` with progress tracking
3. On completion, `getDownloadURL(ref)` returns the public URL
4. URL is included in the API request body when creating posts/comments/profiles

### Storage paths

```
profiles/{uid}/avatar.{ext}
posts/{postId}/{timestamp}-{filename}
comments/{commentId}/{timestamp}-{filename}
```

### Security rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{uid}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == uid
                   && request.resource.size < 5 * 1024 * 1024;
    }
    match /posts/{postId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.role in ['verified', 'admin']
                   && request.resource.size < 10 * 1024 * 1024;
    }
    match /comments/{commentId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.role in ['verified', 'admin']
                   && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

## 5. Component & State Migration

### Direct transfers (no changes)

All `components/ui/` shadcn files (38+), `hooks/use-mobile.tsx`, `hooks/use-toast.ts`, `lib/utils.ts`, `lib/data/divisions.json`, `lib/data/districts.json`, `lib/data/dashboardDummy.ts`, `lib/data/sidebar.tsx` (update links to use `href`).

### Components requiring changes

| File | Change |
|------|--------|
| `components/ProtectedRoute.tsx` | Delete — replaced by `middleware.ts` |
| `components/theme-provider.tsx` | Minor: works with Next.js, may need `"use client"` directive |
| `components/ui/app-sidebar.tsx` | Update: move into `(dashboard)/layout.tsx`, change Link imports |
| `components/ui/nav-main.tsx` | Update: `Link` from `next/link`, `usePathname()` for active state |
| `components/ui/nav-user.tsx` | Update: use Firebase `signOut()` instead of custom `logOut()` |
| `pages/auth/login/Login.tsx` | Rewrite: use Firebase `signInWithEmailAndPassword` |
| `pages/auth/Signup/Signup.tsx` | Rewrite: use Firebase `createUserWithEmailAndPassword` |
| `pages/auth/Signup/VerificationModal.tsx` | Rewrite: use Firebase Phone Auth OTP flow |
| All page components | Add `"use client"` where needed, replace `useNavigate` with `useRouter` |

### Zustand stores

**`useAuthStore` (simplified):**
```typescript
interface AuthState {
  user: User | null;        // Firebase User object
  role: string | null;      // From custom claims
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
}
```
No more manual `accessToken`, `refreshToken`, or rehydration logic. A `useAuth` hook wraps `onAuthStateChanged` and updates the store.

**`useSidebarStore`:** No changes — transfers as-is.

### API client layer

```
lib/api/
├── client.ts           # Axios instance: baseURL = "/api/v1", auto-attach Firebase ID token
├── posts.ts            # createPost, getPosts, getPost, deletePost, votePost
├── comments.ts         # createComment, getComments, deleteComment
├── users.ts            # getProfile, updateProfile, getUserPosts
└── admin.ts            # getUsers, banUser, deletePost, deleteComment
```

The Axios instance auto-attaches the Firebase ID token via an interceptor:
```typescript
axios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 6. Package Changes

### Remove
- `react-router-dom`
- `@emailjs/browser`
- `vite`, `@vitejs/plugin-react-swc`
- `js-cookie`
- Entire `crimelens_server/` directory and its dependencies

### Add
- `next`
- `firebase` (client SDK)
- `firebase-admin` (server SDK, API routes only)

### Keep
- `react`, `react-dom`
- `zustand`
- `axios`
- `@google/generative-ai`
- `@hookform/resolvers`, `react-hook-form`, `zod`
- All `@radix-ui/*` packages
- `leaflet`, `react-leaflet`
- `recharts`
- `sonner`
- `date-fns`
- `tailwindcss`, `tailwind-merge`, `tailwindcss-animate`, `postcss`, `autoprefixer`
- `class-variance-authority`, `clsx`
- `lucide-react`
- `next-themes`
- `eslint`, `typescript`

## 7. Environment Variables

All in `.env.local` (gitignored):

```
# Firebase Client (public — exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-only — never exposed)
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# MongoDB
MONGODB_URI=mongodb+srv://crimelens:...@cluster0.jhv99.mongodb.net/?retryWrites=true&w=majority

# Google AI
GOOGLE_AI_API_KEY=
```

No more hardcoded credentials anywhere in the codebase.

## 8. Next.js Middleware (Auth Guard)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/' || pathname === '/signup') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') ||
      pathname.startsWith('/report') || pathname.startsWith('/crime-feed') ||
      pathname.startsWith('/profile') || pathname.startsWith('/notifications') ||
      pathname.startsWith('/emergency') || pathname.startsWith('/heatmap') ||
      pathname.startsWith('/leaderboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

Session cookie is set after Firebase login by calling a `/api/v1/auth/session` endpoint that creates a Firebase session cookie server-side.

## 9. Deployment

- **Vercel:** Connect GitHub repo, auto-deploy on push to `master`
- **Environment variables:** Set in Vercel project settings
- **Firebase:** Keep existing project (`business-intelligence-pl-69515`) for Auth, Storage, and Realtime DB
- **MongoDB Atlas:** Keep existing cluster, whitelist Vercel's IP ranges (or use 0.0.0.0/0 for serverless)
- Remove `firebase.json` hosting config (no longer deploying frontend to Firebase)
- Keep `.firebaserc` for Firebase CLI operations (auth setup, storage rules deployment)

## 10. Migration Order

1. Initialize Next.js 15 project in the repo root (replace Vite config)
2. Set up Firebase client + admin SDKs
3. Set up MongoDB singleton connection
4. Port all `components/ui/` and shared components
5. Create `(dashboard)/layout.tsx` with sidebar
6. Create `admin/layout.tsx` with admin sidebar
7. Port auth pages (login, signup) with Firebase Auth
8. Create `middleware.ts` for route protection
9. Port remaining pages (dashboard, report, crime-feed, profile, etc.)
10. Create API routes (posts CRUD, comments, votes, users, admin)
11. Set up Firebase Storage for file uploads
12. Wire up Axios client with Firebase token interceptor
13. Delete `crimelens_server/` directory
14. Delete Vite/React Router config files
15. Update CLAUDE.md with new project structure
16. Test all flows end-to-end
