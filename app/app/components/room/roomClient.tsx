"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  Plus,
  Play,
  SkipForward,
  Music,
  Loader2,
  Link as LinkIcon,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Appbar } from "../Appbar";
import { useRouter } from "next/navigation";

type Stream = {
  id: string;
  url: string;
  extractedId: string;
  title: string;
  smallImge: string;
  largeImage: string;
  upvotes: { id: string; userId: string; streamId: string }[];
  user: { id: string; name: string | null };
};

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

  // Fetch streams for this room
  const fetchStreams = async () => {
    try {
      const res = await fetch(`/api/room/${roomId}/streams`);
      if (!res.ok) throw new Error("Failed to fetch streams");
      const data: Stream[] = await res.json();
      setStreams(data);

      // If no current stream is set, auto-play top voted
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
    const interval = setInterval(fetchStreams, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Add a new song
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
    } catch (err: any) {
      setError(err.message || "Failed to add song");
    } finally {
      setAdding(false);
    }
  };

  // Upvote
  const handleUpvote = async (streamId: string) => {
    try {
      await fetch("/api/streams/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId }),
      });
      await fetchStreams();
    } catch {
      // silently handle
    }
  };

  // Downvote (remove upvote)
  const handleDownvote = async (streamId: string) => {
    try {
      await fetch("/api/streams/downvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId }),
      });
      await fetchStreams();
    } catch {
      // silently handle
    }
  };

  // Play next top voted song
  const handlePlayNext = () => {
    const next = streams.find((s) => s.id !== currentStream?.id);
    if (next) {
      setCurrentStream(next);
    }
  };

  const hasUpvoted = (stream: Stream) =>
    stream.upvotes.some((u) => u.userId === userId);

  // Queue = everything except currently playing
  const queue = streams.filter((s) => s.id !== currentStream?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <Appbar />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6">
        {/* Back button */}
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
            {/* ========= Left Column: Player + Add Song ========= */}
            <div className="space-y-6">
              {/* Now Playing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                {currentStream ? (
                  <>
                    <div className="relative aspect-video w-full bg-black">
                      <iframe
                        key={currentStream.extractedId}
                        src={`https://www.youtube.com/embed/${currentStream.extractedId}?autoplay=1&rel=0`}
                        className="absolute inset-0 h-full w-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-purple-400">
                          Now Playing
                        </p>
                        <h2 className="mt-1 truncate text-lg font-semibold">
                          {currentStream.title ||
                            `Video ${currentStream.extractedId}`}
                        </h2>
                      </div>
                      <button
                        onClick={handlePlayNext}
                        disabled={queue.length === 0}
                        className="ml-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:border-purple-500/30 hover:bg-white/10 disabled:opacity-30"
                      >
                        <SkipForward className="h-4 w-4" />
                        Play Next
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-3 text-gray-500">
                    <Music className="h-12 w-12" />
                    <p>No songs yet. Add one below!</p>
                  </div>
                )}
              </motion.div>

              {/* Add Song */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  <Plus className="h-4 w-4 text-purple-400" />
                  Add a Song
                </h3>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSong()}
                      placeholder="Paste YouTube URL here..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500/50"
                    />
                  </div>
                  <button
                    onClick={handleAddSong}
                    disabled={adding || !url.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
              </motion.div>
            </div>

            {/* ========= Right Column: Queue ========= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/10 bg-white/5 lg:self-start"
            >
              <div className="border-b border-white/10 px-5 py-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  <Users className="h-4 w-4 text-purple-400" />
                  Up Next
                  <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                    {queue.length}
                  </span>
                </h3>
              </div>

              <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-3">
                {queue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Music className="mb-2 h-8 w-8" />
                    <p className="text-sm">Queue is empty</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Add songs to get the party going!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {queue.map((stream, i) => (
                      <motion.div
                        key={stream.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="group flex items-center gap-3 rounded-xl border border-transparent bg-white/[0.03] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.06]"
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-800"
                          onClick={() => setCurrentStream(stream)}
                        >
                          <img
                            src={`https://img.youtube.com/vi/${stream.extractedId}/mqdefault.jpg`}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Play className="h-5 w-5 text-white" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-200">
                            {stream.title ||
                              `Video ${stream.extractedId}`}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            Added by {stream.user?.name || "Anonymous"}
                          </p>
                        </div>

                        {/* Vote Button */}
                        <button
                          onClick={() =>
                            hasUpvoted(stream)
                              ? handleDownvote(stream.id)
                              : handleUpvote(stream.id)
                          }
                          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            hasUpvoted(stream)
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <ThumbsUp
                            className={`h-3.5 w-3.5 ${hasUpvoted(stream) ? "fill-current" : ""}`}
                          />
                          {stream.upvotes.length}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
