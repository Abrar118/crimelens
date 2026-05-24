import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { generateImageDescription } from "@/lib/ai-generate";

export async function POST(request: Request) {
  try {
    await requireRole(request, "verified");
    const { base64Data, mimeType } = await request.json();

    if (!base64Data || !mimeType) {
      return NextResponse.json(
        { error: "base64Data and mimeType are required" },
        { status: 400 }
      );
    }

    const description = await generateImageDescription(base64Data, mimeType);
    return NextResponse.json({ description });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
