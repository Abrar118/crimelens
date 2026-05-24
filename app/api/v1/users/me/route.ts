import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuth(request);
    const db = await getDb();
    const user = await db.collection("users").findOne({ _id: decoded.uid as any });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyAuth(request);
    const body = await request.json();
    const db = await getDb();

    await db.collection("users").updateOne(
      { _id: decoded.uid as any },
      {
        $set: {
          name: body.name,
          phone: body.phone,
          profile_image: body.profile_image || "",
          bio: body.bio || "",
          email: decoded.email,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );

    initAdmin();
    await getAuth().setCustomUserClaims(decoded.uid, { role: "verified" });

    return NextResponse.json({ status: "success" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const decoded = await verifyAuth(request);
    const body = await request.json();
    const db = await getDb();

    await db.collection("users").updateOne(
      { _id: decoded.uid as any },
      {
        $set: {
          ...body,
          updated_at: new Date(),
        },
      }
    );

    return NextResponse.json({ status: "success" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
