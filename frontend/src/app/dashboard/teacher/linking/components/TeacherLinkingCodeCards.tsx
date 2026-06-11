import React from 'react';
import { ShieldCheck, Copy, School, Sparkles } from 'lucide-react';

interface TeacherLinkingCodeCardsProps {
  personalCode?: string;
  schoolCode?: string;
  onCopy: (text: string) => void;
  isPersonal: boolean;
}

export function TeacherLinkingCodeCards({ personalCode, schoolCode, onCopy, isPersonal }: TeacherLinkingCodeCardsProps) {
  return (
    <div className={`grid grid-cols-1 ${isPersonal || !schoolCode ? 'max-w-xl mx-auto' : 'md:grid-cols-2'} gap-4 pb-2 w-full`}>

      {/* ── Personal / Teacher Code Card ── */}
      {isPersonal && (
        <div className="
          relative group overflow-hidden rounded-2xl
          bg-gradient-to-br from-primary via-primary to-violet-600
          dark:from-indigo-600 dark:via-violet-700 dark:to-indigo-800
          p-px shadow-lg shadow-primary/20 dark:shadow-indigo-500/20
          active:scale-[0.99] transition-all duration-300
        ">
          <div className="relative rounded-[0.95rem] overflow-hidden px-4 py-4
            bg-gradient-to-br from-primary/95 via-primary to-violet-600/90
            dark:from-indigo-600/90 dark:via-violet-700/85 dark:to-indigo-800/90
          ">
            {/* Ambient glows */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 dark:bg-indigo-300/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-violet-300/10 dark:bg-violet-400/10 blur-xl pointer-events-none" />

            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none group-hover:via-white/10 transition-all duration-700" />

            {/* Decorative sparkle */}
            <div className="absolute top-2 right-3 opacity-10 dark:opacity-[0.07] pointer-events-none">
              <Sparkles size={40} className="text-white" />
            </div>

            {/* Single-row layout: icon+label | code+copy */}
            <div className="flex items-center justify-between gap-4 relative z-10">
              {/* Left: icon + label */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/20 group-hover:rotate-6 transition-transform duration-500">
                  <ShieldCheck className="text-white drop-shadow-sm" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight leading-tight">Teacher Code</h3>
                  <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest leading-tight">Personal</p>
                </div>
              </div>

              {/* Right: code pill + copy */}
              <div className="flex items-center gap-2">
                <div className="
                  bg-white/10 dark:bg-black/20 backdrop-blur-xl
                  px-4 py-1.5 rounded-xl
                  border border-white/15 dark:border-white/10
                  shadow-md flex items-center justify-center
                  group-hover:bg-white/15 dark:group-hover:bg-black/30
                  transition-all duration-300
                ">
                  <span className="text-base font-black tracking-widest text-white drop-shadow-sm whitespace-nowrap">
                    {personalCode || '···'}
                  </span>
                </div>
                <button
                  onClick={() => onCopy(personalCode || '')}
                  className="
                    h-8 w-8 rounded-xl flex items-center justify-center cursor-pointer shrink-0
                    bg-white text-primary
                    dark:bg-white/90 dark:text-indigo-700
                    shadow-md shadow-black/15
                    hover:scale-110 active:scale-95
                    transition-all duration-200
                  "
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── School Code Card ── */}
      {!isPersonal && schoolCode && (
        <div className="
          relative group overflow-hidden rounded-2xl
          bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700
          dark:from-slate-800 dark:via-indigo-900 dark:to-slate-900
          p-px shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10
          active:scale-[0.99] transition-all duration-300
          dark:border dark:border-indigo-500/20
        ">
          <div className="relative rounded-[0.95rem] overflow-hidden px-4 py-4
            bg-gradient-to-br from-indigo-600/95 via-indigo-700/90 to-violet-700/85
            dark:from-slate-800/95 dark:via-indigo-900/90 dark:to-slate-900/95
          ">
            {/* Ambient glows */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-indigo-300/15 dark:bg-indigo-400/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-violet-400/10 dark:bg-violet-500/10 blur-xl pointer-events-none" />

            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none group-hover:via-white/8 transition-all duration-700" />

            {/* Decorative sparkle */}
            <div className="absolute top-2 right-3 opacity-10 dark:opacity-[0.06] pointer-events-none">
              <Sparkles size={40} className="text-white" />
            </div>

            {/* Single-row layout */}
            <div className="flex items-center justify-between gap-4 relative z-10">
              {/* Left: icon + label */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/20 group-hover:-rotate-6 transition-transform duration-500">
                  <School className="text-white drop-shadow-sm" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight leading-tight">School Code</h3>
                  <p className="text-[9px] font-bold text-indigo-100/60 dark:text-indigo-300/50 uppercase tracking-widest leading-tight">Active Context</p>
                </div>
              </div>

              {/* Right: code pill + copy */}
              <div className="flex items-center gap-2">
                <div className="
                  bg-white/10 dark:bg-black/25 backdrop-blur-xl
                  px-4 py-1.5 rounded-xl
                  border border-white/15 dark:border-indigo-400/20
                  shadow-md flex items-center justify-center
                  group-hover:bg-white/15 dark:group-hover:bg-black/35
                  transition-all duration-300
                ">
                  <span className="text-base font-black tracking-widest text-white drop-shadow-sm whitespace-nowrap">
                    {schoolCode}
                  </span>
                </div>
                <button
                  onClick={() => onCopy(schoolCode)}
                  className="
                    h-8 w-8 rounded-xl flex items-center justify-center cursor-pointer shrink-0
                    bg-white text-indigo-600
                    dark:bg-indigo-400/20 dark:text-indigo-200
                    dark:border dark:border-indigo-400/30
                    shadow-md shadow-black/15
                    hover:scale-110 active:scale-95
                    transition-all duration-200
                    dark:hover:bg-indigo-400/30
                  "
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
