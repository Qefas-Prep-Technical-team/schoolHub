"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
      <div className="max-w-md w-full text-center">
        
        {/* Animated 404 Illustration */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <h1 className="text-9xl font-black text-slate-200 dark:text-zinc-800 select-none">
              404
            </h1>
            
            <motion.div 
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800">
                <Search size={48} className="text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
            Lost in the hallways?
          </h2>
          <p className="text-slate-500 dark:text-zinc-400">
            We couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => window.history.back()}
            className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            <Home size={18} />
            Return Home
          </Link>
        </motion.div>

        {/* Footer Subtle Link */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-xs text-slate-400 uppercase tracking-widest font-semibold"
        >
          School Management System
        </motion.p>
      </div>
    </div>
  );
}