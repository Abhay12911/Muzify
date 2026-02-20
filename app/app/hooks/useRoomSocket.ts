// useRef is used instead of useState because changing a ref doesn't trigger a re-render. You don't want the component to re-render every time the WebSocket object changes internally.

import { useEffect, useRef, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export const useRoomSocket = (roomId: string, onStreamUpdated: () => void) => {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "join-room", roomId }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "stream-updated") {
                    onStreamUpdated(); // this will be fetchStreams()
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
    }, [roomId]);

    // Call this after any mutation (add song, upvote, downvote)
    const notifyStreamUpdate = useCallback(() => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "stream-updated" }));
        }
    }, []);

    return { notifyStreamUpdate };
};