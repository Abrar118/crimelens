"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  MessageCircle,
  FileText,
  Loader2,
  Crown,
} from "lucide-react";
import { getLeaderboard } from "@/lib/api/posts";
import { useAuth } from "@/hooks/use-auth";

interface LeaderboardEntry {
  user_id: string;
  name: string;
  profile_image: string;
  post_count: number;
  comment_count: number;
  score: number;
}

const RANK_STYLES: Record<number, { icon: typeof Trophy; color: string; bg: string }> = {
  1: { icon: Crown, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  2: { icon: Medal, color: "text-gray-300", bg: "bg-gray-300/10 border-gray-300/30" },
  3: { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30" },
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="text-primary text-xl md:text-2xl flex items-center">
              <Trophy className="mr-2 text-yellow-400" size={28} /> Top Contributors
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Score = Reports x 10 + Comments x 5
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No contributors yet</p>
            ) : (
              entries.map((entry, index) => {
                const rank = index + 1;
                const rankStyle = RANK_STYLES[rank];
                const isCurrentUser = user?.uid === entry.user_id;

                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      isCurrentUser
                        ? "bg-blue-500/10 border-blue-500/30"
                        : rankStyle
                        ? rankStyle.bg
                        : "bg-gray-900/50 border-gray-700"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center flex-shrink-0">
                      {rankStyle ? (
                        <rankStyle.icon size={24} className={rankStyle.color} />
                      ) : (
                        <span className="text-lg font-bold text-gray-400">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar + Name */}
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={entry.profile_image || "/images/avatar.jpg"} />
                      <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {entry.name}
                        {isCurrentUser && (
                          <span className="text-blue-400 text-xs ml-2">(You)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> {entry.post_count} reports
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} /> {entry.comment_count} comments
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <Badge
                      variant="outline"
                      className={`text-sm font-bold flex-shrink-0 ${
                        rankStyle ? rankStyle.color : "text-gray-300"
                      }`}
                    >
                      {entry.score} pts
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
