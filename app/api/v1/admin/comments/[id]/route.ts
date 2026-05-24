import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, "admin");
    const { id } = await params;
    const db = await getDb();

    const comment = await db.collection("comments").findOne({ _id: new ObjectId(id) });
    if (comment) {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(comment.post_id) },
        { $inc: { comment_count: -1 } }
      );
    }

    await db.collection("comments").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
