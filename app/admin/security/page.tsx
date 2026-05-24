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
      return "text-destructive font-bold";
    case "Warning":
      return "text-yellow-500 font-bold";
    case "Info":
      return "text-primary font-bold";
    case "Safe":
      return "text-green-500 font-bold";
    default:
      return "text-muted-foreground";
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
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <ShieldAlert className="mr-3 text-destructive" /> Security Logs
      </h1>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <Search size={20} className="text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search security events..."
          className="bg-muted text-foreground border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Security Logs Table */}
      <Card className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-foreground">Event</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Time</TableHead>
              <TableHead className="text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/50">
                  <TableCell>{log.event}</TableCell>
                  <TableCell className={getStatusColor(log.status)}>
                    {log.status}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.time}</TableCell>
                  <TableCell className="flex gap-3">
                    {/* View Log Details */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary cursor-pointer"
                    >
                      <Eye className="mr-2" size={16} />
                      View
                    </Button>

                    {/* Delete Log */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive cursor-pointer"
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
                <TableCell colSpan={4} className="text-center text-muted-foreground">
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
