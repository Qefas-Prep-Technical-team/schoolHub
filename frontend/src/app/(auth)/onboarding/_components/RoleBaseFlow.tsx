"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../login/services/auth-store";

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
  const { setHasCompletedOnboarding } = useAuthStore()

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
      setHasCompletedOnboarding(true);
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
    <MotionConfig transition={{ duration: 0.6, type: "spring", bounce: 0.1 }}>
      <div className="relative w-full min-h-[100dvh] bg-transparent flex flex-col text-slate-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-blue-500/30">
        
        {/* Premium Background Accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px]"
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        </div>

        {/* Redirecting Overlay */}
        <AnimatePresence>
          {isRedirecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-2xl"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="w-[min(400px,90vw)] rounded-[2.5rem] border border-white/20 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] p-10 text-center backdrop-blur-xl"
              >
                {/* Custom Premium Spinner */}
                <div className="relative mx-auto mb-8 h-16 w-16">
                  <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 dark:border-zinc-800" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 dark:border-t-blue-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Setting up your space</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                  We're busy preparing everything for you. This will only take a moment.
                </p>

                {/* Refined Progress Indicator */}
                <div className="mt-8 relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header / Progress bar */}
        <header className="sticky top-0 z-20 transition-all duration-300">
          <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 mb-0.5">
                  Onboarding
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Step {active + 1} <span className="text-slate-400 dark:text-zinc-500 font-medium">/ {total}</span>
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100/50 dark:border-blue-500/20">
                <span className="text-xs font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {Math.round(pct)}% <span className="font-medium opacity-70">Complete</span>
                </span>
              </div>
            </div>

            <div className="relative h-1 w-full rounded-full bg-slate-200 dark:bg-zinc-800/50 overflow-hidden group">
              <motion.div
                initial={false}
                animate={{ width: `${pct}%` }}
                className="relative h-full bg-blue-600 dark:bg-blue-500"
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              >
                {/* Glow effect at the end of progress */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 bg-blue-400 dark:bg-blue-400 blur-md rounded-full opacity-60" />
              </motion.div>
            </div>
          </div>
        </header>

        {/* Step Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
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
        <footer className="sticky bottom-0 z-20 pb-10 pt-6 px-6">
          {/* Subtle gradient to mask content behind footer */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/95 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto flex gap-4 relative z-10">
            {active > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                whileTap={{ scale: 0.98 }}
                onClick={back}
                disabled={isRedirecting}
                className="px-8 py-4 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md font-bold text-sm transition-all hover:border-slate-300 dark:hover:border-zinc-700 disabled:opacity-50"
              >
                Back
              </motion.button>
            )}

            <motion.button
              whileHover={{ 
                scale: isRedirecting ? 1 : 1.01,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: isRedirecting ? 1 : 0.98 }}
              onClick={next}
              disabled={isRedirecting}
              className="flex-1 px-8 py-4 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm shadow-xl shadow-slate-200/50 dark:shadow-none transition-all disabled:opacity-60 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                {isRedirecting
                  ? "Redirecting..."
                  : active === total - 1
                    ? "Complete Setup"
                    : "Continue"}
                {!isRedirecting && active !== total - 1 && (
                  <motion.svg 
                    initial={{ x: 0 }}
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"
                  >
                    <path d="M5 12h14m-7-7 7 7-7 7"/>
                  </motion.svg>
                )}
              </span>
            </motion.button>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
