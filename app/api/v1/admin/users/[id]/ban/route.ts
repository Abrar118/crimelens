import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(request, "admin");
    const { id } = await params;
    initAdmin();
    await getAuth().updateUser(id, { disabled: true });
    return NextResponse.json({ status: "banned" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
