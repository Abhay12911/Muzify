import { prismaClient } from "@/app/lib/db";
import { NextResponse } from "next/server";

// This route is called daily by Vercel Cron (see vercel.json)
// It deletes rooms that have had no activity for more than 24 hours
export async function GET() {
  // Calculate the cutoff timestamp: anything older than this is "inactive"
  // Date.now() gives current time in ms, subtract 24h worth of ms
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // deleteMany removes ALL rooms matching the condition in one DB query
  // Cascading deletes in the schema (onDelete: Cascade on Stream.room) mean
  // all streams and room users are automatically deleted too — no orphaned data
  const result = await prismaClient.room.deleteMany({
    where: {
      lastActivityAt: { lt: cutoff }, // lt = less than = older than 24h ago
    },
  });

  return NextResponse.json({ deleted: result.count });
}
