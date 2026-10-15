'use client';

import React from 'react';
import { ShieldCheck, Copy, School, Sparkles } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface TeacherLinkingCodeCardsProps {
  personalCode?: string;
  schoolCode?: string;
  onCopy: (text: string) => void;
  isPersonal: boolean;
}

export function TeacherLinkingCodeCards({
  personalCode,
  schoolCode,
  onCopy,
  isPersonal,
}: TeacherLinkingCodeCardsProps) {
  return (
    <div className={`grid grid-cols-1 ${isPersonal || !schoolCode ? 'max-w-2xl mx-auto' : 'md:grid-cols-2'} gap-3 sm:gap-4 pb-2 w-full`}>
      {/* Personal / Teacher Code Card */}
      {isPersonal && (
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 dark:from-emerald-700 dark:via-emerald-800 dark:to-teal-900 p-px shadow-md shadow-emerald-500/10 active:scale-[0.99] transition-all">
          <div className="relative rounded-[0.95rem] overflow-hidden p-3.5 sm:p-4 bg-gradient-to-br from-emerald-600/95 via-emerald-600 to-teal-700/90 dark:from-emerald-700/90 dark:via-emerald-800/85 dark:to-teal-900/90">
            {/* Ambient glows */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-teal-300/10 blur-xl pointer-events-none" />

            {/* Decorative sparkle */}
            <div className="absolute top-2 right-3 opacity-15 pointer-events-none">
              <Sparkles size={36} className="text-white" />
            </div>

            {/* Content row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              {/* Left: icon + label */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/25">
                  <ShieldCheck className="text-white drop-shadow-sm" size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-white tracking-tight leading-tight">
                      Teacher Code
                    </h3>
                    <HeaderTooltip
                      content="Share this unique teacher linking code with students or parents. Submitting this code connects their account directly to your classroom."
                      size={12}
                      className="text-white/80 hover:text-white"
                    />
                  </div>
                  <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest leading-tight mt-0.5">
                    Personal Classroom
                  </p>
                </div>
              </div>

              {/* Right: code pill + copy button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="bg-white/15 dark:bg-black/30 backdrop-blur-xl px-3 sm:px-4 py-1.5 rounded-xl border border-white/20 dark:border-white/10 shadow-inner flex items-center justify-center flex-1 sm:flex-none">
                  <span className="text-sm sm:text-base font-black tracking-widest text-white drop-shadow-sm whitespace-nowrap">
                    {personalCode || '···'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onCopy(personalCode || '')}
                  className="h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer shrink-0 bg-white text-emerald-700 shadow-md hover:scale-105 active:scale-95 transition-all"
                  aria-label="Copy Teacher Code"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* School Code Card */}
      {!isPersonal && schoolCode && (
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-slate-800 dark:via-emerald-950 dark:to-slate-900 p-px shadow-md shadow-emerald-500/10 active:scale-[0.99] transition-all">
          <div className="relative rounded-[0.95rem] overflow-hidden p-3.5 sm:p-4 bg-gradient-to-br from-emerald-600/95 via-emerald-700/90 to-teal-800/85 dark:from-slate-800/95 dark:via-emerald-950/90 dark:to-slate-900/95">
            {/* Ambient glows */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-emerald-300/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

            {/* Decorative sparkle */}
            <div className="absolute top-2 right-3 opacity-15 pointer-events-none">
              <Sparkles size={36} className="text-white" />
            </div>

            {/* Content row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              {/* Left: icon + label */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/25">
                  <School className="text-white drop-shadow-sm" size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-black text-white tracking-tight leading-tight">
                      School Code
                    </h3>
                    <HeaderTooltip
                      content="Institutional organization linking code representing your active school campus. Used for school-wide enrollment and multi-class cohorts."
                      size={12}
                      className="text-white/80 hover:text-white"
                    />
                  </div>
                  <p className="text-[9px] font-bold text-emerald-100/70 dark:text-emerald-300/60 uppercase tracking-widest leading-tight mt-0.5">
                    Active Context
                  </p>
                </div>
              </div>

              {/* Right: code pill + copy button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="bg-white/15 dark:bg-black/30 backdrop-blur-xl px-3 sm:px-4 py-1.5 rounded-xl border border-white/20 dark:border-emerald-400/20 shadow-inner flex items-center justify-center flex-1 sm:flex-none">
                  <span className="text-sm sm:text-base font-black tracking-widest text-white drop-shadow-sm whitespace-nowrap">
                    {schoolCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onCopy(schoolCode)}
                  className="h-9 w-9 rounded-xl flex items-center justify-center cursor-pointer shrink-0 bg-white text-emerald-700 shadow-md hover:scale-105 active:scale-95 transition-all"
                  aria-label="Copy School Code"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
