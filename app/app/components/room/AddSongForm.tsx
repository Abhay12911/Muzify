"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Search } from "lucide-react";
import { YT_REGEX } from "@/app/lib/utils";

type SearchResult = {
  videoId: string;
  title: string;
  thumbnail: string;
};

interface AddSongFormProps {
  adding: boolean;
  error: string;
  setError: (e: string) => void;
  // Called when user submits a YouTube URL directly
  onAdd: (url: string) => void;
  // Called when user picks a result from search — title already known
  onAddByVideoId: (videoId: string, title: string) => void;
}

export default function AddSongForm({
  adding,
  error,
  setError,
  onAdd,
  onAddByVideoId,
}: AddSongFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isUrl = YT_REGEX.test(query.trim());

  // Debounced search: fires 400ms after the user stops typing, but only if input
  // is NOT a YouTube URL (if it's a URL, we just add it directly — no search needed)
  useEffect(() => {
    if (isUrl || !query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/streams/search?q=${encodeURIComponent(query.trim())}`
        );
        const data: SearchResult[] = await res.json();
        setResults(data);
        setShowDropdown(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms debounce — feels responsive without hammering the API

    // Cleanup: cancel the pending search if user types again before 400ms
    return () => clearTimeout(timer);
  }, [query, isUrl]);

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = () => {
    if (!query.trim()) return;
    if (isUrl) {
      onAdd(query.trim());
      setQuery("");
    }
    // If not a URL, user should pick from the dropdown
  };

  const handlePickResult = (result: SearchResult) => {
    // Pass videoId + title to parent — no need to re-fetch title in the API
    onAddByVideoId(result.videoId, result.title);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

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

      <div ref={containerRef} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            {/* Icon: magnifier while searching, link icon otherwise */}
            {searching ? (
              <Loader2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Search song or paste YouTube URL..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500/50"
            />
          </div>

          {/* Add button only shown when user typed a valid YouTube URL */}
          {isUrl && (
            <button
              onClick={handleSubmit}
              disabled={adding}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-2xl"
            >
              {results.map((result) => (
                <button
                  key={result.videoId}
                  onClick={() => handlePickResult(result)}
                  disabled={adding}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
                >
                  {/* Thumbnail from YouTube CDN */}
                  <img
                    src={result.thumbnail}
                    alt=""
                    className="h-10 w-16 shrink-0 rounded-lg object-cover bg-gray-800"
                  />
                  <span className="line-clamp-2 text-sm text-gray-200">
                    {result.title}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </motion.div>
  );
}
