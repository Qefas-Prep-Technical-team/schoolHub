"use client";

import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Zap,
  Settings,
  Shield,
} from "lucide-react";
import ButtonGroup from "../../_components/ButtonGroup";

export default function SubjectSetup() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-2xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Zap size={14} className="fill-current" />
            Teaching Workspace Ready
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              How Your Teaching Dashboard Works
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 leading-relaxed">
              Everything you need to manage classes, students, and academic performance is organized
              inside your personal dashboard.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <BookOpen size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Your Assigned Classes</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Access your subjects and class sections instantly. Upload materials, manage attendance,
              and structure lessons efficiently.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Student Management</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              View enrolled students, track participation, manage submissions, and communicate with
              learners seamlessly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Performance Insights</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Monitor grades, assessment trends, and academic progress through structured
              performance analytics.
            </p>
          </div>
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Performance Insights</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Monitor grades, assessment trends, and academic progress through structured
              performance analytics.
            </p>
          </div>

          {/* Wide Card */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Centralized Control Panel</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Attendance, grading, materials, and communication are all managed from one unified
                dashboard — no switching tools, no confusion.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-slate-400 dark:text-zinc-600 text-xs">
          <div className="flex items-center gap-1">
            <Settings size={14} />
            Auto-configured
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-800" />
          <div className="flex items-center gap-1">
            <Shield size={14} />
            Secure & Private
          </div>
        </div>

       
      </div>
    </div>
  );
}
