"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  LogIn,
  Music,
  Users,
  ListMusic,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { Appbar } from "../Appbar";

type Room = {
  id: string;
  code: string;
  createdAt: Date;
  _count: { users: number; streams: number };
};

export default function HomeClient({
  rooms,
  userName,
}: {
  rooms: Room[];
  userName: string;
}) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/room/create", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push(`/dashboard/${data.room.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create room");
      setCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }
    setJoining(true);
    setError("");
    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode: roomCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push(`/dashboard/${data.roomId}`);
    } catch (err: any) {
      setError(err.message || "Failed to join room");
      setJoining(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <Appbar />

      <main className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold sm:text-4xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>
          <p className="mt-2 text-gray-400">
            Create a new room or join one with a code.
          </p>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 grid gap-6 sm:grid-cols-2"
        >
          {/* Create Room Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Plus className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="mb-1 text-xl font-semibold">Create a Room</h2>
            <p className="mb-5 text-sm text-gray-400">
              Start a new music room and share the code with your friends.
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {creating ? "Creating..." : "Create Room"}
            </button>
          </div>

          {/* Join Room Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <LogIn className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="mb-1 text-xl font-semibold">Join a Room</h2>
            <p className="mb-5 text-sm text-gray-400">
              Enter a room code to join an existing music session.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                placeholder="Enter room code"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-purple-500/50"
              />
              <button
                onClick={handleJoinRoom}
                disabled={joining}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              >
                {joining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Join
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="-mt-8 mb-8 text-center text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* Your Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="mb-6 text-xl font-semibold">Your Rooms</h2>

          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
              <Music className="mx-auto mb-3 h-10 w-10 text-gray-600" />
              <p className="text-gray-500">
                No rooms yet. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
                  onClick={() => router.push(`/dashboard/${room.id}`)}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-purple-500/30 hover:bg-white/[0.07]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(room.code);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-purple-500/30 hover:text-white"
                    >
                      {copiedCode === room.code ? (
                        <>
                          <Check className="h-3 w-3 text-green-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          {room.code}
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="mb-3 text-base font-medium text-white">
                    Room {room.code}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {room._count.users}{" "}
                      {room._count.users === 1 ? "member" : "members"}
                    </span>
                    <span className="flex items-center gap-1">
                      <ListMusic className="h-3.5 w-3.5" />
                      {room._count.streams}{" "}
                      {room._count.streams === 1 ? "song" : "songs"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
