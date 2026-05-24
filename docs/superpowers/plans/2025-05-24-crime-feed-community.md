# Crime Feed + Community Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the crime feed to real API data with pagination/filtering/sorting/search, add a post detail page with votes and comments, integrate Tiptap rich text editor, add Firebase Storage uploads, and wire the My Reports page.

**Architecture:** Replace all placeholder/dummy data pages with real API calls. Create two reusable components (TiptapEditor, FileUpload) used across report form, post detail, and comments. Modify the post detail API to include user vote state.

**Tech Stack:** Next.js 15, Tiptap, Firebase Storage, MongoDB, date-fns, shadcn/ui

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `components/tiptap-editor.tsx` | Create | Reusable rich text editor with toolbar |
| `components/file-upload.tsx` | Create | Firebase Storage upload with progress |
| `app/(dashboard)/crime-feed/page.tsx` | Rewrite | Real API data with pagination, filters |
| `app/(dashboard)/crime-feed/[id]/page.tsx` | Create | Post detail with votes, comments |
| `app/(dashboard)/report/page.tsx` | Modify | Add Tiptap for description |
| `app/(dashboard)/profile/my-reports/page.tsx` | Rewrite | Real user posts |
| `app/api/v1/posts/[id]/route.ts` | Modify | Include userVote in GET response |
| `package.json` | Modify | Add tiptap deps |

---

## Task 1: Install Tiptap Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install tiptap packages**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

- [ ] **Step 2: Verify installation**

```bash
node -e "require('@tiptap/react'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add tiptap rich text editor dependencies"
```

---

## Task 2: Create Tiptap Editor Component

**Files:**
- Create: `components/tiptap-editor.tsx`

- [ ] **Step 1: Create `components/tiptap-editor.tsx`**

```typescript
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from "lucide-react";
import { useEffect } from "react";

interface TiptapEditorProps {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export function TiptapEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Write something...",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] p-3 rounded-md border border-input bg-background text-foreground focus:outline-none prose prose-invert prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  if (!editable) {
    return (
      <div className="prose prose-invert prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
        >
          <Heading3 size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered size={16} />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/tiptap-editor.tsx
git commit -m "feat: create reusable Tiptap rich text editor component"
```

---

## Task 3: Create Firebase Storage File Upload Component

**Files:**
- Create: `components/file-upload.tsx`

- [ ] **Step 1: Create `components/file-upload.tsx`**

```typescript
"use client";

import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileVideo, ImageIcon } from "lucide-react";

interface FileUploadProps {
  storagePath: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  storagePath,
  onUploadComplete,
  accept = "image/*,video/*",
  maxSizeMB = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setFileName(file.name);
    setIsVideo(file.type.startsWith("video/"));

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    setUploading(true);
    const timestamp = Date.now();
    const storageRef = ref(storage, `${storagePath}/${timestamp}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        console.error("Upload error:", error);
        setUploading(false);
        setProgress(0);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setUploading(false);
        onUploadComplete(url);
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreviewUrl(null);
    setFileName(null);
    setProgress(0);
    setIsVideo(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {!fileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-input rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
          <p className="text-sm text-muted-foreground">
            Click or drag file to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 border border-input rounded-md bg-muted/30">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
          ) : isVideo ? (
            <FileVideo size={40} className="text-muted-foreground" />
          ) : (
            <ImageIcon size={40} className="text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{fileName}</p>
            {uploading && <Progress value={progress} className="mt-1 h-2" />}
            {!uploading && progress === 100 && (
              <p className="text-xs text-green-400 mt-1">Uploaded</p>
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            <X size={16} />
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/file-upload.tsx
git commit -m "feat: create Firebase Storage file upload component"
```

---

## Task 4: Update Post Detail API with Vote State

**Files:**
- Modify: `app/api/v1/posts/[id]/route.ts`

- [ ] **Step 1: Modify GET handler to include userVote**

Replace the `GET` function in `app/api/v1/posts/[id]/route.ts` with:

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  let userVote: string | null = null;
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    try {
      const decoded = await verifyAuth(request);
      const vote = await db.collection("votes").findOne({
        post_id: id,
        user_id: decoded.uid,
      });
      userVote = vote?.type ?? null;
    } catch {
      // Not authenticated — userVote stays null
    }
  }

  return NextResponse.json({ ...post, userVote });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/v1/posts/\[id\]/route.ts
git commit -m "feat: include user vote state in post detail API response"
```

---

## Task 5: Rewrite Crime Feed Page

**Files:**
- Rewrite: `app/(dashboard)/crime-feed/page.tsx`

- [ ] **Step 1: Replace entire content of `app/(dashboard)/crime-feed/page.tsx`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/crime-feed/page.tsx
git commit -m "feat: wire crime feed to real API with pagination, filtering, sorting, search"
```

---

## Task 6: Create Post Detail Page

**Files:**
- Create: `app/(dashboard)/crime-feed/[id]/page.tsx`

- [ ] **Step 1: Create directory and page**

```bash
mkdir -p "app/(dashboard)/crime-feed/[id]"
```

Create `app/(dashboard)/crime-feed/[id]/page.tsx`:

```typescript
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
} from "lucide-react";
import { getPost, votePost } from "@/lib/api/posts";
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
  userVote: "up" | "down" | null;
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
        const prev = currentVote;
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
      <div className="text-center py-16 text-gray-400">Post not found</div>
    );
  }

  const score = post.upvotes - post.downvotes;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="text-gray-400">
        <ArrowLeft size={18} className="mr-2" /> Back to Feed
      </Button>

      {/* Post Header */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl text-white">{post.title}</CardTitle>
              <div className="flex items-center gap-3 text-sm text-gray-400">
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
                  {formatDistanceToNow(new Date(post.post_time), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline"><MapPin size={12} className="mr-1" />{post.division}</Badge>
              <Badge variant="outline">{post.district}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Calendar size={12} />
            Crime occurred: {format(new Date(post.crime_time), "PPpp")}
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

          {/* Score + Votes */}
          <div className="flex items-center gap-4 pt-2">
            <Badge variant={score >= 0 ? "default" : "destructive"} className="text-sm">
              <Shield size={14} className="mr-1" /> Score: {score}
            </Badge>

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

            <span className="flex items-center gap-1 text-sm text-gray-400">
              <MessageCircle size={14} /> {post.comment_count} comments
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Comments</h2>

        {/* Add Comment */}
        {role && role !== "unverified" ? (
          <Card className="bg-gray-900 border-gray-700">
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

        <Separator className="bg-gray-700" />

        {/* Comment List */}
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment._id} className="bg-gray-900/50 border-gray-700">
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
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/crime-feed/\[id\]/
git commit -m "feat: create post detail page with votes, comments, and proof uploads"
```

---

## Task 7: Update Report Form with Tiptap

**Files:**
- Modify: `app/(dashboard)/report/page.tsx`

- [ ] **Step 1: Add Tiptap editor for description**

In `app/(dashboard)/report/page.tsx`:

1. Add import at the top:
```typescript
import { TiptapEditor } from "@/components/tiptap-editor";
```

2. Add state for the description HTML (after existing `description` state):
Change the existing:
```typescript
const [description, setDescription] = useState<string | undefined>();
```
To:
```typescript
const [description, setDescription] = useState("");
```

3. Replace the plain text description display block. Find:
```tsx
            {description && (
              <div className="bg-gray-100 p-4 rounded-md">
                <p>{description}</p>
              </div>
            )}
```

Replace with:
```tsx
            {description && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Description (AI-generated, editable)</label>
                <TiptapEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Crime description..."
                />
              </div>
            )}
```

4. Update the `onSubmit` function to include the description:
Change:
```typescript
  async function onSubmit(values: z.infer<typeof formSchema>) {
    await apiClient.post("/posts", values);
```
To:
```typescript
  async function onSubmit(values: z.infer<typeof formSchema>) {
    await apiClient.post("/posts", { ...values, description });
```

5. Update the AI description handler to set HTML content. The current handler uses `generateImageDescription` which returns plain text. Wrap it in a paragraph tag:
Change `setDescription(response);` to `setDescription(\`<p>${response}</p>\`);`

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/report/page.tsx
git commit -m "feat: add Tiptap rich text editor to report form"
```

---

## Task 8: Rewrite My Reports Page

**Files:**
- Rewrite: `app/(dashboard)/profile/my-reports/page.tsx`

- [ ] **Step 1: Replace entire content of `app/(dashboard)/profile/my-reports/page.tsx`**

```typescript
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
            <p className="text-gray-400">You haven't reported any crimes yet.</p>
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
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/profile/my-reports/page.tsx
git commit -m "feat: wire my reports page to real user posts API"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Install Tiptap deps | `package.json` |
| 2 | Tiptap editor component | `components/tiptap-editor.tsx` |
| 3 | File upload component | `components/file-upload.tsx` |
| 4 | Post detail API vote state | `app/api/v1/posts/[id]/route.ts` |
| 5 | Crime feed page (real data) | `app/(dashboard)/crime-feed/page.tsx` |
| 6 | Post detail page | `app/(dashboard)/crime-feed/[id]/page.tsx` |
| 7 | Report form + Tiptap | `app/(dashboard)/report/page.tsx` |
| 8 | My reports page | `app/(dashboard)/profile/my-reports/page.tsx` |
