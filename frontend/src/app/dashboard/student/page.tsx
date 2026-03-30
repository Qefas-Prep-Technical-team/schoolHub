"use client";

import { useMemo } from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Brain, 
  TrendingUp, 
  TrendingDown,
  BookOpen, 
  Calendar,
  ChevronRight,
  Sparkles,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function StudentHomeDashboard() {
  const { username } = useUserStore();
  const { data: attempts, isLoading: isLoadingExams } = useStudentExamAttempts();
  const { data: standaloneGrades, isLoading: isLoadingGrades } = useGrades();

  // AI Analysis Logic
  const analysis = useMemo(() => {
    if (!attempts || attempts.length === 0) return null;

    const subjectsMap: Record<string, { total: number, score: number, count: number }> = {};
    
    // Aggregate from exams
    attempts.forEach((attempt: any) => {
      attempt.subjectAttempts?.forEach((sa: any) => {
        const subName = sa.subjectPaper.subject.name;
        if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
        subjectsMap[subName].score += sa.score;
        subjectsMap[subName].total += sa.subjectPaper.totalMarks;
        subjectsMap[subName].count += 1;
      });
    });

    // Aggregate from standalone
    standaloneGrades?.forEach((grade: any) => {
      const subName = grade.subject;
      if (!subjectsMap[subName]) subjectsMap[subName] = { total: 0, score: 0, count: 0 };
      subjectsMap[subName].score += grade.score;
      subjectsMap[subName].total += grade.maxMarks;
      subjectsMap[subName].count += 1;
    });

    const chartData = Object.entries(subjectsMap).map(([name, data]) => ({
      subject: name,
      A: Math.round((data.score / data.total) * 100),
      fullMark: 100,
    }));

    const sortedSubjects = [...chartData].sort((a, b) => a.A - b.A);
    const weakest = sortedSubjects[0];
    const strongest = sortedSubjects[sortedSubjects.length - 1];

    // Generate AI Suggestions
    let advice = "";
    if (weakest.A < 50) {
      advice = `Critical attention needed in ${weakest.subject}. We've noticed consistent struggles here. Focus on foundational concepts and consider requesting a peer-tutoring session.`;
    } else if (weakest.A < 70) {
      advice = `Good progress, but ${weakest.subject} could use a boost. Focus on active recall and past papers to push your scores into the distinction range.`;
    } else {
      advice = `Excellence across the board! Your weakest area is ${weakest.subject} at ${weakest.A}%, which is still very strong. Keep sharpening your skills!`;
    }

    return { chartData, weakest, strongest, advice };
  }, [attempts, standaloneGrades]);

  const gpa = useMemo(() => {
    if ((!attempts || attempts.length === 0) && (!standaloneGrades || standaloneGrades.length === 0)) return "0.0";
    
    let totalWeight = 0;
    let totalPoints = 0;

    const getPoints = (percent: number) => {
        if (percent >= 90) return 4.0;
        if (percent >= 70) return 4.0; 
        if (percent >= 60) return 3.0;
        if (percent >= 50) return 2.0;
        if (percent >= 40) return 1.0;
        return 0.0;
    };

    attempts?.forEach((a: any) => {
        const p = (a.totalScore / a.totalMarks) * 100;
        totalPoints += getPoints(p);
        totalWeight += 1;
    });

    standaloneGrades?.forEach((g: any) => {
        const p = (g.score / g.maxMarks) * 100;
        totalPoints += getPoints(p);
        totalWeight += 1;
    });

    return totalWeight > 0 ? (totalPoints / totalWeight).toFixed(2) : "0.0";
  }, [attempts, standaloneGrades]);

  const stats = [
    { label: "Semester GPA", value: gpa, icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Exams Taken", value: attempts?.length || "0", icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Credits Earned", value: "18 / 24", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 lg:p-10 pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-primary italic">{username || 'Scholar'}</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Your academic journey is looking bright today.</p>
          </motion.div>
          
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Calendar size={20} />
            </div>
            <div className="pr-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Term</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Spring Semester 2026</p>
            </div>
          </div>
        </section>

        {/* Top Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all"
                >
                    <div className="flex items-center gap-6">
                        <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </section>

        {/* AI Performance Analysis Section */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-xl shadow-slate-200/20 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.02] group-hover:scale-110 transition-transform duration-700 translate-x-10 -translate-y-10">
                    <Brain size={400} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center animate-pulse">
                                <Sparkles size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Academic Insights</h2>
                        </div>

                        {analysis ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Our AI has analyzed your recent <span className="text-slate-900 dark:text-white font-black">{attempts?.length} exam attempts</span> and <span className="text-slate-900 dark:text-white font-black">{standaloneGrades?.length} assessments</span>.
                                    </p>
                                    <div className="p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 italic">
                                        <p className="text-indigo-600 dark:text-indigo-400 font-bold leading-relaxed">
                                            "{analysis.advice}"
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                            <TrendingUp size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Strength</span>
                                        </div>
                                        <p className="text-lg font-black text-slate-800 dark:text-slate-200">{analysis.strongest.subject}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                        <div className="flex items-center gap-2 text-rose-500 mb-1">
                                            <TrendingDown size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Focus Area</span>
                                        </div>
                                        <p className="text-lg font-black text-slate-800 dark:text-slate-200">{analysis.weakest.subject}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 font-medium italic">Collect more performance data to unlock personalized AI insights.</p>
                        )}
                    </div>

                    <div className="w-full md:w-64 h-64 shrink-0">
                        {analysis ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analysis.chartData}>
                                    <PolarGrid stroke="#64748b" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                    <Radar
                                        name="Mastery"
                                        dataKey="A"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.4}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse border-4 border-dashed border-slate-200 dark:border-slate-700" />
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-6"
            >
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BookOpen className="text-primary" /> Active Materials
                    </h3>
                    <Button variant="ghost" className="text-[10px] items-center flex font-black uppercase tracking-widest text-slate-400">View All</Button>
                </div>

                <div className="space-y-4">
                    {[
                        { title: "Advanced Calculus II", status: "Ongoing", progress: 65, color: "primary" },
                        { title: "Organic Chemistry Labs", status: "Up Next", progress: 0, color: "indigo" },
                        { title: "World Literature", status: "Revision", progress: 92, color: "emerald" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] group hover:-translate-y-1 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-slate-200">{item.title}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{item.status}</p>
                                </div>
                                <ArrowUpRight className="text-slate-300 group-hover:text-primary transition-colors" size={20} />
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        item.color === 'primary' ? 'bg-primary' : item.color === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500'
                                    )}
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>

        {/* Recent Grades Section */}
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <TrendingUp className="text-rose-500" /> Recent Grades
                </h3>
                 <Button variant="outline" className="rounded-xl border-slate-200 h-10 px-4 text-[10px] font-black uppercase tracking-widest">
                    Open Results Center
                 </Button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score / Rating</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Submission Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoadingExams ? (
                                <tr><td colSpan={3} className="px-8 py-10 text-center animate-pulse text-xs font-bold text-slate-400">Loading your latest results...</td></tr>
                            ) : attempts?.slice(0, 5).map((attempt: any) => {
                                const scorePercent = Math.round((attempt.totalScore / attempt.totalMarks) * 100);
                                return (
                                    <tr key={attempt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                                                    <Trophy size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{attempt.exam.title}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{attempt.exam.category || 'EXAM'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{scorePercent}%</p>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase",
                                                    scorePercent >= 70 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                                )}>
                                                    {scorePercent >= 70 ? 'Superior' : 'Needs Focus'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className="text-xs font-bold text-slate-500">{format(new Date(attempt.submittedAt), "MMM d, yyyy")}</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}