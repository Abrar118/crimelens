# Infrastructure Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate CrimeLens from Vite+React Router+Hono to a single Next.js 15 App Router project with Firebase Auth, Firebase Storage, MongoDB Atlas, and Vercel deployment.

**Architecture:** Replace the current two-project setup (Vite SPA + Hono server in `crimelens_server/`) with a single Next.js 15 project. Firebase Auth replaces custom JWT auth. Firebase Storage replaces Cloudinary. Next.js API Routes replace Hono endpoints. MongoDB Atlas remains the database. Zustand remains for client state but the auth store is simplified.

**Tech Stack:** Next.js 15, React 18, TypeScript, Firebase Auth, Firebase Admin SDK, Firebase Storage, MongoDB (native driver), Zustand, shadcn/ui, Tailwind CSS, Axios, Google Generative AI (Gemini), Vercel

---

## File Structure

```
crimelens/
├── app/
│   ├── globals.css                         # CSS variables + Tailwind directives (from src/App.css)
│   ├── layout.tsx                          # Root layout: html/body, fonts, ThemeProvider, Toaster
│   ├── page.tsx                            # Login page
│   ├── signup/
│   │   └── page.tsx                        # Registration + OTP verification
│   ├── (dashboard)/
│   │   ├── layout.tsx                      # Sidebar + breadcrumb header
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── report/
│   │   │   └── page.tsx
│   │   ├── crime-feed/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
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
│   ├── admin/
│   │   ├── layout.tsx
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
│           ├── auth/
│           │   └── session/
│           │       └── route.ts
│           ├── posts/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       ├── vote/
│           │       │   └── route.ts
│           │       └── comments/
│           │           ├── route.ts
│           │           └── [commentId]/
│           │               └── route.ts
│           ├── users/
│           │   ├── me/
│           │   │   └── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       └── posts/
│           │           └── route.ts
│           ├── admin/
│           │   ├── users/
│           │   │   ├── route.ts
│           │   │   └── [id]/
│           │   │       └── ban/
│           │   │           └── route.ts
│           │   ├── posts/
│           │   │   └── [id]/
│           │   │       └── route.ts
│           │   └── comments/
│           │       └── [id]/
│           │           └── route.ts
│           └── ai/
│               └── describe/
│                   └── route.ts
├── components/
│   ├── ui/                                 # All 38+ shadcn components (copied from src/components/ui/)
│   ├── theme-provider.tsx                  # Add "use client"
│   └── chart.tsx
├── lib/
│   ├── firebase.ts                         # Firebase client SDK init
│   ├── firebase-admin.ts                   # Firebase Admin SDK init (server-only)
│   ├── mongodb.ts                          # MongoDB singleton
│   ├── auth.ts                             # verifyAuth + requireRole helpers
│   ├── store.ts                            # Zustand stores (auth simplified, sidebar kept)
│   ├── ai-generate.ts                      # Gemini integration (env var for key)
│   ├── utils.ts                            # cn() utility
│   ├── api/
│   │   ├── client.ts                       # Axios instance with Firebase token interceptor
│   │   ├── posts.ts                        # Post API functions
│   │   ├── comments.ts                     # Comment API functions
│   │   ├── users.ts                        # User profile API functions
│   │   └── admin.ts                        # Admin API functions
│   └── data/
│       ├── divisions.json                  # Copied from src/lib/data/
│       ├── districts.json                  # Copied from src/lib/data/
│       ├── dashboard-dummy.ts              # Copied from src/lib/data/dashboardDummy.ts
│       └── sidebar.ts                      # Updated URLs, remove avatar import
├── hooks/
│   ├── use-mobile.tsx                      # Copied from src/hooks/
│   ├── use-toast.ts                        # Copied from src/hooks/
│   └── use-auth.ts                         # New: Firebase onAuthStateChanged hook
├── types/
│   └── index.ts                            # User, Post, Comment, Vote types
├── public/
│   ├── images/                             # Static images (avatar, backgrounds)
│   └── favicon.ico
├── middleware.ts                            # Next.js auth guard middleware
├── .env.local                              # All environment variables
├── .env.example                            # Template for env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json                         # shadcn/ui config (updated for Next.js)
└── package.json
```

---

## Task 1: Initialize Next.js 15 Project

**Files:**
- Create: `package.json` (overwrite), `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`, `.env.local`, `.env.example`, `.gitignore` (update), `components.json` (update)
- Delete: `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`, `src/router.tsx`, `postcss.config.js`, `eslint.config.js`

- [ ] **Step 1: Back up the current `src/` directory**

```bash
cp -r src src-backup
```

- [ ] **Step 2: Remove Vite config files**

```bash
rm vite.config.ts tsconfig.app.json tsconfig.node.json index.html postcss.config.js eslint.config.js src/main.tsx src/vite-env.d.ts src/router.tsx
```

- [ ] **Step 3: Create `next.config.ts`**

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create `postcss.config.mjs`**

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

- [ ] **Step 6: Create `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

- [ ] **Step 7: Create `.env.example`**

```
# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-only)
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# MongoDB
MONGODB_URI=

# Google AI
GOOGLE_AI_API_KEY=
```

- [ ] **Step 8: Create `.env.local`** from `.env.example` with actual values. The MongoDB URI is `mongodb+srv://crimelens:zjqmLjCsgU6y5uCO@cluster0.jhv99.mongodb.net/?retryWrites=true&w=majority`. The Firebase and Google AI values must be obtained from the Firebase console and Google AI Studio respectively.

- [ ] **Step 9: Update `package.json`**

```json
{
  "name": "crimelens",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@hookform/resolvers": "^4.0.0",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-collapsible": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.4",
    "axios": "^1.7.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "firebase": "^11.0.0",
    "firebase-admin": "^13.0.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.468.0",
    "mongodb": "^6.13.0",
    "next": "^15.1.0",
    "next-themes": "^0.4.4",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "react-leaflet": "^4.2.1",
    "recharts": "^2.14.1",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.16",
    "@types/node": "^22.10.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.15.0",
    "eslint-config-next": "^15.1.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "~5.6.2"
  }
}
```

- [ ] **Step 10: Update `components.json` for Next.js**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 11: Update `.gitignore`** — add Next.js entries:

```
# next.js
/.next/
/out/

# env
.env*.local

# vercel
.vercel

# existing
node_modules
dist
src-backup
```

- [ ] **Step 12: Install dependencies**

```bash
rm -rf node_modules package-lock.json
npm install
```

- [ ] **Step 13: Verify Next.js initializes**

Run: `npx next --version`
Expected: Prints Next.js version (15.x)

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js 15 project, remove Vite config"
```

---

## Task 2: Set Up Core Library Files

**Files:**
- Create: `lib/firebase.ts`, `lib/firebase-admin.ts`, `lib/mongodb.ts`, `lib/auth.ts`, `lib/utils.ts`, `lib/ai-generate.ts`, `types/index.ts`
- Copy: `lib/data/divisions.json`, `lib/data/districts.json`, `lib/data/dashboard-dummy.ts`

- [ ] **Step 1: Create `lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create `lib/firebase.ts`**

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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

- [ ] **Step 3: Create `lib/firebase-admin.ts`**

```typescript
import { initializeApp, getApps, cert } from "firebase-admin/app";

export function initAdmin() {
  if (getApps().length > 0) return;

  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
```

- [ ] **Step 4: Create `lib/auth.ts`**

```typescript
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "./firebase-admin";

export async function verifyAuth(request: Request) {
  initAdmin();
  const token = request.headers.get("Authorization")?.split("Bearer ")[1];
  if (!token) {
    throw new Error("Unauthorized");
  }
  return getAuth().verifyIdToken(token);
}

export async function requireRole(request: Request, role: "verified" | "admin") {
  const decoded = await verifyAuth(request);
  const userRole = decoded.role as string | undefined;
  if (userRole !== role && userRole !== "admin") {
    throw new Error("Forbidden");
  }
  return decoded;
}
```

- [ ] **Step 5: Create `lib/mongodb.ts`**

```typescript
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
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

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("crimelens");
}
```

- [ ] **Step 6: Create `lib/ai-generate.ts`**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY ?? process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateImageDescription(base64Data: string, mimeType: string): Promise<string> {
  const result = await model.generateContent([
    "Describe what is in this image. Focus on any criminal activity, damage, or suspicious elements visible.",
    {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    },
  ]);
  return result.response.text();
}
```

- [ ] **Step 7: Create `types/index.ts`**

```typescript
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profile_image: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  division: string;
  district: string;
  images: string[];
  video?: string;
  crime_time: Date;
  post_time: Date;
  upvotes: number;
  downvotes: number;
  verification_score: number;
  is_anonymous: boolean;
  is_verified_badge: boolean;
  comment_count: number;
}

export interface Comment {
  _id: string;
  post_id: string;
  user_id: string;
  text: string;
  proof_url: string;
  created_at: Date;
}

export interface Vote {
  _id: string;
  post_id: string;
  user_id: string;
  type: "up" | "down";
}
```

- [ ] **Step 8: Copy static data files**

```bash
mkdir -p lib/data
cp src-backup/lib/data/divisions.json lib/data/
cp src-backup/lib/data/districts.json lib/data/
cp src-backup/lib/data/dashboardDummy.ts lib/data/dashboard-dummy.ts
```

- [ ] **Step 9: Create `lib/data/sidebar.ts`** with updated URLs (no avatar import — use `/images/avatar.jpg` from public):

```typescript
import {
  Bell,
  BookOpen,
  Bot,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  icon: LucideIcon;
  items: { title: string; url: string }[];
}

export const navMain: NavItem[] = [
  {
    title: "General",
    icon: SquareTerminal,
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "Report a Crime", url: "/report" },
      { title: "Crime Feed", url: "/crime-feed" },
    ],
  },
  {
    title: "My Profile",
    icon: Bot,
    items: [
      { title: "Information", url: "/profile" },
      { title: "My Reports", url: "/profile/my-reports" },
    ],
  },
  {
    title: "Alert & Update",
    icon: Bell,
    items: [
      { title: "Notification", url: "/notifications" },
      { title: "Emergency", url: "/emergency" },
    ],
  },
  {
    title: "Survey",
    icon: BookOpen,
    items: [
      { title: "Heatmap", url: "/heatmap" },
      { title: "Leaderboard", url: "/leaderboard" },
    ],
  },
];
```

- [ ] **Step 10: Copy `getDivisionInfo.ts`**

```bash
cp src-backup/lib/getDivisionInfo.ts lib/get-division-info.ts
```

Then update the import paths inside the copied file: change `"./data/districts.json"` and `"./data/divisions.json"` to `"@/lib/data/districts.json"` and `"@/lib/data/divisions.json"`.

- [ ] **Step 11: Commit**

```bash
git add lib/ types/
git commit -m "feat: add core library files - Firebase, MongoDB, auth, types"
```

---

## Task 3: Port UI Components

**Files:**
- Copy: all `src/components/ui/*.tsx` → `components/ui/`
- Copy: `src/components/theme-provider.tsx` → `components/theme-provider.tsx`
- Copy: `src/components/chart.tsx` → `components/chart.tsx`
- Copy: `src/hooks/use-mobile.tsx` → `hooks/use-mobile.tsx`
- Copy: `src/hooks/use-toast.ts` → `hooks/use-toast.ts`
- Copy: `src/assets/*` → `public/images/`

- [ ] **Step 1: Copy all shadcn UI components**

```bash
mkdir -p components/ui
cp src-backup/components/ui/*.tsx components/ui/
```

- [ ] **Step 2: Copy theme-provider and chart**

```bash
cp src-backup/components/theme-provider.tsx components/theme-provider.tsx
cp src-backup/components/chart.tsx components/chart.tsx
```

- [ ] **Step 3: Add `"use client"` to `components/theme-provider.tsx`**

Add `"use client";` as the very first line of the file, before any imports. This is required because the component uses `useState`, `useEffect`, `useContext`, and `localStorage`.

- [ ] **Step 4: Copy hooks**

```bash
mkdir -p hooks
cp src-backup/hooks/use-mobile.tsx hooks/use-mobile.tsx
cp src-backup/hooks/use-toast.ts hooks/use-toast.ts
```

- [ ] **Step 5: Copy static assets to `public/images/`**

```bash
mkdir -p public/images
cp src-backup/assets/*.jpg public/images/
cp src-backup/assets/*.svg public/images/
```

- [ ] **Step 6: Update `components/ui/sidebar.tsx`** — replace `useSidebarStore` import path from `@/lib/store` (this will still work since the path alias `@/` now points to project root and `lib/store.ts` will be created in Task 4).

No changes needed if `@/lib/store` resolves correctly. Verify the import exists:
```
import { useSidebarStore } from "@/lib/store";
```

- [ ] **Step 7: Update `components/ui/nav-main.tsx`**

Replace the `<a href={subItem.url}>` with Next.js `Link`:

Change:
```typescript
import { useState } from "react";
```
To:
```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
```

And change:
```tsx
<a href={subItem.url}>
  <span>{subItem.title}</span>
</a>
```
To:
```tsx
<Link href={subItem.url}>
  <span>{subItem.title}</span>
</Link>
```

- [ ] **Step 8: Update `components/ui/nav-user.tsx`**

Replace React Router imports with Next.js and Firebase:

Change:
```typescript
import { logOut } from "@/apis/userApis";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
```
To:
```typescript
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
```

Add `"use client";` at the top of the file.

Replace the logout handler:
```typescript
const navigate = useNavigate();
const setAccessToken = useAuthStore((state) => state.setAccessToken);

const handleLogout = () => {
  try {
    setAccessToken(null);
    logOut();
    toast.success("Logged out successfully");
    navigate("/");
  } catch (error) {
    toast.error("Failed to logout");
  }
};
```
With:
```typescript
const router = useRouter();
const setUser = useAuthStore((state) => state.setUser);

const handleLogout = async () => {
  try {
    await signOut(auth);
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/");
  } catch (error) {
    toast.error("Failed to logout");
  }
};
```

- [ ] **Step 9: Update `components/ui/app-sidebar.tsx`** — update the data import:

Change:
```typescript
import { data } from "@/lib/data/sidebar";
```
To:
```typescript
import { navMain } from "@/lib/data/sidebar";
```

Update the usage from `data.navMain` to `navMain` and remove `data.user`, `data.teams`, `data.projects` references. The user data will come from the auth store instead. For now, hardcode placeholder values so it compiles:

```typescript
"use client";

import type * as React from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navMain } from "@/lib/data/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} variant="floating" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="font-bold text-lg">CrimeLens</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: "User", email: "user@example.com", avatar: "/images/avatar.jpg" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

- [ ] **Step 10: Commit**

```bash
git add components/ hooks/ public/images/
git commit -m "feat: port UI components, hooks, and static assets"
```

---

## Task 4: Create Zustand Stores and Auth Hook

**Files:**
- Create: `lib/store.ts`, `hooks/use-auth.ts`, `lib/api/client.ts`

- [ ] **Step 1: Create `lib/store.ts`**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "firebase/auth";

interface SidebarState {
  openStatus: boolean;
  expanedGroup: string;
  toggleStatus: () => void;
  setExpanedGroup: (group: string) => void;
}

interface AuthState {
  user: User | null;
  role: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      openStatus: true,
      expanedGroup: "General",
      toggleStatus: () => {
        set((state) => ({ openStatus: !state.openStatus }));
      },
      setExpanedGroup: (group: string) => set({ expanedGroup: group }),
    }),
    {
      name: "sidebar-storage",
    }
  )
);

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

- [ ] **Step 2: Create `hooks/use-auth.ts`**

```typescript
"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";

export function useAuth() {
  const { user, role, isLoading, setUser, setRole, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const tokenResult = await firebaseUser.getIdTokenResult();
        setRole((tokenResult.claims.role as string) ?? "unverified");
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setRole, setLoading]);

  return { user, role, isLoading };
}
```

- [ ] **Step 3: Create `lib/api/client.ts`**

```typescript
import axios from "axios";
import { auth } from "@/lib/firebase";

const apiClient = axios.create({
  baseURL: "/api/v1",
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

- [ ] **Step 4: Commit**

```bash
git add lib/store.ts hooks/use-auth.ts lib/api/
git commit -m "feat: add Zustand stores, auth hook, and API client"
```

---

## Task 5: Create Root Layout and Global CSS

**Files:**
- Create: `app/layout.tsx`, `app/globals.css`

- [ ] **Step 1: Create `app/globals.css`**

Copy the entire content of `src-backup/App.css` (which contains Tailwind directives + CSS variables for light/dark themes + scrollbar styles). The file starts with `@tailwind base; @tailwind components; @tailwind utilities;` and contains the `:root` and `.dark` CSS variable blocks.

```bash
cp src-backup/App.css app/globals.css
```

- [ ] **Step 2: Create `app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CrimeLens",
  description: "Crime Reporting and Community Verification Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" storageKey="crimelens-theme">
          <main className="min-h-screen flex flex-col bg-background">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the app compiles**

Run: `npx next build 2>&1 | head -30`

If there are import errors in copied components (e.g., missing `@/lib/store` — it should exist now), fix the specific paths. The build may not fully succeed yet since we haven't created page files, but it should parse the layout.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: add root layout and global CSS"
```

---

## Task 6: Create Auth Pages (Login + Signup)

**Files:**
- Create: `app/page.tsx`, `app/signup/page.tsx`

- [ ] **Step 1: Create `app/page.tsx`** (Login page)

This replaces `src/pages/auth/login/Login.tsx`. Key changes: `useNavigate` → `useRouter`, `loginUser()` → Firebase `signInWithEmailAndPassword`, no more manual token storage.

```typescript
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      setUser(userCredential.user);
      toast.success("Login Successful");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: "url(/images/loginbg.jpg)" }}
    >
      <div className="absolute inset-0 bg-[rgba(0,0,30,0.70)]" />

      <div className="shadow-2xl border-4 rounded-2xl border-blue-300 flex justify-center items-center z-10">
        <div className="lg:max-w-6xl md:max-w-2xl max-w-lg flex flex-col md:flex-row rounded-2xl overflow-hidden bg-[#131a30] shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          <div
            className="hidden lg:flex flex-1 bg-cover bg-center w-[300px]"
            style={{
              backgroundImage: "url(/images/loginbg.jpg)",
              clipPath: "polygon(0 0, 95% 0, 65% 100%, 0% 100%)",
            }}
          />

          <div className="flex-1 p-[30px] flex flex-col justify-center text-[#f0f6ff]">
            <h2 className="lg:text-3xl text-center mb-10 font-bold text-[#ffbf00]">
              Login to Your Account
            </h2>

            <div className="text-5xl flex justify-center mb-5 text-[#66fcf1]">
              🔒
            </div>

            <input
              type="text"
              name="email"
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff] focus:bg-[#0f0f0f] transition-all"
            />
            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff] focus:bg-[#0f0f0f] transition-all"
            />

            <div className="flex items-center mb-4">
              <input type="checkbox" id="rememberMe" className="mr-2" />
              <label htmlFor="rememberMe" className="text-gray-300">
                Remember Me
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="w-full p-3 rounded-md bg-[#1c3d73] text-white font-bold hover:bg-[#0e1b33] hover:scale-105 transition-all"
              >
                Signup
              </button>
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full p-3 rounded-md bg-[#1c3d73] text-white font-bold hover:bg-[#0e1b33] hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/signup/page.tsx`** (Registration page)

This replaces `src/pages/auth/Signup/Signup.tsx`. Key changes: Firebase `createUserWithEmailAndPassword` replaces `createUser()`, phone verification replaces email OTP, profile data saved to MongoDB via API route.

```typescript
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import apiClient from "@/lib/api/client";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!termsChecked) {
      toast.error("Please agree to the terms and conditions to proceed.");
      return;
    }
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill all the fields to proceed.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await apiClient.post("/users/me", {
        name: formData.name,
        phone: formData.phone,
        profile_image: "",
      });

      toast.success("Account created! Please verify your phone number.");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: "url(/images/signupbg.jpg)" }}
    >
      <div className="absolute inset-0 bg-[rgba(0,0,30,0.70)]" />

      <div className="shadow-2xl border-4 border-blue-300 rounded-2xl flex justify-center items-center z-10">
        <div className="lg:max-w-6xl md:max-w-4xl max-w-lg flex flex-col lg:flex-row rounded-2xl overflow-hidden bg-[#131a30] shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          <div
            className="hidden lg:flex flex-1 bg-cover bg-center w-[300px]"
            style={{
              backgroundImage: "url(/images/signupbg.jpg)",
              clipPath: "polygon(0 0, 95% 0, 65% 100%, 0% 100%)",
            }}
          />

          <div className="flex-1 p-[30px] flex flex-col justify-center text-[#f0f6ff]">
            <h2 className="lg:text-3xl text-center mb-10 font-bold text-[#ffbf00]">
              Register Your Account
            </h2>

            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff]" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff]" />
            <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff]" />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 mb-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff]" />

            <div className="flex items-center mb-4">
              <input type="checkbox" id="terms" className="mr-2" checked={termsChecked} onChange={() => setTermsChecked(!termsChecked)} />
              <label htmlFor="terms" className="text-gray-300">
                By signing up, I agree with{" "}
                <span className="text-[#66fcf1] cursor-pointer">Terms & Conditions</span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full p-3 rounded-md bg-[#1c3d73] text-white font-bold hover:bg-[#0e1b33] hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <span className="text-gray-300 mt-4">
              Already have an account?{" "}
              <Link href="/" className="text-[#66fcf1] cursor-pointer">
                Login here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify the login page renders**

Run: `npm run dev`
Open: `http://localhost:3000`
Expected: Login page renders with the background image and form fields.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/signup/
git commit -m "feat: add login and signup pages with Firebase Auth"
```

---

## Task 7: Create Dashboard Layout and Middleware

**Files:**
- Create: `app/(dashboard)/layout.tsx`, `middleware.ts`

- [ ] **Step 1: Create `middleware.ts`**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/signup"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
```

- [ ] **Step 2: Create session API route** at `app/api/v1/auth/session/route.ts` so the client can set the session cookie after Firebase login:

```typescript
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    initAdmin();
    const { idToken } = await request.json();

    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return NextResponse.json({ status: "success" });
}
```

- [ ] **Step 3: Update login page** — after successful Firebase login, call the session endpoint to set the cookie:

In `app/page.tsx`, after `signInWithEmailAndPassword` succeeds, add:

```typescript
const idToken = await userCredential.user.getIdToken();
await fetch("/api/v1/auth/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken }),
});
```

Insert this after `setUser(userCredential.user);` and before `toast.success(...)`.

- [ ] **Step 4: Update signup page** — same session cookie setting after `createUserWithEmailAndPassword`:

In `app/signup/page.tsx`, after `createUserWithEmailAndPassword` succeeds, add:

```typescript
const idToken = await userCredential.user.getIdToken();
await fetch("/api/v1/auth/session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken }),
});
```

- [ ] **Step 5: Update logout in `nav-user.tsx`** — delete session cookie on logout:

Add before `router.push("/")`:
```typescript
await fetch("/api/v1/auth/session", { method: "DELETE" });
```

- [ ] **Step 6: Create `app/(dashboard)/layout.tsx`**

This replaces `ProfileLayout.tsx`. Uses the sidebar, breadcrumbs, and `{children}` instead of `<Outlet />`.

```typescript
"use client";

import { AppSidebar } from "@/components/ui/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openStatus } = useSidebarStore();
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  useAuth();

  return (
    <SidebarProvider open={openStatus}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex text-white h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 text-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                  const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                  const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
                  const isLast = index === pathSegments.length - 1;

                  return (
                    <BreadcrumbItem key={segment} className="hidden md:flex">
                      {isLast ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                          <BreadcrumbSeparator className="hidden md:block" />
                        </>
                      )}
                    </BreadcrumbItem>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add middleware.ts app/api/v1/auth/ app/\(dashboard\)/layout.tsx
git commit -m "feat: add middleware, session API, and dashboard layout"
```

---

## Task 8: Port Dashboard and Report Pages

**Files:**
- Create: `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/report/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/dashboard/page.tsx`**

Copy `src-backup/pages/profile/General/dashboard/Dashboard.tsx` and its `_components/` subfolder. Add `"use client";` at top. No routing changes needed — this page uses only shadcn components.

```bash
mkdir -p app/\(dashboard\)/dashboard
```

Copy the Dashboard component content, adding `"use client";` at the top. All imports from `@/components/ui/*` and `@/lib/data/dashboardDummy` (now `@/lib/data/dashboard-dummy`) remain valid. Copy the `_components` directory too:

```bash
mkdir -p app/\(dashboard\)/dashboard/_components
cp src-backup/pages/profile/General/dashboard/_components/DashboardCard.tsx app/\(dashboard\)/dashboard/_components/
cp src-backup/pages/profile/General/dashboard/_components/Overview.tsx app/\(dashboard\)/dashboard/_components/
```

Create the page file with the Dashboard content from `src-backup/pages/profile/General/dashboard/Dashboard.tsx`, adding `"use client";` at the top and updating the import from `dashboardDummy` to `dashboard-dummy`:

Change:
```typescript
import { chartData, recentResonses, npsData, satisfactionData } from "@/lib/data/dashboardDummy";
```
To:
```typescript
import { chartData, recentResonses, npsData, satisfactionData } from "@/lib/data/dashboard-dummy";
```

- [ ] **Step 2: Create `app/(dashboard)/report/page.tsx`**

Copy `src-backup/pages/profile/General/report/ReportForm.tsx`. It already has `"use client";`. Key changes:

- Change `import { createPost } from "@/apis/userApis";` to `import apiClient from "@/lib/api/client";`
- Change `import { run } from "@/lib/AIGenerate";` to `import { generateImageDescription } from "@/lib/ai-generate";`
- Change `import { getDivisionsWithDistricts } from "@/lib/getDivisionInfo";` to `import { getDivisionsWithDistricts } from "@/lib/get-division-info";`
- Replace `await createPost(values);` with `await apiClient.post("/posts", values);`
- Update the AI description handler to convert file to base64 and call the new function

```bash
mkdir -p app/\(dashboard\)/report
```

Write the page file with the ReportForm content, applying the import changes above.

- [ ] **Step 3: Verify dashboard renders**

Run: `npm run dev`
Navigate to `/dashboard` (you may need to temporarily disable middleware or set a test session cookie)
Expected: Dashboard page renders with tabs and chart components.

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/dashboard/ app/\(dashboard\)/report/
git commit -m "feat: port dashboard and report pages"
```

---

## Task 9: Port Remaining Dashboard Pages

**Files:**
- Create: `app/(dashboard)/crime-feed/page.tsx`, `app/(dashboard)/profile/page.tsx`, `app/(dashboard)/profile/my-reports/page.tsx`, `app/(dashboard)/notifications/page.tsx`, `app/(dashboard)/emergency/page.tsx`, `app/(dashboard)/heatmap/page.tsx`, `app/(dashboard)/leaderboard/page.tsx`

- [ ] **Step 1: Create placeholder pages for each route**

For each page, copy the content from its corresponding `src-backup/pages/profile/` file. Add `"use client";` at the top. Replace any `react-router-dom` imports:
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useLocation()` → `usePathname()` from `next/navigation`
- `<Link to="...">` → `<Link href="...">` from `next/link`
- `useParams()` → `useParams()` from `next/navigation`

```bash
mkdir -p app/\(dashboard\)/crime-feed
mkdir -p app/\(dashboard\)/profile/my-reports
mkdir -p app/\(dashboard\)/notifications
mkdir -p app/\(dashboard\)/emergency
mkdir -p app/\(dashboard\)/heatmap
mkdir -p app/\(dashboard\)/leaderboard
```

For each file, create the page.tsx with content from the corresponding source:

| Source | Destination |
|--------|-------------|
| `src-backup/pages/profile/General/crim-feed/CrimeFeed.tsx` | `app/(dashboard)/crime-feed/page.tsx` |
| `src-backup/pages/profile/my-profile/information/ProfileInfo.tsx` | `app/(dashboard)/profile/page.tsx` |
| `src-backup/pages/profile/my-profile/my-reports/MyReports.tsx` | `app/(dashboard)/profile/my-reports/page.tsx` |
| `src-backup/pages/profile/alert-update/notification/Notification.tsx` | `app/(dashboard)/notifications/page.tsx` |
| `src-backup/pages/profile/alert-update/emergency/Emergency.tsx` | `app/(dashboard)/emergency/page.tsx` |
| `src-backup/pages/profile/survey/heatmap/Heatmap.tsx` | `app/(dashboard)/heatmap/page.tsx` |
| `src-backup/pages/profile/survey/leaderboard/Leaderboard.tsx` | `app/(dashboard)/leaderboard/page.tsx` |

Each page must:
1. Start with `"use client";`
2. Replace react-router-dom imports with next/navigation equivalents
3. Be the default export of the file

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/
git commit -m "feat: port remaining dashboard pages"
```

---

## Task 10: Port Admin Pages

**Files:**
- Create: `app/admin/layout.tsx`, `app/admin/dashboard/page.tsx`, `app/admin/users/page.tsx`, `app/admin/alerts/page.tsx`, `app/admin/security/page.tsx`, `app/admin/settings/page.tsx`

- [ ] **Step 1: Create `app/admin/layout.tsx`**

This replaces `AdminLayout.tsx`. Convert from `<Outlet />` to `{children}`. Replace the admin sidebar/navbar React Router imports.

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Bell, ShieldAlert, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const navItems = [
  { title: "Dashboard", icon: Home, path: "/admin/dashboard" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "Alerts", icon: Bell, path: "/admin/alerts" },
  { title: "Security", icon: ShieldAlert, path: "/admin/security" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/v1/auth/session", { method: "DELETE" });
    router.push("/");
  };

  return (
    <div className="flex">
      <aside className="h-screen w-64 bg-gray-900 text-white p-4 fixed">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
        <nav className="space-y-4">
          {navItems.map(({ title, icon: Icon, path }) => (
            <Link
              key={title}
              href={path}
              className={`flex items-center p-3 rounded-md ${
                pathname === path ? "bg-blue-500" : "hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {title}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 ml-64">
        <div className="w-full bg-gray-900 text-white flex justify-between p-4">
          <h2 className="text-lg font-bold">Admin Dashboard</h2>
          <div className="flex gap-4">
            <Link href="/admin/alerts">
              <Bell size={24} className="text-gray-400 hover:text-white" />
            </Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-white">
              <LogOut size={24} />
            </button>
          </div>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create admin page files**

For each admin page, copy from `src-backup/admin/`:

| Source | Destination |
|--------|-------------|
| `src-backup/admin/Dashboard.tsx` | `app/admin/dashboard/page.tsx` |
| `src-backup/admin/Users.tsx` | `app/admin/users/page.tsx` |
| `src-backup/admin/Alert.tsx` | `app/admin/alerts/page.tsx` |
| `src-backup/admin/Security.tsx` | `app/admin/security/page.tsx` |
| `src-backup/admin/Settings.tsx` | `app/admin/settings/page.tsx` |

Each file:
1. Add `"use client";` at top
2. Replace any `react-router-dom` imports with `next/navigation` and `next/link`
3. Make the component the default export
4. Remove the `md:ml-64` class from the admin Dashboard since the layout handles the margin

- [ ] **Step 3: Commit**

```bash
git add app/admin/
git commit -m "feat: port admin pages and layout"
```

---

## Task 11: Create API Routes

**Files:**
- Create: `app/api/v1/posts/route.ts`, `app/api/v1/posts/[id]/route.ts`, `app/api/v1/posts/[id]/vote/route.ts`, `app/api/v1/posts/[id]/comments/route.ts`, `app/api/v1/posts/[id]/comments/[commentId]/route.ts`, `app/api/v1/users/me/route.ts`, `app/api/v1/users/[id]/route.ts`, `app/api/v1/users/[id]/posts/route.ts`, `app/api/v1/admin/users/route.ts`, `app/api/v1/admin/users/[id]/ban/route.ts`, `app/api/v1/admin/posts/[id]/route.ts`, `app/api/v1/admin/comments/[id]/route.ts`, `app/api/v1/ai/describe/route.ts`

- [ ] **Step 1: Create `app/api/v1/users/me/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuth(request);
    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: decoded.uid });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyAuth(request);
    const body = await request.json();
    const db = await getDb();

    await db.collection("users").updateOne(
      { _id: decoded.uid },
      {
        $set: {
          name: body.name,
          phone: body.phone,
          profile_image: body.profile_image || "",
          bio: body.bio || "",
          email: decoded.email,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ status: "success" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const decoded = await verifyAuth(request);
    const body = await request.json();
    const db = await getDb();

    await db.collection("users").updateOne(
      { _id: decoded.uid },
      {
        $set: {
          ...body,
          updated_at: new Date(),
        },
      }
    );

    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

- [ ] **Step 2: Create `app/api/v1/posts/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { verifyAuth, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const division = searchParams.get("division");
  const district = searchParams.get("district");
  const sort = searchParams.get("sort") || "post_time";
  const order = searchParams.get("order") === "asc" ? 1 : -1;
  const search = searchParams.get("search");

  const db = await getDb();
  const filter: Record<string, unknown> = {};

  if (division) filter.division = division;
  if (district) filter.district = district;
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    db.collection("posts")
      .find(filter)
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("posts").countDocuments(filter),
  ]);

  return NextResponse.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  try {
    const decoded = await requireRole(request, "verified");
    const body = await request.json();
    const db = await getDb();

    const post = {
      user_id: decoded.uid,
      title: body.title,
      description: body.description || "",
      division: body.division,
      district: body.district,
      images: body.images || [],
      video: body.video || null,
      crime_time: new Date(body.crime_time),
      post_time: new Date(),
      upvotes: 0,
      downvotes: 0,
      verification_score: 0,
      is_anonymous: body.is_anonymous || false,
      is_verified_badge: false,
      comment_count: 0,
    };

    const result = await db.collection("posts").insertOne(post);
    return NextResponse.json({ _id: result.insertedId, ...post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 3: Create `app/api/v1/posts/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await verifyAuth(request);
    const db = await getDb();

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const role = decoded.role as string;
    if (post.user_id !== decoded.uid && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
    await db.collection("comments").deleteMany({ post_id: id });
    await db.collection("votes").deleteMany({ post_id: id });

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

- [ ] **Step 4: Create `app/api/v1/posts/[id]/vote/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await requireRole(request, "verified");
    const { type } = await request.json();

    if (type !== "up" && type !== "down") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    const db = await getDb();
    const existingVote = await db.collection("votes").findOne({
      post_id: id,
      user_id: decoded.uid,
    });

    if (existingVote) {
      if (existingVote.type === type) {
        await db.collection("votes").deleteOne({ _id: existingVote._id });
        const field = type === "up" ? "upvotes" : "downvotes";
        await db.collection("posts").updateOne(
          { _id: new ObjectId(id) },
          { $inc: { [field]: -1 } }
        );
        return NextResponse.json({ status: "removed" });
      }

      await db.collection("votes").updateOne(
        { _id: existingVote._id },
        { $set: { type } }
      );
      const incField = type === "up" ? "upvotes" : "downvotes";
      const decField = type === "up" ? "downvotes" : "upvotes";
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { [incField]: 1, [decField]: -1 } }
      );
      return NextResponse.json({ status: "changed" });
    }

    await db.collection("votes").insertOne({
      post_id: id,
      user_id: decoded.uid,
      type,
    });
    const field = type === "up" ? "upvotes" : "downvotes";
    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { [field]: 1 } }
    );

    return NextResponse.json({ status: "voted" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 5: Create `app/api/v1/posts/[id]/comments/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const comments = await db.collection("comments")
    .find({ post_id: id })
    .sort({ created_at: -1 })
    .toArray();

  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await requireRole(request, "verified");
    const body = await request.json();

    if (!body.proof_url) {
      return NextResponse.json(
        { error: "Proof attachment is mandatory" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const comment = {
      post_id: id,
      user_id: decoded.uid,
      text: body.text,
      proof_url: body.proof_url,
      created_at: new Date(),
    };

    const result = await db.collection("comments").insertOne(comment);
    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { comment_count: 1 } }
    );

    return NextResponse.json({ _id: result.insertedId, ...comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 6: Create `app/api/v1/posts/[id]/comments/[commentId]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const decoded = await verifyAuth(request);
    const db = await getDb();

    const comment = await db.collection("comments").findOne({
      _id: new ObjectId(commentId),
    });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const role = decoded.role as string;
    if (comment.user_id !== decoded.uid && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("comments").deleteOne({ _id: new ObjectId(commentId) });
    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { comment_count: -1 } }
    );

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

- [ ] **Step 7: Create `app/api/v1/users/[id]/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: id },
    { projection: { name: 1, profile_image: 1, bio: 1, created_at: 1 } }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
```

- [ ] **Step 8: Create `app/api/v1/users/[id]/posts/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const posts = await db.collection("posts")
    .find({ user_id: id })
    .sort({ post_time: -1 })
    .toArray();

  return NextResponse.json(posts);
}
```

- [ ] **Step 9: Create admin API routes**

Create `app/api/v1/admin/users/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    await requireRole(request, "admin");
    const db = await getDb();
    const users = await db.collection("users").find().toArray();
    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

Create `app/api/v1/admin/users/[id]/ban/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, "admin");
    const { id } = await params;
    initAdmin();
    await getAuth().updateUser(id, { disabled: true });
    return NextResponse.json({ status: "banned" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

Create `app/api/v1/admin/posts/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, "admin");
    const { id } = await params;
    const db = await getDb();
    await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
    await db.collection("comments").deleteMany({ post_id: id });
    await db.collection("votes").deleteMany({ post_id: id });
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

Create `app/api/v1/admin/comments/[id]/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, "admin");
    const { id } = await params;
    const db = await getDb();

    const comment = await db.collection("comments").findOne({ _id: new ObjectId(id) });
    if (comment) {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(comment.post_id) },
        { $inc: { comment_count: -1 } }
      );
    }

    await db.collection("comments").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 10: Create `app/api/v1/ai/describe/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { generateImageDescription } from "@/lib/ai-generate";

export async function POST(request: Request) {
  try {
    await requireRole(request, "verified");
    const { base64Data, mimeType } = await request.json();

    if (!base64Data || !mimeType) {
      return NextResponse.json(
        { error: "base64Data and mimeType are required" },
        { status: 400 }
      );
    }

    const description = await generateImageDescription(base64Data, mimeType);
    return NextResponse.json({ description });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 11: Commit**

```bash
git add app/api/
git commit -m "feat: add all API routes - posts, comments, votes, users, admin, AI"
```

---

## Task 12: Create API Client Functions

**Files:**
- Create: `lib/api/posts.ts`, `lib/api/comments.ts`, `lib/api/users.ts`, `lib/api/admin.ts`

- [ ] **Step 1: Create `lib/api/posts.ts`**

```typescript
import apiClient from "./client";

export async function getPosts(params?: {
  page?: number;
  limit?: number;
  division?: string;
  district?: string;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}) {
  const { data } = await apiClient.get("/posts", { params });
  return data;
}

export async function getPost(id: string) {
  const { data } = await apiClient.get(`/posts/${id}`);
  return data;
}

export async function createPost(body: {
  title: string;
  description?: string;
  division: string;
  district: string;
  images: string[];
  video?: string;
  crime_time: string;
  is_anonymous?: boolean;
}) {
  const { data } = await apiClient.post("/posts", body);
  return data;
}

export async function deletePost(id: string) {
  const { data } = await apiClient.delete(`/posts/${id}`);
  return data;
}

export async function votePost(id: string, type: "up" | "down") {
  const { data } = await apiClient.post(`/posts/${id}/vote`, { type });
  return data;
}
```

- [ ] **Step 2: Create `lib/api/comments.ts`**

```typescript
import apiClient from "./client";

export async function getComments(postId: string) {
  const { data } = await apiClient.get(`/posts/${postId}/comments`);
  return data;
}

export async function createComment(postId: string, body: {
  text: string;
  proof_url: string;
}) {
  const { data } = await apiClient.post(`/posts/${postId}/comments`, body);
  return data;
}

export async function deleteComment(postId: string, commentId: string) {
  const { data } = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  return data;
}
```

- [ ] **Step 3: Create `lib/api/users.ts`**

```typescript
import apiClient from "./client";

export async function getMyProfile() {
  const { data } = await apiClient.get("/users/me");
  return data;
}

export async function updateMyProfile(body: {
  name?: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
}) {
  const { data } = await apiClient.put("/users/me", body);
  return data;
}

export async function getUserProfile(id: string) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
}

export async function getUserPosts(id: string) {
  const { data } = await apiClient.get(`/users/${id}/posts`);
  return data;
}
```

- [ ] **Step 4: Create `lib/api/admin.ts`**

```typescript
import apiClient from "./client";

export async function getAllUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data;
}

export async function banUser(userId: string) {
  const { data } = await apiClient.post(`/admin/users/${userId}/ban`);
  return data;
}

export async function adminDeletePost(postId: string) {
  const { data } = await apiClient.delete(`/admin/posts/${postId}`);
  return data;
}

export async function adminDeleteComment(commentId: string) {
  const { data } = await apiClient.delete(`/admin/comments/${commentId}`);
  return data;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/api/
git commit -m "feat: add typed API client functions for posts, comments, users, admin"
```

---

## Task 13: Clean Up Old Files

**Files:**
- Delete: `crimelens_server/` directory, `src/` directory (already backed up to `src-backup/`), `firebase.json`, `models/`, `src-backup/`

- [ ] **Step 1: Delete `crimelens_server/`**

```bash
rm -rf crimelens_server
```

- [ ] **Step 2: Delete `src/`** (the original, not src-backup)

```bash
rm -rf src
```

- [ ] **Step 3: Delete obsolete root files**

```bash
rm -f firebase.json
rm -rf models
```

- [ ] **Step 4: Delete `src-backup/`** once you've confirmed all files have been ported

```bash
rm -rf src-backup
```

- [ ] **Step 5: Verify the build**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds or shows only minor warnings (no missing module errors).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove old Vite/Hono/src files and crimelens_server"
```

---

## Task 14: Update CLAUDE.md and Final Verification

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update `CLAUDE.md`** with the new project structure. Replace the existing content to reflect:

- Commands: `npm run dev` (Next.js), `npm run build`, `npm run lint`
- Architecture: Single Next.js 15 project (no more crimelens_server)
- Auth: Firebase Auth (not custom JWT)
- Storage: Firebase Storage (not Cloudinary)
- Database: MongoDB Atlas (unchanged)
- API: Next.js Route Handlers under `app/api/v1/`
- State: Zustand (simplified auth store)
- Deployment: Vercel

- [ ] **Step 2: Run the dev server and verify**

Run: `npm run dev`

Test these flows:
1. Login page renders at `/`
2. Signup page renders at `/signup`
3. After login, redirects to `/dashboard`
4. Sidebar navigation works between pages
5. Admin layout renders at `/admin/dashboard`
6. API routes respond (e.g., `curl http://localhost:3000/api/v1/posts`)

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Next.js architecture"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Initialize Next.js 15 | `next.config.ts`, `package.json`, `tsconfig.json` |
| 2 | Core library files | `lib/firebase.ts`, `lib/mongodb.ts`, `lib/auth.ts`, `types/index.ts` |
| 3 | Port UI components | `components/ui/*`, `hooks/*`, `public/images/*` |
| 4 | Zustand stores + auth hook | `lib/store.ts`, `hooks/use-auth.ts`, `lib/api/client.ts` |
| 5 | Root layout + CSS | `app/layout.tsx`, `app/globals.css` |
| 6 | Auth pages | `app/page.tsx`, `app/signup/page.tsx` |
| 7 | Dashboard layout + middleware | `app/(dashboard)/layout.tsx`, `middleware.ts` |
| 8 | Dashboard + report pages | `app/(dashboard)/dashboard/`, `app/(dashboard)/report/` |
| 9 | Remaining dashboard pages | Crime feed, profile, notifications, etc. |
| 10 | Admin pages | `app/admin/layout.tsx`, admin page files |
| 11 | API routes | All `app/api/v1/` route handlers |
| 12 | API client functions | `lib/api/posts.ts`, etc. |
| 13 | Clean up old files | Delete `crimelens_server/`, `src/`, old configs |
| 14 | Update docs + verify | `CLAUDE.md`, end-to-end testing |
