import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    await requireRole(request, "admin");
    const db = await getDb();
    const posts = await db.collection("posts")
      .find({ ai_flagged: true })
      .sort({ ai_confidence: 1 })
      .toArray();

    return NextResponse.json(posts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
