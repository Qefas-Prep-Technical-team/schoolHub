"use client";

import React from "react";
import { BookOpen, Award, GraduationCap, ChevronDown } from "lucide-react";
import HeadlineText from "../../_components/HeadlineText";
import ButtonGroup from "../../_components/ButtonGroup";

export default function SubjectSetup() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none mb-6">
            <GraduationCap className="text-white" size={32} />
          </div>
          <HeadlineText 
            title="What do you teach?" 
            subtitle="Tell us your specialty. We'll use this to customize your dashboard and connect you with your students." 
          />
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm space-y-6">
          
          {/* Primary Subject */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 ml-1">
              Primary Subject
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <BookOpen size={20} />
              </div>
              <input 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
                placeholder="e.g. Advanced Mathematics" 
              />
            </div>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 ml-1">
              Academic Department
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                <Award size={20} />
              </div>
              <select className="w-full pl-12 pr-10 py-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                <option disabled selected>Select your department</option>
                <option>Science</option>
                <option>Humanities</option>
                <option>Arts</option>
                <option>Physical Education</option>
                <option>Technology & Engineering</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Helpful Tip */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 flex gap-4 items-start">
            <div className="mt-1 p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <BookOpen className="text-blue-600 dark:text-blue-400" size={16} />
            </div>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
              <strong>Tip:</strong> You can add secondary subjects and specific class sections later in your profile settings.
            </p>
          </div>

          <div className="pt-2">
            <ButtonGroup nextLabel="Continue" />
          </div>
        </div>
      </div>
    </div>
  );
}