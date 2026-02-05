import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { Stream } from "stream";

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {

    const session = await getServerSession();
    if (!session?.user.id) {
        return new Response(JSON.stringify({
            message: "Unauthenticated"
        }), { status: 403 });
    }

    try {
        const Streams = await prismaClient.stream.findMany({
            where: {
                roomId: params.roomId,
            },
            include: {
                user: true,
                upvotes: true,

            },
            orderBy: {
                upvotes: {
                    _count: "desc"
                }
            }
        });

        return Response.json(Streams)
    } catch (error) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }
}

