"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Clock,
  Flame,
  BookMarked,
  Award,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { useUserStore } from '@/store/useUserStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useLinkProfile } from '@/lib/api/hooks/useLinks';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useMyPublishedResults } from '@/lib/api/hooks/useRecords';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StudentConnectionModal } from './components/StudentConnectionModal';
import { StudentClassSelectionModal } from './components/StudentClassSelectionModal';
import AcademicHistory, { HistoryAttempt } from './components/dashboard/AcademicHistory';
import PerformanceTrend, { PerformanceAttempt, PerformanceGrade } from './components/dashboard/PerformanceTrend';
import LatestAssignmentsCard from './components/dashboard/LatestAssignmentsCard';
import PrefectCelebration from './components/PrefectCelebration';
import PrefectRoleBanner from './components/PrefectRoleBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HeaderTooltip } from './components/dashboard/HeaderTooltip';

interface SubjectAttemptRecord {
  score: number;
  subjectPaper: {
    totalMarks: number;
    subject: {
      name: string;
    };
  };
}

interface RawExamAttempt {
  id: string;
  totalScore: number;
  totalMarks?: number;
  submittedAt?: string | Date;
  exam?: {
    id?: string;
    title?: string;
  };
  subjectAttempts?: SubjectAttemptRecord[];
}

interface RawGradeRecord {
  id?: string;
  subject?: string;
  score: number;
  maxMarks?: number;
  dateLogged?: string | Date;
  createdAt?: string | Date;
}

interface ClassSubjectItem {
  id?: string;
  name?: string;
  category?: string;
  subject?: {
    name?: string;
    category?: string;
  };
}

export default function StudentHomeDashboard() {
  const { username } = useUserStore();
  const { user } = useAuthStore();
  const { data: attemptsData, isLoading: isLoadingExams } = useStudentExamAttempts();
  const { data: standaloneGradesData } = useGrades();
  const { data: profileResponse } = useLinkProfile();
  const { data: studentProfile, isLoading: isLoadingProfile } = useStudentProfile();
  const { data: publishedResultsData } = useMyPublishedResults();
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isClassSelectionModalOpen, setIsClassSelectionModalOpen] = useState(false);

  const attempts: RawExamAttempt[] = (attemptsData?.attempts as RawExamAttempt[]) || [];
  const standaloneGrades: RawGradeRecord[] = (standaloneGradesData?.grades as RawGradeRecord[]) || [];
  const studentCode = profileResponse?.data?.linkingCode || "";

  const connectedSchool = studentProfile?.school || (studentProfile?.schoolId ? { id: studentProfile.schoolId, name: 'Connected School' } : null);
  const isEnrolledInClass = Boolean(studentProfile?.classes && studentProfile.classes.length > 0);

  const rawStatus = String(studentProfile?.status || (user as any)?.status || "").toUpperCase();
  const isGraduated = Boolean(
    rawStatus === "GRADUATED" ||
    rawStatus === "ALUMNI" ||
    studentProfile?.isAlumni ||
    (user as any)?.isAlumni ||
    (studentProfile as unknown as Record<string, unknown>)?.graduationStatus?.toString().toUpperCase() === "GRADUATED"
  );

  // Only display if a new final result was published in the last 7 days
  const hasRecentFinalResults = useMemo(() => {
    if (!Array.isArray(publishedResultsData) || publishedResultsData.length === 0) {
      return false;
    }

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return publishedResultsData.some((group: Record<string, any>) => {
      // Check individual subject results in this published group
      const subjectResults = group.subjectResults;
      if (Array.isArray(subjectResults) && subjectResults.length > 0) {
        return subjectResults.some((r: Record<string, any>) => {
          const rawDate = r.releaseDate || r.updatedAt || r.createdAt;
          if (!rawDate) return false;
          const time = new Date(rawDate).getTime();
          if (isNaN(time)) return false;
          const diff = now - time;
          return diff >= 0 && diff <= SEVEN_DAYS_MS;
        });
      }

      // Check group-level timestamps as fallback
      const groupDate = group.releaseDate || group.updatedAt || group.createdAt;
      if (groupDate) {
        const time = new Date(groupDate).getTime();
        if (!isNaN(time)) {
          const diff = now - time;
          return diff >= 0 && diff <= SEVEN_DAYS_MS;
        }
      }

      return false;
    });
  }, [publishedResultsData]);

  const activeClass = studentProfile?.classes?.[0]?.class;
  const enrolledSubjectsCount = activeClass?.subjects?.length || 0;

  const prefectRole = studentProfile?.prefectRole;
  const hasSeenCelebration = studentProfile?.hasSeenPrefectCelebration ?? true;

  // AI Analysis Logic
  const analysis = useMemo(() => {
    if (!attempts || attempts.length === 0) return null;

    const subjectsMap: Record<string, { total: number; score: number; count: number }> = {};

    attempts.forEach((attempt) => {
      attempt.subjectAttempts?.forEach((sa) => {
        const subName = sa.subjectPaper?.subject?.name;
        if (!subName) return;
        if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
        subjectsMap[subName].score += sa.score;
        subjectsMap[subName].total += sa.subjectPaper?.totalMarks || 100;
        subjectsMap[subName].count += 1;
      });
    });

    standaloneGrades.forEach((grade) => {
      const subName = grade.subject;
      if (!subName) return;
      if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
      subjectsMap[subName].score += grade.score;
      subjectsMap[subName].total += grade.maxMarks || 100;
      subjectsMap[subName].count += 1;
    });

    const chartData = Object.entries(subjectsMap).map(([name, data]) => ({
      subject: name,
      A: Math.round((data.score / (data.total || 1)) * 100),
      fullMark: 100,
    }));

    if (chartData.length === 0) return null;

    const sortedSubjects = [...chartData].sort((a, b) => a.A - b.A);
    const weakest = sortedSubjects[0];
    const strongest = sortedSubjects[sortedSubjects.length - 1];

    let advice = "";
    if (weakest.A < 40) advice = `You need to put more effort into ${weakest.subject}. We recommend practicing past questions before your next assessment.`;
    else if (weakest.A < 50) advice = `Your performance in ${weakest.subject} is at a Pass level. Revise foundational topics to boost your score.`;
    else if (weakest.A < 75) advice = `You are performing steadily in ${weakest.subject}. A little extra focus will secure you an A distinction.`;
    else advice = `Outstanding mastery in ${weakest.subject}! Maintain your consistent study routine.`;

    const overallMastery = Math.round(chartData.reduce((acc, curr) => acc + curr.A, 0) / chartData.length);

    return { chartData, weakest, strongest, advice, overallMastery };
  }, [attempts, standaloneGrades]);

  const gpa = useMemo(() => {
    if (attempts.length === 0 && standaloneGrades.length === 0) return "0.00";
    let totalWeight = 0;
    let totalPoints = 0;
    const getPoints = (percent: number) => {
      if (percent >= 75) return 5.0;
      if (percent >= 70) return 4.0;
      if (percent >= 65) return 3.5;
      if (percent >= 50) return 3.0;
      if (percent >= 45) return 2.0;
      if (percent >= 40) return 1.0;
      return 0.0;
    };
    attempts.forEach((a) => {
      const p = (a.totalScore / (a.totalMarks || 1)) * 100;
      totalPoints += getPoints(p);
      totalWeight += 1;
    });
    standaloneGrades.forEach((g) => {
      const p = (g.score / (g.maxMarks || 1)) * 100;
      totalPoints += getPoints(p);
      totalWeight += 1;
    });
    return totalWeight > 0 ? (totalPoints / totalWeight).toFixed(2) : "0.00";
  }, [attempts, standaloneGrades]);

  // Derived data for UI layout
  const latestAttempt = attempts[0];
  const enrolledSubjectsList = (activeClass?.subjects as ClassSubjectItem[]) || [];
  const displaySubjects = enrolledSubjectsList.map((sub, i) => ({
    id: sub.id || String(i),
    name: sub.subject?.name || sub.name || "Subject",
    category: sub.subject?.category || sub.category || "GENERAL",
  }));

  if (isLoadingExams || isLoadingProfile) {
    return (
      <div className="w-full space-y-6 sm:space-y-8 animate-pulse">
        <div className="h-[240px] sm:h-[300px] w-full rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="h-28 sm:h-32 rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
          <div className="h-28 sm:h-32 rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
          <div className="h-28 sm:h-32 rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
          <div className="h-28 sm:h-32 rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <div className="xl:col-span-2 space-y-4">
            <div className="h-56 sm:h-64 rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
            <div className="h-56 sm:h-64 rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
          </div>
          <div className="h-[400px] sm:h-[500px] rounded-3xl bg-slate-200 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 font-sans pb-12 md:pb-6">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        
        <PrefectRoleBanner roleName={prefectRole || ''} />

        {/* Top Hero Banner */}
        <div className="bg-pink-600 dark:bg-pink-700 rounded-3xl p-6 sm:p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-pink-600/20">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-3 sm:mb-4 tracking-tight leading-tight">
              Ready to keep learning, {username || 'Scholar'}?
            </h1>
            <p className="text-pink-100 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 font-medium leading-relaxed">
              Let&apos;s keep your academic momentum going. You are one step closer to achieving your educational goals.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link href={latestAttempt ? "/dashboard/student/result" : "/dashboard/student/exams&quizzes"} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-pink-600 hover:bg-slate-50 dark:hover:bg-zinc-100 rounded-xl h-11 sm:h-12 px-6 sm:px-8 font-bold text-sm sm:text-base shadow-sm">
                  {latestAttempt ? "Resume Last Activity" : "Explore Assessments"}
                </Button>
              </Link>
              <Link href="/dashboard/student/timetable" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto text-white hover:bg-white/10 hover:text-white rounded-xl h-11 sm:h-12 px-6 sm:px-8 font-semibold text-sm sm:text-base border border-white/20 sm:border-transparent">
                  View Timetable
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right side floating badges */}
          <div className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 flex-col gap-6 pointer-events-none">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg -translate-x-8">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Result Banner - Only display when a new final result was published in the last 7 days */}
        {hasRecentFinalResults && (
          <div className="bg-emerald-600 dark:bg-emerald-700 rounded-3xl p-5 sm:p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Final Results Available!</h2>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">Your published academic report card and term summaries are ready for review.</p>
            </div>
            <Link href="/dashboard/student/result/termly" className="w-full sm:w-auto shrink-0">
               <Button className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-slate-50 dark:hover:bg-zinc-100 font-bold rounded-xl h-11 sm:h-12 px-6 sm:px-8 shadow-sm text-sm sm:text-base">
                 View Final Result
               </Button>
            </Link>
          </div>
        )}

        {/* Connected School without Class Banner (Only for active non-graduated students) */}
        {connectedSchool && !isEnrolledInClass && !isGraduated && (
          <div className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-pink-500/5 border border-pink-200 dark:border-pink-800/50 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-600/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider">
                  <Sparkles size={13} />
                  Connected School: {connectedSchool.name}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Join Your School Class Cohort
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                  You are linked to {connectedSchool.name}, but have not yet joined a classroom. Select an available class to see enrolled classmates, active subjects, and course timetables.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsClassSelectionModalOpen(true)}
              className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl h-11 px-6 shadow-md shadow-pink-600/20 text-xs sm:text-sm shrink-0 gap-2"
            >
              <span>Choose Class</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Graduated / Alumni Scholar Recognition Banner */}
        {isGraduated && (
          <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/10 border border-amber-300/40 dark:border-amber-700/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-200 text-xs font-black uppercase tracking-wider border border-amber-400/30">
                  <Sparkles size={12} className="text-amber-500" />
                  Honored Alumni Scholar
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Graduated Scholar • {connectedSchool?.name || "Your School"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 max-w-xl font-medium leading-relaxed">
                  Congratulations on successfully graduating and completing your studies. Your permanent academic transcript, honors, and graduation credentials are secure in your vault.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto shrink-0">
              <Link href="/dashboard/student/result/termly" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto rounded-xl h-11 px-5 border-amber-300 dark:border-amber-700/60 font-bold text-xs sm:text-sm">
                  <BookMarked className="w-4 h-4 mr-2 text-amber-500" />
                  Academic Vault
                </Button>
              </Link>
              <Button
                onClick={() => setIsClassSelectionModalOpen(true)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl h-11 px-5 text-xs sm:text-sm gap-2"
              >
                <span>View Cohorts</span>
                <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        )}

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard 
            icon={<BookMarked className="w-5 h-5 text-pink-600 dark:text-pink-400" />} 
            label="Exams Taken" 
            value={attempts.length} 
            tooltip="Total completed examinations and graded quizzes logged on Qefas Hub."
          />
          <StatCard 
            icon={<Award className="w-5 h-5 text-amber-500" />} 
            label="Active Subjects" 
            value={enrolledSubjectsCount} 
            tooltip="Number of registered course subjects currently configured in your class curriculum."
          />
          <StatCard 
            icon={<Clock className="w-5 h-5 text-emerald-500" />} 
            label="Current GPA" 
            value={gpa} 
            tooltip="Cumulative Grade Point Average calculated on a standard 5.0 scale across all evaluated exams and assignments."
          />
          <StatCard 
            icon={<Flame className="w-5 h-5 text-pink-500" />} 
            label="Overall Mastery" 
            value={analysis ? `${analysis.overallMastery}%` : "0%"} 
            tooltip="Aggregated syllabus proficiency percentage computed from your scores across all examined subjects."
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <div className="xl:col-span-2 space-y-6 sm:space-y-8">
            
            {/* Recent Activity Section */}
            <section className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Recent Activity</h2>
                <HeaderTooltip content="Your most recent assessment activity, showing attained score vs total marks and direct access to question-level analysis." />
              </div>

              {latestAttempt ? (
                <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-4 sm:gap-6 group hover:shadow-md transition-shadow">
                  <div className="w-full md:w-56 h-36 sm:h-40 bg-slate-100 dark:bg-zinc-900 rounded-2xl overflow-hidden relative shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors" />
                    <BookOpen className="w-12 h-12 text-pink-500 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
                        Latest Assessment
                      </span>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white line-clamp-1">
                        {latestAttempt.exam?.title || "Assessment"}
                      </h3>
                      <p className="text-slate-500 dark:text-zinc-400 mt-1 font-medium text-xs sm:text-sm">
                        Score: {latestAttempt.totalScore} / {latestAttempt.totalMarks || 100}
                      </p>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm font-semibold">
                        <span className="text-pink-600 dark:text-pink-400">Score Percentage</span>
                        <span className="text-slate-700 dark:text-zinc-300">
                          {Math.round((latestAttempt.totalScore / (latestAttempt.totalMarks || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-600 dark:bg-pink-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.round((latestAttempt.totalScore / (latestAttempt.totalMarks || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex w-full md:w-auto shrink-0 justify-center md:justify-start pt-2 md:pt-0">
                    <Link href="/dashboard/student/result" className="w-full md:w-auto">
                      <Button className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-11 sm:h-12 px-6 shadow-sm font-bold text-sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                  <div className="w-full md:w-48 h-32 sm:h-36 bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl shrink-0 flex flex-col items-center justify-center border border-pink-100 dark:border-zinc-800">
                    <Sparkles className="w-10 h-10 text-pink-500 mb-2 drop-shadow-sm" strokeWidth={1.8} />
                    <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">Ready to Start</span>
                  </div>
                  
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wider">
                      No Assessments Yet
                    </span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      Welcome to your Student Hub!
                    </h3>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-xs sm:text-sm max-w-xl">
                      You haven&apos;t taken any exams or quizzes yet. Once you complete an assessment, your scores, percentage breakdown, and progress tracking will show up here.
                    </p>
                  </div>
                  
                  <div className="flex w-full md:w-auto shrink-0 justify-center md:justify-start">
                    <Link href="/dashboard/student/exams&quizzes" className="w-full md:w-auto">
                      <Button className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-11 sm:h-12 px-6 shadow-sm font-bold text-sm gap-2">
                        <span>Browse Exams &amp; Quizzes</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Enrolled Subjects Section */}
            <section className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Enrolled Subjects</h2>
                <HeaderTooltip content="Class curriculum subjects assigned to you. Scroll horizontally or click any subject card to inspect enrollment details." />
              </div>

              <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {displaySubjects.length > 0 ? (
                  displaySubjects.map((sub) => (
                    <Dialog key={sub.id}>
                      <DialogTrigger asChild>
                        <div className="w-[240px] sm:w-[280px] shrink-0 snap-center bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full cursor-pointer">
                          <div className="h-28 sm:h-32 bg-slate-100 dark:bg-zinc-900 rounded-2xl mb-3 sm:mb-4 flex items-center justify-center relative overflow-hidden">
                            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 group-hover:scale-110 group-hover:text-pink-500 transition-all" />
                          </div>
                          <span className={cn(
                            "inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold rounded-lg uppercase tracking-wider mb-2 sm:mb-3 self-start",
                            sub.category === "SCIENCE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                            sub.category === "ARTS" ? "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          )}>
                            {sub.category}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 leading-tight truncate">
                            {sub.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-auto">
                            Ready for assessment
                          </p>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] rounded-3xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                        <DialogHeader>
                          <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{sub.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 pt-3">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium text-sm">Category</span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{sub.category}</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium text-sm">Status</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Enrolled & Active</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <div className="col-span-full w-full py-10 sm:py-12 text-center bg-slate-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-4">
                    <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">No subjects enrolled in current class roster.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Performance Overview & History */}
            <section className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Performance Overview</h2>
                <HeaderTooltip content="Longitudinal trajectory of your academic performance showing historical trendlines and verified examination papers." />
              </div>
              <PerformanceTrend 
                attempts={attempts as PerformanceAttempt[]} 
                standaloneGrades={standaloneGrades as PerformanceGrade[]} 
              />
              <AcademicHistory 
                attempts={attempts as unknown as HistoryAttempt[]} 
                isLoading={isLoadingExams} 
              />
            </section>

          </div>
          
          {/* Right Sidebar (Radar Chart & Latest Assignments) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Subject Mastery</h3>
                  <HeaderTooltip content="Multi-dimensional radar chart measuring your competency across all evaluated subject domains. Helps prioritize study topics." />
                </div>
              </div>
              
              <div className="w-full h-60 sm:h-64 shrink-0 relative">
                {analysis ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analysis.chartData}>
                      <PolarGrid stroke="#f43f5e" strokeOpacity={0.15} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontWeight: 600 }} />
                      <Radar
                        name="Mastery"
                        dataKey="A"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="#f43f5e"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 flex items-center justify-center p-4 text-center">
                    <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-zinc-500">No Assessment Data Yet</span>
                  </div>
                )}
              </div>
              
              {analysis && (
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20">
                    <p className="text-xs sm:text-sm text-pink-900 dark:text-pink-200 font-medium leading-relaxed">
                      {analysis.advice}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                      <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">Strongest</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{analysis.strongest.subject}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20">
                      <p className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 mb-1">Weakest</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{analysis.weakest.subject}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-[380px] sm:h-[400px]">
              <LatestAssignmentsCard />
            </div>
          </div>
          
        </div>

      </div>

      <StudentConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        studentCode={studentCode}
      />

      <StudentClassSelectionModal
        isOpen={isClassSelectionModalOpen}
        onClose={() => {
          setIsClassSelectionModalOpen(false);
          if (typeof window !== 'undefined') {
            const key = connectedSchool?.id ? `dismissed_class_prompt_${connectedSchool.id}` : 'dismissed_class_prompt';
            localStorage.setItem(key, 'true');
          }
        }}
        schoolId={connectedSchool?.id}
        schoolName={connectedSchool?.name || 'Your School'}
        studentName={studentProfile?.name || username || 'Scholar'}
      />

      <PrefectCelebration
        studentId={studentProfile?.id || ''}
        studentName={studentProfile?.name || username || 'Scholar'}
        roleName={prefectRole || ''}
        hasSeenCelebration={hasSeenCelebration}
        onAcknowledge={() => {}}
      />
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  tooltip 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  tooltip: string; 
}) {
  return (
    <div className="bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 md:p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center">
          {icon}
        </div>
        <HeaderTooltip content={tooltip} />
      </div>
      <div>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 mb-0.5 sm:mb-1">{label}</p>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
}
