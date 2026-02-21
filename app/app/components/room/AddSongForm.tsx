"use client";

import { motion } from "framer-motion";
import { Plus, Loader2, Link as LinkIcon } from "lucide-react";

interface AddSongFormProps {
  url: string;
  setUrl: (url: string) => void;
  adding: boolean;
  error: string;
  setError: (error: string) => void;
  onAdd: () => void;
}

export default function AddSongForm({
  url,
  setUrl,
  adding,
  error,
  setError,
  onAdd,
}: AddSongFormProps) {
  return (
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
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            placeholder="Paste YouTube URL here..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500/50"
          />
        </div>
        <button
          onClick={onAdd}
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
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </motion.div>
  );
}
