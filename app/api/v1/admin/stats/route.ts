import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    await requireRole(request, "admin");
    const db = await getDb();

    const [totalUsers, totalPosts, totalComments] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("posts").countDocuments(),
      db.collection("comments").countDocuments(),
    ]);

    return NextResponse.json({ totalUsers, totalPosts, totalComments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
