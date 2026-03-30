"use client";

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Trophy, 
  User, 
  Calendar, 
  FileText,
  BarChart3,
  Users,
  GraduationCap,
  Percent,
  Download,
  Filter
} from 'lucide-react';
import { useExams, useExamAttempts, useExamResult } from '@/lib/api/hooks/useExams';
import { useAdminGrades } from '@/lib/api/hooks/useGrades';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProgressCircle from '@/components/ui/ProgressCircle';

export default function AdminGradesDashboard() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'exams' | 'standalone'>('exams');
  const [searchTerm, setSearchTerm] = useState('');

  // Data fetching
  const { data: exams, isLoading: isLoadingExams } = useExams();
  const { data: standaloneGrades, isLoading: isLoadingGrades } = useAdminGrades();

  const handleBackToExams = () => {
    setSelectedExamId(null);
    setSelectedStudentId(null);
  };

  const handleBackToStudents = () => {
    setSelectedStudentId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Academic Performance
            </h1>
            <p className="text-slate-500 font-medium">Manage and analyze student performance across the institution.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 h-12 px-6 font-bold bg-white dark:bg-slate-900 shadow-sm">
                <Download className="mr-2" size={18} /> Export Institution Report
             </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 shadow-inner">
            <button 
                onClick={() => setActiveTab('exams')}
                className={cn(
                    "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === 'exams' ? "bg-white dark:bg-slate-800 text-primary shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                Exam Analytics
            </button>
            <button 
                onClick={() => setActiveTab('standalone')}
                className={cn(
                    "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300",
                    activeTab === 'standalone' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
            >
                Standalone Grades
            </button>
        </div>

        {/* Content Area */}
        <div className="pb-20">
          {activeTab === 'exams' ? (
            <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Institution Examinations</h2>
                    <p className="text-sm font-medium text-slate-500">Hierarchical breakdown of major exam performance.</p>
                  </div>
                </div>
                {selectedExamId && (
                   <Button variant="ghost" onClick={handleBackToExams} className="text-primary font-bold hover:bg-primary/5 rounded-xl">
                      View All Exams
                   </Button>
                )}
              </div>
              
              <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-2 md:p-6 shadow-xl shadow-slate-200/20 dark:shadow-none min-h-[400px]">
                <ExamGradesFlow 
                  exams={exams || []} 
                  selectedExamId={selectedExamId}
                  setSelectedExamId={setSelectedExamId}
                  selectedStudentId={selectedStudentId}
                  setSelectedStudentId={setSelectedStudentId}
                  onBackToExams={handleBackToExams}
                  onBackToStudents={handleBackToStudents}
                  isLoading={isLoadingExams}
                />
              </div>
            </section>
          ) : (
            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Standalone Assessment Grades</h2>
                  <p className="text-sm font-medium text-slate-500">Individual quiz and assessment entries not linked to major exams.</p>
                </div>
              </div>
              
              <StandaloneGradesView 
                grades={standaloneGrades || []} 
                isLoading={isLoadingGrades} 
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Exam Grades Flow - Handles Level 1 (Exams), Level 2 (Students), Level 3 (Result)
 */
function ExamGradesFlow({ 
  exams, 
  selectedExamId, 
  setSelectedExamId, 
  selectedStudentId, 
  setSelectedStudentId,
  onBackToExams,
  onBackToStudents,
  isLoading
}: any) {
  
  if (selectedStudentId && selectedExamId) {
    return <DetailedStudentResult examId={selectedExamId} studentId={selectedStudentId} onBack={onBackToStudents} />;
  }

  if (selectedExamId) {
    return <ExamStudentList examId={selectedExamId} onBack={onBackToExams} onSelectStudent={setSelectedStudentId} />;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Search & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search exams..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-700 dark:text-slate-200"
            />
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 h-12 px-6 font-bold">
                <Filter className="mr-2" size={18} /> Filter
             </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
           <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No examination data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam: any) => (
                <div 
                    key={exam.id} 
                    onClick={() => setSelectedExamId(exam.id)}
                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer overflow-hidden"
                >
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="h-14 w-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                                <Trophy size={28} />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {exam.category || 'General'}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{exam.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Class {exam.classId || "All"}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{exam.questions?.length || 0} Papers</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                                        <User size={12} />
                                    </div>
                                ))}
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                    +12
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                    {/* Decorative background circle */}
                    <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Exam Student List - Level 2
 */
function ExamStudentList({ examId, onBack, onSelectStudent }: any) {
  const { data: attempts, isLoading } = useExamAttempts(examId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="p-4 md:p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest group mb-6"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Exams
        </button>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shadow-inner">
                      <Users size={24} />
                  </div>
                  <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Participant Results</h2>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{attempts?.length || 0} Students Attempted</p>
                  </div>
               </div>
               <Button variant="outline" className="rounded-xl font-bold h-11 border-slate-200 dark:border-slate-800 shadow-sm">
                  <Download size={18} className="mr-2" /> Export CSV
               </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Student</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Score</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Performance</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse">Loading participant data...</td></tr>
                ) : attempts?.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No attempts discovered</td></tr>
                ) : attempts?.map((attempt: any) => {
                  const scorePercent = Math.round((attempt.totalScore / attempt.totalMarks) * 100);
                  return (
                    <tr 
                      key={attempt.id} 
                      onClick={() => onSelectStudent(attempt.studentId)}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700 shadow-inner">
                              <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{attempt.student.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{attempt.student.studentCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          attempt.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                        )}>
                          {attempt.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {attempt.totalScore}<span className="text-xs text-slate-400 ml-1">/{attempt.totalMarks}</span>
                         </p>
                      </td>
                      <td className="px-8 py-6">
                          <div className="flex items-center gap-3 w-40">
                              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                      className={cn(
                                          "h-full rounded-full transition-all duration-1000",
                                          scorePercent >= 70 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : scorePercent >= 40 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                                      )} 
                                      style={{ width: `${scorePercent}%` }}
                                  />
                              </div>
                              <span className="text-xs font-black text-slate-500">{scorePercent}%</span>
                          </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all shadow-sm">
                              <ChevronRight size={20} />
                          </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Detailed Student Result - Level 3
 */
function DetailedStudentResult({ examId, studentId, onBack }: any) {
  const { data: result, isLoading } = useExamResult(examId, studentId);

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center text-slate-400 animate-pulse font-black uppercase tracking-widest text-xs">Generating Performance Insights...</div>;
  if (!result) return <div className="text-center py-20 p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-slate-500 font-bold uppercase tracking-widest">In-depth analysis currently unavailable</div>;

  const scorePercentage = Math.round((result.totalScore / result.totalMarks) * 100);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 p-4 md:p-6 pb-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Participant List
      </button>

      {/* Main Result Card */}
      <div className="relative overflow-hidden rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 md:p-12">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] dark:opacity-[0.03]">
                <GraduationCap size={400} className="text-primary rotate-12 -translate-y-20 translate-x-20" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                <div className="space-y-8 max-w-2xl text-center md:text-left">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-primary/10 text-primary dark:text-primary-400 text-xs font-black uppercase tracking-widest border border-primary/20">
                        <User size={16} /> Performance Analysis Report
                    </div>
                    
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]">
                            {result.student?.name}
                        </h1>
                        <p className="text-lg text-slate-500 font-medium mt-3 border-l-4 border-primary pl-4">Assessment analysis for <span className="text-slate-900 dark:text-white font-black underline decoration-primary/30 decoration-4">{result.title}</span></p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peer Percentile</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white italic">TOP 5%</p>
                        </div>
                        <div className="p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Score</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{result.totalScore}/{result.totalMarks}</p>
                        </div>
                         <div className="p-5 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proficiency</p>
                            <p className="text-2xl font-black text-emerald-500 uppercase">Distinction</p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex justify-center">
                    <div className="relative group p-4">
                        <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-125 opacity-50 dark:opacity-20 animate-pulse" />
                        <ProgressCircle 
                            value={scorePercentage}
                            size={280}
                            strokeWidth={22}
                            label={`${scorePercentage}%`}
                            sublabel="Institution Avg Comparison"
                            className="relative z-10 drop-shadow-2xl"
                        />
                    </div>
                </div>
            </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 uppercase tracking-wider">
                        <BarChart3 className="text-primary" /> Topic Performance
                    </h3>
                </div>
                <div className="space-y-4">
                    {result.subjects?.map((sub: any, i: number) => {
                        const percent = Math.round((sub.score / sub.totalMarks) * 100);
                        return (
                            <div key={i} className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5">
                                <div className="space-y-1">
                                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{sub.subjectName}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Excellence Breakdown</p>
                                </div>
                                <div className="flex items-center gap-8 text-right">
                                    <div className="hidden md:block">
                                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{sub.score}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/ {sub.totalMarks}</p>
                                    </div>
                                    <div className="h-14 w-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    <div className="w-16">
                                        <p className={cn(
                                            "text-2xl font-black",
                                            percent >= 70 ? "text-emerald-500" : percent >= 40 ? "text-amber-500" : "text-rose-500"
                                        )}>{percent}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 px-2 uppercase tracking-wider">
                    <Percent className="text-indigo-500" /> Relative standing
                </h3>
                <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-10 shadow-sm">
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Global Standing Rank</p>
                                <p className="text-3xl font-black text-primary">Superior to 92.4%</p>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black">
                                A+
                            </div>
                        </div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full w-[92%] bg-gradient-to-r from-primary to-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-inner">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Median</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{result.classAverage || "76"}%</p>
                        </div>
                         <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-inner">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trend Velocity</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-2xl font-black text-emerald-500">+12%</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            "The student exhibits exceptional mastery of core concepts. Current velocity suggests they are on track for elite academic honors this term."
                        </p>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
}

/**
 * Standalone Grades View
 */
function StandaloneGradesView({ grades, isLoading }: any) {
  return (
    <div className="space-y-8">
      {/* Search & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search standalone grades..."
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-200"
            />
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <Download size={18} className="mr-2" /> Export
             </Button>
             <Button className="rounded-xl h-12 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                <Plus size={18} className="mr-2" /> Manual Entry
             </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Subject / Paper</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Date Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Retrieving grade records...</td></tr>
              ) : grades.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No standalone entries found</td></tr>
              ) : grades.map((grade: any) => (
                <tr key={grade.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{grade.student?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Class {grade.class?.name}{grade.class?.section}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">{grade.subject}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{grade.assessmentType}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                      <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        {grade.score}<span className="text-xs text-slate-400 ml-1">/{grade.maxMarks}</span>
                      </p>
                  </td>
                  <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                        {grade.assessmentType || 'General'}
                      </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                      <p className="text-xs text-slate-500 font-bold tracking-tight">{format(new Date(grade.createdAt), "MMMM d, yyyy")}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}