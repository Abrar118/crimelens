import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await verifyAuth(request);
    const { id } = await params;
    const db = await getDb();

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (!post.is_anonymous) {
      return NextResponse.json({ error: "Post is not anonymous" }, { status: 400 });
    }
    if (post.user_id !== decoded.uid) {
      return NextResponse.json({ error: "Not your post" }, { status: 403 });
    }

    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_anonymous: false } }
    );

    return NextResponse.json({ status: "claimed" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
