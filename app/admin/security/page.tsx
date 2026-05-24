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
import { ShieldAlert, Search, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

// Dummy Security Logs (Replace with API)
const dummyLogs = [
  {
    id: 1,
    event: "Unauthorized Access Attempt",
    status: "Critical",
    time: "2025-02-12 10:30 AM",
  },
  {
    id: 2,
    event: "User Password Change",
    status: "Info",
    time: "2025-02-11 08:45 PM",
  },
  { id: 3, event: "Admin Login", status: "Safe", time: "2025-02-11 05:22 PM" },
  {
    id: 4,
    event: "Multiple Failed Login Attempts",
    status: "Warning",
    time: "2025-02-10 09:15 AM",
  },
  {
    id: 5,
    event: "Database Backup Completed",
    status: "Safe",
    time: "2025-02-09 06:30 AM",
  },
];

// Status Badge Colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "Critical":
      return "text-red-500 font-bold";
    case "Warning":
      return "text-yellow-400 font-bold";
    case "Info":
      return "text-blue-400 font-bold";
    case "Safe":
      return "text-green-400 font-bold";
    default:
      return "text-gray-400";
  }
};

const Security: React.FC = () => {
  const [logs, setLogs] = useState(dummyLogs);
  const [searchTerm, setSearchTerm] = useState("");

  // Search Security Logs
  useEffect(() => {
    const filteredLogs = dummyLogs.filter((log) =>
      log.event.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setLogs(filteredLogs);
  }, [searchTerm]);

  // Delete Security Log
  const deleteLog = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;

    setLogs((prev) => prev.filter((log) => log.id !== id));
    toast.success("Security log deleted successfully!");
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <ShieldAlert className="mr-3 text-red-500" /> Security Logs
      </h1>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <Search size={20} className="text-gray-400" />
        <Input
          type="text"
          placeholder="Search security events..."
          className="bg-gray-800 text-white border-gray-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Security Logs Table */}
      <Card className="overflow-hidden border border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800">
              <TableHead className="text-white">Event</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Time</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-800">
                  <TableCell>{log.event}</TableCell>
                  <TableCell className={getStatusColor(log.status)}>
                    {log.status}
                  </TableCell>
                  <TableCell className="text-gray-400">{log.time}</TableCell>
                  <TableCell className="flex gap-3">
                    {/* View Log Details */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      <Eye className="mr-2" size={16} />
                      View
                    </Button>

                    {/* Delete Log */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400 text-red-400"
                      onClick={() => deleteLog(log.id)}
                    >
                      <Trash2 className="mr-2" size={16} />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400">
                  No security logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Security;
