"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/app/hooks/useRoomSocket";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}

// Format a ms timestamp to "HH:MM" — e.g. "14:05"
function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPanel({ messages, onSend }: ChatPanelProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message whenever messages array changes
  // scrollIntoView({ behavior: "smooth" }) makes it glide rather than jump
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText(""); // clear input immediately — optimistic UX
  };

  return (
    <div className="flex h-full min-w-0 flex-col overflow-x-hidden">
      {/* Message list — explicit min/max heights so it shows on mobile without needing a parent height */}
      <div className="overflow-y-auto space-y-3 p-3 min-h-[200px] max-h-64 lg:max-h-[calc(100vh-300px)]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm">No messages yet.</p>
            <p className="mt-1 text-xs text-gray-600">Say hi! 👋</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/[0.04] px-3 py-2"
            >
              {/* Header row: name + timestamp */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-purple-400">
                  {msg.userName}
                </span>
                <span className="text-[10px] text-gray-600 shrink-0">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              {/* Message body */}
              <p className="mt-0.5 text-sm text-gray-200 break-words">{msg.text}</p>
            </motion.div>
          ))
        )}
        {/* Invisible div at the bottom — scrollIntoView targets this */}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
        <div className="border-t border-white/10 p-3 flex gap-2 overflow-x-hidden">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Send a message..."
          maxLength={200} // prevent spam walls of text
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex items-center justify-center rounded-xl bg-purple-500 px-3 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
