"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Trophy, RefreshCw, ChevronDown, Star } from "lucide-react";

// Dummy Data for Leaderboard
const leaderboardData = [
  {
    id: 1,
    name: "Enamul Haque",
    reports: 150,
    upvotes: 240,
    badge: "Elite Reporter",
  },
  {
    id: 2,
    name: "Sarah Rahman",
    reports: 120,
    upvotes: 200,
    badge: "Expert Witness",
  },
  {
    id: 3,
    name: "Ayan Zaman",
    reports: 98,
    upvotes: 180,
    badge: "Crime Analyst",
  },
  {
    id: 4,
    name: "Mehedi Hasan",
    reports: 85,
    upvotes: 150,
    badge: "Senior Investigator",
  },
  {
    id: 5,
    name: "Maria Hossain",
    reports: 75,
    upvotes: 140,
    badge: "Active Contributor",
  },
];

const Leaderboard: React.FC = () => {
  const [sortedData, setSortedData] = useState(leaderboardData);
  const [sortType, setSortType] = useState("reports");

  // Sorting Function
  const sortLeaderboard = (type: string) => {
    let sorted = [...leaderboardData];
    if (type === "reports") {
      sorted = sorted.sort((a, b) => b.reports - a.reports);
    } else {
      sorted = sorted.sort((a, b) => b.upvotes - a.upvotes);
    }
    setSortedData(sorted);
    setSortType(type);
    toast.success(
      `Sorted by ${type === "reports" ? "Total Reports" : "Upvotes Received"}`
    );
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="text-primary text-xl md:text-2xl flex items-center">
              <Trophy className="mr-2" size={28} /> Crime Reporting Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sorting Options */}
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                className="text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-black"
                onClick={() => sortLeaderboard("reports")}
              >
                <ChevronDown className="mr-2" size={16} /> Sort by Reports
              </Button>
              <Button
                variant="outline"
                className="text-green-400 border-green-500 hover:bg-green-500 hover:text-black"
                onClick={() => sortLeaderboard("upvotes")}
              >
                <ChevronDown className="mr-2" size={16} /> Sort by Upvotes
              </Button>
              <Button
                variant="outline"
                className="text-yellow-400 border-yellow-500 hover:bg-yellow-500 hover:text-black"
                onClick={() => toast.info("Leaderboard Updated!")}
              >
                <RefreshCw className="mr-2" size={16} /> Refresh
              </Button>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-700">
                <thead className="bg-gray-800 text-yellow-400">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Total Reports</th>
                    <th className="p-3">Upvotes</th>
                    <th className="p-3">Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData?.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-700 hover:bg-gray-200"
                    >
                      <td className="p-3 font-bold text-yellow-800">
                        #{index + 1}
                      </td>
                      <td className="p-3 flex items-center">
                        <Users className="mr-2 text-blue-300" size={20} />{" "}
                        {user.name}
                      </td>
                      <td className="p-3">{user.reports}</td>
                      <td className="p-3">{user.upvotes}</td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className="text-blue-300 border-blue-400 flex items-center"
                        >
                          <Star className="mr-1" size={14} /> {user.badge}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Note */}
            <p className="text-gray-400 text-sm mt-4">
              * Leaderboard updates every 24 hours. Report crimes responsibly!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
