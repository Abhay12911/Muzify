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
wss.on("connection", (ws) => {
    console.log("client connected");
    ws.on("message", (message) => {
        const msg = message.toString();
        console.log("received: " + msg);
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws_1.WebSocket.OPEN) {
                client.send(msg);
            }
        });
    });
});
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});
