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
