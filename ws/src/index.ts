import { WebSocketServer , WebSocket } from "ws";
import http from "http";
const server  = http.createServer();
const wss = new WebSocketServer({ server });

const port = 8080;

const rooms = new Map<string, Set<WebSocket>>();

wss.on("connection", (ws: WebSocket) =>{
    console.log("client connected");

    ws.on("message", (message) =>{
        const msg = message.toString();
        console.log("received: " + msg);
        wss.clients.forEach( ( client) =>{
            if(client !== ws && client.readyState === WebSocket.OPEN){
                client.send(msg);
            }
        })
    })

 ws.on("close ", () =>{
    console.log("client disconnected");
 })
})

server.listen( port, ()=>{
    console.log(`WebSocket server is running on port ${port}`);
})