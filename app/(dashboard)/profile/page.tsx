"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Edit3,
  Save,
  X,
  Lock,
  Mail,
  Phone,
  Calendar,
  FileText,
  Loader2,
  Shield,
} from "lucide-react";
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
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    profile_image: "",
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
          profile_image: data.profile_image || "",
          created_at: data.created_at
            ? new Date(data.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : "",
          updated_at: data.updated_at
            ? new Date(data.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
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
    } finally {
      setSaving(false);
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20 border-2 border-primary/20">
              <AvatarImage src={profile.profile_image} alt={profile.name} />
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold truncate">{profile.name || "No name set"}</h2>
                <Badge
                  variant={role === "verified" || role === "admin" ? "default" : "destructive"}
                  className="flex-shrink-0"
                >
                  {role === "verified" || role === "admin" ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      {role === "admin" ? "Admin" : "Verified"}
                    </>
                  ) : (
                    <>
                      <XCircle size={12} className="mr-1" />
                      Unverified
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
              )}
            </div>

            <Button
              variant={isEditing ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="cursor-pointer flex-shrink-0"
            >
              {isEditing ? <X size={16} className="mr-1.5" /> : <Edit3 size={16} className="mr-1.5" />}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield size={14} /> Full Name
            </label>
            {isEditing ? (
              <Input name="name" value={profile.name} onChange={handleChange} />
            ) : (
              <p className="text-sm">{profile.name || "Not set"}</p>
            )}
          </div>

          <Separator />

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail size={14} /> Email
            </label>
            <p className="text-sm">{profile.email}</p>
          </div>

          <Separator />

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone size={14} /> Phone
            </label>
            {isEditing ? (
              <Input name="phone" value={profile.phone} onChange={handleChange} type="tel" />
            ) : (
              <p className="text-sm">{profile.phone || "Not set"}</p>
            )}
          </div>

          <Separator />

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText size={14} /> Bio
            </label>
            {isEditing ? (
              <Input name="bio" value={profile.bio} onChange={handleChange} placeholder="Write a short bio..." />
            ) : (
              <p className="text-sm">{profile.bio || "No bio set"}</p>
            )}
          </div>

          {isEditing && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Profile Image URL</label>
                <Input name="profile_image" value={profile.profile_image} onChange={handleChange} placeholder="https://..." />
              </div>
            </>
          )}

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar size={12} /> Member since
              </label>
              <p className="text-sm">{profile.created_at || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar size={12} /> Last updated
              </label>
              <p className="text-sm">{profile.updated_at || "N/A"}</p>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
                {saving ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock size={16} /> Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showPasswordForm ? (
            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label htmlFor="currentPw" className="text-sm font-medium text-muted-foreground">Current Password</label>
                <Input
                  id="currentPw"
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="newPw" className="text-sm font-medium text-muted-foreground">New Password</label>
                <Input
                  id="newPw"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmPw" className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                <Input
                  id="confirmPw"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="cursor-pointer"
                >
                  {changingPassword ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : null}
                  {changingPassword ? "Changing..." : "Update Password"}
                </Button>
                <Button
                  variant="ghost"
                  className="cursor-pointer"
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Password</p>
                <p className="text-xs text-muted-foreground">Last changed: Unknown</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(true)}
                className="cursor-pointer"
              >
                Change Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
