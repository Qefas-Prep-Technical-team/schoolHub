"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, School } from "lucide-react";
import { useEffect, useState } from "react";

// Define our color themes to keep the code clean
const THEMES = {
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-600 dark:bg-blue-400",
    spinner: "bg-blue-600/40 dark:bg-blue-400/40",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-600 dark:bg-emerald-400",
    spinner: "bg-emerald-600/40 dark:bg-emerald-400/40",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-600 dark:bg-amber-400",
    spinner: "bg-amber-600/40 dark:bg-amber-400/40",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-600 dark:bg-rose-400",
    spinner: "bg-rose-600/40 dark:bg-rose-400/40",
  }
};

interface GenericLoaderProps {
  message?: string;
  subMessage?: string;
  Icon?: LucideIcon;
  duration?: number;
  color?: keyof typeof THEMES;
}

export default function GenericLoader({
  message = "Confirming status",
  subMessage = "Just a moment...",
  Icon = School,
  duration = 2000,
  color = "blue" // Default to blue
}: GenericLoaderProps) {
  const [progress, setProgress] = useState(0);
  const theme = THEMES[color];

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      if (newProgress >= 100) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="flex flex-col items-center space-y-8 w-full max-w-xs">
        
        {/* ICON + SPINNER */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-4 rounded-full ${theme.spinner}`}
                style={{ transform: `rotate(${i * 30}deg) translate(0, -14px)` }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.083 }}
              />
            ))}
          </div>

          <Icon className={`${theme.text} relative z-10`} size={36} strokeWidth={1.8} />
        </div>

        {/* TEXT CONTENT */}
        <div className="text-center space-y-1">
          <AnimatePresence mode="wait">
            <motion.h2
              key={message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {message}
            </motion.h2>
          </AnimatePresence>

          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {subMessage}
          </p>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest pt-1">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-56 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${theme.bg}`}
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>

        {/* STEP DOTS */}
        <div className="flex space-x-1.5">
          {[1, 2, 3, 4, 5].map((i) => {
            const active = i <= (progress / 100) * 5;
            return (
              <motion.div
                key={i}
                animate={{ scale: active ? 1.2 : 1, opacity: active ? 1 : 0.3 }}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  active ? theme.bg : "bg-gray-300 dark:bg-gray-700"
                }`}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
}