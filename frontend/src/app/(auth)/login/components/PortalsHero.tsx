"use client";
import React from "react";
import { motion } from "framer-motion";

const PortalsHero: React.FC = () => {
  return (
    <div className="text-center mb-20 font-['Lexend']">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[40px] leading-tight font-bold text-[#0b1c30] mb-3 tracking-tight"
      >
        Qefas Hub Portals
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg text-[#45464d] max-w-2xl mx-auto font-medium"
      >
        Select your entry point to access specialized management and learning tools.
      </motion.p>
    </div>
  );
};

export default PortalsHero;
