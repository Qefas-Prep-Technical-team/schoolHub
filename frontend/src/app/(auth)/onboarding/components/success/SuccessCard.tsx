'use client';
import React from 'react';

import { motion } from 'framer-motion';

export default function SuccessCard() {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col gap-6 rounded-xl bg-white dark:bg-gray-900/50 p-6 shadow-sm md:p-8 max-w-md w-full"
    >
      {/* <ProgressBar step={1} total={5} /> */}

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20 animate-pulse" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30">
            <span className="material-symbols-outlined text-7xl text-primary">
              check
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">
            Email Verified Successfully 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            Welcome to SchoolHub — your journey in smarter learning starts here.
          </p>
        </div>
      </div>

      <div className="flex pt-4 justify-center">
        <button className="flex min-w-[84px] w-full max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors duration-200">
          <span className="truncate">Next</span>
        </button>
      </div>
    </motion.div>
  );
}
