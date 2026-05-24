import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: id as any },
    { projection: { name: 1, profile_image: 1, bio: 1, created_at: 1 } }
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
