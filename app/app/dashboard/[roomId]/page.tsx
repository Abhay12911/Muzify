import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prismaClient } from "@/app/lib/db";
import { redirect } from "next/navigation";
import RoomClient from "../../components/room/roomClient";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/");
  }

  // Fetch the room to check who the host is
  // This runs on the server so no extra client round-trip needed
  const room = await prismaClient.room.findUnique({
    where: { id: roomId },
  });

  // Compare the room's stored hostId against the logged-in user's id
  // If room is null (deleted) or hostId doesn't match → not a host
  const isHost = room?.hostId === session.user.id;

  return (
    <RoomClient
      roomId={roomId}
      userId={session.user.id}
      userName={session.user.name ?? "Someone"}
      isHost={isHost}
    />
  );
}
