"use client";

import { motion, AnimatePresence } from "framer-motion";
import { School } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { UserType } from "@/app/(auth)/login/services/auth-store";

const LOADING_STEPS = [
  { message: "Verifying credentials" },
  { message: "Securing connection" },
  { message: "Syncing dashboard" },
  { message: "Fetching profile" },
  { message: "Welcome" },
];

const TYPE_DISPLAY: Record<string, string> = {
  PARENT: "Parent",
  TEACHER: "Teacher",
  ADMIN: "Administrator",
  STUDENT: "Student",
};

export default function LoadingDashboard({
  userType = "STUDENT",
  duration = 3200,
}: { userType?: UserType | null; duration?: number }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const pct = useMemo(() => {
    if (LOADING_STEPS.length <= 1) return 0;
    return Math.round((currentStepIdx / (LOADING_STEPS.length - 1)) * 100);
  }, [currentStepIdx]);

  useEffect(() => {
    const intervalTime = duration / LOADING_STEPS.length;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-zinc-950 px-6 py-10">
      <div className="relative w-full max-w-sm">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/15" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/15" />

        {/* Card */}
        <motion.div
          initial={{ y: 10, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/60 shadow-xl backdrop-blur-xl"
        >
          {/* top sheen */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent dark:from-white/10" />

          <div className="px-8 pt-10 pb-8">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* glow ring */}
                <motion.div
                  animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 -m-4 rounded-[28px] bg-blue-500/15 blur-xl"
                />
                <div className="relative grid place-items-center rounded-3xl border border-slate-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-950 p-5 shadow-sm">
                  <School className="text-blue-600 dark:text-blue-400" size={44} strokeWidth={1.6} />
                </div>
              </motion.div>
            </div>

            {/* Title + dynamic message */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                <span>Preparing Dashboard</span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <span className="tabular-nums">{pct}%</span>
              </div>

              <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-zinc-100">
                Hello, {TYPE_DISPLAY[userType ?? "STUDENT"]}
              </h2>

              <div className="relative mt-3 h-7 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStepIdx}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 140, damping: 18 }}
                    className="text-sm font-medium text-slate-500 dark:text-zinc-400"
                  >
                    {LOADING_STEPS[currentStepIdx].message}
                    <motion.span
                      className="inline-block"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      …
                    </motion.span>
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-8 space-y-3">
              <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-zinc-800 overflow-hidden">
                {/* fill */}
                <motion.div
                  className="relative h-full bg-blue-600 dark:bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                >
                  {/* shimmer */}
                  <motion.div
                    className="absolute inset-0 translate-x-[-40%] bg-gradient-to-r from-transparent via-white/35 to-transparent"
                    animate={{ x: ["-40%", "140%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                <span className="uppercase tracking-widest">Almost there</span>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="uppercase tracking-widest"
                >
                  Processing
                </motion.span>
              </div>
            </div>

            {/* Step dots */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {LOADING_STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i <= currentStepIdx
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-slate-300 dark:bg-zinc-800"
                  }`}
                  animate={{ width: i === currentStepIdx ? 26 : 10 }}
                  transition={{ duration: 0.35 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* small footer hint */}
        <p className="mt-5 text-center text-xs text-slate-400 dark:text-zinc-600">
          Please don’t close this tab.
        </p>
      </div>
    </div>
  );
}
