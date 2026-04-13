import { prismaClient } from "@/app/lib/db";
import { NextResponse } from "next/server";

// This route is called every 12 hours by Vercel Cron (see vercel.json)
// It deletes rooms that have had no activity for more than 12 hours
export async function GET() {
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);

  const result = await prismaClient.room.deleteMany({
    where: {
      lastActivityAt: { lt: cutoff },
    },
  });

  return NextResponse.json({ deleted: result.count });
}
