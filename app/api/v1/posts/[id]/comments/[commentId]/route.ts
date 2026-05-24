import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const decoded = await verifyAuth(request);
    const db = await getDb();

    const comment = await db.collection("comments").findOne({
      _id: new ObjectId(commentId),
    });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const role = decoded.role as string;
    if (comment.user_id !== decoded.uid && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("comments").deleteOne({ _id: new ObjectId(commentId) });
    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { comment_count: -1 } }
    );

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
