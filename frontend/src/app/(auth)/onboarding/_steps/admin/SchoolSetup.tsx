"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Globe, Zap, Settings, Shield } from "lucide-react";
import HeadlineText from "../../_components/HeadlineText";

export default function SchoolSetupExplanation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-2xl space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Zap size={14} className="fill-current" />
            System Initialized
          </div>
          <HeadlineText 
            title="Your Dashboard is Ready" 
            subtitle="Your institution is now live on our infrastructure. Here is how you will manage your digital campus." 
          />
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Subdomain */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)" }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:border-indigo-500/30 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Custom Portal</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Your school is isolated on its own subdomain. This ensures data privacy and gives your staff a professional login experience.
            </p>
          </motion.div>

          {/* Card 2: User Management */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)" }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:border-emerald-500/30 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Role Hierarchy</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              The system automatically categorizes users into Teachers, Students, and Parents based on the registration data you provided.
            </p>
          </motion.div>

          {/* Card 3: Multi-Tenancy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.01 }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:border-orange-500/30 md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-8 group"
          >
            <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:rotate-6 transition-transform">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Administrative Oversight</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                From the central dashboard, you can monitor verification requests, track active refresh tokens for security, and manage institutional settings across all departments.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Informational Footer */}
        <div className="flex items-center justify-center gap-4 text-slate-400 dark:text-zinc-600 text-xs">
          <div className="flex items-center gap-1">
            <Settings size={14} />
            Auto-configured
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-800" />
          <div className="flex items-center gap-1">
            <Shield size={14} />
            Encrypted Data
          </div>
        </div>

      </div>
    </div>
  );
}
