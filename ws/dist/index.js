"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer();
const wss = new ws_1.WebSocketServer({ server });
const port = 8080;
const rooms = new Map();
const socketToRoom = new Map();
const roomToCurrentStream = new Map();
//excludes? -> excludes the sender to hear its own message
function broadcaseToRoom(roomId, message, excludesWs) {
    const roomSockets = rooms.get(roomId);
    if (!roomSockets)
        return;
    roomSockets.forEach((client) => {
        if (client !== excludesWs && client.readyState === ws_1.WebSocket.OPEN) {
            client.send(message);
        }
    });
}
function removeFromRoom(ws) {
    const roomId = socketToRoom.get(ws);
    if (!roomId)
        return;
    if (rooms.has(roomId)) {
        const roomSocket = rooms.get(roomId);
        if (roomSocket) {
            roomSocket.delete(ws);
        }
    }
    socketToRoom.delete(ws);
}
wss.on("connection", (ws) => {
    console.log("client connected");
    ws.on("message", (raw) => {
        var _a;
        try {
            const message = JSON.parse(raw.toString());
            if (message.type === "join-room") {
                const { roomId } = message;
                if (!roomId)
                    return;
                removeFromRoom(ws);
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, new Set());
                }
                (_a = rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.add(ws);
                socketToRoom.set(ws, roomId);
                ws.send(JSON.stringify({ type: "joined-room", roomId }));
                const currentStreamId = roomToCurrentStream.get(roomId);
                if (currentStreamId) {
                    ws.send(JSON.stringify({ type: "current-stream", streamId: currentStreamId }));
                }
            }
            else if (message.type === "stream-updated") {
                const roomId = socketToRoom.get(ws);
                if (!roomId)
                    return;
                broadcaseToRoom(roomId, JSON.stringify({ type: "stream-updated" }), ws);
            }
            else if (message.type === "set-current-stream") {
                const roomId = socketToRoom.get(ws);
                const { streamId } = message;
                if (!roomId || !streamId)
                    return;
                roomToCurrentStream.set(roomId, streamId);
                broadcaseToRoom(roomId, JSON.stringify({ type: "current-stream", streamId }));
            }
        }
        catch (err) {
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
