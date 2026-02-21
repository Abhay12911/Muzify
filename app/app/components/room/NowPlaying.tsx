"use client";

import { motion } from "framer-motion";
import { SkipForward, Music } from "lucide-react";
import type { Stream } from "./types";

interface NowPlayingProps {
  currentStream: Stream | null;
  queueLength: number;
  onPlayNext: () => void;
}

export default function NowPlaying({
  currentStream,
  queueLength,
  onPlayNext,
}: NowPlayingProps) {
  return (
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
              onClick={onPlayNext}
              disabled={queueLength === 0}
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
  );
}
