# Crime Feed + Community Interaction Design

**Sub-project:** 3 of 6 (Crime Feed + Community)
**Date:** 2025-05-24
**Status:** Approved

## Overview

Wire the crime feed to real API data with pagination, filtering, sorting, and search. Add a dedicated post detail page with upvote/downvote and comments with mandatory proof attachments. Integrate Tiptap rich text editor for crime descriptions (report form + comments). Add Firebase Storage file uploads for comment proof. Wire the My Reports page to real data.

## What Already Works

- Report form (`app/(dashboard)/report/page.tsx`) submits to `POST /api/v1/posts` with AI-generated description
- All API routes exist: posts CRUD, comments, votes, users
- `lib/api/posts.ts` and `lib/api/comments.ts` client functions exist
- MongoDB collections: `posts`, `comments`, `votes`
- Firebase Storage SDK initialized in `lib/firebase.ts` (`storage` export)
- Division/district data in `lib/data/`
- `useAuth()` hook provides `user` and `role`

## What Needs Building

### 1. Crime Feed Page (Real Data)

Rewrite `app/(dashboard)/crime-feed/page.tsx` to replace hardcoded data:

**Data fetching:** Call `getPosts()` from `lib/api/posts.ts` on mount and when filters change. The existing `GET /api/v1/posts` endpoint supports:
- `page` (number), `limit` (number)
- `division` (string), `district` (string)
- `sort` (field name: `post_time`, `upvotes`, `verification_score`), `order` (`asc`/`desc`)
- `search` (text search on title/description)

**UI controls:**
- Search input at top (debounced, triggers refetch)
- Division dropdown → district dropdown (cascading, from `getDivisionsWithDistricts()`)
- Sort dropdown: Newest (default), Oldest, Most Upvoted, Highest Score
- Clear filters button

**Post cards:** Each card shows:
- First image as thumbnail (or placeholder if no image)
- Title, description preview (first 150 chars, strip HTML tags)
- Division / District badge
- Upvote count, downvote count, comment count
- Post time (relative, using `date-fns` `formatDistanceToNow`)
- Click → navigate to `/crime-feed/{post._id}`

**Pagination:** Page buttons at bottom. Display "Page X of Y" with Previous/Next. Default 10 per page.

### 2. Post Detail Page

Create `app/(dashboard)/crime-feed/[id]/page.tsx`:

**Data fetching:** 
- Fetch post via `getPost(id)` from `lib/api/posts.ts`
- Fetch comments via `getComments(id)` from `lib/api/comments.ts`
- Fetch author profile via `getUserProfile(post.user_id)` from `lib/api/users.ts`

**Layout:**
- **Header:** Title, author name + avatar, post time (formatted), crime time, division/district badges
- **Media section:** Image grid (all post images), video player if present. Use `next/image` for images.
- **Description:** Render rich HTML from Tiptap using a read-only TiptapEditor component (`editable={false}`)
- **Verification score:** Display as a badge: (upvotes - downvotes) + comment_count
- **Vote section:** Upvote/downvote buttons with counts. Visual state for the user's current vote (highlight active). Call `votePost(id, "up" | "down")`. Toggle: clicking the same vote type removes the vote.
- **Comments section:**
  - List all comments, each showing: commenter name, text (rendered as rich HTML), proof image/video, timestamp
  - "Add Comment" form at bottom (Tiptap editor + file upload + submit button)
  - Proof upload is mandatory — disable submit until a file is uploaded
- **Role guard:** Hide vote buttons and comment form for unverified users. Show a message instead.

### 3. Tiptap Rich Text Editor Component

Create `components/tiptap-editor.tsx`:

**Dependencies to install:** `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`

**Props:**
```typescript
interface TiptapEditorProps {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}
```

**Features:**
- Toolbar (only when `editable={true}`): Bold, Italic, Heading 2, Heading 3, Bullet List, Ordered List
- Toolbar buttons use active state highlighting
- Content stored as HTML string
- Dark theme styling matching the app's color scheme
- `editable={false}` renders content without toolbar (for display)

### 4. Report Form Update

Modify `app/(dashboard)/report/page.tsx`:

- Add Tiptap editor for the description field
- When AI generates a description, set it as the editor's content
- User can edit the rich text before submitting
- On form submit, include the HTML description string in the post body
- Remove the current plain text description display

### 5. Firebase Storage File Upload Component

Create `components/file-upload.tsx`:

**Props:**
```typescript
interface FileUploadProps {
  storagePath: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}
```

**Behavior:**
- File input with drag-and-drop zone
- Validates file type and size before upload
- Uploads to Firebase Storage using `uploadBytesResumable`
- Shows progress bar during upload
- Returns download URL via `onUploadComplete` callback
- Shows uploaded file preview (image thumbnail or video icon)

**Storage paths:**
- Comment proof: `comments/{postId}/{timestamp}-{filename}`
- Post images (future): `posts/{postId}/{timestamp}-{filename}`

### 6. My Reports Page

Rewrite `app/(dashboard)/profile/my-reports/page.tsx`:

- Fetch the current user's posts. The simplest approach: use `useAuth()` to get `user.uid`, then call `getUserPosts(user.uid)` from `lib/api/users.ts`
- Display the same card format as the crime feed
- Add a "No reports yet" empty state with a link to "/report"

### 7. Vote State Tracking

To show which posts the current user has voted on, add a client-side approach:
- When viewing the post detail page, fetch the user's vote state. Add a new API route `GET /api/v1/posts/[id]/vote` that returns the current user's vote (if any).
- Alternatively, include vote state in the post detail response. Modify `GET /api/v1/posts/[id]` to check the `votes` collection for the current user's vote and include it.

**Chosen approach:** Modify `GET /api/v1/posts/[id]` to optionally check the `Authorization` header. If present, look up the user's vote in the `votes` collection and include `userVote: "up" | "down" | null` in the response. If no auth header, `userVote` is `null`.

## Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `components/tiptap-editor.tsx` | Create | Reusable rich text editor |
| `components/file-upload.tsx` | Create | Firebase Storage upload with progress |
| `app/(dashboard)/crime-feed/page.tsx` | Rewrite | Real API data, pagination, filtering, sorting, search |
| `app/(dashboard)/crime-feed/[id]/page.tsx` | Create | Post detail with votes, comments, media |
| `app/(dashboard)/report/page.tsx` | Modify | Add Tiptap for description editing |
| `app/(dashboard)/profile/my-reports/page.tsx` | Rewrite | Fetch real user posts |
| `app/api/v1/posts/[id]/route.ts` | Modify | Include user's vote state in response |
| `package.json` | Modify | Add tiptap dependencies |

## Dependencies to Add

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

## Out of Scope

- Post editing/updating (only create and delete for now)
- Comment editing (only create and delete)
- Infinite scroll (using page-based pagination instead)
- Image compression/watermarking (later sub-project)
- Report form Firebase Storage upload for post images (the form currently sends image data; upgrading to Storage is a future enhancement)
