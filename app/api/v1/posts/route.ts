import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ensureIndexes } from "@/lib/ensure-indexes";

export async function GET(request: Request) {
  await ensureIndexes();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const division = searchParams.get("division");
  const district = searchParams.get("district");
  const sort = searchParams.get("sort") || "post_time";
  const order = searchParams.get("order") === "asc" ? 1 : -1;
  const search = searchParams.get("search");

  const db = await getDb();
  const filter: Record<string, unknown> = {};

  if (division) filter.division = division;
  if (district) filter.district = district;
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    db.collection("posts")
      .find(filter)
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .toArray(),
    db.collection("posts").countDocuments(filter),
  ]);

  return NextResponse.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  try {
    const decoded = await requireRole(request, "verified");
    const body = await request.json();
    const db = await getDb();

    const post = {
      user_id: decoded.uid,
      title: body.title,
      description: body.description || "",
      division: body.division,
      district: body.district,
      images: body.images || [],
      video: body.video || null,
      crime_time: new Date(body.crime_time),
      post_time: new Date(),
      upvotes: 0,
      downvotes: 0,
      verification_score: 0,
      is_anonymous: body.is_anonymous || false,
      is_verified_badge: false,
      comment_count: 0,
    };

    const result = await db.collection("posts").insertOne(post);

    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const analysisPrompt = `Analyze this crime report for credibility. Consider the description and context.
Title: ${post.title}
Description: ${post.description}
Location: ${post.division}, ${post.district}

Respond with ONLY a JSON object: { "confidence": <number 0-100>, "flagged": <boolean>, "reason": "<brief explanation>" }`;

      const aiResult = await model.generateContent(analysisPrompt);
      const text = aiResult.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        await db.collection("posts").updateOne(
          { _id: result.insertedId },
          {
            $set: {
              ai_confidence: analysis.confidence,
              ai_flagged: analysis.flagged,
              ai_flag_reason: analysis.reason,
            },
          }
        );
      }
    } catch {
      // AI analysis is non-blocking
    }

    return NextResponse.json({ _id: result.insertedId, ...post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
