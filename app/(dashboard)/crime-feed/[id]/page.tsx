"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MapPin,
  Clock,
  Calendar,
  ArrowLeft,
  Loader2,
  Shield,
  Send,
  ShieldCheck,
  AlertTriangle as WarningIcon,
  UserCheck,
} from "lucide-react";
import { getPost, votePost, claimPost } from "@/lib/api/posts";
import { verifyPost } from "@/lib/api/admin";
import { getComments, createComment } from "@/lib/api/comments";
import { getUserProfile } from "@/lib/api/users";
import { TiptapEditor } from "@/components/tiptap-editor";
import { FileUpload } from "@/components/file-upload";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface PostData {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  division: string;
  district: string;
  images: string[];
  video?: string;
  crime_time: string;
  post_time: string;
  upvotes: number;
  downvotes: number;
  verification_score: number;
  comment_count: number;
  is_anonymous: boolean;
  is_verified_badge?: boolean;
  userVote: "up" | "down" | null;
  ai_confidence?: number;
  ai_flagged?: boolean;
  ai_flag_reason?: string;
}

interface CommentData {
  _id: string;
  post_id: string;
  user_id: string;
  text: string;
  proof_url: string;
  created_at: string;
}

interface AuthorData {
  name: string;
  profile_image: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [author, setAuthor] = useState<AuthorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(null);

  const [commentText, setCommentText] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [postData, commentsData] = await Promise.all([
          getPost(postId),
          getComments(postId),
        ]);
        setPost(postData);
        setComments(commentsData);
        setCurrentVote(postData.userVote);

        if (!postData.is_anonymous && postData.user_id) {
          try {
            const authorData = await getUserProfile(postData.user_id);
            setAuthor(authorData);
          } catch {
            setAuthor({ name: "Unknown", profile_image: "" });
          }
        }
      } catch {
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  const handleVote = async (type: "up" | "down") => {
    if (!user || role === "unverified") return;
    try {
      const result = await votePost(postId, type);
      if (result.status === "removed") {
        setCurrentVote(null);
        setPost((p) =>
          p ? { ...p, [type === "up" ? "upvotes" : "downvotes"]: p[type === "up" ? "upvotes" : "downvotes"] - 1 } : p
        );
      } else if (result.status === "changed") {
        setCurrentVote(type);
        setPost((p) => {
          if (!p) return p;
          const incField = type === "up" ? "upvotes" : "downvotes";
          const decField = type === "up" ? "downvotes" : "upvotes";
          return { ...p, [incField]: p[incField] + 1, [decField]: p[decField] - 1 };
        });
      } else {
        setCurrentVote(type);
        setPost((p) =>
          p ? { ...p, [type === "up" ? "upvotes" : "downvotes"]: p[type === "up" ? "upvotes" : "downvotes"] + 1 } : p
        );
      }
    } catch {
      toast.error("Failed to vote");
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast.error("Please write a comment");
      return;
    }
    if (!proofUrl) {
      toast.error("Proof attachment is mandatory");
      return;
    }
    try {
      setSubmittingComment(true);
      const newComment = await createComment(postId, {
        text: commentText,
        proof_url: proofUrl,
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setProofUrl("");
      setPost((p) => (p ? { ...p, comment_count: p.comment_count + 1 } : p));
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16 text-muted-foreground">Post not found</div>
    );
  }

  const score = post.upvotes - post.downvotes;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground">
        <ArrowLeft size={18} className="mr-2" /> Back to Feed
      </Button>

      {/* Post Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-foreground">{post.title}</CardTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {author && !post.is_anonymous && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={author.profile_image || "/images/avatar.jpg"} />
                      <AvatarFallback>{author.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{author.name}</span>
                  </div>
                )}
                {post.is_anonymous && <span className="italic">Anonymous</span>}
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {(() => { const d = new Date(post.post_time); return isNaN(d.getTime()) ? "Unknown" : formatDistanceToNow(d, { addSuffix: true }); })()}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline"><MapPin size={12} className="mr-1" />{post.division}</Badge>
              <Badge variant="outline">{post.district}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Calendar size={12} />
            Crime occurred: {(() => { const d = new Date(post.crime_time); return isNaN(d.getTime()) ? "Unknown" : format(d, "PPpp"); })()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Images */}
          {post.images?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {post.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-md" />
              ))}
            </div>
          )}

          {/* Video */}
          {post.video && (
            <video controls className="w-full rounded-md max-h-96">
              <source src={post.video} />
            </video>
          )}

          {/* Description */}
          <TiptapEditor content={post.description} editable={false} />

          {post.ai_flagged && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 flex items-start gap-2">
              <WarningIcon size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">
                  AI Flagged for Review (Confidence: {post.ai_confidence}%)
                </p>
                {post.ai_flag_reason && (
                  <p className="text-yellow-400/70 text-xs mt-1">{post.ai_flag_reason}</p>
                )}
              </div>
            </div>
          )}

          {/* Score + Votes */}
          <div className="flex items-center gap-4 pt-2">
            <Badge variant={score >= 0 ? "default" : "destructive"} className="text-sm">
              <Shield size={14} className="mr-1" /> Score: {score}
            </Badge>
            {post.is_verified_badge && (
              <Badge className="bg-green-500 text-white text-sm">
                <ShieldCheck size={14} className="mr-1" /> Verified
              </Badge>
            )}

            {role && role !== "unverified" ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote("up")}
                  className={currentVote === "up" ? "bg-green-500/20 border-green-500 text-green-400" : "text-gray-400"}
                >
                  <ThumbsUp size={16} className="mr-1" /> {post.upvotes}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVote("down")}
                  className={currentVote === "down" ? "bg-red-500/20 border-red-500 text-red-400" : "text-gray-400"}
                >
                  <ThumbsDown size={16} className="mr-1" /> {post.downvotes}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Verify your account to vote</p>
            )}

            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle size={14} /> {post.comment_count} comments
            </span>

            {role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const result = await verifyPost(postId);
                  setPost((p) => p ? { ...p, is_verified_badge: result.is_verified_badge } : p);
                  toast.success(result.is_verified_badge ? "Post verified" : "Verification removed");
                }}
                className="text-green-400 border-green-500"
              >
                <ShieldCheck size={14} className="mr-1" />
                {post.is_verified_badge ? "Unverify" : "Verify"}
              </Button>
            )}

            {post.is_anonymous && user?.uid === post.user_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await claimPost(postId);
                  setPost((p) => p ? { ...p, is_anonymous: false } : p);
                  toast.success("Post claimed successfully");
                }}
                className="text-purple-400 border-purple-500"
              >
                <UserCheck size={14} className="mr-1" /> Claim Post
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Comments</h2>

        {/* Add Comment */}
        {role && role !== "unverified" ? (
          <Card className="bg-card border-border">
            <CardContent className="pt-6 space-y-3">
              <TiptapEditor
                content={commentText}
                onChange={setCommentText}
                placeholder="Add a comment with proof..."
              />
              <FileUpload
                storagePath={`comments/${postId}`}
                onUploadComplete={setProofUrl}
                accept="image/*,video/*"
                watermark
              />
              <Button
                onClick={handleSubmitComment}
                disabled={submittingComment || !proofUrl}
                className="w-full"
              >
                {submittingComment ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Send size={16} className="mr-2" />
                )}
                Submit Comment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <p className="text-gray-500 text-sm">Verify your account to comment</p>
        )}

        <Separator className="bg-border" />

        {/* Comment List */}
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment._id} className="bg-card/50 border-border">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <TiptapEditor content={comment.text} editable={false} />
                {comment.proof_url && (
                  <div className="mt-2">
                    {comment.proof_url.match(/\.(mp4|webm|mov)/i) ? (
                      <video controls className="w-full max-h-64 rounded-md">
                        <source src={comment.proof_url} />
                      </video>
                    ) : (
                      <img src={comment.proof_url} alt="Proof" className="max-h-64 rounded-md" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
