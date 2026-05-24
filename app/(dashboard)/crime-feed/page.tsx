"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  Search,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Filter,
  RefreshCw,
  Send,
} from "lucide-react";

//Comment
interface CommentType {
  text: string;
  proof: boolean;
}

//Crime Report
interface CrimeReport {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  time: string;
  upvotes: number;
  downvotes: number;
  comments: CommentType[];
}

// Dummy Crime Reports (Replace with API)
const crimeReports: CrimeReport[] = [
  {
    id: 1,
    title: "Robbery at Downtown",
    description: "A store was looted last night in the downtown area...",
    image: "/images/image1.jpg",
    location: "Dhaka, Bangladesh",
    time: "2 hours ago",
    upvotes: 25,
    downvotes: 3,
    comments: [
      { text: "This is so sad!", proof: false },
      { text: "I hope they catch the culprit soon.", proof: false },
    ],
  },
  {
    id: 2,
    title: "Cyber Fraud in Online Banking",
    description: "Multiple people reported unauthorized transactions...",
    image: "/images/image2.jpg",
    location: "Chattogram, Bangladesh",
    time: "1 day ago",
    upvotes: 38,
    downvotes: 10,
    comments: [
      { text: "This is so sad!", proof: false },
      { text: "I hope they catch the culprit soon.", proof: false },
    ],
  },
  {
    id: 3,
    title: "Hit and Run Incident",
    description: "A pedestrian was hit by a car and the driver fled...",
    image: "/images/image3.jpg",
    location: "Sylhet, Bangladesh",
    time: "3 days ago",
    upvotes: 15,
    downvotes: 2,
    comments: [
      { text: "This is so sad!", proof: false },
      { text: "I hope they catch the culprit soon.", proof: false },
    ],
  },
];

const CrimeFeed: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReports, setFilteredReports] = useState(crimeReports);
  const [commentText, setCommentText] = useState("");
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  // Search crime reports
  useEffect(() => {
    setFilteredReports(
      crimeReports.filter((report) =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  // Handle upvote
  const handleUpvote = (id: number) => {
    toast.success("Upvoted this report!");
    setFilteredReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, upvotes: report.upvotes + 1 } : report
      )
    );
  };

  // Handle downvote
  const handleDownvote = (id: number) => {
    toast.error("Downvoted this report!");
    setFilteredReports((prev) =>
      prev.map((report) =>
        report.id === id
          ? { ...report, downvotes: report.downvotes + 1 }
          : report
      )
    );
  };

  // Handle comment
  const handleComment = (id: number) => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment and attach proof");
      return;
    }

    setFilteredReports((prev) =>
      prev?.map((report) =>
        report.id === id
          ? {
              ...report,
              comments: [
                ...(report.comments || []),
                { text: commentText, proof: true },
              ],
            }
          : report
      )
    );

    setCommentText("");
    toast.success("Comment added successfully!");
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center">
            <MapPin className="mr-2" size={28} /> Crime Reports Feed
          </h1>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search reports..."
              className="pl-10 bg-gray-900 text-white border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-black"
          >
            <Filter className="mr-2" size={16} /> Filters
          </Button>
          <Button
            variant="outline"
            className="text-green-400 border-green-500 hover:bg-green-500 hover:text-black"
          >
            <RefreshCw className="mr-2" size={16} /> Refresh
          </Button>
        </div>

        {/* Crime Reports List */}
        <div className="space-y-6">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <Card
                key={report.id}
                className="bg-gray-900 border border-gray-700"
              >
                <CardHeader>
                  <CardTitle className="text-white">{report.title}</CardTitle>
                  <p className="text-gray-400 text-sm">
                    {report.time} - {report.location}
                  </p>
                </CardHeader>
                <CardContent>
                  <img
                    src={report.image}
                    alt="Crime scene"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <p className="text-gray-300">{report.description}</p>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-4">
                    {/* Upvote/Downvote */}
                    <div className="flex gap-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-400 border-green-500 hover:bg-green-500 hover:text-black"
                        onClick={() => handleUpvote(report.id)}
                      >
                        <ThumbsUp className="mr-1" size={16} /> {report.upvotes}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-500 hover:bg-red-500 hover:text-black"
                        onClick={() => handleDownvote(report.id)}
                      >
                        <ThumbsDown className="mr-1" size={16} />{" "}
                        {report.downvotes}
                      </Button>
                    </div>

                    {/* Comment Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-black"
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <MessageCircle className="mr-1" size={16} /> Comment
                    </Button>
                  </div>

                  {/* Comment Section */}
                  {selectedReport === report.id && (
                    <div className="mt-4">
                      <Textarea
                        placeholder="Write a comment... (Attach proof)"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="bg-gray-800 text-white border-gray-700"
                      />
                      <Button
                        className="mt-2 w-full flex items-center"
                        onClick={() => handleComment(report.id)}
                      >
                        <Send className="mr-2" size={18} /> Submit Comment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-400">No crime reports found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrimeFeed;
