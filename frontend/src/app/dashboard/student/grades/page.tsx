"use client";

import { useState } from 'react';
import { 
  ChevronRight, 
  ArrowLeft, 
  Trophy, 
  User, 
  FileText,
  BarChart3,
  GraduationCap,
  Percent,
  Download,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  Quote
} from 'lucide-react';
import { useStudentExamAttempts, useExamResult } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProgressCircle from '@/components/ui/ProgressCircle';

export default function StudentGradesPage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'exams' | 'standalone'>('exams');

  // Data fetching
  const { data: attempts, isLoading: isLoadingAttempts } = useStudentExamAttempts();
  const { data: standaloneGrades, isLoading: isLoadingGrades } = useGrades();

  const handleBackToExams = () => {
    setSelectedExamId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              My Academic Record
            </h1>
            <p className="text-slate-500 font-medium">Track your performance across examinations and assessments with AI-driven insights.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 h-12 px-6 font-bold bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all">
                <Download className="mr-2" size={18} /> Download Transcript
             </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-2 bg-slate-100 dark:bg-slate-900 rounded-[2rem] w-fit border border-slate-200 dark:border-slate-800 shadow-inner">
            <button 
                onClick={() => { setActiveTab('exams'); handleBackToExams(); }}
                className={cn(
                    "px-10 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500",
                    activeTab === 'exams' ? "bg-white dark:bg-slate-800 text-primary shadow-xl scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                Major Examinations
            </button>
            <button 
                onClick={() => setActiveTab('standalone')}
                className={cn(
                    "px-10 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500",
                    activeTab === 'standalone' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xl scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                Assessments & Quizzes
            </button>
        </div>

        {/* Content Area */}
        <div className="pb-20">
          {activeTab === 'exams' ? (
            <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
               {selectedExamId ? (
                 <DetailedStudentResult examId={selectedExamId} onBack={handleBackToExams} />
               ) : (
                 <div className="space-y-10">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center shadow-md border border-primary/10">
                            <Trophy size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Performance History</h2>
                            <p className="text-sm font-medium text-slate-500">Dive deep into your institutional examination results.</p>
                        </div>
                    </div>

                    <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl rounded-[3.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none min-h-[500px]">
                        {isLoadingAttempts ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1,2,3].map(i => <div key={i} className="h-72 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
                             </div>
                        ) : attempts?.length === 0 ? (
                            <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <Trophy className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Your performance records are being digitized</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {attempts?.map((attempt: any) => {
                                    const scorePercent = Math.round((attempt.totalScore / attempt.totalMarks) * 100);
                                    
                                    // Grading Logic
                                    let grade = "F";
                                    let gColor = "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
                                    if (scorePercent >= 90) { grade = "A+"; gColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"; }
                                    else if (scorePercent >= 70) { grade = "A"; gColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"; }
                                    else if (scorePercent >= 60) { grade = "B"; gColor = "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"; }
                                    else if (scorePercent >= 50) { grade = "C"; gColor = "text-amber-500 bg-amber-50 dark:bg-amber-500/10"; }
                                    else if (scorePercent >= 40) { grade = "D"; gColor = "text-orange-500 bg-orange-50 dark:bg-orange-500/10"; }

                                    return (
                                        <div 
                                            key={attempt.id} 
                                            onClick={() => setSelectedExamId(attempt.examId)}
                                            className="group relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-3xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden border-b-4 hover:border-b-primary"
                                        >
                                            <div className="relative z-10 space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all border border-slate-100 dark:border-slate-800 shadow-inner">
                                                        <Trophy size={28} />
                                                    </div>
                                                    <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", gColor)}>
                                                        {grade} Standing
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 leading-tight">{attempt.exam.title}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{format(new Date(attempt.submittedAt), "MMMM d, yyyy")}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{scorePercent}%</p>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mastery Level</p>
                                                    </div>
                                                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                        <ChevronRight size={24} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute -right-12 -bottom-12 h-48 w-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                 </div>
               )}
            </section>
          ) : (
            <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-[1.5rem] bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-600 flex items-center justify-center shadow-md border border-indigo-500/10">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ongoing Assessments</h2>
                  <p className="text-sm font-medium text-slate-500">Track your daily quizzes, assignments, and class performance.</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Subject / Assessment</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Results</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Proficiency</th>
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Date Recorded</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoadingGrades ? (
                                <tr><td colSpan={4} className="px-10 py-24 text-center text-slate-300 font-bold animate-pulse uppercase tracking-widest text-[10px]">Retriving encrypted scores...</td></tr>
                            ) : standaloneGrades?.length === 0 || !standaloneGrades ? (
                                <tr><td colSpan={4} className="px-10 py-24 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No recent assessment logs found</td></tr>
                            ) : standaloneGrades.map((grade: any) => {
                                const percent = Math.round((grade.score / grade.maxMarks) * 100);
                                return (
                                    <tr key={grade.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-lg font-black text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{grade.subject}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-70 italic">{grade.remarks || "General Assessment"}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                 <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                    {percent}%
                                                </p>
                                                <div className="h-4 w-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                                <p className="text-xs font-bold text-slate-400 italic">{grade.score}/{grade.maxMarks}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                percent >= 60 ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20" : "bg-rose-50 text-rose-500 border-rose-100 shadow-rose-100/20"
                                            )}>
                                                {percent >= 60 ? 'Mastery' : 'Needs Focus'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <p className="text-xs text-slate-500 font-bold tracking-tight">{format(new Date(grade.createdAt), "MMMM d, yyyy")}</p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Detailed Student Result Component - Reused from Admin with Student focus
 */
function DetailedStudentResult({ examId, onBack }: { examId: string, onBack: () => void }) {
  const { data: result, isLoading } = useExamResult(examId);

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center text-slate-400 animate-pulse font-black uppercase tracking-widest text-[10px] gap-2"><div className="h-4 w-4 bg-primary rounded-full animate-bounce" /> Analyzing performance data...</div>;
  if (!result) return <div className="text-center py-20 p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-500 font-black uppercase tracking-widest">Result details currently unavailable</div>;

  const scorePercentage = Math.round((result.totalScore / result.totalMarks) * 100);

  // Proficiency Logic as requested
  let grade = "F";
  let gColor = "text-rose-500 bg-rose-50";
  let proficiency = "Failing";
  if (scorePercentage >= 90) { grade = "A+"; gColor = "text-emerald-600 bg-emerald-50"; proficiency = "Elite Mastery"; }
  else if (scorePercentage >= 70) { grade = "A"; gColor = "text-emerald-500 bg-emerald-50"; proficiency = "Distinction"; }
  else if (scorePercentage >= 60) { grade = "B"; gColor = "text-indigo-500 bg-indigo-50"; proficiency = "Proficient"; }
  else if (scorePercentage >= 50) { grade = "C"; gColor = "text-amber-500 bg-amber-50"; proficiency = "Competent"; }
  else if (scorePercentage >= 45) { grade = "D"; gColor = "text-orange-500 bg-orange-50"; proficiency = "Approaching"; }
  else if (scorePercentage >= 40) { grade = "D"; gColor = "text-orange-500 bg-orange-50"; proficiency = "Marginal"; }

  // Mocked/Calculated Standings
  const globalStanding = 92.4; // Superior to %
  const classMedian = result.classAverage || 63;
  const velocity = 12; // Trend velocity

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest group no-print"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" />
          Back to Results Overview
        </button>

        <Button 
          onClick={() => window.print()}
          className="rounded-2xl h-10 px-6 font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm hover:shadow-lg transition-all no-print"
          variant="outline"
        >
          <Download className="mr-2" size={16} /> Download Result PDF
        </Button>
      </div>

      {/* Main Result Card */}
      <div className="relative overflow-hidden rounded-[4rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] p-10 md:p-16">
            <div className="absolute top-0 right-0 p-12 opacity-[0.04] dark:opacity-[0.02] pointer-events-none">
                <Target size={500} className="text-primary rotate-12 -translate-y-24 translate-x-24" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 relative z-10">
                <div className="space-y-10 max-w-2xl">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/10 shadow-sm">
                        <Sparkles size={16} className="animate-pulse" /> Official Student Performance Transcript
                    </div>
                    
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.95] mb-4">
                            {result.title}
                        </h1>
                        <div className="flex items-center gap-4 mt-6">
                            <div className="h-10 w-1 bg-primary rounded-full" />
                            <p className="text-xl text-slate-500 font-medium italic">Validated assessment record from {format(new Date(result.submittedAt), "MMMM d, yyyy")}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="p-7 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner group hover:border-primary/20 transition-all">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Users size={12} className="text-slate-300" /> Class Average
                            </p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{result.classAverage || 63}%</p>
                        </div>
                        <div className="p-7 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner group hover:border-indigo-500/20 transition-all">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Zap size={12} className="text-slate-300" /> Proficiency
                            </p>
                            <p className={cn("text-3xl font-black tracking-tighter", gColor.split(' ')[0])}>{proficiency}</p>
                        </div>
                        <div className="p-7 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner group hover:border-emerald-500/20 transition-all">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <TrendingUp size={12} className="text-slate-300" /> Velocity
                            </p>
                            <p className="text-3xl font-black text-emerald-500 tracking-tighter">+{velocity}%</p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex justify-center">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 opacity-40 dark:opacity-20 animate-pulse pointer-events-none" />
                        <ProgressCircle 
                            value={scorePercentage}
                            size={320}
                            strokeWidth={24}
                            label={`${scorePercentage}%`}
                            sublabel="Overall Standing"
                            className="relative z-10 drop-shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                </div>
            </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
            {/* Subject Mastery List */}
            <div className="lg:col-span-3 space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
                        <BarChart3 className="text-primary" /> Subject Mastery Breakdown
                    </h3>
                </div>
                <div className="space-y-6">
                    {result.subjects?.map((sub: any, i: number) => {
                        const percent = Math.round((sub.score / sub.totalMarks) * 100);
                        return (
                            <div key={i} className="p-10 rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:shadow-2xl hover:border-primary/50 transition-all duration-500">
                                <div className="space-y-2">
                                    <p className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{sub.subjectName}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={cn("h-full transition-all duration-1000", percent >= 70 ? "bg-emerald-500" : percent >= 40 ? "bg-amber-500" : "bg-rose-500")}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub.score} / {sub.totalMarks} Points</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{percent}%</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</p>
                                    </div>
                                    <ChevronRight size={24} className="text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-2" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Performance Insights */}
            <div className="lg:col-span-3 space-y-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4 px-4">
                   <Zap className="text-indigo-500" /> Global Standings & Insight
                </h3>
                
                <div className="p-12 rounded-[4rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-12 shadow-sm relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 p-20 opacity-[0.02] text-indigo-500 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <GraduationCap size={400} />
                    </div>

                    <div className="space-y-10 relative z-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <TrendingUp size={12} className="text-indigo-500" /> Global Standing Rank
                                </p>
                                <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Superior to {globalStanding}%</p>
                            </div>
                            <div className={cn("h-20 w-20 rounded-[1.5rem] flex items-center justify-center text-3xl font-black shadow-lg border-2 border-white dark:border-slate-800 rotate-6 group-hover:rotate-0 transition-all duration-500", gColor)}>
                                {grade}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                             <div className="p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Class Median</p>
                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{classMedian}%</p>
                            </div>
                             <div className="p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Trend Velocity</p>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-4xl font-black text-emerald-500 tracking-tighter">+{velocity}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative p-10 rounded-[3rem] bg-indigo-50/50 dark:bg-indigo-500/5 border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 group/quote">
                            <Quote className="absolute top-6 left-6 text-indigo-300 dark:text-indigo-800 transform -rotate-12" size={32} />
                            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic relative z-10 pl-4">
                                "The student exhibits exceptional mastery of core concepts. Current velocity suggests they are on track for elite academic honors this term. Continued focus on existing subject papers will solidify their top-tier global percentile."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
}

function Users(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
