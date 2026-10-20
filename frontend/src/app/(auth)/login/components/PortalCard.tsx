"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getRoleTheme } from "@/lib/theme/roleTheme";

interface PortalCardProps {
  role: string;
  icon: string;
  title: string;
  description: string;
  href: string;
  delay?: number;
  isHighlighted?: boolean;
}

const PortalCard: React.FC<PortalCardProps> = ({
  role,
  icon,
  title,
  description,
  href,
  delay = 0,
  isHighlighted = false,
}) => {
  const roleTheme = getRoleTheme(role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative bg-white dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-start shadow-sm border transition-all duration-300 hover:shadow-2xl hover:${roleTheme.activeNavBorder} group ${
        isHighlighted
          ? "border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-500/30 dark:ring-indigo-400/30 shadow-2xl scale-[1.02] bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-[10px] tracking-wider uppercase shadow-md shadow-indigo-600/30 flex items-center gap-1.5 animate-pulse z-10">
          <span>✨</span>
          <span>Your Registered Portal</span>
        </div>
      )}

      <div className={`w-14 h-14 rounded-2xl ${roleTheme.badgeBg} flex items-center justify-center ${roleTheme.badgeText} mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 border ${roleTheme.badgeBorder}`}>
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 mb-8 flex-grow font-medium">
        {description}
      </p>
      <Link 
        href={href}
        className={`w-full flex items-center justify-between group ${
          isHighlighted
            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/25"
            : `bg-slate-50 dark:bg-slate-800 ${roleTheme.hoverBg} text-slate-900 dark:text-white hover:text-white`
        } px-6 py-4 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest shadow-sm`}
      >
        <span>{isHighlighted ? "Sign In Here" : "Access Portal"}</span>
        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </Link>
    </motion.div>
  );
};

export default PortalCard;
