# Remaining Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 8 final hackathon features: real-time notifications (Firebase RTDB), verification badges, anonymous reporting + claim, AI fake detection, image compression, and watermarking.

**Architecture:** Notifications use Firebase Realtime DB (Admin writes, client listens via `onValue`). Verification badges auto-apply in existing vote/comment API routes. AI fake detection calls Gemini on post creation. Image processing (compression + watermark) happens client-side before Firebase Storage upload.

**Tech Stack:** Firebase Realtime DB (client + admin), Gemini AI, browser-image-compression, Canvas API, MongoDB, Next.js 15

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `lib/firebase.ts` | Modify | Add RTDB export |
| `lib/firebase-admin.ts` | Modify | Add databaseURL |
| `lib/notifications.ts` | Create | Server-side notification helper |
| `hooks/use-notifications.ts` | Create | Client-side RTDB listener |
| `app/(dashboard)/notifications/page.tsx` | Rewrite | Real-time notification UI |
| `app/api/v1/posts/[id]/comments/route.ts` | Modify | Notification + badge check |
| `app/api/v1/posts/[id]/vote/route.ts` | Modify | Notification + badge check |
| `app/api/v1/admin/users/[id]/ban/route.ts` | Modify | Add notification |
| `app/api/v1/admin/posts/[id]/verify/route.ts` | Create | Admin verify toggle |
| `app/api/v1/admin/posts/flagged/route.ts` | Create | Flagged posts list |
| `app/api/v1/posts/[id]/claim/route.ts` | Create | Claim anonymous post |
| `app/api/v1/posts/route.ts` | Modify | AI fake detection on create |
| `app/(dashboard)/report/page.tsx` | Modify | Anonymous checkbox |
| `app/(dashboard)/crime-feed/[id]/page.tsx` | Modify | Badge, AI score, claim, admin verify |
| `app/(dashboard)/crime-feed/page.tsx` | Modify | Show badge on cards |
| `components/file-upload.tsx` | Modify | Compression + watermark |
| `components/ui/app-sidebar.tsx` | Modify | Unread badge |
| `lib/api/posts.ts` | Modify | Add claimPost |
| `lib/api/admin.ts` | Modify | Add verifyPost, getFlaggedPosts |
| `.env.example` | Modify | Add RTDB URL |

---

## Task 1: Install Dependencies + Firebase RTDB Setup

**Files:**
- Modify: `package.json`, `lib/firebase.ts`, `lib/firebase-admin.ts`, `.env.example`

- [ ] **Step 1: Install browser-image-compression**

```bash
npm install browser-image-compression
```

- [ ] **Step 2: Add RTDB to `lib/firebase.ts`**

Add these two lines at the end of the file:
```typescript
import { getDatabase } from "firebase/database";
export const database = getDatabase(app);
```

- [ ] **Step 3: Add databaseURL to `lib/firebase-admin.ts`**

The `initializeApp` call needs a `databaseURL`. Change the function to:

```typescript
export function initAdmin() {
  if (getApps().length > 0) return;

  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}
```

- [ ] **Step 4: Update `.env.example`**

Add this line:
```
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
```

Also add it to `.env.local` with the actual Firebase RTDB URL (e.g., `https://<project-id>-default-rtdb.firebaseio.com`).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/firebase.ts lib/firebase-admin.ts .env.example
git commit -m "chore: add browser-image-compression, Firebase RTDB setup"
```

---

## Task 2: Notification Server Helper + Hooks

**Files:**
- Create: `lib/notifications.ts`
- Create: `hooks/use-notifications.ts`

- [ ] **Step 1: Create `lib/notifications.ts`**

```typescript
import { getDatabase } from "firebase-admin/database";
import { initAdmin } from "./firebase-admin";

export async function createNotification(userId: string, data: {
  type: string;
  post_id?: string;
  actor_id: string;
  message: string;
}) {
  initAdmin();
  const db = getDatabase();
  const ref = db.ref(`notifications/${userId}`).push();
  await ref.set({
    ...data,
    read: false,
    created_at: Date.now(),
  });
}
```

- [ ] **Step 2: Create `hooks/use-notifications.ts`**

```typescript
"use client";

import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";

export interface Notification {
  id: string;
  type: string;
  post_id?: string;
  actor_id: string;
  message: string;
  read: boolean;
  created_at: number;
}

export function useNotifications() {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const notifRef = ref(database, `notifications/${user.uid}`);
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const list: Notification[] = Object.entries(data)
        .map(([id, val]) => ({ id, ...(val as Omit<Notification, "id">) }))
        .sort((a, b) => b.created_at - a.created_at);

      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    const notifRef = ref(database, `notifications/${user.uid}/${notificationId}`);
    await update(notifRef, { read: true });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const updates: Record<string, boolean> = {};
    notifications.filter((n) => !n.read).forEach((n) => {
      updates[`notifications/${user.uid}/${n.id}/read`] = true;
    });
    if (Object.keys(updates).length > 0) {
      const dbRef = ref(database);
      await update(dbRef, updates);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/notifications.ts hooks/use-notifications.ts
git commit -m "feat: add notification creation helper and real-time listener hook"
```

---

## Task 3: Wire Notifications into Existing API Routes

**Files:**
- Modify: `app/api/v1/posts/[id]/comments/route.ts`
- Modify: `app/api/v1/posts/[id]/vote/route.ts`
- Modify: `app/api/v1/admin/users/[id]/ban/route.ts`

- [ ] **Step 1: Add notification to comments route**

In `app/api/v1/posts/[id]/comments/route.ts`, add import at top:
```typescript
import { createNotification } from "@/lib/notifications";
```

In the `POST` function, after `await db.collection("posts").updateOne(...)` (the comment_count increment) and before the return, add:
```typescript
    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (post && post.user_id !== decoded.uid) {
      await createNotification(post.user_id, {
        type: "comment",
        post_id: id,
        actor_id: decoded.uid,
        message: "Someone commented on your post",
      }).catch(() => {});
    }
```

Also add the auto-badge check right after the notification block:
```typescript
    if (post && post.upvotes >= 10 && (post.comment_count + 1) >= 3) {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_verified_badge: true } }
      );
    }
```

- [ ] **Step 2: Add notification + badge to vote route**

In `app/api/v1/posts/[id]/vote/route.ts`, add import at top:
```typescript
import { createNotification } from "@/lib/notifications";
```

At the end of the `POST` function, just BEFORE the final `return NextResponse.json({ status: "voted" }, { status: 201 });` (the new vote case), add:
```typescript
    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (post && post.user_id !== decoded.uid) {
      await createNotification(post.user_id, {
        type: "vote",
        post_id: id,
        actor_id: decoded.uid,
        message: `Someone ${type}voted your post`,
      }).catch(() => {});
    }

    if (post && post.upvotes >= 10 && post.comment_count >= 3) {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_verified_badge: true } }
      );
    }
```

- [ ] **Step 3: Add notification to ban route**

In `app/api/v1/admin/users/[id]/ban/route.ts`, add import at top:
```typescript
import { createNotification } from "@/lib/notifications";
```

After `await getAuth().updateUser(id, { disabled: true });` and before the return, add:
```typescript
    await createNotification(id, {
      type: "admin_ban",
      actor_id: (await requireRole(request, "admin")).uid,
      message: "Your account has been banned",
    }).catch(() => {});
```

Wait — `requireRole` was already called at the top and we can't call it twice (it reads the body). Instead, store the decoded result. Change the function to:

Actually, `requireRole` only reads the Authorization header, not the body. But it was already called. The result isn't stored. Let me restructure: change `await requireRole(request, "admin");` to `const adminUser = await requireRole(request, "admin");` and use `adminUser.uid`.

Replace the entire POST function:
```typescript
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireRole(request, "admin");
    const { id } = await params;
    initAdmin();
    await getAuth().updateUser(id, { disabled: true });
    await createNotification(id, {
      type: "admin_ban",
      actor_id: adminUser.uid,
      message: "Your account has been banned",
    }).catch(() => {});
    return NextResponse.json({ status: "banned" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/posts/\[id\]/comments/route.ts app/api/v1/posts/\[id\]/vote/route.ts app/api/v1/admin/users/\[id\]/ban/route.ts
git commit -m "feat: trigger notifications on comment, vote, and ban actions"
```

---

## Task 4: Notifications Page + Sidebar Badge

**Files:**
- Rewrite: `app/(dashboard)/notifications/page.tsx`
- Modify: `components/ui/app-sidebar.tsx`

- [ ] **Step 1: Rewrite `app/(dashboard)/notifications/page.tsx`**

```typescript
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageCircle,
  ThumbsUp,
  ShieldAlert,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const TYPE_ICONS: Record<string, typeof Bell> = {
  comment: MessageCircle,
  vote: ThumbsUp,
  admin_ban: ShieldAlert,
  admin_delete: ShieldAlert,
};

const TYPE_COLORS: Record<string, string> = {
  comment: "text-blue-400",
  vote: "text-green-400",
  admin_ban: "text-red-400",
  admin_delete: "text-red-400",
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={24} /> Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h1>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck size={16} className="mr-2" /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No notifications yet</p>
        ) : (
          notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const color = TYPE_COLORS[notif.type] || "text-gray-400";

            return (
              <Card
                key={notif.id}
                className={`border cursor-pointer transition-colors ${
                  notif.read
                    ? "bg-gray-900/30 border-gray-800"
                    : "bg-gray-900 border-gray-600"
                }`}
                onClick={() => markAsRead(notif.id)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Icon size={20} className={color} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.read ? "text-gray-400" : "text-white"}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {notif.post_id && (
                    <Link href={`/crime-feed/${notif.post_id}`} onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={16} className="text-gray-400 hover:text-white" />
                    </Link>
                  )}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add unread badge to sidebar**

In `components/ui/app-sidebar.tsx`, add import and hook usage. Replace the entire file:

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
import { useAuthStore } from "@/lib/store";
import { useNotifications } from "@/hooks/use-notifications";
import { Badge } from "@/components/ui/badge";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();

  const userData = {
    name: user?.displayName ?? user?.email?.split("@")[0] ?? "User",
    email: user?.email ?? "",
    avatar: user?.photoURL ?? "/images/avatar.jpg",
  };

  const navWithBadge = navMain.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      badge: item.url === "/notifications" && unreadCount > 0 ? unreadCount : undefined,
    })),
  }));

  return (
    <Sidebar collapsible="icon" {...props} variant="floating" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="font-bold text-lg">CrimeLens</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navWithBadge} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

Then update the `NavMain` component in `components/ui/nav-main.tsx` to render the badge. Find the sub-item rendering and add badge display. In the `<SidebarMenuSubButton>` where the sub-item title is rendered, after `<span>{subItem.title}</span>`, add:

```tsx
{(subItem as any).badge && (
  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
    {(subItem as any).badge}
  </span>
)}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/notifications/page.tsx components/ui/app-sidebar.tsx components/ui/nav-main.tsx
git commit -m "feat: add real-time notifications page with sidebar unread badge"
```

---

## Task 5: Admin Verify + Flagged Posts Routes + Client Functions

**Files:**
- Create: `app/api/v1/admin/posts/[id]/verify/route.ts`
- Create: `app/api/v1/admin/posts/flagged/route.ts`
- Create: `app/api/v1/posts/[id]/claim/route.ts`
- Modify: `lib/api/admin.ts`
- Modify: `lib/api/posts.ts`

- [ ] **Step 1: Create `app/api/v1/admin/posts/[id]/verify/route.ts`**

```bash
mkdir -p "app/api/v1/admin/posts/[id]/verify"
```

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
    await requireRole(request, "admin");
    const { id } = await params;
    const db = await getDb();

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newState = !post.is_verified_badge;
    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_verified_badge: newState } }
    );

    return NextResponse.json({ is_verified_badge: newState });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 2: Create `app/api/v1/admin/posts/flagged/route.ts`**

```bash
mkdir -p "app/api/v1/admin/posts/flagged"
```

```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    await requireRole(request, "admin");
    const db = await getDb();
    const posts = await db.collection("posts")
      .find({ ai_flagged: true })
      .sort({ ai_confidence: 1 })
      .toArray();

    return NextResponse.json(posts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 3: Create `app/api/v1/posts/[id]/claim/route.ts`**

```bash
mkdir -p "app/api/v1/posts/[id]/claim"
```

```typescript
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAuth(request);
    const { id } = await params;
    const db = await getDb();

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (!post.is_anonymous) {
      return NextResponse.json({ error: "Post is not anonymous" }, { status: 400 });
    }
    if (post.user_id !== decoded.uid) {
      return NextResponse.json({ error: "Not your post" }, { status: 403 });
    }

    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_anonymous: false } }
    );

    return NextResponse.json({ status: "claimed" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

- [ ] **Step 4: Add client functions**

Append to `lib/api/admin.ts`:
```typescript

export async function verifyPost(postId: string) {
  const { data } = await apiClient.post(`/admin/posts/${postId}/verify`);
  return data;
}

export async function getFlaggedPosts() {
  const { data } = await apiClient.get("/admin/posts/flagged");
  return data;
}
```

Append to `lib/api/posts.ts`:
```typescript

export async function claimPost(postId: string) {
  const { data } = await apiClient.post(`/posts/${postId}/claim`);
  return data;
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/admin/posts/\[id\]/verify/ app/api/v1/admin/posts/flagged/ app/api/v1/posts/\[id\]/claim/ lib/api/admin.ts lib/api/posts.ts
git commit -m "feat: add verify, flagged, and claim API routes with client functions"
```

---

## Task 6: AI Fake Detection on Post Creation

**Files:**
- Modify: `app/api/v1/posts/route.ts`

- [ ] **Step 1: Add AI analysis after post insert**

In `app/api/v1/posts/route.ts`, add import at top:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
```

In the `POST` function, after `const result = await db.collection("posts").insertOne(post);` and before the return, add:

```typescript
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const analysisPrompt = `Analyze this crime report for credibility. Consider the description and context.
Title: ${post.title}
Description: ${post.description}
Location: ${post.division}, ${post.district}

Respond with ONLY a JSON object: { "confidence": <number 0-100>, "flagged": <boolean>, "reason": "<brief explanation>" }`;

      const aiResult = await model.generateContent(analysisPrompt);
      const text = aiResult.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        await db.collection("posts").updateOne(
          { _id: result.insertedId },
          {
            $set: {
              ai_confidence: analysis.confidence,
              ai_flagged: analysis.flagged,
              ai_flag_reason: analysis.reason,
            },
          }
        );
      }
    } catch {
      // AI analysis is non-blocking — post is created regardless
    }
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/posts/route.ts
git commit -m "feat: add AI fake report detection on post creation via Gemini"
```

---

## Task 7: Anonymous Checkbox + Claim/Badge/AI on Post Detail + Feed Cards

**Files:**
- Modify: `app/(dashboard)/report/page.tsx`
- Modify: `app/(dashboard)/crime-feed/[id]/page.tsx`
- Modify: `app/(dashboard)/crime-feed/page.tsx`

- [ ] **Step 1: Add anonymous checkbox to report form**

In `app/(dashboard)/report/page.tsx`, add state after the existing `description` state:
```typescript
const [isAnonymous, setIsAnonymous] = useState(false);
```

Update the `onSubmit` function to include `isAnonymous`:
Change `await apiClient.post("/posts", { ...values, description });` to:
```typescript
await apiClient.post("/posts", { ...values, description, is_anonymous: isAnonymous });
```

Add the checkbox UI before the Submit button (before `<Button type="submit" className="w-full">`):
```tsx
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-muted-foreground">
              Post anonymously (your identity will be hidden)
            </label>
          </div>
```

- [ ] **Step 2: Add verification badge, AI score, claim button, admin verify to post detail**

In `app/(dashboard)/crime-feed/[id]/page.tsx`, add imports at top:
```typescript
import { claimPost } from "@/lib/api/posts";
import { verifyPost } from "@/lib/api/admin";
import { ShieldCheck, AlertTriangle as WarningIcon, UserCheck } from "lucide-react";
```

Add to the `PostData` interface:
```typescript
  ai_confidence?: number;
  ai_flagged?: boolean;
  ai_flag_reason?: string;
```

In the JSX, after the Score badge and before the vote buttons section, add:

```tsx
            {post.is_verified_badge && (
              <Badge className="bg-green-500 text-white text-sm">
                <ShieldCheck size={14} className="mr-1" /> Verified
              </Badge>
            )}
```

After the vote/comment count section (still inside the `<div className="flex items-center gap-4 pt-2">`), add admin verify and claim buttons:

```tsx
            {role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const result = await verifyPost(postId);
                  setPost((p) => p ? { ...p, is_verified_badge: result.is_verified_badge } : p);
                  toast.success(result.is_verified_badge ? "Post verified" : "Verification removed");
                }}
                className="text-green-400 border-green-500"
              >
                <ShieldCheck size={14} className="mr-1" />
                {post.is_verified_badge ? "Unverify" : "Verify"}
              </Button>
            )}

            {post.is_anonymous && user?.uid === post.user_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await claimPost(postId);
                  setPost((p) => p ? { ...p, is_anonymous: false } : p);
                  toast.success("Post claimed successfully");
                }}
                className="text-purple-400 border-purple-500"
              >
                <UserCheck size={14} className="mr-1" /> Claim Post
              </Button>
            )}
```

After the description TiptapEditor, add AI flagged warning:
```tsx
          {post.ai_flagged && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 flex items-start gap-2">
              <WarningIcon size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">
                  AI Flagged for Review (Confidence: {post.ai_confidence}%)
                </p>
                {post.ai_flag_reason && (
                  <p className="text-yellow-400/70 text-xs mt-1">{post.ai_flag_reason}</p>
                )}
              </div>
            </div>
          )}
```

- [ ] **Step 3: Add verification badge to feed cards**

In `app/(dashboard)/crime-feed/page.tsx`, add import:
```typescript
import { ShieldCheck } from "lucide-react";
```

Add `is_verified_badge` to the `PostItem` interface:
```typescript
  is_verified_badge: boolean;
```

In the post card JSX, after the title `<CardTitle>`, add:
```tsx
                    {post.is_verified_badge && (
                      <Badge className="bg-green-500 text-white text-xs">
                        <ShieldCheck size={10} className="mr-1" /> Verified
                      </Badge>
                    )}
```

- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/report/page.tsx app/\(dashboard\)/crime-feed/\[id\]/page.tsx app/\(dashboard\)/crime-feed/page.tsx
git commit -m "feat: add anonymous reporting, verification badge, AI score display, claim ownership"
```

---

## Task 8: Image Compression + Watermarking in FileUpload

**Files:**
- Modify: `components/file-upload.tsx`

- [ ] **Step 1: Add compression and watermark to FileUpload**

In `components/file-upload.tsx`, add import at top:
```typescript
import imageCompression from "browser-image-compression";
```

Add `watermark` to the interface:
```typescript
interface FileUploadProps {
  storagePath: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  watermark?: boolean;
}
```

Update the component signature to include `watermark = false`:
```typescript
export function FileUpload({
  storagePath,
  onUploadComplete,
  accept = "image/*,video/*",
  maxSizeMB = 10,
  watermark = false,
}: FileUploadProps) {
```

Add the watermark function inside the component (before `handleFile`):
```typescript
  const addWatermark = async (file: File): Promise<File> => {
    const img = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.font = `${Math.max(canvas.width, canvas.height) / 20}px sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.fillText("CrimeLens", 0, 0);
    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: file.type }));
      }, file.type);
    });
  };
```

In the `handleFile` function, add compression and watermark processing BEFORE the upload. After the size check and after setting preview/fileName state, add this block before `setUploading(true);`:

```typescript
    let processedFile = file;
    if (file.type.startsWith("image/")) {
      processedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      if (watermark) {
        processedFile = await addWatermark(processedFile);
      }
    }
```

Then change the upload to use `processedFile` instead of `file`:
Change `const uploadTask = uploadBytesResumable(storageRef, file);` to:
```typescript
    const uploadTask = uploadBytesResumable(storageRef, processedFile);
```

- [ ] **Step 2: Update usages to add watermark prop**

In `app/(dashboard)/crime-feed/[id]/page.tsx`, find the `<FileUpload` component and add `watermark`:
Change:
```tsx
<FileUpload
  storagePath={`comments/${postId}`}
  onUploadComplete={setProofUrl}
  accept="image/*,video/*"
/>
```
To:
```tsx
<FileUpload
  storagePath={`comments/${postId}`}
  onUploadComplete={setProofUrl}
  accept="image/*,video/*"
  watermark
/>
```

- [ ] **Step 3: Commit**

```bash
git add components/file-upload.tsx app/\(dashboard\)/crime-feed/\[id\]/page.tsx
git commit -m "feat: add client-side image compression and watermarking to file uploads"
```

---

## Summary

| Task | Features | Files |
|------|----------|-------|
| 1 | Firebase RTDB setup + deps | `lib/firebase.ts`, `lib/firebase-admin.ts`, `.env.example`, `package.json` |
| 2 | Notification helper + hook | `lib/notifications.ts`, `hooks/use-notifications.ts` |
| 3 | Wire notifications into APIs | vote route, comments route, ban route |
| 4 | Notifications page + sidebar badge | notifications page, app-sidebar, nav-main |
| 5 | Verify/flagged/claim API routes + clients | 3 new routes, `lib/api/admin.ts`, `lib/api/posts.ts` |
| 6 | AI fake detection on post creation | `app/api/v1/posts/route.ts` |
| 7 | Anonymous checkbox + UI for badge/AI/claim | report form, post detail, crime feed |
| 8 | Image compression + watermarking | `components/file-upload.tsx`, post detail |
