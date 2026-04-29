"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PortalCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  delay?: number;
}

const PortalCard: React.FC<PortalCardProps> = ({ icon, title, description, href, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-start shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 group"
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 mb-8 flex-grow font-medium">
        {description}
      </p>
      <Link 
        href={href}
        className="w-full flex items-center justify-between group bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 text-slate-900 dark:text-white hover:text-white px-6 py-4 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
      >
        Access Portal
        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </Link>
    </motion.div>
  );
};

export default PortalCard;
