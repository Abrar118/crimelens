import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await requireRole(request, "verified");
    const { type } = await request.json();

    if (type !== "up" && type !== "down") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    const db = await getDb();
    const existingVote = await db.collection("votes").findOne({
      post_id: id,
      user_id: decoded.uid,
    });

    if (existingVote) {
      if (existingVote.type === type) {
        await db.collection("votes").deleteOne({ _id: existingVote._id });
        const field = type === "up" ? "upvotes" : "downvotes";
        await db.collection("posts").updateOne(
          { _id: new ObjectId(id) },
          { $inc: { [field]: -1 } }
        );
        return NextResponse.json({ status: "removed" });
      }

      await db.collection("votes").updateOne(
        { _id: existingVote._id },
        { $set: { type } }
      );
      const incField = type === "up" ? "upvotes" : "downvotes";
      const decField = type === "up" ? "downvotes" : "upvotes";
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { [incField]: 1, [decField]: -1 } }
      );
      return NextResponse.json({ status: "changed" });
    }

    await db.collection("votes").insertOne({
      post_id: id,
      user_id: decoded.uid,
      type,
    });
    const field = type === "up" ? "upvotes" : "downvotes";
    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { [field]: 1 } }
    );

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (post && post.user_id !== decoded.uid) {
      await createNotification(post.user_id, {
        type: "vote",
        post_id: id,
        actor_id: decoded.uid,
        message: `Someone ${type}voted your post`,
      }).catch(() => {});
    }

    if (post && post.upvotes >= 10 && post.comment_count >= 3) {
      await db.collection("posts").updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_verified_badge: true } }
      );
    }

    return NextResponse.json({ status: "voted" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
