import { prismaClient as db } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get("streamId");

  if (!streamId) {
    return NextResponse.json({ message: "Stream ID is required" }, { status: 400 });
  }

  try {
    // Fetch the stream AND its room so we can check hostId
    // Without this we'd only know the stream's owner, not the room's host
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      include: { room: true }, // room gives us room.hostId
    });

    if (!stream) {
      return NextResponse.json({ message: "Stream not found" }, { status: 404 });
    }

    const isHost = stream.room.hostId === session.user.id; // creator of the room
    const isOwner = stream.userId === session.user.id;     // person who added this song

    // Only the room host OR the song's owner can delete it
    if (!isHost && !isOwner) {
      return NextResponse.json({ message: "Not allowed" }, { status: 403 });
    }

    await db.stream.delete({ where: { id: streamId } });

    return NextResponse.json({ message: "Song removed successfully" });
  } catch {
    return NextResponse.json({ message: "Error while removing the song" }, { status: 400 });
  }
}
