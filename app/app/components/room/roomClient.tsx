"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { Appbar } from "../Appbar";
import { useRouter } from "next/navigation";
import { useRoomSocket } from "@/app/hooks/useRoomSocket";
import type { Stream } from "./types";
import NowPlaying from "./NowPlaying";
import AddSongForm from "./AddSongForm";
import QueueList from "./QueueList";

export default function RoomClient({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) {
  const router = useRouter();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const { notifyStreamUpdate } = useRoomSocket(roomId, () => fetchStreams());

  const fetchStreams = async () => {
    try {
      const res = await fetch(`/api/room/${roomId}/streams`);
      if (!res.ok) throw new Error("Failed to fetch streams");
      const data: Stream[] = await res.json();
      setStreams(data);

      if (!currentStream && data.length > 0) {
        setCurrentStream(data[0]);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err: any) {
      setError(err.message || "Failed to add song");
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
    } catch (err: any) {
      console.error("Failed to upvote stream:", err);
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

  const handlePlayNext = () => {
    const next = streams.find((s) => s.id !== currentStream?.id);
    if (next) setCurrentStream(next);
  };

  const queue = streams.filter((s) => s.id !== currentStream?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <Appbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/home")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to rooms
        </motion.button>

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
              onPlay={setCurrentStream}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
            />
          </div>
        )}
      </main>
    </div>
  );
}
