"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import { getPosts } from "@/lib/api/posts";
import { getDivisionsWithDistricts } from "@/lib/get-division-info";
import { formatDistanceToNow } from "date-fns";

interface PostItem {
  _id: string;
  title: string;
  description: string;
  images: string[];
  division: string;
  district: string;
  post_time: string;
  crime_time: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
}

const divisionsData = getDivisionsWithDistricts();
const divisionNames = divisionsData.map((d) => d.name);
const districtsByDivision = divisionsData.reduce((acc, d) => {
  acc[d.name] = d.districts.map((dist) => dist.name);
  return acc;
}, {} as Record<string, string[]>);

const SORT_OPTIONS = [
  { label: "Newest", sort: "post_time", order: "desc" as const },
  { label: "Oldest", sort: "post_time", order: "asc" as const },
  { label: "Most Upvoted", sort: "upvotes", order: "desc" as const },
  { label: "Highest Score", sort: "verification_score", order: "desc" as const },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export default function CrimeFeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [sortIndex, setSortIndex] = useState(0);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sort: SORT_OPTIONS[sortIndex].sort,
        order: SORT_OPTIONS[sortIndex].order,
      };
      if (search) params.search = search;
      if (division) params.division = division;
      if (district) params.district = district;

      const data = await getPosts(params);
      setPosts(data.posts);
      setTotalPages(data.totalPages || 1);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, division, district, sortIndex]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setPage(1);
  }, [search, division, district, sortIndex]);

  useEffect(() => {
    if (division) setDistrict("");
  }, [division]);

  const clearFilters = () => {
    setSearch("");
    setDivision("");
    setDistrict("");
    setSortIndex(0);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center mb-6">
          <MapPin className="mr-2" size={28} /> Crime Reports Feed
        </h1>

        {/* Search + Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <Input
              type="text"
              placeholder="Search reports..."
              className="pl-10 bg-gray-900 text-white border-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger className="bg-gray-900 text-white border-gray-700">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              {divisionNames.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={district} onValueChange={setDistrict} disabled={!division}>
            <SelectTrigger className="bg-gray-900 text-white border-gray-700">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              {division && districtsByDivision[division]?.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Select value={String(sortIndex)} onValueChange={(v) => setSortIndex(Number(v))}>
            <SelectTrigger className="w-48 bg-gray-900 text-white border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt, i) => (
                <SelectItem key={opt.label} value={String(i)}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || division || district || sortIndex !== 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400">
              <X size={16} className="mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No crime reports found.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card
                key={post._id}
                className="bg-gray-900 border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors"
                onClick={() => router.push(`/crime-feed/${post._id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg">{post.title}</CardTitle>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">{post.division}</Badge>
                      <Badge variant="outline" className="text-xs">{post.district}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(post.post_time), { addSuffix: true })}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {post.images?.[0] && (
                      <img
                        src={post.images[0]}
                        alt=""
                        className="w-32 h-24 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {stripHtml(post.description).slice(0, 150)}
                      {stripHtml(post.description).length > 150 ? "..." : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={14} /> {post.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown size={14} /> {post.downvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} /> {post.comment_count}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
