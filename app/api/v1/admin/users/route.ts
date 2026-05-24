import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    await requireRole(request, "admin");
    const db = await getDb();
    const users = await db.collection("users").find().toArray();

    initAdmin();
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const firebaseUser = await getAuth().getUser(String(user._id));
          return {
            ...user,
            disabled: firebaseUser.disabled,
            role: firebaseUser.customClaims?.role ?? "unverified",
          };
        } catch {
          return { ...user, disabled: false, role: "unverified" };
        }
      })
    );

    return NextResponse.json(enrichedUsers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
