"use client";
import React from "react";
import { motion } from "framer-motion";

const PortalsHero: React.FC = () => {
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
