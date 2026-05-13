"use client";

import { useMemo } from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Star
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { StudentConnectionModal } from './components/StudentConnectionModal';
import { Badge } from '@/components/ui/badge';
import StudentHero from './components/dashboard/StudentHero';
import ConsoleInsights from './components/dashboard/ConsoleInsights';
import AcademicHistory from './components/dashboard/AcademicHistory';
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';


export default function StudentHomeDashboard() {
  const { username } = useUserStore();
  const { data: attemptsData, isLoading: isLoadingExams } = useStudentExamAttempts();
  const { data: standaloneGradesData, isLoading: isLoadingGrades } = useGrades();
  const { data: profileResponse } = useLinkProfile();
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  const attempts = attemptsData?.attempts || [];
  const standaloneGrades = standaloneGradesData?.grades || [];
  const studentCode = profileResponse?.data?.linkingCode || "";

  // AI Analysis Logic
  const analysis = useMemo(() => {
    if (!attempts || attempts.length === 0) return null;

    const subjectsMap: Record<string, { total: number, score: number, count: number }> = {};
    
    attempts.forEach((attempt: { subjectAttempts?: { subjectPaper: { subject: { name: string }, totalMarks: number }, score: number }[] }) => {
      attempt.subjectAttempts?.forEach((sa) => {
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

    const sortedSubjects = [...chartData].sort((a, b) => a.A - b.A);
    const weakest = sortedSubjects[0];
    const strongest = sortedSubjects[sortedSubjects.length - 1];

    let advice = "";
    if (weakest.A < 40) {
      advice = `Urgent intervention required in ${weakest.subject} (F9 standing). We recommend specialized tutoring and a review of foundational prerequisites to stabilize performance before the next assessment cycle.`;
    } else if (weakest.A < 50) {
      advice = `Performance in ${weakest.subject} is currently at Pass level (D7/E8). Aim for more consistent practice with past WAEC/NECO papers to elevate this to a Credit (C6) or higher.`;
    } else if (weakest.A < 75) {
      advice = `Strong performance in ${weakest.subject} (Credit range). With targeted focus on high-weight topics, you are well-positioned to achieve a Distinction (A1/B2) in upcoming cycles.`;
    } else {
      advice = `Exceptional academic standing! Your mastery of ${weakest.subject} at ${weakest.A}% demonstrates Distinction-level (A1) command. Maintain this excellence while supporting peers in collaborative sessions.`;
    }

    return { chartData, weakest, strongest, advice };
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

    attempts?.forEach((a: Record<string, any>) => {
        const p = (a.totalScore / (a.totalMarks || 1)) * 100;
        totalPoints += getPoints(p);
        totalWeight += 1;
    });

    standaloneGrades?.forEach((g: Record<string, any>) => {
        const p = (g.score / (g.maxMarks || 1)) * 100;
        totalPoints += getPoints(p);
        totalWeight += 1;
    });

    return totalWeight > 0 ? (totalPoints / totalWeight).toFixed(2) : "0.00";
  }, [attempts, standaloneGrades]);

  return (
    <div className="min-h-screen bg-transparent">
      <main className="p-4 md:p-6 lg:p-10 pb-32 md:pb-10">
        <div className="max-w-[1600px] mx-auto space-y-10">
          
          <StudentHero 
            username={username || 'Scholar'} 
            selectedSchoolName={profileResponse?.data?.school?.name}
          />

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              <ConsoleInsights 
                gpa={gpa}
                examsTaken={attempts?.length || 0}
                credits="18 / 24"
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl opacity-50 -translate-y-20 translate-x-20 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                      <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
                                <Sparkles size={24} className="animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Neural <span className="text-pink-600">Advisory</span></h2>
                        </div>

                        {analysis ? (
                            <div className="space-y-8">
                                <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 shadow-inner italic">
                                    <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-sm">
                                        &quot;{analysis.advice}&quot;
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-[2rem] bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 shadow-sm">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                            <TrendingUp size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Strength Matrix</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{analysis.strongest.subject}</p>
                                    </div>
                                    <div className="p-6 rounded-[2rem] bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 shadow-sm">
                                        <div className="flex items-center gap-2 text-rose-500 mb-2">
                                            <Target size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#f43f5e]">Focus Target</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{analysis.weakest.subject}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 font-bold italic">Awaiting telemetry...</p>
                        )}
                      </div>

                      <div className="w-full md:w-72 h-72 shrink-0 relative p-4 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                        {analysis ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.chartData}>
                                  <PolarGrid stroke="#f43f5e" strokeOpacity={0.1} />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 8, fontWeight: 900 }} />
                                  <Radar
                                      name="Mastery"
                                      dataKey="A"
                                      stroke="#f43f5e"
                                      strokeWidth={3}
                                      fill="#f43f5e"
                                      fillOpacity={0.4}
                                  />
                              </RadarChart>
                           </ResponsiveContainer>
                        ) : (
                          <div className="h-full w-full rounded-full border-4 border-dashed border-slate-100 dark:border-slate-800 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </motion.div>

                  <AcademicHistory attempts={attempts} isLoading={isLoadingExams} />
                </div>

                <div className="lg:col-span-5 space-y-8 flex flex-col">
                  <UsageLimitsCard 
                    role="STUDENT"
                    title="Learning Quota"
                    description="Monitoring your academic resource allocation and AI tools."
                    upgradeLink="/dashboard/student/billing"
                    upgradeLabel="View Learning Plans"
                  />
                  <div className="bg-slate-900 dark:bg-slate-100 rounded-[3rem] p-10 text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">

                     <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 dark:bg-slate-900/10 rounded-full blur-3xl -translate-y-20 translate-x-10 group-hover:scale-150 transition-transform duration-700" />
                     <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Quick <span className="text-pink-500">Actions</span></h3>
                            <Zap size={24} className="text-pink-500 fill-pink-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <QuickAction icon={BookOpen} label="Classes" color="bg-pink-500 text-white" />
                            <QuickAction icon={Target} label="Exams" color="bg-rose-500 text-white" />
                            <QuickAction icon={Calendar} label="Schedule" color="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900" />
                            <QuickAction icon={Star} label="Grades" color="bg-amber-500 text-white" />
                        </div>
                        <Button 
                          onClick={() => setIsConnectionModalOpen(true)}
                          className="w-full h-14 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                        >
                          Generate Connection ID
                        </Button>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-[3rem] p-8 shadow-sm flex-1">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Curriculum</h3>
                        <Badge variant="outline" className="text-[9px] font-black uppercase border-pink-500/20 text-pink-600 bg-pink-50 dark:bg-pink-500/10">3 Enrolled</Badge>
                     </div>
                     <div className="space-y-4">
                        {[
                            { title: "Advanced Calculus", status: "Ongoing", progress: 75 },
                            { title: "Quantum Physics", status: "Revision", progress: 92 },
                            { title: "Organic Chemistry", status: "Upcoming", progress: 0 },
                        ].map((course, i) => (
                            <div key={i} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 hover:border-pink-500/20 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-black text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-pink-600 transition-colors uppercase italic">{course.title}</h4>
                                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-pink-500 transition-colors" />
                                </div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-pink-500 rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                                </div>
                            </div>
                        ))}
                     </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <StudentConnectionModal 
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        studentCode={studentCode}
      />
    </div>
  );
}

function QuickAction({ icon: Icon, label, color }: { icon: React.ElementType, label: string, color: string }) {
  return (
    <button className="flex flex-col items-center justify-center p-5 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all group">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform", color)}>
        <Icon size={24} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
    </button>
  );
}
