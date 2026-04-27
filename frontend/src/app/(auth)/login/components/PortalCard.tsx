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
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 flex flex-col items-start shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900 group font-['Lexend']"
    >
      <div className="w-12 h-12 rounded-xl bg-[#e5eeff] dark:bg-blue-900/20 flex items-center justify-center text-[#0051d5] dark:text-blue-400 mb-6">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-bold text-[#0b1c30] dark:text-white mb-2">{title}</h3>
      <p className="text-[15px] leading-relaxed text-[#45464d] dark:text-slate-400 mb-8 flex-grow font-medium">
        {description}
      </p>
      <Link 
        href={href}
        className="w-full flex items-center justify-between group bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#0051d5] text-[#0051d5] hover:text-white px-6 py-3 rounded-xl transition-all text-sm font-bold tracking-tight"
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
