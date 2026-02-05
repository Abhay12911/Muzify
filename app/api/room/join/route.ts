import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {

    const session = await getServerSession();

    if (!session?.user.id) {
        return new Response(JSON.stringify({
            message: "Unauthenticated"
        }), { status: 403 });
    }

    try {
        const { roomCode } = await req.json();

        const room = await prismaClient.room.findUnique({
            where: {
                code: roomCode,
            }
        })

        if (!room) {
            return Response.json({
                message: "Room not found"
            }, { status: 404 });
        }

        await prismaClient.roomUser.upsert({
            where: {
                userId_roomId: {
                    roomId: room.id,
                    userId: session.user.id
                }
            },
            create: {
                roomId: room.id,
                userId: session.user.id
            },
            update: {}
        })

        return Response.json({
            roomId: room.id,
            message: "Joined room successfully"
        })
    } catch (error) {
        return Response.json({
            message: " Error in joining the room",
        },
            { status: 500 })
    }

}