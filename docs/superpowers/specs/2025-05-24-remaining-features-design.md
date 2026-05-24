# Remaining Features Design

**Sub-project:** 5 of 6 (Final Features)
**Date:** 2025-05-24
**Status:** Approved

## Overview

Implement the 8 remaining hackathon features: real-time notifications via Firebase Realtime DB, verification badges (auto + admin override), anonymous reporting with claim ownership, AI-powered fake report detection via Gemini, client-side image compression, and client-side watermarking.

## Features Dropped

- #5 Phone Number Verification (OTP) — not needed
- #22 Notification Preferences — not needed

## What Already Works

- All core CRUD: posts, comments, votes, users, admin
- `lib/firebase.ts` exports `auth` and `storage` (Firebase client SDK initialized)
- `lib/firebase-admin.ts` exports `initAdmin()` for server-side Firebase Admin
- `lib/ai-generate.ts` exports `generateImageDescription(base64Data, mimeType)` using Gemini
- Post schema already has `is_anonymous` and `is_verified_badge` fields
- Post detail page already checks `post.is_anonymous` and shows "Anonymous"
- Report form already accepts and sends `is_anonymous` in the API body
- `components/file-upload.tsx` handles Firebase Storage uploads
- `app/(dashboard)/notifications/page.tsx` exists as placeholder with dummy data
- Firebase project already configured (`.firebaserc`)

## 1. Real-Time Notifications (Firebase Realtime DB)

### Setup

Add Firebase Realtime DB to the client SDK. In `lib/firebase.ts`, add:
```typescript
import { getDatabase } from "firebase/database";
export const database = getDatabase(app);
```

Add env var `NEXT_PUBLIC_FIREBASE_DATABASE_URL` to `.env.local` and `.env.example`.

### Data Structure (Realtime DB)

```
notifications/
  {userId}/
    {notificationId}/
      type: "comment" | "vote" | "admin_ban" | "admin_delete"
      post_id: string
      actor_id: string
      message: string
      read: boolean
      created_at: number (timestamp)
```

### Server-side notification creation

Create `lib/notifications.ts` with a helper that writes to Firebase Realtime DB via Admin SDK:

```typescript
import { getDatabase } from "firebase-admin/database";

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

### Trigger points (modify existing API routes)

- `POST /api/v1/posts/[id]/comments` → call `createNotification(post.user_id, { type: "comment", post_id: id, actor_id: decoded.uid, message: "Someone commented on your post" })`
- `POST /api/v1/posts/[id]/vote` → call `createNotification(post.user_id, { type: "vote", ... })` (only on new vote, not toggle/remove)
- `POST /api/v1/admin/users/[id]/ban` → call `createNotification(id, { type: "admin_ban", actor_id: decoded.uid, message: "Your account has been banned" })`

### Client-side listener

Create `hooks/use-notifications.ts`:
- Subscribe to `notifications/{userId}` using Firebase `onValue` listener
- Return unread count + notification list
- Provide `markAsRead(notificationId)` and `markAllAsRead()` functions that update the Realtime DB directly

### Page rewrite

Rewrite `app/(dashboard)/notifications/page.tsx`:
- Use `useNotifications()` hook for real-time data
- Show notification cards with type icon, message, timestamp, read/unread state
- Mark as read on click, mark all as read button
- Link to the related post when applicable

### Unread badge in sidebar

Modify `components/ui/app-sidebar.tsx` or the sidebar nav to show an unread count badge next to "Notification" in the sidebar menu.

## 2. Verification Badge (#23) + Admin Override (#24)

### Auto-badge logic

In `POST /api/v1/posts/[id]/vote` and `POST /api/v1/posts/[id]/comments`, after updating vote counts or comment count, check the threshold. If `upvotes >= 10 AND comment_count >= 3`, set `is_verified_badge: true`:

```typescript
const updatedPost = await db.collection("posts").findOne({ _id: new ObjectId(id) });
if (updatedPost && updatedPost.upvotes >= 10 && updatedPost.comment_count >= 3) {
  await db.collection("posts").updateOne(
    { _id: new ObjectId(id) },
    { $set: { is_verified_badge: true } }
  );
}
```

### Display

In the crime feed card and post detail page, show a green shield badge with "Verified" when `is_verified_badge === true`.

### Admin override

Create `POST /api/v1/admin/posts/[id]/verify` route:
- Requires admin role
- Toggles `is_verified_badge` on the post
- Returns the new state

Add a "Verify/Unverify" button on the post detail page, visible only when `role === "admin"`.

Add `verifyPost(postId)` to `lib/api/admin.ts`.

## 3. Anonymous Reporting (#25) + Claim Ownership (#26)

### Report form update

Add an "Post Anonymously" checkbox to `app/(dashboard)/report/page.tsx`. When checked, pass `is_anonymous: true` in the form submission. The API already accepts this field.

### Claim ownership

Create `POST /api/v1/posts/[id]/claim` route:
- Requires authenticated user
- Checks that `post.user_id === decoded.uid` AND `post.is_anonymous === true`
- Sets `is_anonymous: false`
- Returns success

Add a "Claim This Post" button on the post detail page, visible only when the post is anonymous AND the current user is the author (`user.uid === post.user_id`).

Add `claimPost(postId)` to `lib/api/posts.ts`.

## 4. AI-Powered Fake Report Detection (#27)

### On post creation

Modify `POST /api/v1/posts` to run Gemini analysis after inserting the post. Use a prompt that asks for a credibility score 0-100 and a boolean flag:

```typescript
const analysisPrompt = `Analyze this crime report for credibility. Consider the description and context.
Title: ${post.title}
Description: ${post.description}
Location: ${post.division}, ${post.district}

Respond with ONLY a JSON object: { "confidence": <number 0-100>, "flagged": <boolean>, "reason": "<brief explanation>" }`;
```

Parse the JSON response. Update the post with `ai_confidence`, `ai_flagged`, and `ai_flag_reason` fields.

### Display

On the post detail page, show the AI confidence score as a badge. If flagged, show a yellow warning banner: "This report has been flagged by AI for review (confidence: X%)".

### Admin flagged posts

Create `GET /api/v1/admin/posts/flagged` route returning posts where `ai_flagged === true`, sorted by confidence ascending (least credible first).

Add a "Flagged Posts" section to the admin dashboard or a link in the admin sidebar.

## 5. Image Compression (#29)

### Dependencies

```bash
npm install browser-image-compression
```

### Implementation

Modify `components/file-upload.tsx` to compress images before upload:

```typescript
import imageCompression from "browser-image-compression";

// Before uploading, if file is an image:
if (file.type.startsWith("image/")) {
  file = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
}
```

This runs client-side before `uploadBytesResumable`. Videos are not compressed (pass through).

## 6. Watermarking (#30)

### Implementation

Add a `watermark` prop to `FileUpload` component. When `watermark={true}` and the file is an image, draw the watermark using Canvas API before upload:

```typescript
async function addWatermark(file: File): Promise<File> {
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
}
```

Use `watermark={true}` on crime report image uploads and comment proof uploads.

## Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `lib/firebase.ts` | Modify | Add Realtime DB export |
| `lib/notifications.ts` | Create | Server-side notification creation helper |
| `hooks/use-notifications.ts` | Create | Client-side notification listener |
| `app/(dashboard)/notifications/page.tsx` | Rewrite | Real-time notification UI |
| `app/api/v1/posts/[id]/comments/route.ts` | Modify | Add notification + badge check |
| `app/api/v1/posts/[id]/vote/route.ts` | Modify | Add notification + badge check |
| `app/api/v1/admin/users/[id]/ban/route.ts` | Modify | Add notification |
| `app/api/v1/admin/posts/[id]/verify/route.ts` | Create | Admin verify toggle |
| `app/api/v1/admin/posts/flagged/route.ts` | Create | Flagged posts list |
| `app/api/v1/posts/[id]/claim/route.ts` | Create | Claim anonymous post |
| `app/api/v1/posts/route.ts` | Modify | Add AI fake detection on create |
| `app/(dashboard)/report/page.tsx` | Modify | Add anonymous checkbox |
| `app/(dashboard)/crime-feed/[id]/page.tsx` | Modify | Show badge, AI score, claim button, admin verify |
| `app/(dashboard)/crime-feed/page.tsx` | Modify | Show verification badge on cards |
| `components/file-upload.tsx` | Modify | Add compression + watermark |
| `components/ui/app-sidebar.tsx` | Modify | Notification unread badge |
| `lib/api/posts.ts` | Modify | Add claimPost |
| `lib/api/admin.ts` | Modify | Add verifyPost, getFlaggedPosts |
| `.env.example` | Modify | Add NEXT_PUBLIC_FIREBASE_DATABASE_URL |
| `package.json` | Modify | Add browser-image-compression |

## Out of Scope

- Phone OTP verification (#5)
- Notification preferences (#22)
- Push notifications (browser/mobile)
- Vercel deployment (#38) — manual step
