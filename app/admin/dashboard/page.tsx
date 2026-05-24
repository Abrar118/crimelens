"use client";

import { Card } from "@/components/ui/card";
import { Users, ShieldAlert, AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="flex flex-col p-6 min-h-screen text-primary">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users Card */}
        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <Users className="mr-4 text-blue-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Total Users</h2>
            <p className="text-gray-900">1,245</p>
          </div>
        </Card>

        {/* Security Cases Card */}
        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <ShieldAlert className="mr-4 text-red-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Security Cases</h2>
            <p className="text-gray-900">78</p>
          </div>
        </Card>

        {/* Active Alerts Card */}
        <Card className="p-6 bg-gray-300 rounded-lg flex items-center">
          <AlertTriangle className="mr-4 text-yellow-400" size={32} />
          <div>
            <h2 className="text-lg font-bold">Active Alerts</h2>
            <p className="text-gray-900">34</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
