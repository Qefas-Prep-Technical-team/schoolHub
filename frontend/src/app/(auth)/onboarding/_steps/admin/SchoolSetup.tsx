"use client";

import React from "react";
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Subdomain */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Custom Portal</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Your school is isolated on its own subdomain. This ensures data privacy and gives your staff a professional login experience.
            </p>
          </div>

          {/* Card 2: User Management */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Role Hierarchy</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              The system automatically categorizes users into Teachers, Students, and Parents based on the registration data you provided.
            </p>
          </div>

          {/* Card 3: Multi-Tenancy */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Administrative Oversight</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                From the central dashboard, you can monitor verification requests, track active refresh tokens for security, and manage institutional settings across all departments.
              </p>
            </div>
          </div>
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