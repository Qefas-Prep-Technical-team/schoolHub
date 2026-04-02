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
  Quote,
  Eye,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStudentExamAttempts, useExamResult } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProgressCircle from '@/components/ui/ProgressCircle';
import dynamic from 'next/dynamic';
import IndividualStudentReport from '@/app/dashboard/admin/grades/components/IndividualStudentReport';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function StudentGradesPage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'exams' | 'standalone'>('exams');

  // Data fetching
  const { data: attempts, isLoading: isLoadingAttempts } = useStudentExamAttempts();
  const { data: standaloneGrades, isLoading: isLoadingGrades } = useGrades();

  const handleBackToExams = () => {
    setSelectedExamId(null);
  };

  // Calculate Cumulative Academic Index
  const calculateCumulativeAvg = () => {
    const examPercents = attempts?.map((a: any) => (a.totalScore / a.totalMarks) * 100) || [];
    const standalonePercents = standaloneGrades?.map((g: any) => (g.score / g.maxMarks) * 100) || [];
    const allPercents = [...examPercents, ...standalonePercents];  
    if (allPercents.length === 0) return 0;
    return Math.round(allPercents.reduce((acc, curr) => acc + curr, 0) / allPercents.length);
  };
  const cumulativeAvg = calculateCumulativeAvg();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Premium Academic Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
            <GraduationCap size={320} className="text-primary" />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                  Academic Performance
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                   Certified Digital Record
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] uppercase italic">
                Performance <br />
                <span className="text-slate-300 dark:text-slate-700">Hub</span>
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
                <div className="p-6 md:p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-inner flex items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        <TrendingUp size={30} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Cumulative Index</p>
                        <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{cumulativeAvg}%</p>
                            <span className="text-[10px] font-black text-emerald-500 uppercase mb-1.5 animate-pulse">Live Tracking</span>
                        </div>
                    </div>
                </div>

              {/* For transcript, we'll download the most recent if available or just the first attempt for now to demonstrate functionality */}
              {attempts && attempts.length > 0 ? (
                <PDFDownloadLink
                  document={<IndividualStudentReport result={attempts[0]} school={attempts[0].school} />}
                  fileName="Full_Academic_Transcript.pdf"
                >
                  {({ loading }) => (
                    <Button 
                      disabled={loading}
                      variant="outline"
                      className="rounded-3xl h-16 px-8 font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl hover:scale-105 transition-all text-slate-900 dark:text-white"
                    >
                      <Download className="mr-2" size={18} /> {loading ? 'Preparing...' : 'Full Transcript'}
                    </Button>
                  )}
                </PDFDownloadLink>
              ) : null}
            </div>
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
                                    
                                    // Nigerian Grading Logic
                                    let grade = "F9";
                                    let gColor = "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
                                    if (scorePercent >= 75) { grade = "A1"; gColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"; }
                                    else if (scorePercent >= 70) { grade = "B2"; gColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"; }
                                    else if (scorePercent >= 65) { grade = "B3"; gColor = "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"; }
                                    else if (scorePercent >= 50) { grade = "C6"; gColor = "text-amber-500 bg-amber-50 dark:bg-amber-500/10"; }
                                    else if (scorePercent >= 40) { grade = "E8"; gColor = "text-orange-500 bg-orange-50 dark:bg-orange-500/10"; }

                                    return (
                                        <div 
                                            key={attempt.id} 
                                            onClick={() => setSelectedExamId(attempt.examId)}
                                            className="group relative bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden"
                                        >
                                            <div className="relative z-10 space-y-8">
                                                <div className="flex justify-between items-start">
                                                    <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all shadow-sm border border-slate-100 dark:border-slate-800">
                                                        <Trophy size={32} />
                                                    </div>
                                                    <div className={cn("px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border", gColor)}>
                                                        {grade} Standing
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight uppercase italic">{attempt.exam.title}</h3>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{format(new Date(attempt.submittedAt), "MMMM d, yyyy")}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{scorePercent}%</p>
                                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{attempt.totalScore} / {attempt.totalMarks} Points</p>
                                                    </div>
                                                    <div className="h-14 w-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover:scale-110 transition-all shadow-xl">
                                                        <ChevronRight size={28} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute -right-12 -bottom-12 h-64 w-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
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
                                    <tr key={grade.id} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-500 group border-b border-slate-100 dark:border-slate-800">
                                        <td className="px-10 py-10">
                                            <div className="flex items-center gap-6">
                                                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all shadow-sm">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors uppercase italic">{grade.subject}</span>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{grade.remarks || "Standard Assessment"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10">
                                            <div className="flex items-end gap-3">
                                                 <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                                    {percent}%
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 mb-1.5 opacity-60 uppercase tracking-widest">{grade.score} / {grade.maxMarks} PTS</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10">
                                            <div className="flex flex-col gap-2">
                                                <span className={cn(
                                                    "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm w-fit",
                                                    percent >= 60 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                                )}>
                                                    {percent >= 60 ? 'Mastery' : 'Needs Focus'}
                                                </span>
                                                <div className="h-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={cn("h-full", percent >= 60 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${percent}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 text-right">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{format(new Date(grade.createdAt), "MMMM d, yyyy")}</p>
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
  const router = useRouter();
  const [isReviewing, setIsReviewing] = useState(false);
  const { data: result, isLoading } = useExamResult(examId);

  if (isLoading) return (
    <div className="flex flex-col h-[50vh] items-center justify-center gap-6">
        <div className="relative">
            <Loader2 className="h-14 w-14 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        </div>
        <p className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-[10px]">Analyzing session data...</p>
    </div>
  );

  if (!result) return (
    <div className="text-center py-20 p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-500 font-black uppercase tracking-widest">
        Result details currently unavailable
    </div>
  );

  const scorePercentage = Math.round((result.totalScore / result.totalMarks) * 100);

  // Nigerian Standard Proficiency Logic
  let grade = "F9";
  let gColor = "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
  let proficiency = "Incomplete";
  if (scorePercentage >= 75) { grade = "A1"; gColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"; proficiency = "Distinction"; }
  else if (scorePercentage >= 70) { grade = "B2"; gColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"; proficiency = "Very Good"; }
  else if (scorePercentage >= 65) { grade = "B3"; gColor = "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"; proficiency = "Good"; }
  else if (scorePercentage >= 50) { grade = "C6"; gColor = "text-amber-500 bg-amber-50 dark:bg-amber-500/10"; proficiency = "Credit"; }
  else if (scorePercentage >= 45) { grade = "D7"; gColor = "text-orange-500 bg-orange-50 dark:bg-orange-500/10"; proficiency = "Pass"; }
  else if (scorePercentage >= 40) { grade = "E8"; gColor = "text-orange-500 bg-orange-50 dark:bg-orange-500/10"; proficiency = "Pass"; }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all text-[11px] font-black uppercase tracking-[0.2em] group no-print"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1.5 transition-transform" />
          Return to History
        </button>

        <div className="flex gap-4 no-print">
            <PDFDownloadLink
                document={<IndividualStudentReport result={result} school={result.school} />}
                fileName={`${result.student?.name?.replace(/\s+/g, '_')}_Transcript.pdf`}
            >
                {({ loading }) => (
                    <Button 
                        disabled={loading}
                        variant="ghost"
                        className="rounded-2xl h-12 px-6 font-black text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-none"
                    >
                        <Download className="mr-3" size={18} /> {loading ? 'Preparing...' : 'Export PDF Result'}
                    </Button>
                )}
            </PDFDownloadLink>
        </div>
      </div>

      {/* Meta-Style Scoreboard Header */}
        <div className="relative group">
            {/* Blurs */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse delay-1000 pointer-events-none" />

            <div className="relative overflow-hidden rounded-[3rem] md:rounded-[4.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-20">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-20">
                    
                    <div className="space-y-10 flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                            <div className="px-5 py-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                                <Sparkles size={14} className="inline mr-2 animate-pulse" /> Certified Transit
                            </div>
                            <div className="px-5 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em]">
                                Level Performance
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.85] italic uppercase">
                                {result.title}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-500 font-bold italic opacity-60">
                                Recorded on {format(new Date(result.submittedAt), "MMMM d, yyyy")}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                            <Button
                                onClick={() => {
                                    setIsReviewing(true);
                                    router.push(`/dashboard/student/exams&quizzes/${examId}/review`);
                                }}
                                disabled={isReviewing}
                                className="h-16 px-10 text-xs font-black rounded-3xl gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest no-print"
                            >
                                {isReviewing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Eye size={20} /> Review Answers</>}
                            </Button>
                            
                            <div className="h-16 flex items-center gap-4 px-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <Users size={20} className="text-slate-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    Class Average: <span className="text-slate-900 dark:text-white">{result.classAverage || 63}%</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 relative">
                        <div className="relative p-6">
                            {/* Floating Grade Badge */}
                            <div className="absolute -top-4 -right-4 z-20 h-24 w-24 rounded-[2rem] bg-primary flex flex-col items-center justify-center text-white shadow-2xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Grade</p>
                                <p className="text-3xl font-black">{grade}</p>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-110 opacity-30 animate-pulse pointer-events-none" />
                                <ProgressCircle
                                    value={scorePercentage}
                                    size={320}
                                    strokeWidth={28}
                                    label={`${scorePercentage}%`}
                                    sublabel="TOTAL MASTERY"
                                    className="relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-700 hover:scale-[1.02]"
                                />
                            </div>

                            <div className="mt-8 text-center space-y-1">
                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{result.totalScore} <span className="text-slate-300 dark:text-slate-700">/ {result.totalMarks}</span></p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">POINTS EARNED</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
            {/* Subject Mastery List */}
            <div className="lg:col-span-3 space-y-10">
                <div className="flex items-center gap-5">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] shrink-0">Subject Competency</h3>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {result.subjects?.map((sub: any, i: number) => {
                        const percent = Math.round((sub.score / sub.totalMarks) * 100);
                        return (
                            <div key={i} className="group p-8 rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-2xl hover:border-primary/40 transition-all duration-500 overflow-hidden relative">
                                <div className="absolute -right-8 -top-8 p-10 opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none">
                                    <GraduationCap size={160} />
                                </div>
                                
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors italic uppercase">{sub.subjectName}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Raw Score: {sub.score} / {sub.totalMarks}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="max-w-[160px] space-y-2">
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800 relative shadow-inner">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000", 
                                                    percent >= 75 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : 
                                                    percent >= 40 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : 
                                                    "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                                )}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{percent}%</p>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Institutional Verified</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Performance Insights */}
            <div className="lg:col-span-3 space-y-10">
                <div className="flex items-center gap-5 px-4">
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] shrink-0">Intelligence Insights</h3>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>
                
                <div className="p-12 rounded-[4rem] bg-slate-950 border border-slate-800 space-y-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 p-20 opacity-[0.05] text-primary pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <Zap size={400} />
                    </div>

                    <div className="space-y-10 relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest leading-none">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Registrar's Verdict
                            </div>
                            <div className={cn("h-20 w-24 rounded-[1.5rem] flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-slate-900 rotate-6 group-hover:rotate-0 transition-all duration-500", gColor)}>
                                {grade}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                             <div className="p-8 rounded-[2.5rem] bg-white/5 dark:bg-slate-900/50 border border-slate-800 shadow-inner text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Velocity Update</p>
                                <div className="flex items-center justify-center gap-3">
                                    <TrendingUp size={24} className={cn(result.velocity >= 0 ? "text-emerald-500" : "text-rose-500")} />
                                    <p className={cn("text-4xl font-black tracking-tighter transition-all", result.velocity >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                        {result.velocity > 0 ? `+${result.velocity}` : result.velocity}%
                                    </p>
                                </div>
                            </div>
                             <div className="p-8 rounded-[2.5rem] bg-white/5 dark:bg-slate-900/50 border border-slate-800 shadow-inner text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Peer Standing</p>
                                <p className="text-4xl font-black text-slate-300 tracking-tighter">Top {100 - (result.globalStanding || 0)}%</p>
                            </div>
                        </div>

                        <div className="relative p-12 rounded-[3.5rem] bg-primary/5 border-2 border-dashed border-primary/10 group/quote shadow-2xl">
                            <Quote className="absolute top-8 left-8 text-primary/20 transform -rotate-12" size={40} />
                            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-bold italic relative z-10 pl-6">
                                "{result.performanceInsight || "Consistency in subject mastery indicates a high trajectory for future academic milestones."}"
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
