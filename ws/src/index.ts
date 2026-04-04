import { WebSocketServer, WebSocket } from "ws";
import http from "http";
const server = http.createServer();
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 8080;

const rooms = new Map<string, Set<WebSocket>>();
const socketToRoom = new Map<WebSocket, string>();
const socketToName = new Map<WebSocket, string>();
const roomToCurrentStream = new Map<string, string>();

function broadcastToRoom(roomId: string, message: string, excludeWs?: WebSocket) {
    const roomSockets = rooms.get(roomId);
    if (!roomSockets) return;
    roomSockets.forEach((client) => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function broadcastToAll(roomId: string, message: string) {
    const roomSockets = rooms.get(roomId);
    if (!roomSockets) return;
    roomSockets.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function getRoomMembers(roomId: string): string[] {
    const roomSockets = rooms.get(roomId);
    if (!roomSockets) return [];
    return Array.from(roomSockets).map(ws => socketToName.get(ws) ?? "Someone");
}

function removeFromRoom(ws: WebSocket) {
    const roomId = socketToRoom.get(ws);
    if (!roomId) return;
    socketToName.delete(ws);
    const roomSocket = rooms.get(roomId);
    if (roomSocket) {
        roomSocket.delete(ws);
        const members = getRoomMembers(roomId);
        broadcastToAll(roomId, JSON.stringify({ type: "room-members", members, count: members.length }));
    }
    socketToRoom.delete(ws);
}

wss.on("connection", (ws: WebSocket) => {
    console.log("client connected");

    ws.on("message", (raw) => {
        try {
            const message = JSON.parse(raw.toString());

            if (message.type === "join-room") {
                const { roomId, userName } = message;
                if (!roomId) return;

                removeFromRoom(ws);

                if (!rooms.has(roomId)) {
                    rooms.set(roomId, new Set());
                }

                rooms.get(roomId)?.add(ws);
                socketToRoom.set(ws, roomId);
                socketToName.set(ws, userName || "Someone");

                const members = getRoomMembers(roomId);

                // Send joined confirmation + full members list to the new joiner
                ws.send(JSON.stringify({ type: "joined-room", roomId }));
                ws.send(JSON.stringify({ type: "room-members", members, count: members.length }));

                // Notify others that someone joined + send updated members list
                broadcastToRoom(roomId, JSON.stringify({
                    type: "user-joined",
                    userName: userName || "Someone",
                    members,
                    count: members.length,
                }), ws);

                // Send current stream to new joiner if exists
                const currentStreamId = roomToCurrentStream.get(roomId);
                if (currentStreamId) {
                    ws.send(JSON.stringify({ type: "current-stream", streamId: currentStreamId }));
                }
            }
            else if (message.type === "stream-updated") {
                const roomId = socketToRoom.get(ws);
                if (!roomId) return;
                broadcastToRoom(roomId, JSON.stringify({ type: "stream-updated" }), ws);
            }
            else if (message.type === "set-current-stream") {
                const roomId = socketToRoom.get(ws);
                const { streamId } = message;
                if (!roomId || !streamId) return;
                roomToCurrentStream.set(roomId, streamId);
                broadcastToRoom(roomId, JSON.stringify({ type: "current-stream", streamId }));
            }
            else if (message.type === "chat-message") {
                // A user sent a chat message. We look up their name from the socket map
                // (no need to trust the client to send their own name — we already stored it on join)
                const roomId = socketToRoom.get(ws);
                const { text } = message;
                if (!roomId || !text?.trim()) return;

                const userName = socketToName.get(ws) ?? "Someone";

                // Broadcast to EVERYONE in the room including the sender
                // so the sender sees their own message appear
                broadcastToAll(roomId, JSON.stringify({
                    type: "chat-message",
                    userName,
                    text: text.trim(),
                    timestamp: Date.now(), // ms since epoch — client formats it
                }));
            }
            else if (message.type === "reaction") {
                // A user sent an emoji reaction (e.g. "❤️")
                const roomId = socketToRoom.get(ws);
                const { emoji } = message;
                if (!roomId || !emoji) return;

                // Broadcast to ALL — reactions are shown as floating overlays for everyone
                broadcastToAll(roomId, JSON.stringify({
                    type: "reaction",
                    emoji,
                    // random id so React can key the animated element uniquely
                    id: Math.random().toString(36).slice(2),
                }));
            }
        } catch (err) {
            console.error("Failed to parse message", err);
        }
    });

    ws.on("close", () => {
        removeFromRoom(ws);
        console.log("client disconnected");
    });
});

server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});
