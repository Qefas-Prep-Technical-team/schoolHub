"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function StatusBar() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30"
        >
            {/* Pulsing Icon */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                }}
            >
                <Zap size={14} className="fill-amber-500 text-amber-500" />
            </motion.div>

            {/* Shimmering Text */}
            <span className="relative overflow-hidden text-[13px] font-medium text-amber-700 dark:text-amber-400">
                Connecting to secure servers...
                <span className="ml-1 opacity-60 font-normal">(May take a moment)</span>

                {/* Animated shimmer highlight */}
                <motion.div
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                />
            </span>
        </motion.div>
    );
}