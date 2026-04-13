"use client";
import { Appbar } from "./components/Appbar";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Music,
  Users,
  ThumbsUp,
  Play,
  Radio,
  ChevronRight,
  Headphones,
  ListMusic,
  Vote,
  Zap,
  Sparkles,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Users,
    title: "Create Rooms",
    description:
      "Spin up a watch room in seconds and invite your friends to join the session.",
  },
  {
    icon: ListMusic,
    title: "Add via YouTube",
    description:
      "Paste any YouTube URL — music, podcasts, clips, anything. It joins the shared queue instantly.",
  },
  {
    icon: Vote,
    title: "Vote on Videos",
    description:
      "Upvote what you want to watch and downvote the rest. The crowd decides what's next.",
  },
  {
    icon: Play,
    title: "Top Video Plays",
    description:
      "The most voted video automatically plays next. Democracy meets streaming.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a Room",
    description: "Sign in and create your own watch room with a single click.",
    icon: Radio,
  },
  {
    step: "02",
    title: "Share & Add Videos",
    description:
      "Share the room link with friends and paste any YouTube URL to build the queue.",
    icon: Headphones,
  },
  {
    step: "03",
    title: "Vote & Watch",
    description:
      "Everyone votes on videos. The highest-voted one plays next for the whole room.",
    icon: ThumbsUp,
  },
];

const BAR_HEIGHTS = [6, 10, 14, 8, 12, 16, 10, 6, 12, 8, 14, 10, 6, 12, 16, 8, 10, 6];

export default function Home() {
  const session = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session.data?.user) {
      router.push("/home");
    } else {
      signIn(undefined, { callbackUrl: "/home" });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
      {/* Subtle grid texture — blue tint */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <Appbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Blue ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-16 h-[560px] w-[560px] rounded-full bg-blue-700/20 blur-[160px]" />
          <div className="absolute -right-32 top-1/3 h-[440px] w-[440px] rounded-full bg-blue-600/10 blur-[140px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[700px] rounded-full bg-blue-500/8 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            Rooms are live — watch together now
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-6 text-6xl font-black leading-none tracking-tight sm:text-7xl lg:text-[88px]"
          >
            <span className="block bg-gradient-to-b from-white via-gray-100 to-blue-200 bg-clip-text text-transparent">
              Conflux Rooms
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-500 sm:text-xl"
          >
            Create a room, add any YouTube video, and let your crowd vote on
            what plays next.{" "}
            <span className="text-gray-300">Real-time watch democracy.</span>
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <button
              onClick={handleGetStarted}
              className="group relative flex items-center gap-2 rounded-full bg-blue-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 hover:bg-blue-400 hover:shadow-blue-500/50"
            >
              <span className="absolute inset-0 rounded-full bg-blue-400 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
              <span className="relative">Start Watching Free</span>
              <Zap className="relative h-4 w-4 transition-transform group-hover:scale-125" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-base font-medium text-gray-400 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white"
            >
              How it works
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          {/* Preview card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.65 }}
            className="mx-auto mt-20 max-w-sm"
          >
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/80 backdrop-blur-2xl">
              {/* Blue glow behind card */}
              <div className="pointer-events-none absolute inset-x-8 -bottom-4 h-12 rounded-full bg-blue-500/20 blur-xl" />

              {/* Window bar */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/30" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/50" />
                  </div>
                  <span className="ml-1 text-xs text-gray-600">Weekend Vibes</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-blue-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                  3 watching
                </span>
              </div>

              {/* Now playing */}
              <div className="mb-3 rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
                      <Play className="h-3.5 w-3.5 fill-white text-white ml-0.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Blinding Lights</p>
                      <p className="text-xs text-gray-500">The Weeknd</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-blue-400" />
                    <span className="text-xs font-bold text-blue-300">12</span>
                  </div>
                </div>
                {/* Sound bars */}
                <div className="mt-3 flex items-end gap-[2px]" style={{ height: 20 }}>
                  {BAR_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full"
                      style={{
                        height: `${h}px`,
                        background: "linear-gradient(to top, #3b82f6, #93c5fd)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Queue */}
              <div className="space-y-2">
                {[
                  { name: "Bohemian Rhapsody", artist: "Queen", votes: 9 },
                  { name: "Shape of You", artist: "Ed Sheeran", votes: 7 },
                ].map((song, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5"
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-300">{song.name}</p>
                      <p className="text-[11px] text-gray-600">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-gray-600" />
                      <span className="text-xs text-gray-600">{song.votes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="relative px-6 py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400"
            >
              <Sparkles className="h-3 w-3" /> Features
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl font-black tracking-tight sm:text-5xl"
            >
              Built for the{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                watch crowd
              </span>
            </motion.h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-blue-500/30 hover:bg-white/[0.05]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition-all duration-300 group-hover:bg-blue-500/20">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" className="relative px-6 py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/8 blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400"
            >
              How It Works
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-4xl font-black tracking-tight sm:text-5xl"
            >
              Three steps to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                watch together
              </span>
            </motion.h2>
          </motion.div>

          <div className="space-y-5">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="group flex items-start gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-blue-500/20 hover:bg-white/[0.05] sm:p-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-xl font-black text-white shadow-lg shadow-blue-500/30">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 flex items-center gap-3">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <item.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="leading-relaxed text-gray-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[160px]" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-6 flex justify-center">
            <Sparkles className="h-8 w-8 text-blue-400/80" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="mb-4 text-4xl font-black tracking-tight sm:text-5xl"
          >
            Your room is one click away.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              Start the party.
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mb-10 text-lg text-gray-500">
            No credit card. No setup. Just watch.
          </motion.p>
          <motion.div variants={fadeUp} custom={3}>
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center gap-2.5 rounded-full bg-blue-500 px-10 py-4 text-base font-bold text-white shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 hover:bg-blue-400 hover:shadow-blue-500/50"
            >
              <span className="absolute inset-0 rounded-full bg-blue-400 opacity-0 blur-xl transition-all group-hover:opacity-30" />
              <span className="relative">Create Your First Room</span>
              <ChevronRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/25">
              <Music className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-300">Conflux Rooms</span>
          </div>
          <p className="text-sm text-gray-600">
            Any YouTube video. Any crowd. Your vote controls the stream.
          </p>
        </div>
      </footer>
    </div>
  );
}
