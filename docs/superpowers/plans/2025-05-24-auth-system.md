# Auth System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the CrimeLens auth system with password management, auto-verified roles, admin user management with real data, real user data in the sidebar, role-based UI guards, and admin dashboard stats.

**Architecture:** Extend existing Firebase Auth integration with password reset/change flows. Set `{ role: "verified" }` custom claim on signup. Wire admin pages to real API endpoints. Add role-based conditional rendering in UI pages.

**Tech Stack:** Next.js 15, Firebase Auth (client + admin SDK), MongoDB, Zustand, shadcn/ui

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `app/page.tsx` | Modify | Add forgot password UI |
| `app/api/v1/users/me/route.ts` | Modify | Set verified custom claim on signup |
| `components/ui/app-sidebar.tsx` | Modify | Show real user data from auth store |
| `app/(dashboard)/profile/page.tsx` | Modify | Wire to real data, add change password |
| `app/(dashboard)/report/page.tsx` | Modify | Add role guard |
| `app/api/v1/admin/users/route.ts` | Modify | Include Firebase Auth state |
| `app/api/v1/admin/users/[id]/unban/route.ts` | Create | Unban user endpoint |
| `app/api/v1/admin/stats/route.ts` | Create | Dashboard stats endpoint |
| `lib/api/admin.ts` | Modify | Add unbanUser, getStats |
| `app/admin/users/page.tsx` | Modify | Wire to real API data |
| `app/admin/dashboard/page.tsx` | Modify | Fetch real stats |

---

## Task 1: Auto-Verified Role on Registration

**Files:**
- Modify: `app/api/v1/users/me/route.ts`

- [ ] **Step 1: Add Firebase Admin imports and set custom claim in POST handler**

In `app/api/v1/users/me/route.ts`, add the import and the `setCustomUserClaims` call after the MongoDB upsert in the `POST` function.

Add to the top imports:
```typescript
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";
```

In the `POST` function, after the `db.collection("users").updateOne(...)` call and before the `return NextResponse.json(...)`, add:
```typescript
    initAdmin();
    await getAuth().setCustomUserClaims(decoded.uid, { role: "verified" });
```

The full POST function becomes:
```typescript
export async function POST(request: Request) {
  try {
    const decoded = await verifyAuth(request);
    const body = await request.json();
    const db = await getDb();

    await db.collection("users").updateOne(
      { _id: decoded.uid as any },
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

    initAdmin();
    await getAuth().setCustomUserClaims(decoded.uid, { role: "verified" });

    return NextResponse.json({ status: "success" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/users/me/route.ts
git commit -m "feat: set verified custom claim on user registration"
```

---

## Task 2: Forgot Password on Login Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add forgot password state and handler**

In `app/page.tsx`, add `sendPasswordResetEmail` to the Firebase import, add state for the forgot-password mode, and add the reset handler.

Change the Firebase import line:
```typescript
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
```

Add state after the existing `useState` calls:
```typescript
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
```

Add the handler after `handleLogin`:
```typescript
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success("Password reset email sent. Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(message);
    }
  };
```

- [ ] **Step 2: Add forgot password UI**

In the JSX, after the "Remember Me" checkbox div (the `<div className="flex items-center mb-4">` block) and before the buttons div, add:

```tsx
            {showForgotPassword ? (
              <div className="mb-4 space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email for reset"
                  className="w-full p-3 rounded-md border border-[#4f576f] bg-[#1f2a40] text-[#f0f6ff] focus:bg-[#0f0f0f] transition-all"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="flex-1 p-2 rounded-md bg-[#66fcf1] text-[#131a30] font-bold hover:opacity-90 transition-all"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="p-2 rounded-md border border-[#4f576f] text-gray-300 hover:bg-[#1f2a40] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[#66fcf1] text-sm mb-4 hover:underline text-left"
              >
                Forgot Password?
              </button>
            )}
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add forgot password flow to login page"
```

---

## Task 3: Real User Data in Sidebar

**Files:**
- Modify: `components/ui/app-sidebar.tsx`

- [ ] **Step 1: Replace hardcoded user with auth store data**

Rewrite `components/ui/app-sidebar.tsx` to:

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);

  const userData = {
    name: user?.displayName ?? user?.email?.split("@")[0] ?? "User",
    email: user?.email ?? "",
    avatar: user?.photoURL ?? "/images/avatar.jpg",
  };

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
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/app-sidebar.tsx
git commit -m "feat: show real user data in sidebar from auth store"
```

---

## Task 4: Profile Page — Real Data + Change Password

**Files:**
- Modify: `app/(dashboard)/profile/page.tsx`

- [ ] **Step 1: Rewrite profile page with real data and change password**

Replace the entire content of `app/(dashboard)/profile/page.tsx` with:

```typescript
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Edit3, Save, X, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getMyProfile, updateMyProfile } from "@/lib/api/users";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user: firebaseUser, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    profile_image: "/images/avatar.jpg",
    created_at: "",
    updated_at: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyProfile();
        setProfile({
          name: data.name || "",
          email: data.email || firebaseUser?.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          profile_image: data.profile_image || "/images/avatar.jpg",
          created_at: data.created_at
            ? new Date(data.created_at).toLocaleString()
            : "",
          updated_at: data.updated_at
            ? new Date(data.updated_at).toLocaleString()
            : "",
        });
      } catch {
        if (firebaseUser) {
          setProfile((p) => ({
            ...p,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
          }));
        }
      } finally {
        setLoading(false);
      }
    }
    if (firebaseUser) loadProfile();
  }, [firebaseUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateMyProfile({
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        profile_image: profile.profile_image,
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!firebaseUser?.email) return;

    try {
      setChangingPassword(true);
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, passwordForm.newPassword);
      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-white px-4 py-8 gap-6">
      <Card className="w-full max-w-2xl bg-[#131a30] border border-gray-700 shadow-lg rounded-xl">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24 border-2 border-yellow-400">
              <AvatarImage src={profile.profile_image} alt="Profile Picture" />
              <AvatarFallback className="bg-gray-800 text-white">
                {profile.name.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-yellow-400 text-2xl">
                {isEditing ? (
                  <Input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="bg-gray-900 text-white border border-gray-700"
                  />
                ) : (
                  profile.name || "No name set"
                )}
              </CardTitle>
              <Badge
                variant={role === "verified" || role === "admin" ? "default" : "destructive"}
                className={`mt-2 flex items-center ${
                  role === "verified" || role === "admin"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {role === "verified" || role === "admin" ? (
                  <>
                    <CheckCircle className="mr-2" size={18} />
                    {role === "admin" ? "Admin" : "Verified"}
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2" size={18} />
                    Not Verified
                  </>
                )}
              </Badge>
            </div>
          </div>
          <Button
            className="transition-transform transform hover:scale-105 bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X size={20} /> : <Edit3 size={20} />}
            <span className="ml-2">{isEditing ? "Cancel" : "Edit"}</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-400">Email:</span>
            <span className="text-white">{profile.email}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-400">Phone:</span>
            {isEditing ? (
              <Input name="phone" value={profile.phone} onChange={handleChange} className="bg-gray-900 text-white border border-gray-700 max-w-xs" />
            ) : (
              <span className="text-white">{profile.phone || "Not set"}</span>
            )}
          </div>
          <div className="border-b pb-2">
            <span className="text-gray-400 block mb-1">Bio:</span>
            {isEditing ? (
              <Input name="bio" value={profile.bio} onChange={handleChange} className="bg-gray-900 text-white border border-gray-700 w-full" />
            ) : (
              <p className="text-white">{profile.bio || "No bio set"}</p>
            )}
          </div>
          {isEditing && (
            <div className="border-b pb-2">
              <span className="text-gray-400 block mb-1">Profile Image URL:</span>
              <Input name="profile_image" value={profile.profile_image} onChange={handleChange} className="bg-gray-900 text-white border border-gray-700 w-full" />
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-400">Created At:</span>
            <span className="text-white">{profile.created_at || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Updated:</span>
            <span className="text-white">{profile.updated_at || "N/A"}</span>
          </div>
          {isEditing && (
            <div className="flex justify-end mt-4">
              <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center" onClick={handleSave}>
                <Save size={20} />
                <span className="ml-2">Save Changes</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="w-full max-w-2xl bg-[#131a30] border border-gray-700 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock size={20} />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showPasswordForm ? (
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="bg-gray-900 text-white border border-gray-700"
              />
              <Input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="bg-gray-900 text-white border border-gray-700"
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="bg-gray-900 text-white border border-gray-700"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
              className="border-gray-600 text-gray-300"
            >
              Change Password
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/profile/page.tsx
git commit -m "feat: wire profile page to real data, add change password"
```

---

## Task 5: Admin API Enhancements

**Files:**
- Modify: `app/api/v1/admin/users/route.ts`
- Create: `app/api/v1/admin/users/[id]/unban/route.ts`
- Create: `app/api/v1/admin/stats/route.ts`
- Modify: `lib/api/admin.ts`

- [ ] **Step 1: Enhance GET /api/v1/admin/users to include Firebase Auth state**

Rewrite `app/api/v1/admin/users/route.ts` to:

```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    await requireRole(request, "admin");
    const db = await getDb();
    const users = await db.collection("users").find().toArray();

    initAdmin();
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const firebaseUser = await getAuth().getUser(user._id as string);
          return {
            ...user,
            disabled: firebaseUser.disabled,
            role: firebaseUser.customClaims?.role ?? "unverified",
          };
        } catch {
          return { ...user, disabled: false, role: "unverified" };
        }
      })
    );

    return NextResponse.json(enrichedUsers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 2: Create unban API route**

Create `app/api/v1/admin/users/[id]/unban/route.ts`:

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
    await getAuth().updateUser(id, { disabled: false });
    return NextResponse.json({ status: "unbanned" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 3: Create admin stats API route**

Create `app/api/v1/admin/stats/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    await requireRole(request, "admin");
    const db = await getDb();

    const [totalUsers, totalPosts, totalComments] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("posts").countDocuments(),
      db.collection("comments").countDocuments(),
    ]);

    return NextResponse.json({ totalUsers, totalPosts, totalComments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
```

- [ ] **Step 4: Add unbanUser and getStats to the API client**

Replace `lib/api/admin.ts` with:

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

export async function unbanUser(userId: string) {
  const { data } = await apiClient.post(`/admin/users/${userId}/unban`);
  return data;
}

export async function getStats() {
  const { data } = await apiClient.get("/admin/stats");
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
git add app/api/v1/admin/ lib/api/admin.ts
git commit -m "feat: add unban route, stats route, enhance admin users API"
```

---

## Task 6: Admin Users Page — Real Data

**Files:**
- Modify: `app/admin/users/page.tsx`

- [ ] **Step 1: Rewrite admin users page with real API data**

Replace the entire content of `app/admin/users/page.tsx` with:

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ban, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAllUsers, banUser, unbanUser } from "@/lib/api/admin";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  disabled: boolean;
  phone?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleBanToggle = async (userId: string, currentlyDisabled: boolean) => {
    setActionLoading(userId);
    try {
      if (currentlyDisabled) {
        await unbanUser(userId);
        toast.success("User unbanned");
      } else {
        await banUser(userId);
        toast.success("User banned");
      }
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, disabled: !currentlyDisabled } : u
        )
      );
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      <div className="mb-4 flex items-center gap-3">
        <Search size={20} className="text-gray-400" />
        <Input
          type="text"
          placeholder="Search users..."
          className="bg-gray-800 text-white border-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden border border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Role</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id} className="hover:bg-gray-800">
                <TableCell>{user.name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell
                  className={`font-bold ${
                    user.disabled ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {user.disabled ? "Banned" : "Active"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading === user._id}
                    className={`border ${
                      user.disabled
                        ? "border-green-400 text-green-400"
                        : "border-red-400 text-red-400"
                    }`}
                    onClick={() => handleBanToggle(user._id, user.disabled)}
                  >
                    {actionLoading === user._id ? (
                      <Loader2 className="animate-spin mr-2" size={16} />
                    ) : (
                      <Ban className="mr-2" size={16} />
                    )}
                    {user.disabled ? "Unban" : "Ban"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/users/page.tsx
git commit -m "feat: wire admin users page to real API with ban/unban"
```

---

## Task 7: Admin Dashboard — Real Stats

**Files:**
- Modify: `app/admin/dashboard/page.tsx`

- [ ] **Step 1: Rewrite admin dashboard with real stats**

Replace the entire content of `app/admin/dashboard/page.tsx` with:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, ShieldAlert, MessageSquare, Loader2 } from "lucide-react";
import { getStats } from "@/lib/api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getStats();
        setStats(data);
      } catch {
        // Stats will show 0 on error
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 min-h-screen text-primary">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <Users className="mr-4 text-blue-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Total Users</h2>
            <p className="text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <ShieldAlert className="mr-4 text-red-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Crime Reports</h2>
            <p className="text-gray-900">{stats.totalPosts.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <MessageSquare className="mr-4 text-yellow-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Comments</h2>
            <p className="text-gray-900">{stats.totalComments.toLocaleString()}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/dashboard/page.tsx
git commit -m "feat: wire admin dashboard to real stats from API"
```

---

## Task 8: Role-Based UI Guard on Report Page

**Files:**
- Modify: `app/(dashboard)/report/page.tsx`

- [ ] **Step 1: Add role check to the report page**

At the top of `app/(dashboard)/report/page.tsx`, add the import:
```typescript
import { useAuth } from "@/hooks/use-auth";
```

Inside the `ReportCrime` component function (after the existing hook calls like `useForm`), add:
```typescript
  const { role } = useAuth();
```

At the very beginning of the component's return statement, before the existing `<div>`, add a guard:

```typescript
  if (role === "unverified") {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-destructive">Access Restricted</h2>
          <p className="text-muted-foreground">
            Verify your account to report crimes. Complete phone verification to unlock this feature.
          </p>
        </div>
      </div>
    );
  }
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/report/page.tsx
git commit -m "feat: add role-based guard on report page for unverified users"
```

---

## Summary

| Task | Description | Files Changed |
|------|-------------|---------------|
| 1 | Auto-verified role on registration | `app/api/v1/users/me/route.ts` |
| 2 | Forgot password on login page | `app/page.tsx` |
| 3 | Real user data in sidebar | `components/ui/app-sidebar.tsx` |
| 4 | Profile page: real data + change password | `app/(dashboard)/profile/page.tsx` |
| 5 | Admin API: unban, stats, enriched users | 4 files in `app/api/` + `lib/api/admin.ts` |
| 6 | Admin users page with real data | `app/admin/users/page.tsx` |
| 7 | Admin dashboard with real stats | `app/admin/dashboard/page.tsx` |
| 8 | Role guard on report page | `app/(dashboard)/report/page.tsx` |
