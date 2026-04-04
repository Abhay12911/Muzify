"use client";

import { Music, Users } from "lucide-react";
import type { Stream } from "./types";
import QueueItem from "./QueueItem";

interface QueueListProps {
  queue: Stream[];
  userId: string;
  isHost: boolean;
  onPlay: (stream: Stream) => void;
  onUpvote: (streamId: string) => void;
  onDownvote: (streamId: string) => void;
  onRemove: (streamId: string) => void;
}

export default function QueueList({
  queue,
  userId,
  isHost,
  onPlay,
  onUpvote,
  onDownvote,
  onRemove,
}: QueueListProps) {
  const hasUpvoted = (stream: Stream) =>
    stream.upvotes.some((u) => u.userId === userId);

  return (
    <div className="min-w-0">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <Users className="h-4 w-4 text-purple-400" />
          Up Next
          <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-300">
            {queue.length}
          </span>
        </h3>
      </div>

      <div className="max-h-72 overflow-y-auto p-3 lg:max-h-[calc(100vh-220px)]">
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
              <QueueItem
                key={stream.id}
                stream={stream}
                index={i}
                isUpvoted={hasUpvoted(stream)}
                isHost={isHost}
                userId={userId}
                onPlay={onPlay}
                onUpvote={onUpvote}
                onDownvote={onDownvote}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
