import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
    const session = await getServerSession();

    if (!session?.user.id) {
        return new Response(JSON.stringify({ message: "Unauthenticated" }), { status: 403 });
    }

    const user = session.user;

    try {
        const room = await prismaClient.room.create({
            data: {
                code: generateRoomCode(),
                users: {
                    create: {
                        userId: session.user.id,
                    }
                }
            }
        })

        return Response.json({ room } );
    } catch (error) {
            return Response.json({
                message: "Error while creating room",
                error: (error as Error).message,
            }, { status: 500
            })
    }
}