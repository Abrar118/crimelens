"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, ShieldAlert, MessageSquare, Loader2 } from "lucide-react";
import { getStats } from "@/lib/api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getStats();
        setStats(data);
      } catch {
        // Stats will show 0 on error
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border flex items-center">
          <div className="p-2 rounded-lg bg-primary/10 mr-4">
            <Users className="text-primary" size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Total Users</h2>
            <p className="text-muted-foreground">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-card border flex items-center">
          <div className="p-2 rounded-lg bg-destructive/10 mr-4">
            <ShieldAlert className="text-destructive" size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Crime Reports</h2>
            <p className="text-muted-foreground">{stats.totalPosts.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-card border flex items-center">
          <div className="p-2 rounded-lg bg-yellow-500/10 mr-4">
            <MessageSquare className="text-yellow-500" size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Comments</h2>
            <p className="text-muted-foreground">{stats.totalComments.toLocaleString()}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
