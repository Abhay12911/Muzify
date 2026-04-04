import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/app/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

import { prismaClient } from "@/app/lib/db";


const CreateStreamSchema = z.object({
  url: z.string(),
  roomId: z.string(),
});

const MAX_QUEUE_LEN = 20;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user.id) {
      return NextResponse.json(
        {
          message: "Unauthenticated",
        },
        {
          status: 403,
        },
      );
    }
    const user = session.user;

    const data = CreateStreamSchema.parse(await req.json());

    // Rate limit: check if this user already added a song in the last 60 seconds in this room
    // Date.now() - 60000 gives a timestamp 1 minute ago
    // findFirst looks for ANY stream from this user in this room created after that timestamp
    const recentStream = await prismaClient.stream.findFirst({
      where: {
        userId: session.user.id,
        roomId: data.roomId,
        createAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentStream) {
      return NextResponse.json(
        { message: "Please wait 1 minute before adding another song" },
        { status: 429 } // 429 = Too Many Requests — the correct HTTP code for rate limiting
      );
    }

    if (!data.url.trim()) {
      return NextResponse.json(
        {
          message: "YouTube link cannot be empty",
        },
        {
          status: 400,
        },
      );
    }

    const isYt = data.url.match(YT_REGEX);
    const videoId = data.url ? data.url.match(YT_REGEX)?.[1] : null;
    if (!isYt || !videoId) {
      return NextResponse.json(
        {
          message: "Invalid YouTube URL format",
        },
        {
          status: 400,
        },
      );
    }

    const extractedId = videoId;

    const stream = await prismaClient.stream.create({
      data: {
        userId: session.user.id,
        roomId: data.roomId,
        url: data.url,
        extractedId,
        type: "Youtube",
      },
    });

    // Stamp the room as active now — this resets the 24h inactivity timer
    await prismaClient.room.update({
      where: { id: data.roomId },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({
      message: "Stream created successfully",
      id: stream.id,
    });
  } catch (error) {
    return NextResponse.json({
        message : "Error while creating stream",
    },{
        status: 411,
    })
  }
}

