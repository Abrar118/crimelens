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
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="mb-4 flex items-center gap-3">
        <Search size={20} className="text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users..."
          className="bg-muted text-foreground border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-foreground">Name</TableHead>
              <TableHead className="text-foreground">Email</TableHead>
              <TableHead className="text-foreground">Role</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id} className="hover:bg-muted/50">
                <TableCell>{user.name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell
                  className={`font-bold ${
                    user.disabled ? "text-destructive" : "text-green-500"
                  }`}
                >
                  {user.disabled ? "Banned" : "Active"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading === user._id}
                    className={`border cursor-pointer ${
                      user.disabled
                        ? "border-green-500 text-green-500"
                        : "border-destructive text-destructive"
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
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
