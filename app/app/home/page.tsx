import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prismaClient } from "@/app/lib/db";
import HomeClient from "../components/home/HomeClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/");
  }

  const rooms = await prismaClient.room.findMany({
    where: {
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, streams: true } },
    },
  });

  return <HomeClient rooms={rooms} userName={session.user.name ?? "User"} />;
}
