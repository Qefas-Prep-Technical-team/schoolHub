"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import SchoolNotFoundView from "@/components/common/SchoolNotFoundView";
import { detectSubdomain } from "@/lib/utils/subdomain";

export default function NotFound() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isSchoolRoute, setIsSchoolRoute] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (typeof window === "undefined") return;

    const detected = detectSubdomain(window.location.hostname);
    const pathname = window.location.pathname;
    const pathParts = pathname.split("/").filter(Boolean);
    const isSchoolPath = pathParts[0] === "school" || pathname.startsWith("/school/");

    if (detected) {
      setSubdomain(detected);
      setIsSchoolRoute(true);
    } else if (isSchoolPath) {
      setSubdomain(pathParts[1] || null);
      setIsSchoolRoute(true);
    }
  }, []);

  // When detected on a school subdomain or school route, render the specialized School Not Found view
  if (hasMounted && (isSchoolRoute || subdomain)) {
    return <SchoolNotFoundView subdomain={subdomain} type="school_not_found" />;
  }

  // Standard Page 404
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 font-sans">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 Illustration */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <h1 className="text-9xl font-black text-slate-200 dark:text-zinc-800 select-none tracking-tight">
              404
            </h1>

            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800">
                <Search size={48} className="text-orange-500" />
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
          <h2 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            Lost in the Hallways?
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            We couldn&apos;t find the page you&apos;re looking for. It might have been moved, renamed, or no longer exists.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all active:scale-95"
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </motion.div>

        {/* Footer Subtle Brand Tag */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-xs text-slate-400 uppercase tracking-widest font-semibold"
        >
          Qefas Hub Academic Platform
        </motion.p>
      </div>
    </div>
  );
}
