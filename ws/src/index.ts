import { WebSocketServer, WebSocket } from "ws";
import http from "http";
const server = http.createServer();
const wss = new WebSocketServer({ server });

const port = 8080;

const rooms = new Map<string, Set<WebSocket>>();
const socketToRoom = new Map<WebSocket, string>();

//excludes? -> excludes the sender to hear its own message
function broadcaseToRoom(roomId: string, message: string, excludesWs?: WebSocket) {
    const roomSockets = rooms.get(roomId);
    if (!roomSockets) return;

    roomSockets.forEach((client) => {
        if (client !== excludesWs && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    })
}

function removeFromRoom(ws: WebSocket) {
    const roomId = socketToRoom.get(ws);
    if (!roomId) return;
    if (rooms.has(roomId)) {
        const roomSocket = rooms.get(roomId);
        if (roomSocket) {
            roomSocket.delete(ws);
        }
    }
    socketToRoom.delete(ws);
}

wss.on("connection", (ws: WebSocket) => {
    console.log("client connected");

    ws.on("message", (raw) => {
        try {
            const message = JSON.parse(raw.toString());
            if (message.type === "join-room") {
                const { roomId } = message;
                if (!roomId) return;
                removeFromRoom(ws);
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, new Set());
                }

                rooms.get(roomId)?.add(ws);
                socketToRoom.set(ws, roomId);
                ws.send(JSON.stringify({ type: "joined-room", roomId }));
            }
            else if (message.type === "stream-updated") {
                const roomId = socketToRoom.get(ws);
                if (!roomId) return;
                broadcaseToRoom(roomId, JSON.stringify({ type: "stream-updated" }), ws);

            }


        } catch (err) {
            console.error("Failed to parse message", err);
        }

        ws.on("close", () => {
            removeFromRoom(ws);
            console.log("client disconnected");

        })
    })

    server.listen(port, () => {
        console.log(`WebSocket server is running on port ${port}`);
    })
});