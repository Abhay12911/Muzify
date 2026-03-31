import { useEffect, useRef, useCallback } from "react";

const WS_URL =
    process.env.NEXT_PUBLIC_WS_URL ||
    (process.env.NODE_ENV === "production"
        ? "wss://muzify-ws.onrender.com"
        : "ws://localhost:8080");

export const useRoomSocket = (
    roomId: string,
    userName: string,
    onStreamUpdated: () => void,
    onCurrentStreamChanged: (streamId: string) => void,
    onUserJoined: (userName: string) => void,
    onCountChanged: (count: number) => void
) => {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join-room", roomId, userName }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "stream-updated") {
                    onStreamUpdated();
                } else if (data.type === "current-stream" && data.streamId) {
                    onCurrentStreamChanged(data.streamId);
                } else if (data.type === "user-joined" && data.userName) {
                    onUserJoined(data.userName);
                    onCountChanged(data.count);
                } else if (data.type === "room-count") {
                    onCountChanged(data.count);
                }
            } catch {
                // ignore non-JSON messages
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected from room", roomId);
        };

        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [roomId, userName]);

    const notifyStreamUpdate = useCallback(() => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "stream-updated" }));
        }
    }, []);

    const setRoomCurrentStream = useCallback((streamId: string) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "set-current-stream", streamId }));
        }
    }, []);

    return { notifyStreamUpdate, setRoomCurrentStream };
};
