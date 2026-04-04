"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Music } from "lucide-react";
import type { Stream } from "./types";

const REACTIONS = ["❤️", "🔥", "🎵", "😂", "👏", "🤩"];

type FloatingReaction = {
  id: string;
  emoji: string;
  x: number;
};

interface NowPlayingProps {
  currentStream: Stream | null;
  queueLength: number;
  isHost: boolean;
  floatingReactions: FloatingReaction[];
  onPlayNext: () => void;
  onSendReaction: (emoji: string) => void;
}

export default function NowPlaying({
  currentStream,
  queueLength,
  isHost,
  floatingReactions,
  onPlayNext,
  onSendReaction,
}: NowPlayingProps) {
  // YouTube posts a postMessage when the player state changes.
  // State 0 = ended — trigger auto-advance.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;
      try {
        const data = JSON.parse(event.data as string);
        if (data.event === "onStateChange" && data.info === 0) {
          onPlayNext();
        }
      } catch {
        // ignore non-JSON messages
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onPlayNext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
    >
      {currentStream ? (
        <>
          {/*
           * 16:9 responsive container.
           * padding-bottom: 56.25% = 9/16 of the element's own width,
           * giving a perfect 16:9 box on every screen size.
           * The iframe is absolutely positioned to fill it completely.
           * key={extractedId} makes React swap the iframe when the song
           * changes — no external player library needed.
           */}
          <div className="relative aspect-video w-full max-w-full bg-black">
            <iframe
              key={currentStream.extractedId}
              src={`https://www.youtube.com/embed/${currentStream.extractedId}?autoplay=1&rel=0&enablejsapi=1`}
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
              allow="autoplay; fullscreen; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />

            {/* Floating emoji reactions */}
            <AnimatePresence>
              {floatingReactions.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ y: -120, opacity: 0, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  style={{ left: `${r.x}%` }}
                  className="pointer-events-none absolute bottom-6 text-3xl"
                >
                  {r.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Title + skip */}
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-purple-400">
                Now Playing
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold">
                {currentStream.title || `Video ${currentStream.extractedId}`}
              </h2>
            </div>
            {isHost && (
              <button
                onClick={onPlayNext}
                disabled={queueLength === 0}
                className="ml-2 flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium transition-colors hover:border-purple-500/30 hover:bg-white/10 disabled:opacity-30 sm:px-4"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </button>
            )}
          </div>

          {/* Reaction strip */}
          <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-4 py-3">
            <span className="mr-1 text-xs text-gray-500">React:</span>
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSendReaction(emoji)}
                className="rounded-lg px-2 py-1 text-lg transition-transform hover:scale-125 active:scale-95"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
          <Music className="h-12 w-12" />
          <p>No songs yet. Add one below!</p>
        </div>
      )}
    </motion.div>
  );
}
