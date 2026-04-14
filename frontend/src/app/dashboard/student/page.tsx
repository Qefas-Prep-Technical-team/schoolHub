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
import { useLinkProfile } from '@/lib/api/hooks/useLinks';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { StudentConnectionModal } from './components/StudentConnectionModal';
import { Badge } from '@/components/ui/badge';

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
      A: Math.round((data.score / (data.total || 1)) * 100),
      fullMark: 100,
    }));

    const sortedSubjects = [...chartData].sort((a, b) => a.A - b.A);
    const weakest = sortedSubjects[0];
    const strongest = sortedSubjects[sortedSubjects.length - 1];

    // Nigerian Academic Advisory Logic (WAEC/NECO Standard)
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

    // Nigerian 5.0 GPA Scale (WAEC Alignment)
    const getPoints = (percent: number) => {
        if (percent >= 75) return 5.0; // A1
        if (percent >= 70) return 4.0; // B2
        if (percent >= 65) return 3.5; // B3
        if (percent >= 50) return 3.0; // C4-C6
        if (percent >= 45) return 2.0; // D7
        if (percent >= 40) return 1.0; // E8
        return 0.0; // F9
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

  const stats = [
    { label: "Semester GPA", value: gpa, icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Exams Taken", value: attempts?.length || "0", icon: Target, color: "text-primary", bg: "bg-primary/10" },
    { label: "Credits Earned", value: "18 / 24", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 lg:p-10 pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Premium Academic Header */}
        <section className="relative overflow-hidden rounded-[3rem] p-8 md:p-14 shadow-2xl border-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-3xl group">
          {/* Animated Background Gradients */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 dark:bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />
          
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
             <Sparkles size={400} className="text-primary rotate-12" />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-gradient-to-r from-primary/10 to-indigo-500/10 text-primary dark:text-white border border-primary/20 rounded-full px-5 py-1.5 text-[11px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md">
                  Academic Command Center
                </Badge>
                <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Term Progress: High
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome Back,
                </h1>
                <h2 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-purple-500">
                  {username || 'Scholar'}
                </h2>
              </div>
              
              <p className="text-base text-slate-500 font-medium max-w-xl">
                Your Academic Journey at <span className="text-slate-900 dark:text-white font-black italic">SchoolHub Institution</span> continues today.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <Button 
                onClick={() => setIsConnectionModalOpen(true)}
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-3xl h-16 px-8 shadow-2xl shadow-primary/20 flex items-center gap-4 font-black uppercase tracking-widest text-[11px] group transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus size={20} />
                </div>
                Connection QR
              </Button>

              <div className="flex items-center gap-5 bg-white/40 dark:bg-slate-950/40 p-3 rounded-[2rem] border border-white/50 dark:border-slate-800/50 backdrop-blur-md shadow-inner h-16 px-6">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <Calendar size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Current Term</p>
                    <p className="font-black text-slate-900 dark:text-white whitespace-nowrap">2023/24 - Second Term</p>
                </div>
              </div>
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
                    className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-[2.5rem] p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 hover:bg-white/80 dark:hover:bg-slate-900/90"
                >
                    <div className={cn("absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500", stat.bg)} />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border border-white/20 dark:border-slate-700/50", stat.bg, stat.color)}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">{stat.value}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </section>

        {/* AI Performance Analysis Section */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/40 dark:border-slate-800/50 rounded-[3.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/20 dark:shadow-none relative overflow-hidden group"
            >
                {/* Ambient glow inside */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000 -translate-y-20 translate-x-20 pointer-events-none" />

                <div className="absolute top-0 right-0 p-12 opacity-[0.02] dark:opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <Brain size={400} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Sparkles size={24} className="animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">AI Academic Insights</h2>
                        </div>

                        {analysis ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        Our AI analyzed your recent <span className="text-slate-900 dark:text-white font-black">{attempts?.length} exam attempts</span> and <span className="text-slate-900 dark:text-white font-black">{standaloneGrades?.length} assessments</span>.
                                    </p>
                                    <div className="p-6 rounded-[2rem] bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 backdrop-blur-md shadow-inner italic relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-indigo-500 rounded-r-full" />
                                        <p className="text-indigo-600 dark:text-indigo-300 font-bold leading-relaxed pl-2">
                                            "{analysis.advice}"
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-[2rem] bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 shadow-sm backdrop-blur-sm group-hover:bg-emerald-500/10 transition-colors">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                            <TrendingUp size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Core Strength</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-800 dark:text-slate-100 drop-shadow-sm">{analysis.strongest.subject}</p>
                                    </div>
                                    <div className="p-5 rounded-[2rem] bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 dark:border-rose-500/20 shadow-sm backdrop-blur-sm group-hover:bg-rose-500/10 transition-colors">
                                        <div className="flex items-center gap-2 text-rose-500 mb-2">
                                            <TrendingDown size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Focus Area</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-800 dark:text-slate-100 drop-shadow-sm">{analysis.weakest.subject}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 font-medium italic">Collect more performance data to unlock personalized AI insights.</p>
                        )}
                    </div>

                    <div className="w-full md:w-64 h-64 shrink-0 relative">
                        {analysis ? (
                            <>
                                <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analysis.chartData}>
                                        <PolarGrid stroke="#64748b" strokeOpacity={0.3} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b5cf6', fontSize: 10, fontWeight: 800 }} />
                                        <Radar
                                            name="Mastery"
                                            dataKey="A"
                                            stroke="#8b5cf6"
                                            strokeWidth={3}
                                            fill="#6366f1"
                                            fillOpacity={0.6}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </>
                        ) : (
                            <div className="h-full w-full rounded-full bg-slate-100/50 dark:bg-slate-800/50 animate-pulse border-4 border-dashed border-slate-200 dark:border-slate-700 backdrop-blur-sm" />
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-6 flex flex-col"
            >
                <div className="flex items-center justify-between px-4 bg-white/40 dark:bg-slate-900/40 rounded-3xl p-3 border border-white/50 dark:border-slate-800/50 backdrop-blur-md shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BookOpen className="text-indigo-500" /> Active Materials
                    </h3>
                    <Button variant="ghost" className="text-[10px] items-center flex font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 bg-white/50 dark:bg-slate-800/50 rounded-xl h-8 px-4">View All</Button>
                </div>

                <div className="space-y-4 flex-1">
                    {[
                        { title: "Advanced Calculus II", status: "Ongoing", progress: 65, color: "primary" },
                        { title: "Organic Chemistry Labs", status: "Up Next", progress: 0, color: "indigo-500" },
                        { title: "World Literature", status: "Revision", progress: 92, color: "emerald-500" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/60 dark:bg-slate-900/60 border border-white/60 dark:border-slate-800/60 p-6 rounded-[2.5rem] group hover:-translate-y-1 hover:shadow-xl hover:bg-white/90 dark:hover:bg-slate-800/80 backdrop-blur-xl transition-all duration-300 cursor-pointer">
                            <div className="flex justify-between items-start mb-5">
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-indigo-500 transition-colors drop-shadow-sm">{item.title}</h4>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-950/50 border-none px-3 py-0.5">{item.status}</Badge>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all shadow-sm">
                                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-white" />
                                </div>
                            </div>
                            <div className="h-3 w-full bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-0.5 relative">
                                <div 
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden",
                                        item.color === 'primary' ? 'bg-primary' : item.color === 'indigo-500' ? 'bg-indigo-500' : 'bg-emerald-500'
                                    )}
                                    style={{ width: `${item.progress}%` }}
                                >
                                     {item.progress > 0 && (
                                         <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 animate-[shimmer_2s_infinite]" />
                                     )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>

        {/* Recent Grades Section */}
        <section className="space-y-6">
            <div className="flex items-center justify-between px-4 bg-white/40 dark:bg-slate-900/40 rounded-3xl p-3 border border-white/50 dark:border-slate-800/50 backdrop-blur-md shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 relative z-10">
                    <TrendingUp className="text-rose-500" /> Recent Academic History
                </h3>
                 <Button variant="outline" className="relative z-10 rounded-xl border-white/60 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 h-10 px-6 text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md transition-all">
                    Open Results Center
                 </Button>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/80 border border-white/50 dark:border-slate-800/50 rounded-[3rem] p-4 md:p-8 backdrop-blur-3xl shadow-xl overflow-hidden relative min-h-[400px]">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                    {isLoadingExams ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 md:h-32 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
                            ))}
                        </div>
                    ) : attempts?.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-950/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                             <Trophy className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                             <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No recent performance records found</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {attempts?.slice(0, 5).map((attempt: any) => {
                                const scorePercent = Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100);
                                return (
                                    <div 
                                        key={attempt.id} 
                                        className="group relative bg-white/40 dark:bg-slate-950/40 border border-white/60 dark:border-slate-800/60 rounded-3xl md:rounded-[2.5rem] p-4 md:p-6 flex flex-row items-center justify-between gap-4 md:gap-6 hover:bg-white dark:hover:bg-slate-900 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm"
                                    >
                                        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                                            {/* Circular Icon Container */}
                                            <div className="relative shrink-0">
                                                <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:scale-110 transition-all shadow-inner border border-slate-100 dark:border-slate-800 relative z-10">
                                                    <Trophy size={20} className="md:h-8 md:w-8" />
                                                </div>
                                            </div>

                                            {/* Text Content */}
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge className={cn(
                                                        "px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest border-none shadow-sm",
                                                        scorePercent >= 75 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : scorePercent >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                    )}>
                                                        {scorePercent >= 75 ? 'Distinction' : scorePercent >= 50 ? 'Credit' : 'Review Required'}
                                                    </Badge>
                                                    <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-tighter hidden sm:inline">• {format(new Date(attempt.submittedAt), "MMM d, yyyy")}</span>
                                                </div>
                                                <h4 className="font-extrabold text-sm md:text-xl text-slate-900 dark:text-white truncate uppercase italic tracking-tight group-hover:text-rose-500 transition-colors">{attempt.exam.title}</h4>
                                                <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60 truncate">Validated Institutional Record</p>
                                            </div>
                                        </div>

                                        {/* Score Container */}
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right">
                                                <p className="text-xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{scorePercent}%</p>
                                                <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-tight opacity-60">
                                                    {attempt.totalScore} / {attempt.totalMarks} <span className="hidden md:inline">PTS</span>
                                                </p>
                                            </div>
                                            <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover:scale-110 transition-all shadow-lg">
                                                <ChevronRight size={16} className="md:h-7 md:w-7" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>

      </div>

      <StudentConnectionModal 
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        studentCode={studentCode}
      />
    </div>
  );
}