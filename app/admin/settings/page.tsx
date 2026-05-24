"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Moon, Sun, Lock, Trash2, LogOut, ShieldCheck } from "lucide-react";

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [password, setPassword] = useState("");
  const [twoFA, setTwoFA] = useState(false);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(darkMode ? "Light mode activated!" : "Dark mode activated!");
  };

  // Enable 2FA
  const toggleTwoFA = () => {
    setTwoFA(!twoFA);
    toast.success(twoFA ? "2FA Disabled!" : "2FA Enabled!");
  };

  // Change Password
  const handleChangePassword = () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    toast.success("Password updated successfully!");
    setPassword("");
  };

  // Delete Account
  const handleDeleteAccount = () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    toast.error("Account deleted permanently.");
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Theme Settings */}
      <Card className="p-6 mb-6 border border-border">
        <h2 className="text-xl font-bold flex items-center mb-3">
          <Sun className="mr-2 text-yellow-500" />
          Appearance
        </h2>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Enable Dark Mode</p>
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6 mb-6 border border-border">
        <h2 className="text-xl font-bold flex items-center mb-3">
          <ShieldCheck className="mr-2 text-primary" />
          Security
        </h2>

        {/* Change Password */}
        <div className="mb-4">
          <label className="text-muted-foreground">Change Password</label>
          <div className="flex gap-3">
            <Input
              type="password"
              placeholder="New Password"
              className="bg-muted text-foreground border-border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleChangePassword} className="bg-primary text-primary-foreground cursor-pointer">
              <Lock className="mr-2" size={16} />
              Change
            </Button>
          </div>
        </div>

        {/* Enable 2FA */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-muted-foreground">
            Enable Two-Factor Authentication (2FA)
          </p>
          <Switch checked={twoFA} onCheckedChange={toggleTwoFA} />
        </div>

        {/* Delete Account */}
        <Button
          variant="destructive"
          className="w-full cursor-pointer"
          onClick={handleDeleteAccount}
        >
          <Trash2 className="mr-2" size={16} />
          Delete Account
        </Button>
      </Card>

      {/* Logout Button */}
      <Card className="p-6 border border-border">
        <h2 className="text-xl font-bold flex items-center mb-3">
          <LogOut className="mr-2 text-destructive" />
          Logout
        </h2>
        <p className="text-muted-foreground mb-4">Log out of your account securely.</p>
        <Button className="bg-destructive text-destructive-foreground w-full cursor-pointer">Logout</Button>
      </Card>
    </div>
  );
};

export default Settings;
