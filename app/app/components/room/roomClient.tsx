"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { Appbar } from "../Appbar";
import { useRouter } from "next/navigation";
import { useRoomSocket, type ChatMessage } from "@/app/hooks/useRoomSocket";
import type { Stream } from "./types";
import NowPlaying from "./NowPlaying";
import AddSongForm from "./AddSongForm";
import QueueList from "./QueueList";
import ChatPanel from "./ChatPanel";
import { toast } from "sonner";

type FloatingReaction = { id: string; emoji: string; x: number };

export default function RoomClient({
  roomId,
  userId,
  userName,
  isHost,
}: {
  roomId: string;
  userId: string;
  userName: string;
  isHost: boolean;
}) {
  const router = useRouter();

  // ── music queue state ────────────────────────────────────────────────────
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // ── presence state ───────────────────────────────────────────────────────
  const [onlineCount, setOnlineCount] = useState(1);
  const [members, setMembers] = useState<string[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  // ── chat state ───────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "chat">("queue");
  const [unreadCount, setUnreadCount] = useState(0);

  // ── reaction state ───────────────────────────────────────────────────────
  // Each entry animates for 2s then is removed
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // ── data fetching ────────────────────────────────────────────────────────
  const fetchStreams = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/${roomId}/streams`);
      if (!res.ok) throw new Error();
      const data: Stream[] = await res.json();
      setStreams(data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // ── WS callbacks ─────────────────────────────────────────────────────────
  const handleUserJoined = useCallback((name: string) => {
    toast(`${name} joined the room 🎵`);
  }, []);

  const handleMembersChanged = useCallback((m: string[], count: number) => {
    setMembers(m);
    setOnlineCount(count);
  }, []);

  const handleChatMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
    // Increment unread badge only when chat tab is not active
    setActiveTab((prev) => {
      if (prev !== "chat") setUnreadCount((n) => n + 1);
      return prev;
    });
  }, []);

  const handleReaction = useCallback((emoji: string, id: string) => {
    // x is randomised so reactions spread across the video instead of stacking
    const x = Math.random() * 70 + 10; // 10%–80% from left
    const reaction = { id, emoji, x };

    setFloatingReactions((prev) => [...prev, reaction]);

    // Remove this specific reaction after 2.5s (matches the animation duration)
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  }, []);

  // ── WebSocket hook ───────────────────────────────────────────────────────
  const { notifyStreamUpdate, setRoomCurrentStream, sendChat, sendReaction } =
    useRoomSocket(
      roomId,
      userName,
      fetchStreams,
      setCurrentStreamId,
      handleUserJoined,
      handleMembersChanged,
      handleChatMessage,
      handleReaction
    );

  // ── queue auto-select logic ──────────────────────────────────────────────
  useEffect(() => {
    if (streams.length === 0) { setCurrentStreamId(null); return; }
    if (!currentStreamId) {
      const id = streams[0].id;
      setCurrentStreamId(id);
      setRoomCurrentStream(id);
      return;
    }
    if (!streams.some((s) => s.id === currentStreamId)) {
      const id = streams[0].id;
      setCurrentStreamId(id);
      setRoomCurrentStream(id);
    }
  }, [streams, currentStreamId, setRoomCurrentStream]);

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, [roomId]);

  // ── song actions ─────────────────────────────────────────────────────────
  const handleAddSong = useCallback(async (url: string) => {
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, roomId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchStreams();
      notifyStreamUpdate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add song");
    } finally {
      setAdding(false);
    }
  }, [roomId, fetchStreams, notifyStreamUpdate]);

  // Called when a search result is picked — title is already known, no re-fetch needed
  const handleAddByVideoId = useCallback(async (videoId: string, title: string) => {
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Construct a valid YouTube URL so the existing POST endpoint accepts it
        body: JSON.stringify({
          url: `https://youtube.com/watch?v=${videoId}`,
          roomId,
          title, // pass the title we already have from search results
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchStreams();
      notifyStreamUpdate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add song");
    } finally {
      setAdding(false);
    }
  }, [roomId, fetchStreams, notifyStreamUpdate]);

  const handleUpvote = useCallback(async (streamId: string) => {
    try {
      await fetch("/api/streams/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId }),
      });
      await fetchStreams();
      notifyStreamUpdate();
    } catch { /* silently handle */ }
  }, [fetchStreams, notifyStreamUpdate]);

  const handleDownvote = useCallback(async (streamId: string) => {
    try {
      await fetch("/api/streams/downvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId }),
      });
      await fetchStreams();
      notifyStreamUpdate();
    } catch { /* silently handle */ }
  }, [fetchStreams, notifyStreamUpdate]);

  const handlePlayNext = useCallback(async () => {
    const next = streams.find((s) => s.id !== currentStreamId);
    if (currentStreamId) {
      await fetch(`/api/streams/remove?streamId=${currentStreamId}`, {
        method: "DELETE",
      }).catch(() => {});
    }
    if (!next) {
      setCurrentStreamId(null);
      await fetchStreams();
      notifyStreamUpdate();
      return;
    }
    setCurrentStreamId(next.id);
    setRoomCurrentStream(next.id);
    await fetchStreams();
    notifyStreamUpdate();
  }, [streams, currentStreamId, setRoomCurrentStream, fetchStreams, notifyStreamUpdate]);

  const handleRemoveSong = useCallback(async (streamId: string) => {
    try {
      const res = await fetch(`/api/streams/remove?streamId=${streamId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Could not remove song"); return; }
      await fetchStreams();
      notifyStreamUpdate();
    } catch { toast.error("Failed to remove song"); }
  }, [fetchStreams, notifyStreamUpdate]);

  const handlePlay = useCallback((stream: Stream) => {
    setCurrentStreamId(stream.id);
    setRoomCurrentStream(stream.id);
  }, [setRoomCurrentStream]);

  // ── derived state ────────────────────────────────────────────────────────
  const currentStream = useMemo(
    () => streams.find((s) => s.id === currentStreamId) ?? null,
    [streams, currentStreamId]
  );
  const queue = currentStream
    ? streams.filter((s) => s.id !== currentStream.id)
    : streams;

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <Appbar />

      <main className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-24">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to rooms
          </motion.button>

          {/* Online count pill */}
          <div className="relative">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowMembers((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Users className="h-4 w-4 text-purple-400" />
              <span>{onlineCount} online</span>
            </motion.button>
            {showMembers && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-10 z-50 min-w-[160px] rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-xl"
              >
                {members.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-gray-500">No one here yet</p>
                ) : (
                  members.map((name, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-300">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      {name}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Left column */}
            <div className="min-w-0 space-y-6">
              <NowPlaying
                currentStream={currentStream}
                queueLength={queue.length}
                isHost={isHost}
                floatingReactions={floatingReactions}
                onPlayNext={handlePlayNext}
                onSendReaction={sendReaction}
              />
              <AddSongForm
                adding={adding}
                error={error}
                setError={setError}
                onAdd={handleAddSong}
                onAddByVideoId={handleAddByVideoId}
              />
            </div>

            {/* Right column — Queue / Chat tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="min-w-0 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex flex-col lg:self-start"
            >
              {/* Tab headers */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab("queue")}
                  className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === "queue"
                      ? "border-b-2 border-blue-500 -mb-px text-blue-400"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Queue ({queue.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("chat");
                    setUnreadCount(0);
                  }}
                  className={`relative flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === "chat"
                      ? "border-b-2 border-blue-500 -mb-px text-blue-400"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    Chat
                    {unreadCount > 0 && (
                      <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 py-px text-[10px] font-black leading-none text-white shadow-lg shadow-blue-500/30">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </span>
                </button>
              </div>

              {/* Tab content */}
              {activeTab === "queue" ? (
                <QueueList
                  queue={queue}
                  userId={userId}
                  isHost={isHost}
                  onPlay={handlePlay}
                  onUpvote={handleUpvote}
                  onDownvote={handleDownvote}
                  onRemove={handleRemoveSong}
                />
              ) : (
                <ChatPanel messages={messages} onSend={sendChat} />
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
