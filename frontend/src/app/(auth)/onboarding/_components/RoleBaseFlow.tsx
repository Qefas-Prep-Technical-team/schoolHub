"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RoleBaseFlow({
  steps,
  initialIndex = 0,
  onDone,
}: {
  steps: React.ReactNode[];
  initialIndex?: number;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialIndex);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward
  const [isRedirecting, setIsRedirecting] = useState(false);

  const total = steps.length;

  const pct = useMemo(() => {
    if (total <= 1) return 0;
    return (active / (total - 1)) * 100;
  }, [active, total]);

  const next = () => {
    if (isRedirecting) return;

    if (active < total - 1) {
      setDirection(1);
      setActive((v) => v + 1);
    } else {
      // last step -> redirect
      setIsRedirecting(true);
      onDone?.();

      // small delay so the UI communicates what's happening
      setTimeout(() => {
        router.push("/login");
      }, 900);
    }
  };

  const back = () => {
    if (isRedirecting) return;
    if (active > 0) {
      setDirection(-1);
      setActive((v) => v - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  return (
    <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}>
      <div className="relative w-full min-h-[100dvh] bg-slate-50 dark:bg-zinc-950 flex flex-col text-slate-900 dark:text-zinc-100">
        {/* Redirecting Overlay */}
        <AnimatePresence>
          {isRedirecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur"
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                className="w-[min(420px,92vw)] rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-8 text-center"
              >
                {/* Spinner */}
                <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-slate-200 dark:border-zinc-800 border-t-slate-900 dark:border-t-white animate-spin" />

                <p className="text-base font-semibold">Redirecting to you to login page...</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                  Finishing setup, please don’t close this tab.
                </p>

                {/* subtle progress bar */}
                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.9, ease: "easeInOut" }}
                    className="h-full bg-slate-900 dark:bg-white"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header / Progress */}
        <header className="sticky top-0 z-20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800/50">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                Step {active + 1} of {total}
              </span>
              <span className="text-xs font-medium tabular-nums text-blue-600 dark:text-blue-400">
                {Math.round(pct)}%
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${pct}%` }}
                className="h-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              />
            </div>
          </div>
        </header>

        {/* Step Content */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={active}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {steps[active]}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Navigation Bar */}
        <footer className="sticky bottom-0 z-20 pb-8 pt-4 px-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-zinc-950 dark:via-zinc-950">
          <div className="max-w-2xl mx-auto flex gap-4">
            {active > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: isRedirecting ? 1 : 0.97 }}
                onClick={back}
                disabled={isRedirecting}
                className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-medium text-sm transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: isRedirecting ? 1 : 0.98 }}
              onClick={next}
              disabled={isRedirecting}
              className="flex-1 px-6 cursor-pointer py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-sm shadow-lg shadow-slate-200 dark:shadow-none transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRedirecting
                ? "Redirecting..."
                : active === total - 1
                ? "Complete Setup"
                : "Continue"}
            </motion.button>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
