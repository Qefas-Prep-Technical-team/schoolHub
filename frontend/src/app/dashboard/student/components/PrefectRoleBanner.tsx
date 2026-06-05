"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PrefectRoleBannerProps {
  roleName: string;
}

const getMotivationalText = (role: string) => {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes('head')) {
    return "Lead with integrity, inspire excellence, and set the standard for others.";
  }
  if (lowerRole.includes('class')) {
    return "Your actions set the tone for discipline and excellence in your class.";
  }
  if (lowerRole.includes('library')) {
    return "Keep the library a haven for learning and curiosity.";
  }
  return "Lead with discipline, responsibility, and excellence.";
};

export default function PrefectRoleBanner({ roleName }: PrefectRoleBannerProps) {
  if (!roleName) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 p-1 shadow-lg shadow-amber-500/20"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl bg-white/95 dark:bg-slate-900/95 p-6 backdrop-blur-sm">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-3xl shadow-inner">
          👑
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
            Student Leadership
          </h2>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">
            {roleName}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 font-medium italic">
            "{getMotivationalText(roleName)}"
          </p>
        </div>
        {/* <div className="mt-4 sm:mt-0">
          <button className="rounded-full bg-amber-500 px-6 py-2 text-sm font-bold text-white transition-transform hover:scale-105 hover:bg-amber-600 shadow-md">
            View Responsibilities
          </button>
        </div> */}
      </div>
    </motion.div>
  );
}
