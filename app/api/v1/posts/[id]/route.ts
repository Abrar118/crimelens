import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await verifyAuth(request);
    const db = await getDb();

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const role = decoded.role as string;
    if (post.user_id !== decoded.uid && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
    await db.collection("comments").deleteMany({ post_id: id });
    await db.collection("votes").deleteMany({ post_id: id });

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
