"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getUserPosts } from "@/lib/api/users";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PostItem {
  _id: string;
  title: string;
  description: string;
  images: string[];
  division: string;
  district: string;
  post_time: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export default function MyReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      if (!user) return;
      try {
        const data = await getUserPosts(user.uid);
        setPosts(data);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-yellow-400">My Crime Reports</h1>
          <Link href="/report">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" /> New Report
            </Button>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-gray-400">You haven&apos;t reported any crimes yet.</p>
            <Link href="/report">
              <Button variant="outline">Report a Crime</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <Card
                key={post._id}
                className="bg-gray-900 border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors"
                onClick={() => router.push(`/crime-feed/${post._id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">{post.title}</CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">{post.division}</Badge>
                    <Badge variant="outline" className="text-xs">{post.district}</Badge>
                  </div>
                  <p className="text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(post.post_time), { addSuffix: true })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {stripHtml(post.description).slice(0, 100)}
                  </p>
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
      </div>
    </div>
  );
}
