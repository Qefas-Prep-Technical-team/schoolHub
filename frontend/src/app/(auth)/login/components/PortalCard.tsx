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
}

const PortalCard: React.FC<PortalCardProps> = ({ role, icon, title, description, href, delay = 0 }) => {
  const roleTheme = getRoleTheme(role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-start shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl hover:${roleTheme.activeNavBorder} group`}
    >
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
        className={`w-full flex items-center justify-between group bg-slate-50 dark:bg-slate-800 hover:${roleTheme.accentBg} text-slate-900 dark:text-white hover:text-white px-6 py-4 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest shadow-sm`}
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
