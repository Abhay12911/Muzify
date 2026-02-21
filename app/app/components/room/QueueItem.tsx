"use client";

import { motion } from "framer-motion";
import { Play, ThumbsUp } from "lucide-react";
import type { Stream } from "./types";

interface QueueItemProps {
  stream: Stream;
  index: number;
  isUpvoted: boolean;
  onPlay: (stream: Stream) => void;
  onUpvote: (streamId: string) => void;
  onDownvote: (streamId: string) => void;
}

export default function QueueItem({
  stream,
  index,
  isUpvoted,
  onPlay,
  onUpvote,
  onDownvote,
}: QueueItemProps) {
  return (
    <motion.div
      key={stream.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="group flex items-center gap-3 rounded-xl border border-transparent bg-white/[0.03] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.06]"
    >
      {/* Thumbnail */}
      <div
        className="relative h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-gray-800"
        onClick={() => onPlay(stream)}
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
          {stream.title || `Video ${stream.extractedId}`}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          Added by {stream.user?.name || "Anonymous"}
        </p>
      </div>

      {/* Vote Button */}
      <button
        onClick={() =>
          isUpvoted ? onDownvote(stream.id) : onUpvote(stream.id)
        }
        className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          isUpvoted
            ? "bg-purple-500/20 text-purple-300"
            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        <ThumbsUp
          className={`h-3.5 w-3.5 ${isUpvoted ? "fill-current" : ""}`}
        />
        {stream.upvotes.length}
      </button>
    </motion.div>
  );
}
