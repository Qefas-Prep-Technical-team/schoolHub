"use client";

import React from "react";
import {
  Hash,
  Sparkles,
  Users,
  Shield,
  LayoutDashboard,
  ArrowRight,
  Zap,
  Settings,
} from "lucide-react";
import ButtonGroup from "../../_components/ButtonGroup";

export default function ClassJoin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-2xl space-y-10">

        {/* Icon Header */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-3xl rotate-6" />
          <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-500 rounded-3xl -rotate-3 shadow-lg flex items-center justify-center">
            <Hash className="text-white" size={40} />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1.5 shadow-md">
            <Sparkles className="text-white" size={16} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">
            <Zap size={14} className="fill-current" />
            Classroom Access
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How Classroom Access Works
          </h1>

          <p className="text-sm md:text-base text-slate-500 dark:text-zinc-400 leading-relaxed">
            Your profile connects securely to your school using a unique institutional access code.
            Here’s what happens behind the scenes.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Secure Linking */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Secure Profile Linking
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Each student or teacher account is securely matched to their institution
              using encrypted access credentials.
            </p>
          </div>

          {/* Automatic Sync */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Automatic Class Sync
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Once connected, your dashboard instantly displays your assigned
              classes, subjects, and relevant academic tools.
            </p>
          </div>

          {/* Dashboard Integration */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all md:col-span-2 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Instant Dashboard Activation
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                Your dashboard dynamically updates to reflect your institution’s
                structure — giving you immediate access to the right resources.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-slate-400 dark:text-zinc-600 text-xs">
          <div className="flex items-center gap-1">
            <Settings size={14} />
            Auto-synced
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-800" />
          <div className="flex items-center gap-1">
            <Shield size={14} />
            Encrypted Connection
          </div>
        </div>
        {/* Optional Secondary Action */}
        <button className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mx-auto">
          Learn more about access codes
          <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
}
