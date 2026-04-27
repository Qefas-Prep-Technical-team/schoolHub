"use client";
import React from "react";
import { motion } from "framer-motion";

const IntegrationSection: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="mt-20 relative rounded-3xl overflow-hidden h-64 md:h-96 w-full font-['Lexend']"
    >
      <img 
        alt="Modern educational environment" 
        className="w-full h-full object-cover" 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMOveA0uhV9PDMntdv4vrMQxHcPlRt0IP-qK4hEN07Qq0xlNxKhemXDwBsm6Y23-nsBDuY72hI5Q_o1YJ-MmPeLOEL1ZywGfa_JySaGbi9m_rXv4RT9JagZqkegYZcvZB_3c3yn6jGC9P-3M9uXf3UmP50v_YKiFZ4Hj61i2Rc_NxSuW8ri55-pCG1HYNI9_LESVxY4X5ATJZ47-ZOu5hH5kbFVs9H2G7ps1u54T9SZfEswf6hysKSC_2b0gX6mkC7lT3avbjttsM"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#131b2e]/90 via-[#131b2e]/40 to-transparent flex items-center p-8 md:p-16">
        <div className="max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Seamless Integration</h2>
          <p className="text-lg text-white/80 font-medium">Connect every aspect of your educational experience in one unified platform designed for the modern era.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default IntegrationSection;
