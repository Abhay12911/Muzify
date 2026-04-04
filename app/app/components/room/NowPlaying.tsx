"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Music } from "lucide-react";
import YouTubePlayer from "youtube-player";
import type { Stream } from "./types";

const REACTIONS = ["❤️", "🔥", "🎵", "😂", "👏", "🤩"];

type FloatingReaction = {
  id: string;
  emoji: string;
  x: number; // % from left — randomised so reactions don't stack on each other
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
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const activeVideoIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!currentStream || !playerContainerRef.current) return;

    const nextVideoId = currentStream.extractedId;

    const initOrLoadPlayer = async () => {
      if (!playerRef.current) {
        const player = YouTubePlayer(playerContainerRef.current!, {
          videoId: nextVideoId,
          playerVars: { autoplay: 1, rel: 0 },
        });

        player.on("stateChange", (event: { data: number }) => {
          if (event.data === 0) onPlayNext(); // 0 = video ended
        });

        playerRef.current = player;
        activeVideoIdRef.current = nextVideoId;
        return;
      }

      if (activeVideoIdRef.current !== nextVideoId) {
        activeVideoIdRef.current = nextVideoId;
        await playerRef.current.loadVideoById(nextVideoId);
      }
    };

    initOrLoadPlayer();
  }, [currentStream, onPlayNext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
    >
      {currentStream ? (
        <>
          {/* Video + floating reactions overlay */}
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            <div ref={playerContainerRef} className="absolute inset-0 h-full w-full [&>iframe]:!w-full [&>iframe]:!h-full" />

            {/* Floating emoji reactions animate upward over the video */}
            <AnimatePresence>
              {floatingReactions.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ y: -120, opacity: 0, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  // left is randomised per reaction so they don't all stack
                  style={{ left: `${r.x}%` }}
                  className="pointer-events-none absolute bottom-6 text-3xl"
                >
                  {r.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Title row + skip button (host only) */}
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

          {/* Reaction strip — visible to everyone */}
          <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-4 py-3">
            <span className="text-xs text-gray-500 mr-1">React:</span>
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
        <div className="flex aspect-video flex-col items-center justify-center gap-3 text-gray-500">
          <Music className="h-12 w-12" />
          <p>No songs yet. Add one below!</p>
        </div>
      )}
    </motion.div>
  );
}
