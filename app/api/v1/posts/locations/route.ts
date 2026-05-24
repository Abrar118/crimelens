import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();

  const locations = await db.collection("posts").aggregate([
    {
      $group: {
        _id: { district: "$district", division: "$division" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        district: "$_id.district",
        division: "$_id.division",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]).toArray();

  return NextResponse.json(locations);
}
