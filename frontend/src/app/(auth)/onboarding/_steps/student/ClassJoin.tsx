"use client";

import React from "react";
import { Hash, Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import ButtonGroup from "../../_components/ButtonGroup";
import HeadlineText from "../../_components/HeadlineText";

export default function ClassJoin() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        
        {/* Animated Icon Header */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-3xl rotate-6" />
          <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-500 rounded-3xl -rotate-3 shadow-lg flex items-center justify-center">
            <Hash className="text-white" size={40} />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1.5 shadow-md">
            <Sparkles className="text-white" size={16} />
          </div>
        </div>

        <div className="text-center mb-10">
          <HeadlineText 
            title="Join Your Classroom" 
            subtitle="Enter your unique Student or Teacher code to sync your profile with your institution." 
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-center uppercase tracking-widest text-slate-400">
                Access Code
              </label>
              <div className="relative">
                <input 
                  className="w-full p-6 text-center text-3xl font-mono tracking-[0.5em] rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 focus:border-indigo-500 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700" 
                  placeholder="------" 
                  maxLength={10}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-zinc-500">
                <HelpCircle size={14} />
                <p className="text-xs italic">Codes are provided by your school administrator.</p>
              </div>
            </div>

            <div className="pt-4">
              <ButtonGroup nextLabel="Join Classroom" />
            </div>
          </div>
        </div>

        {/* Alternative Action */}
        <button className="mt-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mx-auto">
          I don&apos;t have a code yet
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}