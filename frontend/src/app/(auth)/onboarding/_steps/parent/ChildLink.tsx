"use client";

import React from "react";
import {
  UserPlus,
  ShieldCheck,
  Search,
  Info,
  Zap,
  Settings,
  Shield,
  Users,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import ButtonGroup from "../../_components/ButtonGroup";

export default function ChildLink() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-2xl space-y-10">
        {/* Connection Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center justify-center gap-6"
        >
          <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
            <UserPlus className="text-slate-400" size={28} />
          </div>
          <div className="relative h-[2px] w-16 overflow-hidden">
             <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-800" />
             <motion.div 
               animate={{ x: ["-100%", "100%"] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
             />
          </div>
          <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
            <ShieldCheck className="text-white" size={28} />
          </div>
        </motion.div>

        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest"
          >
            <Zap size={14} className="fill-current" />
            Parent Access
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How Parent Linking Works
          </h1>

          <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 leading-relaxed">
            Parents don’t need to manage complex setups. The system securely connects you to your
            child’s academic records — only after the school approves the relationship.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)" }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:border-indigo-500/30 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Student Code Matching</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Each student has a unique identification code. That code is used to locate the correct
              student record inside the school’s database.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)" }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:border-emerald-500/30 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">School Approval Layer</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              For privacy and safety, the school administrator must approve the link before grades,
              attendance, and reports become visible.
            </p>
          </motion.div>

          {/* Wide Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:border-orange-500/30 md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-8 group"
          >
            <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:rotate-6 transition-transform">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">One Parent Dashboard</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Once approved, your dashboard becomes your child’s academic hub — performance,
                attendance, announcements, and progress tracking in one place.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Approval Notice (kept as explanation) */}
        <div className="flex gap-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
          <Info className="text-amber-600 dark:text-amber-500 shrink-0" size={18} />
          <p className="text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
            Security note: Parent access is always verified by the institution. This prevents
            unauthorized access to student information.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-slate-400 dark:text-zinc-600 text-xs">
          <div className="flex items-center gap-1">
            <Settings size={14} />
            Manage later
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-800" />
          <div className="flex items-center gap-1">
            <Users size={14} />
            Supports multiple children
          </div>
        </div>

       

        <p className="text-center text-xs text-slate-400 dark:text-zinc-500 italic">
          Multiple children? You can link additional accounts from your dashboard settings later.
        </p>
      </div>
    </div>
  );
}
