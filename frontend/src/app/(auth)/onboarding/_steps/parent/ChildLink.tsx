"use client";

import React from "react";
import { UserPlus, ShieldCheck, Search, Info } from "lucide-react";
import ButtonGroup from "../../_components/ButtonGroup";
import HeadlineText from "../../_components/HeadlineText";

export default function ChildLink() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        
        {/* Connection Visual */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
            <UserPlus className="text-slate-400" size={24} />
          </div>
          <div className="h-[2px] w-12 bg-gradient-to-r from-slate-200 via-blue-400 to-slate-200 dark:from-zinc-800 dark:via-blue-500 dark:to-zinc-800" />
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
            <ShieldCheck className="text-white" size={24} />
          </div>
        </div>

        <div className="text-center mb-8">
          <HeadlineText 
            title="Link Your Children" 
            subtitle="Connect your parent account to your child's academic records using their secure Student Code." 
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Student Identification Code
              </label>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                REQUIRED
              </span>
            </div>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={20} />
              </div>
              <input 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-black focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono tracking-widest uppercase placeholder:tracking-normal placeholder:font-sans" 
                placeholder="STU-XXX-XXX" 
              />
            </div>
          </div>

          {/* Validation Notice */}
          <div className="flex gap-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
            <Info className="text-amber-600 dark:text-amber-500 shrink-0" size={18} />
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
              For security, the school administrator must approve this link before you can access grades and attendance data.
            </p>
          </div>

          <div className="pt-2">
            <ButtonGroup nextLabel="Verify & Link Account" />
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-zinc-500 italic">
          Multiple children? You can link additional accounts from your dashboard settings later.
        </p>
      </div>
    </div>
  );
}