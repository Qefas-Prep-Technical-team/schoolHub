"use client";

import { motion } from "framer-motion";

interface HeadlineTextProps {
  title: string;
  subtitle: string;
  align?: "center" | "left";
}

export default function HeadlineText({ 
  title, 
  subtitle, 
  align = "center" 
}: HeadlineTextProps) {
  return (
    <div className={`space-y-3 ${align === "center" ? "text-center" : "text-left"}`}>
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight"
      >
        {title}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="text-base text-slate-500 dark:text-zinc-400 font-medium leading-relaxed max-w-md mx-auto"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}