import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const posts = await db.collection("posts")
    .find({ user_id: id })
    .sort({ post_time: -1 })
    .toArray();

  return NextResponse.json(posts);
}
