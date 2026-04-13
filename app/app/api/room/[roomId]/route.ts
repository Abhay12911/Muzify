import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const { roomId } = await params;

  const room = await prismaClient.room.findUnique({
    where: { id: roomId },
    select: {
      hostId: true,
      users: { where: { userId: session.user.id }, select: { userId: true } },
    },
  });

  if (!room) {
    return NextResponse.json({ message: "Room not found" }, { status: 404 });
  }

  // Allow deletion if: user is the host, hostId is null (legacy room), or user is a member
  const isMember = room.users.length > 0;
  const isHost = room.hostId === session.user.id || room.hostId === null;

  if (!isHost && !isMember) {
    return NextResponse.json({ message: "Not authorised to delete this room" }, { status: 403 });
  }

  await prismaClient.room.delete({ where: { id: roomId } });

  return NextResponse.json({ message: "Room deleted" });
}
