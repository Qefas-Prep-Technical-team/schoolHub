"use client";

import { motion } from "framer-motion";
import CheerAnimation from "../_components/CheerAnimation";
import HeadlineText from "../_components/HeadlineText";
import Lottie from "lottie-react";
import Success from "../../../../lotties/Success.json";



export default function Step1() {
  return (
    <CheerAnimation>
      <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[3rem] border border-white/40 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-2xl"
          >
            {/* Soft background accents */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />

            <div className="p-12 sm:p-14 text-center">
              {/* Lottie Container with subtle entrance delay */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mx-auto mb-10 w-44 sm:w-48 drop-shadow-[0_8px_16px_rgba(16,185,129,0.2)]"
              >
                <Lottie
                  animationData={Success}
                  loop={false}
                  autoplay
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <HeadlineText
                  title="Account Verified!"
                  subtitle="Your profile is ready. Let’s customize your experience."
                />
              </motion.div>

              {/* small helper text instead of button */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-8 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-zinc-400"
              >
                Preparing your setup…
              </motion.p>

              {/* Refined subtle loading bar */}
              <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800/50">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.6, duration: 2, ease: "easeInOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              </div>
            </div>
          </motion.div>

          {/* optional footnote */}
          <p className="mt-4 text-center text-xs text-slate-400 dark:text-zinc-500">
            If nothing happens, refresh the page.
          </p>
        </div>
      </div>
    </CheerAnimation>
  );
}
