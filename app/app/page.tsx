"use client";
import { Appbar } from "./components/Appbar";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Music,
  Users,
  ThumbsUp,
  ThumbsDown,
  Play,
  Radio,
  ChevronRight,
  Headphones,
  ListMusic,
  Vote,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Users,
    title: "Create Rooms",
    description:
      "Spin up a listening room in seconds and invite your friends to join the party.",
  },
  {
    icon: ListMusic,
    title: "Add Songs via YouTube",
    description:
      "Paste any YouTube URL to add songs to the shared queue. No downloads needed.",
  },
  {
    icon: Vote,
    title: "Vote on Tracks",
    description:
      "Upvote your favorites and downvote the rest. The crowd decides what plays next.",
  },
  {
    icon: Play,
    title: "Top Song Plays",
    description:
      "The most voted song automatically plays next. Democracy meets music.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a Room",
    description: "Sign in and create your own music room with a single click.",
    icon: Radio,
  },
  {
    step: "02",
    title: "Share & Add Songs",
    description:
      "Share the room link with friends and paste YouTube URLs to build the queue.",
    icon: Headphones,
  },
  {
    step: "03",
    title: "Vote & Listen",
    description:
      "Everyone votes on songs. The highest-voted track plays next for all.",
    icon: ThumbsUp,
  },
];

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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <Appbar />

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25"
          >
            <Music className="h-8 w-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Let the Crowd Pick{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              the Music
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl"
          >
            Create a room, share YouTube songs, and let everyone vote. The
            top-voted track plays next. Music, democratized.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <button
              onClick={handleGetStarted}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
            >
              Get Started Free
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-gray-300 transition-all hover:border-white/40 hover:text-white"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Mini preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto mt-16 max-w-lg"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-500">
                  Room: Weekend Vibes
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Blinding Lights", votes: 12, active: true },
                  { name: "Bohemian Rhapsody", votes: 9, active: false },
                  { name: "Shape of You", votes: 7, active: false },
                ].map((song, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                      song.active
                        ? "border border-purple-500/30 bg-purple-500/10"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {song.active && (
                        <Play className="h-4 w-4 text-purple-400" />
                      )}
                      <span
                        className={`text-sm ${
                          song.active ? "font-medium text-white" : "text-gray-400"
                        }`}
                      >
                        {song.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-3.5 w-3.5 text-green-400" />
                      <span className="text-xs font-medium text-gray-400">
                        {song.votes}
                      </span>
                      <ThumbsDown className="h-3.5 w-3.5 text-red-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-3 text-sm font-semibold uppercase tracking-widest text-purple-400"
            >
              Features
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl font-bold sm:text-4xl"
            >
              Everything you need for the perfect{" "}
              <span className="text-purple-400">group listening</span> session
            </motion.h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-purple-500/30 hover:bg-white/[0.07]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <feature.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative px-6 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-3 text-sm font-semibold uppercase tracking-widest text-purple-400"
            >
              How It Works
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl font-bold sm:text-4xl"
            >
              Three steps to{" "}
              <span className="text-purple-400">musical democracy</span>
            </motion.h2>
          </motion.div>

          <div className="space-y-8">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="mb-4 text-3xl font-bold sm:text-4xl"
          >
            Ready to let the crowd{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              choose the vibe
            </span>
            ?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mb-8 text-gray-400"
          >
            Create your first room and start listening together. No credit card
            required.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
            >
              Get Started Now
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
              <Music className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">
              Muziffy
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Music, democratized. Built with Next.js.
          </p>
        </div>
      </footer>
    </div>
  );
}
