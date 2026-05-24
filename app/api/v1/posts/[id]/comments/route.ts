import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const comments = await db.collection("comments")
    .find({ post_id: id })
    .sort({ created_at: -1 })
    .toArray();

  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decoded = await requireRole(request, "verified");
    const body = await request.json();

    if (!body.proof_url) {
      return NextResponse.json(
        { error: "Proof attachment is mandatory" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const comment = {
      post_id: id,
      user_id: decoded.uid,
      text: body.text,
      proof_url: body.proof_url,
      created_at: new Date(),
    };

    const result = await db.collection("comments").insertOne(comment);
    await db.collection("posts").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { comment_count: 1 } }
    );

    return NextResponse.json({ _id: result.insertedId, ...comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
