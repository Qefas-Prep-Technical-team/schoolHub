"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const THEMES = {
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-600 dark:bg-blue-400",
    glow: "shadow-[0_0_40px_rgba(37,99,235,0.15)]",
    spinner: "bg-blue-600/40 dark:bg-blue-400/40",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-600 dark:bg-emerald-400",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    spinner: "bg-emerald-600/40 dark:bg-emerald-400/40",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-600 dark:bg-amber-400",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    spinner: "bg-amber-600/40 dark:bg-amber-400/40",
  },
};

interface OnboardingLoaderProps {
  name?: string;
  message?: string;
  Icon?: LucideIcon;
  color?: keyof typeof THEMES;
  duration?: number;
}

export default function OnboardingLoader({
  name,
  message = "Preparing your workspace",
  Icon = Sparkles,
  color = "blue",
  duration = 3000,
}: OnboardingLoaderProps) {
  const [progress, setProgress] = useState(0);
  const theme = THEMES[color];

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      {/* Decorative background glow */}
      <div className={`absolute w-96 h-96 rounded-full blur-[120px] opacity-20 dark:opacity-10 transition-colors duration-1000 ${theme.bg}`} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">
        
        {/* Animated Icon Container */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative w-24 h-24 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 shadow-2xl ${theme.glow} mb-10`}
        >
          {/* iOS Spinner integrated into the container edge */}
          <div className="absolute inset-0 p-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-3.5 rounded-full left-1/2 top-1/2 ${theme.spinner}`}
                style={{ 
                    originY: "3.2rem",
                    transform: `translateX(-50%) rotate(${i * 30}deg) translateY(-2.8rem)` 
                }}
                animate={{ opacity: [0.1, 1, 0.1] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }}
              />
            ))}
          </div>
          <Icon className={`${theme.text}`} size={40} strokeWidth={1.5} />
        </motion.div>

        {/* Text Section */}
        <div className="text-center space-y-3 mb-10">
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight"
          >
            {name ? `Welcome, ${name}` : "Setting things up"}
          </motion.h1>
          
          <div className="h-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-slate-500 dark:text-zinc-400 font-medium"
              >
                {message}...
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Linear Progress Bar with Shimmer */}
        <div className="w-full space-y-4">
          <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
            <motion.div
              className={`absolute top-0 left-0 h-full ${theme.bg}`}
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
            {/* Shimmer effect */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-1/2 h-full bg-white/20 skew-x-12"
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">
            <span>Configuring Account</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Staggered Step Indicators */}
        <div className="flex space-x-3 mt-12">
          {[1, 2, 3, 4].map((i) => {
             const active = i <= (progress / 100) * 4;
             return (
               <motion.div
                 key={i}
                 initial={false}
                 animate={{ 
                    width: active ? 24 : 8,
                    backgroundColor: active ? "rgba(var(--theme-color))" : "rgba(var(--inactive-color))"
                 }}
                 className={`h-2 rounded-full transition-all duration-500 ${
                   active ? theme.bg : "bg-slate-200 dark:bg-zinc-800"
                 }`}
               />
             );
          })}
        </div>
      </div>
    </div>
  );
}