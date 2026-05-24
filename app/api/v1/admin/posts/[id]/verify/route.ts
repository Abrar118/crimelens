import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, "admin");
    const { id } = await params;
    const db = await getDb();

    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newState = !post.is_verified_badge;
    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $set: { is_verified_badge: newState } }
    );

    return NextResponse.json({ is_verified_badge: newState });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
