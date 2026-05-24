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
import { CheckCircle, Trash2, Search, Bell } from "lucide-react";
import { toast } from "sonner";

// Dummy Alerts Data (Static)
const dummyAlerts = [
  {
    id: 1,
    title: "Unauthorized Login Attempt",
    category: "Critical",
    read: false,
  },
  { id: 2, title: "New User Registration", category: "Info", read: true },
  { id: 3, title: "Data Backup Failed", category: "Warning", read: false },
  {
    id: 4,
    title: "Suspicious Activity Detected",
    category: "Critical",
    read: true,
  },
  { id: 5, title: "System Update Completed", category: "Resolved", read: true },
];

// Category Badge Colors
const getBadgeColor = (category: string) => {
  switch (category) {
    case "Critical":
      return "text-destructive font-bold";
    case "Warning":
      return "text-yellow-500 font-bold";
    case "Info":
      return "text-primary font-bold";
    case "Resolved":
      return "text-green-500 font-bold";
    default:
      return "text-muted-foreground";
  }
};

const Alert: React.FC = () => {
  const [alerts, setAlerts] = useState(dummyAlerts);
  const [searchTerm, setSearchTerm] = useState("");

  // Search Alerts
  useEffect(() => {
    const filteredAlerts = dummyAlerts.filter((alert) =>
      alert.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAlerts(filteredAlerts);
  }, [searchTerm]);

  // Mark Alert as Read
  const markAsRead = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
    toast.success("Alert marked as read!");
  };

  // Delete Alert
  const deleteAlert = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;

    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert deleted successfully!");
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Bell className="mr-3 text-yellow-500" /> Admin Alerts
      </h1>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-3">
        <Search size={20} className="text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search alerts..."
          className="bg-muted text-foreground border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Alerts Table */}
      <Card className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-foreground">Title</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-muted/50">
                  <TableCell>{alert.title}</TableCell>
                  <TableCell className={getBadgeColor(alert.category)}>
                    {alert.category}
                  </TableCell>
                  <TableCell
                    className={`font-bold ${
                      alert.read ? "text-green-500" : "text-destructive"
                    }`}
                  >
                    {alert.read ? "Read" : "Unread"}
                  </TableCell>
                  <TableCell className="flex gap-3">
                    {/* Mark as Read */}
                    {!alert.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-500 cursor-pointer"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <CheckCircle className="mr-2" size={16} />
                        Mark as Read
                      </Button>
                    )}

                    {/* Delete Alert */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive cursor-pointer"
                      onClick={() => deleteAlert(alert.id)}
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
                  No alerts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Alert;
