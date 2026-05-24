"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Edit3, Save, X } from "lucide-react";

const ProfileInfo: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: "Humayra Akter",
    email: "humayra@gmail.com",
    phone: "+8801787599766",
    bio: "Passionate crime reporter & community advocate.",
    verified: false,
    profile_image: "/images/avatar.jpg",
    created_at: new Date(1739296726404).toLocaleString(),
    updated_at: new Date(1739296726404).toLocaleString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0a0f1e] text-white px-4">
      <Card className="w-full max-w-2xl bg-[#131a30] border border-gray-700 shadow-lg rounded-xl">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Profile Image */}
            <Avatar className="w-24 h-24 border-2 border-yellow-400">
              <AvatarImage src={user.profile_image} alt="Profile Picture" />
              <AvatarFallback className="bg-gray-800 text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-yellow-400 text-2xl">
                {isEditing ? (
                  <Input
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    className="bg-gray-900 text-white border border-gray-700"
                  />
                ) : (
                  user.name
                )}
              </CardTitle>
              <Badge
                variant={user.verified ? "default" : "destructive"}
                className={`mt-2 flex items-center ${
                  user.verified
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {user.verified ? (
                  <>
                    <CheckCircle className="mr-2" size={18} />
                    Verified
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

          {/* Edit Button */}
          <Button
            className="transition-transform transform hover:scale-105 bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X size={20} /> : <Edit3 size={20} />}
            <span className="ml-2">{isEditing ? "Cancel" : "Edit"}</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-400">Email:</span>
            {isEditing ? (
              <Input
                name="email"
                value={user.email}
                onChange={handleChange}
                className="bg-gray-900 text-white border border-gray-700"
              />
            ) : (
              <span className="text-white">{user.email}</span>
            )}
          </div>

          {/* Phone */}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-400">Phone:</span>
            {isEditing ? (
              <Input
                name="phone"
                value={user.phone}
                onChange={handleChange}
                className="bg-gray-900 text-white border border-gray-700"
              />
            ) : (
              <span className="text-white">{user.phone}</span>
            )}
          </div>

          {/* Bio */}
          <div className="border-b pb-2">
            <span className="text-gray-400 block mb-1">Bio:</span>
            {isEditing ? (
              <Input
                name="bio"
                value={user.bio}
                onChange={handleChange}
                className="bg-gray-900 text-white border border-gray-700 w-full"
              />
            ) : (
              <p className="text-white">{user.bio}</p>
            )}
          </div>

          {/* Profile Image URL */}
          {isEditing && (
            <div className="border-b pb-2">
              <span className="text-gray-400 block mb-1">
                Profile Image URL:
              </span>
              <Input
                name="profile_image"
                value={user.profile_image}
                onChange={handleChange}
                className="bg-gray-900 text-white border border-gray-700 w-full"
              />
            </div>
          )}

          {/* Created At */}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-400">Created At:</span>
            <span className="text-white">{user.created_at}</span>
          </div>

          {/* Updated At */}
          <div className="flex justify-between">
            <span className="text-gray-400">Last Updated:</span>
            <span className="text-white">{user.updated_at}</span>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end mt-4">
              <Button
                className="bg-green-500 hover:bg-green-600 transition-transform transform hover:scale-105 text-white px-4 py-2 rounded-lg flex items-center"
                onClick={() => setIsEditing(false)}
              >
                <Save size={20} />
                <span className="ml-2">Save Changes</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileInfo;
