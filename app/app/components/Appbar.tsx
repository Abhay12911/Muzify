"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Music } from "lucide-react";

export function Appbar() {
  const session = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Music className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Muziffy
          </span>
        </div>
        <div>
          {session.data?.user ? (
            <button
              onClick={() => signOut()}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => signIn(undefined, { callbackUrl: "/home" })}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
