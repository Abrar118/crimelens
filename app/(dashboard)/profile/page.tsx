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
