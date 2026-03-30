"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SkipForward, Music } from "lucide-react";
import YouTubePlayer from "youtube-player";
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
          playerVars: {
            autoplay: 1,
            rel: 0,
          },
        });

        player.on("stateChange", (event: { data: number }) => {
          // YouTube ended state is 0.
          if (event.data === 0) {
            onPlayNext();
          }
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
          <div className="relative aspect-video w-full bg-black">
            <div ref={playerContainerRef} className="absolute inset-0 h-full w-full" />
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
