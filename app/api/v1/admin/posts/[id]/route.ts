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
    await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
    await db.collection("comments").deleteMany({ post_id: id });
    await db.collection("votes").deleteMany({ post_id: id });
    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
