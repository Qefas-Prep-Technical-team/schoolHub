"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTenantBranding } from "@/lib/api/hooks/useTenantBranding";

const PortalsHero: React.FC = () => {
  const { branding, isLoading } = useTenantBranding();

  if (isLoading) {
    return <div className="h-32 mb-16 md:mb-24 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  if (branding.isBranded) {
    return (
      <div className="text-center mb-16 md:mb-24">
        {branding.logo && (
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={branding.logo} 
            alt={branding.schoolName || "School Logo"} 
            className="w-24 h-24 object-contain mx-auto mb-6 rounded-2xl shadow-sm"
          />
        )}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight"
        >
          {branding.heroTitle || `Welcome to ${branding.schoolName}`}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium"
        >
          {branding.heroSubtitle || "Please select your portal to continue."}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="text-center mb-16 md:mb-24">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter"
      >
        Qefas <span className="text-indigo-600">Hub</span> Portals
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
      >
        Select your specialized entry point to access the unified management and learning ecosystem.
      </motion.p>
    </div>
  );
};

export default PortalsHero;
