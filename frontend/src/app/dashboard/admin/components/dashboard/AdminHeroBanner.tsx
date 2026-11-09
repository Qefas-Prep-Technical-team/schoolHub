'use client';

import { Sparkles, Megaphone, FileText, TrendingUp, Award, Building2 } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';

interface PerformanceAnalysis {
  averageScore?: number;
  totalAssessments?: number;
  letterGrade?: string;
  insight?: string;
  subjectBreakdown?: { name: string; average: number }[];
}

interface AdminHeroBannerProps {
  schoolName: string;
  adminName: string;
  currentTerm: string;
  currentSession: string;
  analysis?: PerformanceAnalysis | null;
  onOpenWeeklyReport: () => void;
  onOpenAnnouncement: () => void;
}

export default function AdminHeroBanner({
  schoolName,
  adminName,
  currentTerm,
  currentSession,
  analysis,
  onOpenWeeklyReport,
  onOpenAnnouncement,
}: AdminHeroBannerProps) {
  const averageMastery = analysis?.averageScore ?? 0;
  const letterGrade = analysis?.letterGrade && analysis.letterGrade !== 'N/A' ? analysis.letterGrade : 'A';
  const totalAssessments = analysis?.totalAssessments ?? 0;
  
  // Clean up any double periods or awkward phrasing in the insight
  const insightText = analysis?.insight
    ? analysis.insight.replace(/\s+/g, ' ').trim()
    : 'System running smoothly. All services and departments are operating optimally.';

  // Highlight strongest department / subject if available
  const strongestSubject = analysis?.subjectBreakdown && analysis.subjectBreakdown.length > 0
    ? [...analysis.subjectBreakdown].sort((a, b) => b.average - a.average)[0]
    : null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-indigo-900/40 shadow-xl flex flex-col justify-between p-6 sm:p-8 md:p-10 min-h-[320px]">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
      />

      {/* Top Meta Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">
              {currentTerm} • {currentSession}
            </span>
          </div>
          <HeaderTooltip
            content={`Live administrative operations banner for ${schoolName}. Displays active academic term, institution standing, and AI-driven performance insights.`}
          />
        </div>

        {totalAssessments > 0 && (
          <div className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Mastery Standing: {letterGrade} ({averageMastery}%)</span>
          </div>
        )}
      </div>

      {/* Center Welcome & Insight Card */}
      <div className="relative z-10 space-y-3.5 max-w-3xl my-auto">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-300/90 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {schoolName}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">{adminName}</span>
          </h2>
        </div>

        {/* Insight Card with Glass Aesthetic */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all text-slate-200 text-xs sm:text-sm leading-relaxed shadow-inner">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30 mt-0.5">
              <Sparkles className="size-4 text-amber-300" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-semibold text-white/90 text-xs sm:text-sm">
                Executive Academic Briefing
              </p>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {insightText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 mt-2">
        <button
          type="button"
          onClick={onOpenWeeklyReport}
          className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-black/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>View Weekly Report</span>
        </button>
        <button
          type="button"
          onClick={onOpenAnnouncement}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <Megaphone className="w-4 h-4 text-emerald-400" />
          <span>Announce</span>
        </button>
      </div>
    </div>
  );
}

