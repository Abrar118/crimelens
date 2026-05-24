"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, CheckCircle, XCircle, Clock } from "lucide-react";

// Dummy reports data
const dummyReports = [
  {
    id: "1",
    title: "Robbery at Gulshan",
    location: "Gulshan, Dhaka",
    status: "Verified",
    date: "2024-03-05",
  },
  {
    id: "2",
    title: "Street Fight in Banani",
    location: "Banani, Dhaka",
    status: "Pending",
    date: "2024-02-28",
  },
  {
    id: "3",
    title: "Vehicle Theft in Uttara",
    location: "Uttara, Dhaka",
    status: "Rejected",
    date: "2024-02-15",
  },
  {
    id: "4",
    title: "Assault near Dhanmondi",
    location: "Dhanmondi, Dhaka",
    status: "Verified",
    date: "2024-02-10",
  },
];

const MyReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter and search logic
  const filteredReports = dummyReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      report.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-yellow-400">
            My Crime Reports
          </h1>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search reports..."
                className="pl-10 bg-gray-800 text-white border border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select onValueChange={(value) => setFilterStatus(value)}>
              <SelectTrigger className="bg-gray-800 text-white border border-gray-700 flex items-center">
                <Filter className="mr-2" size={16} />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reports List */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <Card
                key={report.id}
                className="bg-gray-900 border border-gray-700"
              >
                <CardHeader>
                  <CardTitle className="text-white">{report.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400">📍 {report.location}</p>
                  <p className="text-gray-400">📅 {report.date}</p>

                  {/* Status Badge */}
                  <div className="flex items-center">
                    {report.status === "Verified" && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="mr-2" size={16} /> Verified
                      </Badge>
                    )}
                    {report.status === "Pending" && (
                      <Badge className="bg-yellow-500 text-black">
                        <Clock className="mr-2" size={16} /> Pending
                      </Badge>
                    )}
                    {report.status === "Rejected" && (
                      <Badge className="bg-red-500 text-white">
                        <XCircle className="mr-2" size={16} /> Rejected
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-400">No reports found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;
