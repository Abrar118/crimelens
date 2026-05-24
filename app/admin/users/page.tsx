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
import { Ban, Eye, Search } from "lucide-react";
import { toast } from "sonner";

const dummyUsers = [
  {
    id: 1,
    name: "Abrar",
    email: "abrar@gmail.com",
    role: "User",
    status: "Active",
  },
  {
    id: 2,
    name: "binti",
    email: "binti@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 3,
    name: "Maarzun",
    email: "maarzun@gmail.com",
    role: "User",
    status: "Banned",
  },
  {
    id: 4,
    name: "Hum",
    email: "Hum@gmail.com",
    role: "User",
    status: "Banned",
  },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState(dummyUsers);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Users Based on Search
  useEffect(() => {
    const filteredUsers = dummyUsers.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUsers(filteredUsers);
  }, [searchTerm]);

  // Handle Ban/Unban User
  const handleBanToggle = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Active" ? "Banned" : "Active" }
          : user
      )
    );
    toast.success("User status updated!");
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      {/* Search Bar */}
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

      {/* Users Table */}
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
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-800">
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell
                  className={`font-bold ${
                    user.status === "Active" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {user.status}
                </TableCell>
                <TableCell className="flex gap-3">
                  {/* Ban/Unban Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className={`border ${
                      user.status === "Active"
                        ? "border-red-400 text-red-400"
                        : "border-green-400 text-green-400"
                    }`}
                    onClick={() => handleBanToggle(user.id)}
                  >
                    <Ban className="mr-2" size={16} />
                    {user.status === "Active" ? "Ban" : "Unban"}
                  </Button>

                  {/* View Profile Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-400 text-gray-400"
                  >
                    <Eye className="mr-2" size={16} />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Users;
