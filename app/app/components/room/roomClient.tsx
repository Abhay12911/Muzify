"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { Appbar } from "../Appbar";
import { useRouter } from "next/navigation";
import { useRoomSocket } from "@/app/hooks/useRoomSocket";
import type { Stream } from "./types";
import NowPlaying from "./NowPlaying";
import AddSongForm from "./AddSongForm";
import QueueList from "./QueueList";
import { toast } from "sonner";

export default function RoomClient({
  roomId,
  userId,
  userName,
  isHost,  // true if this user created the room — passed from the server component
}: {
  roomId: string;
  userId: string;
  userName: string;
  isHost: boolean;
}) {
  const router = useRouter();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [onlineCount, setOnlineCount] = useState(1);
  const [members, setMembers] = useState<string[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  const fetchStreams = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/${roomId}/streams`);
      if (!res.ok) throw new Error("Failed to fetch streams");
      const data: Stream[] = await res.json();
      setStreams(data);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const handleUserJoined = useCallback((name: string) => {
    toast(`${name} joined the room 🎵`);
  }, []);

  const handleMembersChanged = useCallback((updatedMembers: string[], count: number) => {
    setMembers(updatedMembers);
    setOnlineCount(count);
  }, []);

  const { notifyStreamUpdate, setRoomCurrentStream } = useRoomSocket(
    roomId,
    userName,
    fetchStreams,
    setCurrentStreamId,
    handleUserJoined,
    handleMembersChanged
  );

  useEffect(() => {
    if (streams.length === 0) {
      setCurrentStreamId(null);
      return;
    }
    if (!currentStreamId) {
      const fallbackId = streams[0].id;
      setCurrentStreamId(fallbackId);
      setRoomCurrentStream(fallbackId);
      return;
    }
    const exists = streams.some((s) => s.id === currentStreamId);
    if (!exists) {
      const fallbackId = streams[0].id;
      setCurrentStreamId(fallbackId);
      setRoomCurrentStream(fallbackId);
    }
  }, [streams, currentStreamId, setRoomCurrentStream]);

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 30000);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleAddSong = async () => {
    if (!url.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), roomId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUrl("");
      await fetchStreams();
      notifyStreamUpdate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add song");
    } finally {
      setAdding(false);
    }
  };

  const handleUpvote = async (streamId: string) => {
    try {
      await fetch("/api/streams/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId }),
      });
      await fetchStreams();
      notifyStreamUpdate();
    } catch {
      // silently handle
    }
  };

  const handleDownvote = async (streamId: string) => {
    try {
      await fetch("/api/streams/downvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId }),
      });
      await fetchStreams();
      notifyStreamUpdate();
    } catch {
      // silently handle
    }
  };

  // Deletes the given stream from DB, then advances to the next most-upvoted song.
  // Called by: (1) skip button (host only), (2) YouTube player ended event (all clients).
  // The DELETE is idempotent — the first client to call it wins, the rest silently get 404.
  const handlePlayNext = useCallback(async () => {
    // streams are already sorted by upvotes desc from the API
    // so the first stream that isn't the current one IS the most upvoted next song
    const next = streams.find((s) => s.id !== currentStreamId);

    // Delete the finished/skipped song so it doesn't reappear in the queue
    if (currentStreamId) {
      await fetch(`/api/streams/remove?streamId=${currentStreamId}`, {
        method: "DELETE",
      }).catch(() => {}); // swallow errors — another client may have already deleted it
    }

    if (!next) {
      // Queue is empty after deletion — clear the player
      setCurrentStreamId(null);
      await fetchStreams();
      notifyStreamUpdate();
      return;
    }

    setCurrentStreamId(next.id);
    setRoomCurrentStream(next.id);   // broadcasts to all clients via WS
    await fetchStreams();
    notifyStreamUpdate();
  }, [streams, currentStreamId, setRoomCurrentStream, fetchStreams, notifyStreamUpdate]);

  // Removes a song from the queue without advancing the player.
  // Host can remove anyone's song; regular users can only remove their own.
  const handleRemoveSong = useCallback(async (streamId: string) => {
    try {
      const res = await fetch(`/api/streams/remove?streamId=${streamId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Could not remove song");
        return;
      }
      await fetchStreams();
      notifyStreamUpdate();
    } catch {
      toast.error("Failed to remove song");
    }
  }, [fetchStreams, notifyStreamUpdate]);

  // Manually play a specific song from the queue (clicking thumbnail)
  // Does NOT delete anything — just changes the active player
  const handlePlay = useCallback((stream: Stream) => {
    setCurrentStreamId(stream.id);
    setRoomCurrentStream(stream.id);
  }, [setRoomCurrentStream]);

  const currentStream = useMemo(
    () => streams.find((s) => s.id === currentStreamId) ?? null,
    [streams, currentStreamId]
  );

  const queue = currentStream
    ? streams.filter((s) => s.id !== currentStream.id)
    : streams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <Appbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">
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
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <NowPlaying
                currentStream={currentStream}
                queueLength={queue.length}
                isHost={isHost}         // controls whether skip button is visible
                onPlayNext={handlePlayNext}
              />
              <AddSongForm
                url={url}
                setUrl={setUrl}
                adding={adding}
                error={error}
                setError={setError}
                onAdd={handleAddSong}
              />
            </div>

            <QueueList
              queue={queue}
              userId={userId}
              isHost={isHost}           // controls whether remove button shows on others' songs
              onPlay={handlePlay}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onRemove={handleRemoveSong}
            />
          </div>
        )}
      </main>
    </div>
  );
}
