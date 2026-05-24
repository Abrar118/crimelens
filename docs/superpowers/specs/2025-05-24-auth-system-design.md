# Auth System Design

**Sub-project:** 2 of 6 (Auth System)
**Date:** 2025-05-24
**Status:** Approved

## Overview

Complete the auth system for CrimeLens by adding password management, role enforcement, admin ban functionality, and wiring the UI to show real authenticated user data. Phone OTP verification is deferred — all registered users are auto-verified.

## What Already Works

- Firebase Auth login (`signInWithEmailAndPassword`) on `app/page.tsx`
- Firebase Auth signup (`createUserWithEmailAndPassword`) on `app/signup/page.tsx`
- Session cookie creation via `POST /api/v1/auth/session`
- Middleware route protection based on session cookie presence
- Logout with session cleanup
- `useAuth()` hook reads Firebase user + role from token claims
- API routes verify auth via `verifyAuth()` and `requireRole()`
- Admin ban API route exists: `POST /api/v1/admin/users/[id]/ban`

## What Needs Building

### 1. Password Management

#### Forgot Password (Login Page)

Add a "Forgot Password?" link below the login form in `app/page.tsx`. When clicked, show an email input with a "Send Reset Link" button. On submit:

```typescript
import { sendPasswordResetEmail } from "firebase/auth";

await sendPasswordResetEmail(auth, email);
toast.success("Password reset email sent. Check your inbox.");
```

Firebase handles the rest (email with link → Firebase-hosted reset page → password updated).

#### Change Password (Profile Page)

Add a "Change Password" card on the profile page (`app/(dashboard)/profile/page.tsx`). Inputs: current password, new password, confirm new password. On submit:

```typescript
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

const credential = EmailAuthProvider.credential(user.email!, currentPassword);
await reauthenticateWithCredential(user, credential);
await updatePassword(user, newPassword);
toast.success("Password changed successfully");
```

Reauthentication is required by Firebase before changing passwords.

### 2. Auto-Verified Role on Registration

Modify `POST /api/v1/users/me` (the route called during signup) to set the Firebase custom claim `{ role: "verified" }` on the user after creating their MongoDB profile:

```typescript
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

// After upserting the user profile in MongoDB:
initAdmin();
await getAuth().setCustomUserClaims(decoded.uid, { role: "verified" });
```

This means all registered users can immediately post, comment, and vote. Admin role is set manually via Firebase Console.

### 3. Admin User Management (Real Data)

Replace the hardcoded `dummyUsers` in `app/admin/users/page.tsx` with real data:

- **Fetch users:** Call `GET /api/v1/admin/users` on page load
- **Ban user:** Call `POST /api/v1/admin/users/[id]/ban` when admin clicks Ban
- **Unban user:** New API route `POST /api/v1/admin/users/[id]/unban` that calls `getAuth().updateUser(uid, { disabled: false })`
- **Display:** Show name, email, role, verified status, ban status from MongoDB + Firebase

#### New API Route: Unban User

Create `app/api/v1/admin/users/[id]/unban/route.ts`:

```typescript
export async function POST(request, { params }) {
  await requireRole(request, "admin");
  const { id } = await params;
  initAdmin();
  await getAuth().updateUser(id, { disabled: false });
  return NextResponse.json({ status: "unbanned" });
}
```

#### Admin User List Enhancement

The existing `GET /api/v1/admin/users` returns MongoDB profiles. Enhance it to also fetch Firebase Auth state (disabled/enabled) for each user by calling `getAuth().getUser(uid)` and merging the results.

### 4. Auth State in Sidebar

Update `components/ui/app-sidebar.tsx` to display the real authenticated user instead of hardcoded "User":

- Import `useAuthStore` from `@/lib/store`
- Read `user` (Firebase User object) from the store
- Pass `user.displayName ?? user.email`, `user.email`, and a profile image URL to `NavUser`
- Profile image comes from the MongoDB `users` collection — for now, use a default avatar if not set

### 5. Role-Based UI Guards

Add role checks in the UI where needed:

- **Report page:** Show a message "Verify your account to report crimes" if role is `unverified`
- **Crime feed:** Hide upvote/downvote/comment buttons for unverified users
- **Sidebar:** These guards can use `const { role } = useAuth()`

No new components needed — just conditional rendering based on `role`.

### 6. Admin Dashboard (Real Stats)

Replace hardcoded stats in `app/admin/dashboard/page.tsx`:

Create a new API route `GET /api/v1/admin/stats` that returns:
```json
{
  "totalUsers": 1245,
  "totalPosts": 78,
  "totalComments": 34
}
```

Computed from MongoDB `countDocuments()` on each collection.

## Files to Create or Modify

| File | Action | Purpose |
|------|--------|---------|
| `app/page.tsx` | Modify | Add forgot password flow |
| `app/signup/page.tsx` | Modify | Ensure session + role claim set |
| `app/(dashboard)/profile/page.tsx` | Modify | Add change password section, wire to real user data |
| `app/admin/users/page.tsx` | Modify | Fetch real users, wire ban/unban |
| `app/admin/dashboard/page.tsx` | Modify | Fetch real stats |
| `components/ui/app-sidebar.tsx` | Modify | Show real user data |
| `app/api/v1/users/me/route.ts` | Modify | Set custom claim on profile creation |
| `app/api/v1/admin/users/[id]/unban/route.ts` | Create | Unban user endpoint |
| `app/api/v1/admin/users/route.ts` | Modify | Include Firebase Auth state in response |
| `app/api/v1/admin/stats/route.ts` | Create | Admin dashboard stats endpoint |
| `lib/api/admin.ts` | Modify | Add unbanUser, getStats functions |

## Out of Scope

- Phone OTP verification (deferred to later sub-project)
- Email verification (Firebase handles this if enabled in console)
- Admin creation in-app (done via Firebase Console)
- Role management UI (admins cannot promote/demote users in-app)
