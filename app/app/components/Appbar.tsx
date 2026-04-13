"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Music } from "lucide-react";

export function Appbar() {
  const session = useSession();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] backdrop-blur-xl"
      style={{ backgroundColor: "rgba(8,8,8,0.85)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Conflux Rooms
          </span>
        </div>
        <div>
          {session.data?.user ? (
            <button
              onClick={() => signOut()}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: "/home" })}
              className="rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:bg-blue-400"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
