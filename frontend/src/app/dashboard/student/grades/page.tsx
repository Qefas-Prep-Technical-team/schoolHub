"use client";

import { useState } from 'react';
import { 
  ChevronRight, 
  ArrowLeft,
  Trophy, 
  FileText,
  GraduationCap,
  Download,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  Quote,
  Eye,
  Loader2,
  Users,
  BrainCircuit,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStudentExamAttempts, useExamResult } from '@/lib/api/hooks/useExams';
import { useGrades, useClassLeaderboard } from '@/lib/api/hooks/useGrades';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProgressCircle from '@/components/ui/ProgressCircle';
import Pagination from '@/components/ui/Pagination';
import dynamic from 'next/dynamic';
import IndividualStudentReport from '@/app/dashboard/admin/grades/components/IndividualStudentReport';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function StudentGradesPage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [activeTab, setActiveTab ] = useState<'exams' | 'standalone'>('exams');
  const [caTab, setCaTab] = useState<'ALL' | 'CA' | 'QUIZ' | 'ASSIGNMENT'>('ALL');
  const [examsPage, setExamsPage] = useState(1);
  const [gradesPage, setGradesPage] = useState(1);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const itemsPerPage = 6;
  
  const { user } = useAuthStore();

  // Data fetching
  const { data: attemptsData, isLoading: isLoadingAttempts } = useStudentExamAttempts({ 
    page: examsPage, 
    limit: itemsPerPage 
  });
  const { data: standaloneGradesData, isLoading: isLoadingGrades } = useGrades(undefined, { 
    page: gradesPage, 
    limit: itemsPerPage,
    assessmentType: caTab === 'ALL' ? 'CA,QUIZ,ASSIGNMENT' : caTab
  });
  const attempts = attemptsData?.attempts || [];
  const examPagination = attemptsData?.pagination;
  const standaloneGrades = standaloneGradesData?.grades || [];
  const gradePagination = standaloneGradesData?.pagination;

  // Extract classId from fetched grades since user object might not have it
  const studentClassId = standaloneGrades.find((g: any) => g.classId)?.classId || attempts.find((a: any) => a.classId)?.classId;
  const { data: leaderboardData } = useClassLeaderboard(studentClassId);

  const handleBackToExams = () => setSelectedExamId(null);

  const calculateCumulativeAvg = () => {
    const examPercents = attemptsData?.attempts?.map((a: Record<string, any>) => (a.totalScore / (a.totalMarks || 1)) * 100) || [];
    const standalonePercents = standaloneGradesData?.grades?.map((g: Record<string, any>) => (g.score / (g.maxMarks || 1)) * 100) || [];
    const allPercents = [...examPercents, ...standalonePercents];  
    if (allPercents.length === 0) return "3.8"; // Default placeholder if empty
    const avg = allPercents.reduce((acc, curr) => acc + (curr || 0), 0) / allPercents.length;
    return (avg / 25).toFixed(1); // Rough conversion to 4.0 scale
  };
  const gpa = calculateCumulativeAvg();
  const progressPercent = Math.round((parseFloat(gpa) / 4.0) * 100);

  if (selectedExamId) {
    return <DetailedStudentResult examId={selectedExamId} onBack={handleBackToExams} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#191C1D] font-lexend selection:bg-[#D9E2FF] p-6 lg:p-10 pb-32">
      <main className="max-w-7xl mx-auto space-y-12">
        
        {/* --- DESKTOP VIEW (hidden lg:grid/block) --- */}
        <div className="hidden lg:block space-y-12">
          {/* Desktop GPA & Standing Section - Bento Grid */}
          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-10 flex items-center justify-between shadow-[0_12px_40px_rgba(25,28,29,0.05)] border border-slate-100/50 dark:border-slate-800/50">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#0856c8] dark:text-blue-400 uppercase tracking-[0.3em]">Academic Performance</p>
                <h2 className="text-5xl font-black text-[#191c1d] dark:text-white tracking-tighter">Overall Performance</h2>
                <p className="text-slate-500 max-w-md font-medium leading-relaxed italic">Maintaining excellent consistency across all core subjects and electives.</p>
              </div>
              <div className="text-right">
                <div className="text-8xl font-black text-[#0856c8] dark:text-blue-400 tracking-tighter italic">{gpa}<span className="text-2xl text-slate-300 dark:text-slate-700 font-normal"> / 4.0</span></div>
                <p className="text-[10px] font-black text-[#445581] dark:text-blue-300 bg-[#d9e2ff]/50 dark:bg-blue-900/20 px-4 py-2 rounded-full inline-block mt-4 uppercase tracking-widest">Excellent Result</p>
              </div>
            </div>

            <div 
              onClick={() => setIsLeaderboardOpen(true)}
              className="col-span-4 bg-gradient-to-br from-[#0856c8] to-[#3670e2] rounded-3xl p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-pink-500/10 cursor-pointer hover:shadow-blue-500/30 transition-all duration-300"
            >
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Trophy size={160} strokeWidth={1} />
              </div>
              <div className="z-10">
                <Sparkles size={32} className="mb-6 opacity-60" />
                <h3 className="text-3xl font-black italic leading-tight tracking-tight">Distinction<br/>Track</h3>
              </div>
              <div className="z-10 mt-8 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Progress: {progressPercent}%</p>
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-2xl transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </section>

          {/* Desktop Major Exams Section */}
          <section className="space-y-8">
            <div className="flex items-end justify-between px-2">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-[#191c1d] dark:text-white">Main Examinations</h3>
                <p className="text-slate-500 text-sm font-medium italic">Results for mid-term and end of term examinations</p>
              </div>
              {attempts.length > 0 && (
                <PDFDownloadLink
                  document={<IndividualStudentReport result={attempts[0]} school={attempts[0].school} />}
                  fileName="Academic_Report.pdf"
                >
                  {({ loading }) => (
                    <button className="text-[#0856c8] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline">
                      {loading ? 'Processing...' : 'View Full Transcript'} 
                      <Download size={16} />
                    </button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
            <div className="grid grid-cols-4 gap-6">
              {isLoadingAttempts ? (
                [1, 2, 3, 4].map(i => <div key={i} className="h-56 rounded-[2.5rem] bg-white dark:bg-slate-900 animate-pulse" />)
              ) : attempts.map((attempt: Record<string, any>) => {
                  const scorePercent = Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100);
                  let grade = "C"; let color = "text-[#0856c8] dark:text-blue-400"; let bg = "bg-[#d9e2ff] dark:bg-blue-900/30";
                  if (scorePercent >= 75) grade = "A";
                  else if (scorePercent >= 65) grade = "B";
                  else if (scorePercent < 50) { grade = "F"; color = "text-rose-600 dark:text-rose-400"; bg = "bg-rose-100 dark:bg-rose-900/30"; }
                  
                  return (
                    <div 
                      key={attempt.id} 
                      onClick={() => setSelectedExamId(attempt.examId)}
                      className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] space-y-5 hover:translate-y-[-8px] transition-all duration-500 shadow-[0_12px_40px_rgba(25,28,29,0.03)] border border-slate-100/50 dark:border-slate-800/50 cursor-pointer group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group-hover:bg-[#d9e2ff] dark:group-hover:bg-blue-900/20 transition-colors">
                          <GraduationCap className="text-[#0856c8] dark:text-blue-400" size={24} />
                        </div>
                        <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm", bg, color)}>
                          {grade}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-black text-[#191c1d] dark:text-white text-base italic tracking-tight group-hover:text-[#0856c8] dark:group-hover:text-blue-400 transition-colors line-clamp-1">{attempt.exam.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Module • {attempt.exam.code}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                        <span className="text-2xl font-black text-[#191c1d] dark:text-white tracking-tighter italic">
                          {attempt.totalScore}<span className="text-sm font-normal text-slate-200 dark:text-slate-700">/{attempt.totalMarks}</span>
                        </span>
                        <span className="text-xs font-black text-[#0856c8] dark:text-blue-400 italic">{scorePercent}%</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            {examPagination && examPagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                  <Pagination
                      currentPage={examsPage}
                      totalPages={examPagination.totalPages}
                      totalItems={examPagination.total}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setExamsPage}
                  />
              </div>
            )}
          </section>

          {/* Desktop Assessments Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-[#191c1d] dark:text-white">Continuous Assessment (C.A)</h3>
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                    {['ALL', 'CA', 'QUIZ', 'ASSIGNMENT'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => { setCaTab(tab as any); setGradesPage(1); }}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                                caTab === tab ? "bg-white dark:bg-slate-800 text-[#0856C8] dark:text-blue-400 shadow-[0_4px_15px_rgba(0,0,0,0.05)] scale-105" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            {tab === 'QUIZ' ? 'Tests' : tab === 'ASSIGNMENT' ? 'Assignments' : tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_12px_40px_rgba(25,28,29,0.03)] border border-slate-100/50 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-10 py-7 text-[10px] font-black text-[#445581] dark:text-blue-300 uppercase tracking-widest">Date</th>
                    <th className="px-10 py-7 text-[10px] font-black text-[#445581] dark:text-blue-300 uppercase tracking-widest">Subject</th>
                    <th className="px-10 py-7 text-[10px] font-black text-[#445581] dark:text-blue-300 uppercase tracking-widest">Type</th>
                    <th className="px-10 py-7 text-[10px] font-black text-[#445581] dark:text-blue-300 uppercase tracking-widest text-right">Score Obtained</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {standaloneGrades.map((grade: Record<string, any>) => {
                    const percent = Math.round((grade.score / (grade.maxMarks || 1)) * 100);
                    return (
                      <tr key={grade.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-10 py-7 text-xs font-bold text-slate-400 uppercase">{format(new Date(grade.createdAt), "MMM d, yyyy")}</td>
                        <td className="px-10 py-7">
                          <h5 className="text-sm font-black text-[#191c1d] dark:text-white uppercase italic group-hover:text-[#0856c8] dark:group-hover:text-blue-400 transition-colors">{grade.subject}</h5>
                        </td>
                        <td className="px-10 py-7">
                          <span className={cn(
                            "px-5 py-2 rounded-full text-[9px] font-black tracking-widest uppercase",
                            grade.remarks?.toLowerCase().includes('quiz') ? "bg-[#d9e2ff] text-[#0856c8] dark:bg-blue-900/30 dark:text-blue-400" : "bg-[#ffdbc8] text-[#753400] dark:bg-orange-900/30 dark:text-orange-400"
                          )}>
                            {grade.remarks || 'Standard'}
                          </span>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <span className="text-xl font-black text-[#191c1d] dark:text-white italic">{grade.score}<span className="text-xs font-normal text-slate-200 dark:text-slate-700">/{grade.maxMarks}</span></span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {gradePagination && gradePagination.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                  <Pagination
                      currentPage={gradesPage}
                      totalPages={gradePagination.totalPages}
                      totalItems={gradePagination.total}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setGradesPage}
                  />
              </div>
            )}
          </section>
        </div>

        {/* --- MOBILE VIEW (lg:hidden) --- */}
        <div className="lg:hidden space-y-12">
          {/* Mobile GPA Hero */}
          <section>
            <div className="flex flex-col justify-between items-start mb-8 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0856C8] dark:text-blue-400 mb-1">Overall Performance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tighter text-[#191C1D] dark:text-white italic">{gpa}</span>
                  <span className="text-2xl font-medium text-slate-400">/ 4.0</span>
                </div>
              </div>
            </div>
            <div 
              onClick={() => setIsLeaderboardOpen(true)}
              className="relative bg-gradient-to-br from-[#0856C8] to-[#3670E2] rounded-3xl p-8 text-white shadow-2xl shadow-pink-500/20 overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10 space-y-2">
                <h3 className="text-2xl font-black italic tracking-tight">Distinction Track</h3>
                <p className="opacity-90 max-w-[240px] text-sm font-medium leading-relaxed">You are in the top 5% of the Sophomore class this term.</p>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-1000">
                <Trophy size={200} />
              </div>
            </div>
          </section>

          {/* Mobile Major Exams */}
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Main Exams</h2>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  <button onClick={() => setActiveTab('exams')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'exams' ? "bg-white dark:bg-slate-800 text-[#0856C8] dark:text-white shadow-sm" : "text-slate-400")}>Exams</button>
                  <button onClick={() => setActiveTab('standalone')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'standalone' ? "bg-white dark:bg-slate-800 text-[#0856C8] dark:text-white shadow-sm" : "text-slate-400")}>C.A</button>
              </div>
            </div>

            {activeTab === 'exams' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoadingAttempts ? (
                  [1, 2].map(i => <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse" />)
                ) : attempts.map((attempt: Record<string, any>) => {
                    const scorePercent = Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100);
                    let grade = "C"; let color = "text-[#0856C8] dark:text-blue-400"; let bg = "bg-[#D9E2FF] dark:bg-blue-900/30";
                    if (scorePercent >= 75) grade = "A";
                    else if (scorePercent >= 65) grade = "B";
                    else if (scorePercent < 50) { grade = "F"; color = "text-error dark:text-rose-400"; bg = "bg-error-container dark:bg-rose-900/30"; }
                    
                    return (
                      <div 
                        key={attempt.id} 
                        onClick={() => setSelectedExamId(attempt.examId)}
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[0_12px_40px_rgba(25,28,29,0.03)] border border-[#C3C6D6]/20 dark:border-slate-800 cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1">
                            <span className={cn("text-[10px] font-black uppercase tracking-tighter mb-1 block", color)}>Module • {attempt.exam.code}</span>
                            <h4 className="text-xl font-black italic tracking-tight text-slate-900 dark:text-white group-hover:text-[#0856C8] dark:group-hover:text-blue-400 transition-colors truncate max-w-[180px]">{attempt.exam.title}</h4>
                          </div>
                          <div className={cn("w-14 h-14 flex items-center justify-center rounded-full text-2xl font-black italic shadow-inner", bg, color)}>
                            {grade}
                          </div>
                        </div>
                        <div className="h-2.5 bg-[#EDEEEF] dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                          <div className={cn("h-full rounded-full", scorePercent >= 50 ? "bg-[#0856C8]" : "bg-[#BA1A1A]")} style={{ width: `${scorePercent}%` }} />
                        </div>
                      </div>
                    );
                  })
                }
                {/* Pagination (Mobile) */}
                {examPagination && examPagination.totalPages > 1 && (
                  <div className="col-span-full mt-4 flex justify-center">
                      <Pagination
                          currentPage={examsPage}
                          totalPages={examPagination.totalPages}
                          totalItems={examPagination.total}
                          itemsPerPage={itemsPerPage}
                          onPageChange={setExamsPage}
                      />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-6">
                    {['ALL', 'CA', 'QUIZ', 'ASSIGNMENT'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => { setCaTab(tab as any); setGradesPage(1); }}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                                caTab === tab ? "bg-[#0856C8] text-white shadow-md" : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                            )}
                        >
                            {tab === 'QUIZ' ? 'Tests' : tab === 'ASSIGNMENT' ? 'Assignments' : tab}
                        </button>
                    ))}
                </div>
                {standaloneGrades.map((grade: Record<string, any>) => {
                  const percent = Math.round((grade.score / (grade.maxMarks || 1)) * 100);
                  const isQuiz = grade.remarks?.toLowerCase().includes('quiz');
                  const Icon = isQuiz ? Zap : FileText;
                  return (
                    <div key={grade.id} className="bg-[#F3F4F5] dark:bg-slate-900/50 p-5 rounded-3xl flex items-center gap-5 border border-transparent hover:border-[#0856C8]/20 dark:hover:border-blue-500/20 hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg transition-all active:scale-[0.98]">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#0856C8] dark:text-blue-400 shadow-sm shrink-0">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-black italic uppercase tracking-tight text-slate-900 dark:text-white truncate">{grade.subject}</h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(grade.createdAt), "MMM d, yyyy")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-sm font-black italic mb-1 text-slate-900 dark:text-white">{grade.score}/{grade.maxMarks}</span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                          percent >= 50 ? "bg-[#D9E2FF] text-[#0856C8] dark:bg-blue-900/30 dark:text-blue-400" : "bg-error-container text-error dark:bg-rose-900/30 dark:text-rose-400"
                        )}>
                           {isQuiz ? 'TEST' : 'ESSAY'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {gradePagination && gradePagination.totalPages > 1 && (
                  <div className="mt-6 flex justify-center pb-8">
                      <Pagination
                          currentPage={gradesPage}
                          totalPages={gradePagination.totalPages}
                          totalItems={gradePagination.total}
                          itemsPerPage={itemsPerPage}
                          onPageChange={setGradesPage}
                      />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Top 5 Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsLeaderboardOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-[#0856C8] dark:text-blue-400 rounded-2xl flex items-center justify-center">
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tight text-slate-900 dark:text-white">Class Top 5</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Distinction Track</p>
              </div>
            </div>

            <div className="space-y-3">
              {(!leaderboardData || leaderboardData.length === 0) ? (
                <p className="text-center text-sm font-medium text-slate-500 py-4 italic">No scores available yet.</p>
              ) : (
                leaderboardData.map((score, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                        index === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        index === 1 ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" :
                        index === 2 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" :
                        "bg-blue-50 text-[#0856C8] dark:bg-blue-900/20 dark:text-blue-400"
                      )}>
                        #{index + 1}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm italic">Student</span>
                    </div>
                    <span className="font-black text-[#0856C8] dark:text-blue-400">{score}%</span>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setIsLeaderboardOpen(false)}
              className="mt-8 w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
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

  const scorePercentage = Math.round((result.totalScore / (result.totalMarks || 1)) * 100);

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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 overflow-x-clip">
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

            <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-6 sm:p-10 md:p-20">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-20">
                    
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
                            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[0.85] italic uppercase break-words">
                                {result.title}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-500 font-bold italic opacity-60">
                                Recorded on {format(new Date(result.submittedAt), "MMMM d, yyyy")}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 w-full mt-6">
                            <Button
                                onClick={() => {
                                    setIsReviewing(true);
                                    router.push(`/dashboard/student/exams&quizzes/${examId}/review`);
                                }}
                                disabled={isReviewing}
                                className="w-full sm:w-auto h-16 px-6 sm:px-10 text-xs font-black rounded-3xl gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest no-print"
                            >
                                {isReviewing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Eye size={20} /> Review Answers</>}
                            </Button>
                            
                            <div className="w-full sm:w-auto h-16 flex items-center justify-center sm:justify-start gap-4 px-6 sm:px-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <Users size={20} className="text-slate-400 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 truncate">
                                    Class Average: <span className="text-slate-900 dark:text-white">{result.classAverage || 63}%</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 relative w-full flex justify-center mt-6 lg:mt-0">
                        <div className="relative p-2 sm:p-4 md:p-6 w-full max-w-[320px]">
                            {/* Floating Grade Badge */}
                            <div className="absolute -top-2 -right-2 md:-top-6 md:-right-4 z-20 h-16 w-16 md:h-24 md:w-24 rounded-full md:rounded-[2rem] bg-primary flex flex-col items-center justify-center text-white shadow-2xl md:rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Grade</p>
                                <p className="text-lg md:text-3xl font-black">{grade}</p>
                            </div>

                            <div className="relative flex justify-center items-center scale-[0.75] sm:scale-90 md:scale-100 -my-8 sm:-my-4 md:-my-0">
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

                            <div className="mt-4 sm:mt-8 text-center space-y-1">
                                <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{result.totalScore} <span className="text-slate-300 dark:text-slate-700">/ {result.totalMarks}</span></p>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">POINTS EARNED</p>
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
                    {result.subjects?.map((sub: Record<string, any>, i: number) => {
                        const percent = Math.round((sub.score / (sub.totalMarks || 1)) * 100);
                        return (
                            <div key={i} className="group p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-4 md:hover:shadow-2xl hover:border-primary/40 transition-all duration-500 overflow-hidden relative">
                                <div className="absolute -right-8 -top-8 p-10 opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none">
                                    <GraduationCap size={160} />
                                </div>
                                
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                                            <Target size={18} className="md:w-6 md:h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm md:text-xl font-bold md:font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors italic md:uppercase truncate">{sub.subjectName}</p>
                                            <p className="text-[10px] text-slate-500 md:text-slate-400 font-medium md:font-black md:uppercase md:tracking-widest mt-0.5">Score: {sub.score} / {sub.totalMarks}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full sm:max-w-[160px] space-y-2">
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

                                <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                                    <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{percent}%</p>
                                    <p className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Institutional Verified</p>
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
                
                <div className="p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] bg-slate-950 border border-slate-800 space-y-8 md:space-y-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 p-20 opacity-[0.05] text-primary pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <Zap size={400} />
                    </div>

                    <div className="space-y-8 md:space-y-10 relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="inline-flex items-center gap-3 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-primary/20 text-primary border border-primary/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Registrar's Verdict
                            </div>
                            <div className={cn("h-16 w-20 md:h-20 md:w-24 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center text-3xl md:text-4xl font-black shadow-2xl border-[3px] md:border-4 border-slate-900 md:rotate-6 group-hover:rotate-0 transition-all duration-500", gColor)}>
                                {grade}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                             <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 dark:bg-slate-900/50 border border-slate-800 shadow-inner text-center">
                                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Velocity Update</p>
                                <div className="flex items-center justify-center gap-3">
                                    <TrendingUp size={24} className={cn("md:w-6 md:h-6 w-5 h-5", result.velocity >= 0 ? "text-emerald-500" : "text-rose-500")} />
                                    <p className={cn("text-3xl md:text-4xl font-black tracking-tighter transition-all", result.velocity >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                        {result.velocity > 0 ? `+${result.velocity}` : result.velocity}%
                                    </p>
                                </div>
                            </div>
                             <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 dark:bg-slate-900/50 border border-slate-800 shadow-inner text-center">
                                <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Peer Standing</p>
                                <p className="text-3xl md:text-4xl font-black text-slate-300 tracking-tighter">Top {100 - (result.globalStanding || 0)}%</p>
                            </div>
                        </div>

                        <div className="relative p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-primary/5 border-2 border-dashed border-primary/10 group/quote shadow-2xl overflow-hidden flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                            {/* AI Icon */}
                            <div className={cn(
                                "shrink-0 h-14 w-14 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] bg-slate-950 border flex items-center justify-center shadow-lg transition-all duration-500 relative z-10",
                                result.hasAiInsightAccess 
                                    ? "text-primary border-primary/30 group-hover/quote:scale-110 group-hover/quote:rotate-6" 
                                    : "text-slate-500 border-slate-800"
                            )}>
                                <BrainCircuit className="w-8 h-8 md:w-10 md:h-10" />
                            </div>

                            <div className="flex-1 relative w-full">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">AI Analysis</h4>
                                    {result.hasAiInsightAccess ? (
                                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                                            <Sparkles size={10} /> Active
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <Lock size={10} /> Premium
                                        </span>
                                    )}
                                </div>

                                <div className="relative">
                                    <Quote className="absolute -top-4 -left-4 text-primary/10 transform -rotate-12 w-8 h-8" />
                                    <p className={cn(
                                        "text-sm md:text-lg text-slate-400 leading-relaxed font-bold italic relative z-10 pl-6 transition-all duration-300",
                                        !result.hasAiInsightAccess && "blur-[6px] select-none opacity-50"
                                    )}>
                                        "{result.performanceInsight || "Premium AI insights analyze your strengths and weaknesses to provide personalized recommendations. Upgrade your plan to see detailed analysis, study guides, and predictive scoring based on this exam performance."}"
                                    </p>
                                </div>

                                {/* Premium Overlay */}
                                {!result.hasAiInsightAccess && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/20 rounded-2xl p-4 text-center">
                                        <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] border-0 gap-2 h-10 md:h-12 px-6 md:px-8 text-xs md:text-sm font-black uppercase tracking-widest mb-2 transition-transform hover:scale-105 active:scale-95">
                                            <Sparkles size={16} /> Upgrade Plan
                                        </Button>
                                        <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest drop-shadow-md">
                                            Unlock Deep AI Insights
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
}

