"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  LogIn,
  Play,
  Users,
  ListMusic,
  Loader2,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Appbar } from "../Appbar";

type Room = {
  id: string;
  code: string;
  createdAt: Date;
  _count: { users: number; streams: number };
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function HomeClient({
  rooms: initialRooms,
  userName,
}: {
  rooms: Room[];
  userName: string;
}) {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [roomCode, setRoomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteRoom = async (roomId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/room/${roomId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to delete room");
        return;
      }
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setConfirmDeleteId(null);
    } catch {
      setError("Failed to delete room");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
      {/* Blue-tinted grid texture */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Ambient blue glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-blue-700/15 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <Appbar />

      <main className="relative mx-auto max-w-5xl px-6 pb-16 pt-28">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
            </span>
            Dashboard
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>
          <p className="mt-2 text-gray-500">
            Create a new room or join one with a code.
          </p>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="mb-12 grid gap-5 sm:grid-cols-2"
        >
          {/* Create Room */}
          <motion.div
            variants={fadeUp}
            custom={1}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:border-blue-500/30 hover:bg-white/[0.05]"
          >
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition-all group-hover:bg-blue-500/20">
              <Plus className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="mb-1.5 text-xl font-bold">Create a Room</h2>
            <p className="mb-6 text-sm text-gray-500">
              Start a new watch room and share the code with your friends.
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={creating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {creating ? "Creating..." : "Create Room"}
            </button>
          </motion.div>

          {/* Join Room */}
          <motion.div
            variants={fadeUp}
            custom={2}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all hover:border-blue-500/30 hover:bg-white/[0.05]"
          >
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition-all group-hover:bg-blue-500/20">
              <LogIn className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="mb-1.5 text-xl font-bold">Join a Room</h2>
            <p className="mb-6 text-sm text-gray-500">
              Enter a room code to join an existing watch session.
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
                placeholder="ROOM CODE"
                maxLength={8}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 font-mono text-sm uppercase tracking-widest text-white placeholder-gray-700 outline-none transition-colors focus:border-blue-500/50 focus:bg-white/[0.08]"
              />
              <button
                onClick={handleJoinRoom}
                disabled={joining}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {joining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Join
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="-mt-8 mb-8 flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 py-3 text-sm text-blue-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {error}
          </motion.div>
        )}

        {/* Your Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-xl font-bold">Your Rooms</h2>
            {rooms.length > 0 && (
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                {rooms.length}
              </span>
            )}
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                <Sparkles className="h-7 w-7 text-blue-500/60" />
              </div>
              <p className="font-medium text-gray-500">No rooms yet.</p>
              <p className="mt-1 text-sm text-gray-600">
                Create one above to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 + i * 0.06 }}
                  onClick={() => confirmDeleteId !== room.id && router.push(`/dashboard/${room.id}`)}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-blue-500/25 hover:bg-white/[0.05]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/25">
                      <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCode(room.code);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs tracking-widest text-gray-500 transition-all hover:border-blue-500/30 hover:text-blue-400"
                      >
                        {copiedCode === room.code ? (
                          <>
                            <Check className="h-3 w-3 text-blue-400" />
                            <span className="text-blue-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            {room.code}
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(
                            confirmDeleteId === room.id ? null : room.id
                          );
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-600 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="mb-3 text-base font-semibold text-white">
                    Room{" "}
                    <span className="font-mono text-blue-400">{room.code}</span>
                  </h3>

                  {confirmDeleteId === room.id ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5"
                    >
                      <p className="text-xs text-red-300">Delete this room?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-400 transition-all hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                          disabled={deleting}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1 text-xs font-bold text-white transition-all hover:bg-red-400 disabled:opacity-50"
                        >
                          {deleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {room._count.users}{" "}
                          {room._count.users === 1 ? "member" : "members"}
                        </span>
                        <span className="flex items-center gap-1">
                          <ListMusic className="h-3.5 w-3.5" />
                          {room._count.streams}{" "}
                          {room._count.streams === 1 ? "video" : "videos"}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-700 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
