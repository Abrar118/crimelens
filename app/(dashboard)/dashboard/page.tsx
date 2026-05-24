"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ThumbsUp,
  MessageCircle,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  Loader2,
  Shield,
  Trophy,
  Clock,
} from "lucide-react";
import { getPosts } from "@/lib/api/posts";
import { getLeaderboard } from "@/lib/api/posts";
import { getUserPosts } from "@/lib/api/users";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PostItem {
  _id: string;
  title: string;
  division: string;
  district: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  post_time: string;
  is_verified_badge: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalReports, setTotalReports] = useState(0);
  const [myReportCount, setMyReportCount] = useState(0);
  const [recentPosts, setRecentPosts] = useState<PostItem[]>([]);
  const [hotspots, setHotspots] = useState<{ division: string; count: number }[]>([]);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [feedData, myPosts, leaderboard] = await Promise.all([
          getPosts({ limit: 5, sort: "post_time", order: "desc" }),
          user ? getUserPosts(user.uid).catch(() => []) : Promise.resolve([]),
          getLeaderboard().catch(() => []),
        ]);

        setTotalReports(feedData.total || 0);
        setRecentPosts(feedData.posts || []);
        setMyReportCount(Array.isArray(myPosts) ? myPosts.length : 0);

        if (user && Array.isArray(leaderboard)) {
          const rank = leaderboard.findIndex((e: any) => e.user_id === user.uid);
          setLeaderboardRank(rank >= 0 ? rank + 1 : null);
        }

        const divisionCounts: Record<string, number> = {};
        (feedData.posts || []).forEach((p: PostItem) => {
          divisionCounts[p.division] = (divisionCounts[p.division] || 0) + 1;
        });
        const sorted = Object.entries(divisionCounts)
          .map(([division, count]) => ({ division, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);
        setHotspots(sorted);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Community safety overview
          </p>
        </div>
        <Link href="/report">
          <Button className="cursor-pointer">
            <Plus size={16} className="mr-2" />
            Report Crime
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold mt-1">{totalReports}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText size={20} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Reports</p>
                <p className="text-3xl font-bold mt-1">{myReportCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Shield size={20} className="text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leaderboard</p>
                <p className="text-3xl font-bold mt-1">
                  {leaderboardRank ? `#${leaderboardRank}` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Trophy size={20} className="text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Areas</p>
                <p className="text-3xl font-bold mt-1">{hotspots.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reports */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Reports</CardTitle>
            <Link href="/crime-feed">
              <Button variant="ghost" size="sm" className="text-muted-foreground cursor-pointer">
                View all <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText size={40} className="mx-auto mb-3 opacity-40" />
                <p>No crime reports yet</p>
                <Link href="/report">
                  <Button variant="outline" size="sm" className="mt-3 cursor-pointer">
                    Be the first to report
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div
                    key={post._id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/crime-feed/${post._id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        {post.is_verified_badge && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {post.division}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(post.post_time), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={12} /> {post.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} /> {post.comment_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions + Hotspots */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/report" className="block">
                <Button variant="outline" className="w-full justify-start cursor-pointer">
                  <Plus size={16} className="mr-2" /> Report a Crime
                </Button>
              </Link>
              <Link href="/crime-feed" className="block">
                <Button variant="outline" className="w-full justify-start cursor-pointer">
                  <FileText size={16} className="mr-2" /> Browse Feed
                </Button>
              </Link>
              <Link href="/heatmap" className="block">
                <Button variant="outline" className="w-full justify-start cursor-pointer">
                  <MapPin size={16} className="mr-2" /> View Heatmap
                </Button>
              </Link>
              <Link href="/emergency" className="block">
                <Button variant="outline" className="w-full justify-start cursor-pointer text-red-500 border-red-500/30 hover:bg-red-500/10">
                  <AlertTriangle size={16} className="mr-2" /> Emergency Contacts
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Crime Hotspots */}
          {hotspots.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp size={18} /> Active Divisions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hotspots.map((h) => (
                  <div key={h.division} className="flex items-center justify-between">
                    <span className="text-sm">{h.division}</span>
                    <Badge variant="secondary">{h.count} reports</Badge>
                  </div>
                ))}
                <Link href="/heatmap">
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground mt-1 cursor-pointer">
                    View full heatmap <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
