import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
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

  return <RoomClient roomId={roomId} userId={session.user.id} />;
}
