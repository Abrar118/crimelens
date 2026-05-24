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
    <div className="flex flex-col p-6 min-h-screen text-primary">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <Users className="mr-4 text-blue-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Total Users</h2>
            <p className="text-gray-900">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <ShieldAlert className="mr-4 text-red-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Crime Reports</h2>
            <p className="text-gray-900">{stats.totalPosts.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <MessageSquare className="mr-4 text-yellow-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Comments</h2>
            <p className="text-gray-900">{stats.totalComments.toLocaleString()}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
