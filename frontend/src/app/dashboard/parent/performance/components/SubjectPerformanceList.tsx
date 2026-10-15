"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Beaker, 
  BookOpen, 
  Palette, 
  History, 
  Dumbbell, 
  Globe, 
  Music, 
  Code, 
  Compass, 
  GraduationCap, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  ArrowUpRight 
} from 'lucide-react';
import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { Skeleton } from '@/components/ui/skeleton';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { cn } from '@/lib/utils';

// Helper to assign icons to subjects
function getSubjectIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('math') || n.includes('arithmetic') || n.includes('calculus')) return Calculator;
  if (n.includes('sci') || n.includes('physic') || n.includes('chem') || n.includes('bio')) return Beaker;
  if (n.includes('eng') || n.includes('lit') || n.includes('read') || n.includes('grammar')) return BookOpen;
  if (n.includes('art') || n.includes('draw') || n.includes('design')) return Palette;
  if (n.includes('hist') || n.includes('gov') || n.includes('civic') || n.includes('social')) return History;
  if (n.includes('pe') || n.includes('phys') || n.includes('sport') || n.includes('gym')) return Dumbbell;
  if (n.includes('geo') || n.includes('econ') || n.includes('commerce')) return Compass;
  if (n.includes('music') || n.includes('audio')) return Music;
  if (n.includes('comp') || n.includes('tech') || n.includes('coding') || n.includes('ict')) return Code;
  if (n.includes('french') || n.includes('spanish') || n.includes('yoruba') || n.includes('igbo') || n.includes('hausa')) return Globe;
  return GraduationCap;
}

function getGradeLetter(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function getPerformanceTier(score: number) {
  if (score >= 80) {
    return {
      label: 'Mastery',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
      badgeBg: 'bg-emerald-500',
    };
  }
  if (score >= 70) {
    return {
      label: 'Proficient',
      bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
      badgeBg: 'bg-blue-500',
    };
  }
  if (score >= 60) {
    return {
      label: 'Developing',
      bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
      badgeBg: 'bg-amber-500',
    };
  }
  return {
    label: 'Needs Support',
    bg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
    badgeBg: 'bg-rose-500',
  };
}

export default function SubjectPerformanceList() {
  const { selectedChildId } = useParentStore();
  const { data: student, isLoading } = useChildExams(selectedChildId);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');

  // Derive all eligible subjects and aggregated stats for this student
  const subjectSummaries = useMemo(() => {
    if (!student) return [];

    const grades = student.grades || [];
    const subjectsMap = new Map<string, {
      name: string;
      teacher: string;
      totalScore: number;
      totalMaxMarks: number;
      assessmentCount: number;
      recentDate?: string;
    }>();

    // 1. Collect subjects from student's enrolled class
    const enrolledClass = student.classes?.[0]?.class;
    if (enrolledClass?.subjects) {
      for (const cs of enrolledClass.subjects) {
        if (cs.subject?.name) {
          subjectsMap.set(cs.subject.name.toLowerCase(), {
            name: cs.subject.name,
            teacher: 'Subject Instructor',
            totalScore: 0,
            totalMaxMarks: 0,
            assessmentCount: 0,
          });
        }
      }
    }

    // 2. Aggregate student's actual grades across their subjects
    for (const g of grades) {
      const subjectName = g.subject || g.subjectPaper?.subject?.name;
      if (!subjectName) continue;
      const key = subjectName.toLowerCase();
      const existing = subjectsMap.get(key) || {
        name: subjectName,
        teacher: g.subjectPaper?.teacher?.name || 'Class Teacher',
        totalScore: 0,
        totalMaxMarks: 0,
        assessmentCount: 0,
      };

      if (g.subjectPaper?.teacher?.name) {
        existing.teacher = g.subjectPaper.teacher.name;
      }
      existing.totalScore += Number(g.score || 0);
      existing.totalMaxMarks += Number(g.maxMarks || 100);
      existing.assessmentCount += 1;
      existing.recentDate = g.createdAt;

      subjectsMap.set(key, existing);
    }

    // Convert map to array and compute averages
    return Array.from(subjectsMap.values()).map((s) => {
      const average = s.totalMaxMarks > 0 
        ? Math.round((s.totalScore / s.totalMaxMarks) * 100) 
        : (s.assessmentCount > 0 ? Math.round(s.totalScore / s.assessmentCount) : 0);
      const grade = getGradeLetter(average);
      const tier = getPerformanceTier(average);
      const Icon = getSubjectIcon(s.name);

      return {
        ...s,
        average,
        grade,
        tier,
        Icon,
      };
    });
  }, [student]);

  const filteredSubjects = useMemo(() => {
    return subjectSummaries.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(search.toLowerCase());
      const teacherMatch = s.teacher.toLowerCase().includes(search.toLowerCase());
      const matchesSearch = !search || nameMatch || teacherMatch;

      let matchesTier = true;
      if (selectedTier === 'mastery') matchesTier = s.average >= 80;
      else if (selectedTier === 'proficient') matchesTier = s.average >= 70 && s.average < 80;
      else if (selectedTier === 'developing') matchesTier = s.average >= 60 && s.average < 70;
      else if (selectedTier === 'support') matchesTier = s.average < 60;

      return matchesSearch && matchesTier;
    });
  }, [subjectSummaries, search, selectedTier]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header with Tooltip & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Subject Mastery Breakdown
            </h3>
            <HeaderTooltip
              content="This breakdown calculates cumulative mastery across every subject your child is actively enrolled in. Scores reflect verified quizzes, continuous assessments, and examinations. Toggle between Grid and List views to analyze subject averages, compare performance tiers, and inspect teacher assignments."
            />
          </div>
          <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
            {subjectSummaries.length} Enrolled Subject{subjectSummaries.length !== 1 ? 's' : ''} in Curriculum
          </p>
        </div>

        {/* View Mode Toggle (Grid is default) */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'grid'
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                viewMode === 'list'
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enrolled subject or teacher..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 border-none rounded-xl py-2 pl-9 pr-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border-none rounded-xl py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
          >
            <option value="all">All Tiers</option>
            <option value="mastery">Mastery (80%+)</option>
            <option value="proficient">Proficient (70-79%)</option>
            <option value="developing">Developing (60-69%)</option>
            <option value="support">Needs Support (&lt;60%)</option>
          </select>
        </div>
      </div>

      {/* Grid or List View Rendering */}
      {filteredSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-bold text-slate-500">No matching subjects found</p>
          <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query or filter</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View (Default) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in duration-300">
          {filteredSubjects.map((subject, index) => {
            const Icon = subject.Icon;
            return (
              <div
                key={subject.name}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-orange-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="size-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-black text-slate-500 flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
                          {subject.name}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {subject.teacher}
                        </p>
                      </div>
                    </div>

                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                      subject.tier.bg
                    )}>
                      {subject.tier.label}
                    </span>
                  </div>

                  {/* Progress Bar & Scores */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Cumulative Average
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {subject.average}%
                        </span>
                        <span className="text-xs font-black text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.2 rounded-md">
                          {subject.grade}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", subject.tier.badgeBg)}
                        style={{ width: `${Math.min(100, Math.max(5, subject.average))}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{subject.assessmentCount} Recorded Assessment{subject.assessmentCount !== 1 ? 's' : ''}</span>
                  <Link
                    href={`/dashboard/parent/exams&results`}
                    className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-0.5 hover:underline"
                  >
                    Exams <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Table View with Numbering */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
                  <th className="px-3 sm:px-4 py-4 w-12 text-center">#</th>
                  <th className="px-4 sm:px-6 py-4">Subject</th>
                  <th className="px-4 sm:px-6 py-4">Teacher</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Average Score</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Assessments</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Status Tier</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSubjects.map((subject, index) => {
                  const Icon = subject.Icon;
                  return (
                    <tr
                      key={subject.name}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Numbering */}
                      <td className="px-3 sm:px-4 py-4 text-center font-bold text-xs text-slate-400 dark:text-slate-500 w-12">
                        {index + 1}
                      </td>

                      {/* Subject */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                            {subject.name}
                          </span>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {subject.teacher}
                      </td>

                      {/* Average */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {subject.average}%
                          </span>
                          <span className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded-md">
                            {subject.grade}
                          </span>
                        </div>
                      </td>

                      {/* Assessments Count */}
                      <td className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {subject.assessmentCount} Tests
                      </td>

                      {/* Tier Badge */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                          subject.tier.bg
                        )}>
                          {subject.tier.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/parent/exams&results`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all"
                        >
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
