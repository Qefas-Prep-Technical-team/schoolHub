"use client";

import { Hammer, Sparkles, MessageSquare } from "lucide-react";

export default function SharedSupportCenter() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 mb-6 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm animate-bounce-slow">
          <MessageSquare className="h-10 w-10 text-indigo-500" />
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Coming Soon</h2>
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
        </div>
        
        <p className="text-slate-500 font-medium max-w-md mx-auto text-lg leading-relaxed mb-8">
          We're currently building a world-class support center. Soon you'll be able to create tickets, chat with our team, and track your requests right here!
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <Hammer className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Under Construction</span>
        </div>
      </div>
    </div>
  );
}
