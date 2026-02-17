import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return new Response(
      JSON.stringify({ message: "Unauthenticated" }),
      { status: 403 }
    );
  }

  try {
    const streams = await prismaClient.stream.findMany({
      where: { roomId },
      include: {
        user: true,
        upvotes: true,
      },
      orderBy: {
        upvotes: {
          _count: "desc",
        },
      },
    });

    return Response.json(streams);
  } catch (error) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
}
