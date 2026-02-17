import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

