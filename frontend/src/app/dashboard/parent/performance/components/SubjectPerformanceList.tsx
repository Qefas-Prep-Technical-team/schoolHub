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
  ArrowUpRight,
  User,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { useChildExams } from '@/lib/api/hooks/useChildExams';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { Skeleton } from '@/components/ui/skeleton';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { cn } from '@/lib/utils';

// Helper to assign icons to subjects
function getSubjectIcon(name: string): React.ComponentType<{ className?: string }> {
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
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
      badgeBg: 'bg-emerald-500',
    };
  }
  if (score >= 70) {
    return {
      label: 'Proficient',
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
      badgeBg: 'bg-blue-500',
    };
  }
  if (score >= 60) {
    return {
      label: 'Developing',
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
      badgeBg: 'bg-amber-500',
    };
  }
  return {
    label: 'Needs Support',
    bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
    badgeBg: 'bg-rose-500',
  };
}

interface EnrolledClassSubject {
  subject?: {
    name?: string;
  };
}

interface StudentGradeRecord {
  score?: number;
  maxMarks?: number;
  subject?: string;
  createdAt?: string;
  subjectPaper?: {
    teacher?: {
      name?: string;
    };
    subject?: {
      name?: string;
    };
  };
}

interface SubjectSummary {
  name: string;
  teacher: string;
  totalScore: number;
  totalMaxMarks: number;
  assessmentCount: number;
  recentDate?: string;
  average: number;
  grade: string;
  tier: {
    label: string;
    bg: string;
    badgeBg: string;
  };
  Icon: React.ComponentType<{ className?: string }>;
}

export default function SubjectPerformanceList() {
  const { selectedChildId } = useParentStore();
  const { data: student, isLoading } = useChildExams(selectedChildId);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');

  // Derive subjects strictly attached to student's department, and fetch every grade attached to them
  const subjectSummaries = useMemo<SubjectSummary[]>(() => {
    if (!student) return [];

    const grades = (student.grades || []) as StudentGradeRecord[];
    const subjectsMap = new Map<string, {
      name: string;
      teacher: string;
      totalScore: number;
      totalMaxMarks: number;
      assessmentCount: number;
      recentDate?: string;
    }>();

    // 1. Collect subjects attached to the department the student is in
    const departmentSubjects = student.department?.subjects || [];
    const hasDeptSubjects = departmentSubjects.length > 0;

    if (hasDeptSubjects) {
      for (const ds of departmentSubjects) {
        const subName = ds.subject?.name;
        if (subName) {
          subjectsMap.set(subName.toLowerCase(), {
            name: subName,
            teacher: 'Subject Instructor',
            totalScore: 0,
            totalMaxMarks: 0,
            assessmentCount: 0,
          });
        }
      }
    } else {
      // Fallback: If student has not yet been assigned a specific department, collect from enrolled class
      const enrolledClass = student.classes?.[0]?.class;
      if (enrolledClass?.subjects) {
        for (const cs of enrolledClass.subjects as EnrolledClassSubject[]) {
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
    }

    // 2. Fetch and aggregate EVERY grade attached to these department subjects
    for (const g of grades) {
      const subjectName = g.subject || g.subjectPaper?.subject?.name;
      if (!subjectName) continue;
      const key = subjectName.toLowerCase();

      // If the student has specific department subjects, ensure grade belongs to their department curriculum
      if (hasDeptSubjects && !subjectsMap.has(key)) {
        continue;
      }

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

    // Convert map to array and compute final averages
    return Array.from(subjectsMap.values()).map((s) => {
      const average = s.totalMaxMarks > 0 
        ? Math.round((s.totalScore / s.totalMaxMarks) * 100) 
        : (s.assessmentCount > 0 ? Math.round(s.totalScore / s.assessmentCount) : 0);
      const grade = s.assessmentCount > 0 ? getGradeLetter(average) : 'N/A';
      const tier = s.assessmentCount > 0 
        ? getPerformanceTier(average) 
        : {
            label: 'Pending Eval',
            bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700',
            badgeBg: 'bg-slate-400',
          };
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
      else if (selectedTier === 'support') matchesTier = s.average < 60 && s.assessmentCount > 0;

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

  const deptTitle = student?.department?.name 
    ? `${student.department.name} Department Curriculum` 
    : 'Curriculum Subjects';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header with Tooltip & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Department Subject Mastery
            </h2>
            <HeaderTooltip
              content={`This analysis evaluates every subject attached to your child's assigned department (${student?.department?.name || 'Department'}). All recorded continuous assessments, test grades, and exam scores are fetched to compute cumulative subject mastery.`}
            />
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5 tracking-wider uppercase flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              {deptTitle}
            </span>
            <span className="size-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
            <span>{subjectSummaries.length} Subject{subjectSummaries.length !== 1 ? 's' : ''} Analyzed</span>
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === 'grid'
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs"
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
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                viewMode === 'list'
                  ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs"
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department subject or instructor..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl py-2 pl-9 pr-9 text-xs sm:text-sm font-semibold text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
          >
            <option value="all">All Tiers ({subjectSummaries.length})</option>
            <option value="mastery">Mastery (80%+)</option>
            <option value="proficient">Proficient (70-79%)</option>
            <option value="developing">Developing (60-69%)</option>
            <option value="support">Needs Support (&lt;60%)</option>
          </select>
        </div>
      </div>

      {/* Grid or List View Rendering */}
      {filteredSubjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 text-center p-6">
          <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching department subjects found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {search ? `No subject matches "${search}".` : 'No department subjects match this status filter.'}
          </p>
          {(search || selectedTier !== 'all') && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSelectedTier('all'); }}
              className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5 animate-in fade-in duration-300">
          {filteredSubjects.map((subject, index) => {
            const Icon = subject.Icon;
            return (
              <div
                key={subject.name}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-orange-500/30 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Top Row: Rank, Icon, Subject Name, Tier Badge */}
                  <div className="flex items-start justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="size-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>
                      <div className="size-9 sm:size-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
                          {subject.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 shrink-0" />
                          <span>{subject.teacher}</span>
                        </p>
                      </div>
                    </div>

                    <span className={cn(
                      "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                      subject.tier.bg
                    )}>
                      {subject.tier.label}
                    </span>
                  </div>

                  {/* Progress Bar & Scores */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Department Mastery
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {subject.assessmentCount > 0 ? `${subject.average}%` : 'N/A'}
                        </span>
                        {subject.assessmentCount > 0 && (
                          <span className="text-xs font-black text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded-md">
                            {subject.grade}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", subject.tier.badgeBg)}
                        style={{ width: `${subject.assessmentCount > 0 ? Math.min(100, Math.max(5, subject.average)) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer: Assessment count + Exam link */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">
                    {subject.assessmentCount} Recorded Assessment{subject.assessmentCount !== 1 ? 's' : ''}
                  </span>
                  <Link
                    href={`/dashboard/parent/exams&results`}
                    className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-0.5 hover:underline text-[11px]"
                  >
                    Exams <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List / Table View */
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[620px]">
              <thead>
                <tr className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
                  <th className="px-3 sm:px-4 py-3.5 w-10 text-center">#</th>
                  <th className="px-4 sm:px-6 py-3.5">Department Subject</th>
                  <th className="px-4 sm:px-6 py-3.5">Instructor</th>
                  <th className="px-4 sm:px-6 py-3.5 text-center">Average Score</th>
                  <th className="px-4 sm:px-6 py-3.5 text-center">Assessments</th>
                  <th className="px-4 sm:px-6 py-3.5 text-center">Mastery Status</th>
                  <th className="px-4 sm:px-6 py-3.5 text-right">Action</th>
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
                      <td className="px-3 sm:px-4 py-3.5 text-center font-bold text-xs text-slate-400 dark:text-slate-500 w-10">
                        {index + 1}
                      </td>

                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors text-xs sm:text-sm">
                            {subject.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {subject.teacher}
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            {subject.assessmentCount > 0 ? `${subject.average}%` : 'N/A'}
                          </span>
                          {subject.assessmentCount > 0 && (
                            <span className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded-md">
                              {subject.grade}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {subject.assessmentCount} Recorded
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-center">
                        <span className={cn(
                          "inline-flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                          subject.tier.bg
                        )}>
                          {subject.tier.label}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-3.5 text-right">
                        <Link
                          href={`/dashboard/parent/exams&results`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-slate-800 transition-all"
                        >
                          Details <ChevronRight className="w-3 h-3" />
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
