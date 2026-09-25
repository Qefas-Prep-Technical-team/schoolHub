"use client";

import { useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Sparkles,
  Trophy,
  Target,
  Clock,
  Flame,
  BookMarked,
  Award,
  Play
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useLinkProfile } from '@/lib/api/hooks/useLinks';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { StudentConnectionModal } from './components/StudentConnectionModal';
import AcademicHistory from './components/dashboard/AcademicHistory';
import PerformanceTrend from './components/dashboard/PerformanceTrend';
import LatestAssignmentsCard from './components/dashboard/LatestAssignmentsCard';
import PrefectCelebration from './components/PrefectCelebration';
import PrefectRoleBanner from './components/PrefectRoleBanner';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function StudentHomeDashboard() {
  const { username } = useUserStore();
  const { data: attemptsData, isLoading: isLoadingExams } = useStudentExamAttempts();
  const { data: standaloneGradesData } = useGrades();
  const { data: profileResponse } = useLinkProfile();
  const { data: studentProfile, isLoading: isLoadingProfile } = useStudentProfile();
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  const attempts = attemptsData?.attempts || [];
  const standaloneGrades = standaloneGradesData?.grades || [];
  const studentCode = profileResponse?.data?.linkingCode || "";

  const activeClass = studentProfile?.classes?.[0]?.class;
  const enrolledSubjectsCount = activeClass?.subjects?.length || 0;

  const prefectRole = studentProfile?.prefectRole;
  const hasSeenCelebration = studentProfile?.hasSeenPrefectCelebration ?? true;

  // AI Analysis Logic
  const analysis = useMemo(() => {
    if (!attempts || attempts.length === 0) return null;

    const subjectsMap: Record<string, { total: number, score: number, count: number }> = {};

    attempts.forEach((attempt: any) => {
      attempt.subjectAttempts?.forEach((sa: any) => {
        const subName = sa.subjectPaper.subject.name;
        if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
        subjectsMap[subName].score += sa.score;
        subjectsMap[subName].total += sa.subjectPaper.totalMarks;
        subjectsMap[subName].count += 1;
      });
    });

    (standaloneGrades as any[])?.forEach((grade) => {
      const subName = grade.subject;
      if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
      subjectsMap[subName].score += grade.score;
      subjectsMap[subName].total += grade.maxMarks;
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
    if (weakest.A < 40) advice = `You need to put more effort into ${weakest.subject}. We recommend practicing well before the next exam.`;
    else if (weakest.A < 50) advice = `Your performance in ${weakest.subject} is at a Pass level. Try practicing more past questions.`;
    else if (weakest.A < 75) advice = `You are doing well in ${weakest.subject}. If you push a bit more, you can secure a Distinction.`;
    else advice = `Excellent! You have mastered ${weakest.subject} well. Keep it up!`;

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
    attempts?.forEach((a: any) => {
      const p = (a.totalScore / (a.totalMarks || 1)) * 100;
      totalPoints += getPoints(p);
      totalWeight += 1;
    });
    standaloneGrades?.forEach((g: any) => {
      const p = (g.score / (g.maxMarks || 1)) * 100;
      totalPoints += getPoints(p);
      totalWeight += 1;
    });
    return totalWeight > 0 ? (totalPoints / totalWeight).toFixed(2) : "0.00";
  }, [attempts, standaloneGrades]);

  // Derived data for UI layout
  const latestAttempt = attempts[0];
  const enrolledSubjectsList = activeClass?.subjects || [];
  const displaySubjects = enrolledSubjectsList.map((sub: any, i: number) => ({
    id: sub.id || i,
    name: sub.subject?.name || sub.name || "Subject",
    category: sub.subject?.category || "ACTIVE SUBJECT",
  }));

  if (isLoadingExams || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 space-y-8">
        <Skeleton className="h-[300px] w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
          <Skeleton className="h-[500px] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <main className="p-4 md:p-8 lg:p-10 pb-32 md:pb-10">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          <PrefectRoleBanner roleName={prefectRole || ''} />

          {/* Skillery-style Top Banner */}
          <div className="bg-pink-600 dark:bg-pink-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-pink-600/20">
            {/* Decorative background blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl translate-y-1/3" />
            
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to keep learning, {username || 'Scholar'}?
              </h1>
              <p className="text-pink-100 text-lg md:text-xl mb-8 font-medium">
                Let&apos;s keep your learning journey going. You&apos;re just one step closer to your goals.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Button className="bg-white text-pink-600 hover:bg-slate-50 rounded-xl h-12 px-8 font-semibold text-base shadow-sm">
                  Resume Last Activity
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-xl h-12 px-8 font-semibold text-base">
                  Explore Classes
                </Button>
              </div>
            </div>
            
            {/* Right side floating icons/badges similar to Skillery */}
            <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col gap-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center animate-bounce-slow">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center shadow-lg -translate-x-12 translate-y-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Result Banner */}
          <div className="bg-emerald-600 dark:bg-emerald-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-600/20 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Final Results Available!</h2>
              <p className="text-emerald-100 font-medium">Your published academic results are ready to view.</p>
            </div>
            <Link href="/dashboard/student/result/termly">
               <Button className="bg-white text-emerald-600 hover:bg-slate-50 font-bold rounded-xl h-12 px-8 shadow-sm">
                 View Final Result
               </Button>
            </Link>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              icon={<BookMarked className="w-5 h-5 text-pink-600 dark:text-pink-400" />} 
              label="Exams Taken" 
              value={attempts?.length || 0} 
            />
            <StatCard 
              icon={<Award className="w-5 h-5 text-amber-500" />} 
              label="Active Subjects" 
              value={enrolledSubjectsCount} 
            />
            <StatCard 
              icon={<Clock className="w-5 h-5 text-emerald-500" />} 
              label="Current GPA" 
              value={gpa} 
            />
            <StatCard 
              icon={<Flame className="w-5 h-5 text-pink-500" />} 
              label="Overall Mastery" 
              value={analysis ? `${analysis.overallMastery}%` : "0%"}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              
              {/* Recent Activity Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Activity</h2>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                  <div className="w-full md:w-64 h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors" />
                    <BookOpen className="w-12 h-12 text-pink-500 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md" strokeWidth={1.5} />
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <span className="inline-block px-3 py-1 bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs font-bold rounded-lg uppercase tracking-wider mb-3">
                        {latestAttempt ? "Latest Assessment" : "Onboarding"}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white line-clamp-1">
                        {latestAttempt ? latestAttempt.exam?.title : "Welcome to your Dashboard"}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {latestAttempt ? `Score: ${latestAttempt.totalScore} / ${latestAttempt.totalMarks}` : "Get started by exploring your classes"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-pink-600 dark:text-pink-400">Score Percentage</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {latestAttempt ? Math.round((latestAttempt.totalScore / (latestAttempt.totalMarks || 1)) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-600 dark:bg-pink-500 rounded-full transition-all duration-1000"
                          style={{ width: `${latestAttempt ? Math.round((latestAttempt.totalScore / (latestAttempt.totalMarks || 1)) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex shrink-0">
                    <Link href={latestAttempt ? "/dashboard/student/result" : "/dashboard/student/exams&quizzes"}>
                      <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-12 px-6 shadow-sm cursor-pointer">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>

              {/* Enrolled Subjects Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Enrolled Subjects</h2>
                <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                  {displaySubjects.length > 0 ? (
                    displaySubjects.map((sub: any) => (
                      <Dialog key={sub.id}>
                        <DialogTrigger asChild>
                          <div className="w-[280px] shrink-0 snap-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full cursor-pointer">
                            <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                              <BookOpen className="w-10 h-10 text-slate-400 group-hover:scale-110 group-hover:text-pink-500 transition-all" />
                            </div>
                            <span className={cn(
                              "inline-block px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider mb-3 self-start",
                              sub.category === "SCIENCE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                              sub.category === "ARTS" ? "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400" :
                              "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            )}>
                              {sub.category}
                            </span>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                              {sub.name}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-auto">
                              Ready for assessment
                            </p>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">{sub.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                              <span className="text-slate-500 font-medium">Category</span>
                              <span className="font-bold text-slate-900 dark:text-white">{sub.category}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                              <span className="text-slate-500 font-medium">Status</span>
                              <span className="font-bold text-emerald-600">Enrolled & Active</span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-500 font-medium">No subjects enrolled yet.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Legacy Charts / Academic History */}
              <section className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Performance Overview</h2>
                <PerformanceTrend attempts={attempts} standaloneGrades={standaloneGrades} />
                <AcademicHistory attempts={attempts} isLoading={isLoadingExams} />
              </section>

            </div>
            
            {/* Right Sidebar (Radar Chart & Insights) */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Subject Mastery</h3>
                <div className="w-full h-64 shrink-0 relative">
                  {analysis ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analysis.chartData}>
                        <PolarGrid stroke="#f43f5e" strokeOpacity={0.1} />
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
                    <div className="h-full w-full rounded-full border-4 border-dashed border-slate-100 dark:border-slate-800 animate-pulse flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-400">No Data Yet</span>
                    </div>
                  )}
                </div>
                
                {analysis && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20">
                      <p className="text-sm text-pink-900 dark:text-pink-200 font-medium leading-relaxed">
                        {analysis.advice}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                        <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">Strongest</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{analysis.strongest.subject}</p>
                      </div>
                      <div className="flex-1 p-3 rounded-xl bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20">
                        <p className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 mb-1">Weakest</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{analysis.weakest.subject}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="h-[400px]">
                <LatestAssignmentsCard />
              </div>
            </div>
            
          </div>

        </div>
      </main>

      <StudentConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        studentCode={studentCode}
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

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col">
      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </h3>
    </div>
  );
}
