import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();

  const postCounts = await db.collection("posts").aggregate([
    { $match: { is_anonymous: { $ne: true } } },
    { $group: { _id: "$user_id", post_count: { $sum: 1 } } },
  ]).toArray();

  const commentCounts = await db.collection("comments").aggregate([
    { $group: { _id: "$user_id", comment_count: { $sum: 1 } } },
  ]).toArray();

  const commentMap = new Map(
    commentCounts.map((c) => [c._id, c.comment_count])
  );

  const merged = postCounts.map((p) => ({
    user_id: p._id as string,
    post_count: p.post_count as number,
    comment_count: (commentMap.get(p._id) as number) || 0,
    score: (p.post_count as number) * 10 + ((commentMap.get(p._id) as number) || 0) * 5,
  }));

  for (const [userId, count] of commentMap.entries()) {
    if (!postCounts.find((p) => p._id === userId)) {
      merged.push({
        user_id: userId as string,
        post_count: 0,
        comment_count: count as number,
        score: (count as number) * 5,
      });
    }
  }

  merged.sort((a, b) => b.score - a.score);
  const top20 = merged.slice(0, 20);

  const userIds = top20.map((u) => u.user_id);
  const users = await db.collection("users")
    .find({ _id: { $in: userIds } as any })
    .project({ name: 1, profile_image: 1 })
    .toArray();

  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const result = top20.map((entry) => {
    const user = userMap.get(entry.user_id);
    return {
      ...entry,
      name: user?.name || "Unknown",
      profile_image: user?.profile_image || "",
    };
  });

  return NextResponse.json(result);
}
