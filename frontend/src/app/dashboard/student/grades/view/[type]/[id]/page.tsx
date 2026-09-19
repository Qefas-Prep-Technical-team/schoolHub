"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft,
  Download,
  Eye,
  Loader2,
  FileText,
  User,
  GraduationCap,
  Calendar,
  Sparkles,
  Lock,
  TrendingUp,
  BrainCircuit,
  Quote,
  Target,
  Users
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExamResult } from '@/lib/api/hooks/useExams';
import { useGrade } from '@/lib/api/hooks/useGrades';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import IndividualStudentReport from '@/app/dashboard/admin/grades/components/IndividualStudentReport';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function ViewResultDetailsPage({ params }: { params: Promise<{ type: string, id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const [isReviewing, setIsReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState<'subjects' | 'insights'>('subjects');
  const { type, id } = React.use(params);

  // Fetch conditionally based on type
  const fetchExamId = type === 'exam' ? id : (type === 'subject-paper' ? examId : '');
  const { data: examData, isLoading: isExamLoading } = useExamResult(fetchExamId || '');
  const { data: gradeRes, isLoading: isGradeLoading } = useGrade(type === 'assessment' ? id : '');

  const gradeData = (gradeRes as any)?.data || gradeRes;
  const isLoading = (type === 'exam' || type === 'subject-paper') ? isExamLoading : isGradeLoading;

  const result = React.useMemo(() => {
    if (type === 'exam' && examData) return examData;

    if (type === 'subject-paper' && examData) {
      const targetSubject = examData.subjects?.find((s: any) => 
        s.id === id || 
        s.subjectPaperId === id || 
        s.subjectPaper?.id === id || 
        s.subjectId === id || 
        s.subject?.id === id
      );
      if (!targetSubject) return null;
      return {
        ...examData,
        title: targetSubject.subjectName || targetSubject.subjectPaper?.title || examData.title,
        totalScore: targetSubject.score,
        totalMarks: targetSubject.totalMarks || 100,
        subjects: [targetSubject],
        isSubjectFocus: true,
        performanceInsight: targetSubject.remark || "No additional insights provided for this subject paper."
      };
    }

    if (type === 'assessment' && gradeData) {
      return {
        title: `${gradeData.subject} ${gradeData.subjectPaperId ? 'Paper' : (gradeData.assessmentType || 'Assessment')}`,
        submittedAt: gradeData.createdAt,
        totalScore: gradeData.score,
        totalMarks: gradeData.maxMarks || 100,
        subjects: [{
          subjectName: gradeData.subject || 'Unknown Subject',
          score: gradeData.score,
          totalMarks: gradeData.maxMarks || 100,
          grade: '-',
          remark: '-'
        }],
        velocity: 0,
        globalStanding: 50,
        classAverage: 0,
        hasAiInsightAccess: false,
        performanceInsight: gradeData.remark || "No additional insights provided for this assessment.",
        student: gradeData.student,
        school: null 
      };
    }
    return null;
  }, [type, examData, gradeData]);

  const handleBack = () => {
    router.push('/dashboard/student/grades');
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-lexend">
      <div className="w-[95%] max-w-[95%] mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-2">
           <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
           <div className="flex gap-3">
             <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
             <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
           </div>
        </div>
        
        {/* Profile Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-3">
                 <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                 <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              </div>
           </div>
           <div className="text-right space-y-3 w-full md:w-auto">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse ml-auto" />
              <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse ml-auto" />
           </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm h-32 flex flex-col justify-between">
                 <div className="flex justify-between">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
                 </div>
                 <div className="space-y-2">
                    <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                 </div>
              </div>
           ))}
        </div>
        
        {/* Content Tabs Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-64 p-6">
           <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
             <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
             <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
           </div>
           <div className="space-y-4">
             <div className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
             <div className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
           </div>
        </div>
      </div>
    </div>
  );

  if (!result) return (
    <div className="min-h-[80vh] bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 flex items-center justify-center font-lexend">
      <div className="max-w-md w-full text-center p-10 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Result Unavailable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
             We couldn't find the detailed results for this assessment. It may have been removed or is not yet published.
          </p>
          <Button onClick={handleBack} className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold transition-all shadow-sm">
             <ArrowLeft className="w-4 h-4 mr-2" /> Back to Grades
          </Button>
      </div>
    </div>
  );

  const scorePercentage = Math.round((result.totalScore / (result.totalMarks || 1)) * 100);

  let grade = "F9";
  let gColor = "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-900/30";
  if (scorePercentage >= 75) { grade = "A1"; gColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"; }
  else if (scorePercentage >= 70) { grade = "B2"; gColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"; }
  else if (scorePercentage >= 65) { grade = "B3"; gColor = "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"; }
  else if (scorePercentage >= 50) { grade = "C6"; gColor = "text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400 border-pink-100 dark:border-pink-900/30"; }
  else if (scorePercentage >= 45) { grade = "D7"; gColor = "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"; }
  else if (scorePercentage >= 40) { grade = "E8"; gColor = "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"; }

  const studentName = result.student?.name || result.student?.user?.name || 'Student';
  const displayImage = result.student?.profileImage || result.student?.user?.profileImage || result.student?.avatar || result.student?.user?.avatar;
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 font-lexend text-slate-800 dark:text-slate-200">
      <div className="w-[95%] max-w-[95%] mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* Top Header Actions */}
        <div className="flex items-center justify-between pb-2">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to grades
          </button>
          
          <div className="flex items-center gap-3">
             {true && (
                <Button onClick={() => { setIsReviewing(true); router.push(`/dashboard/student/exams&quizzes/${type === 'subject-paper' ? examId : id}/review${type === 'subject-paper' ? `?subjectId=${id}` : ''}`); }} disabled={isReviewing} variant="outline" className="h-9 px-4 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                  {isReviewing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />} Review Answers
                </Button>
              )}
             {type === 'exam' && result.school && (
                <PDFDownloadLink document={<IndividualStudentReport result={result} school={result.school} />} fileName={`${studentName.replace(/\s+/g, '_')}_Transcript.pdf`}>
                    {({ loading }) => (
                        <Button disabled={loading} className="h-9 px-4 text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white rounded-lg border-0 shadow-sm">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />} Export PDF
                        </Button>
                    )}
                </PDFDownloadLink>
              )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-2xl font-bold border border-pink-200 dark:border-pink-800/50 shrink-0 overflow-hidden">
               {displayImage ? <img src={displayImage} alt={studentName} className="w-full h-full object-cover" /> : studentInitial}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{studentName}</h1>
               <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium flex-wrap">
                 <span className="flex items-center gap-1.5"><GraduationCap size={15} className="text-pink-500" /> {type === 'exam' ? 'Certified Transit Exam' : 'Assessment'}</span>
                 <span className="flex items-center gap-1.5"><FileText size={15} className="text-pink-500" /> {result.title}</span>
                 <span className="flex items-center gap-1.5"><Calendar size={15} className="text-pink-500" /> {format(new Date(result.submittedAt || new Date()), "MMM d, yyyy")}</span>
               </div>
             </div>
          </div>
          
          {/* Representative / Metadata */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
             <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 shadow-sm"><User size={18} /></div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teacher / Evaluator</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">System Generated</p>
             </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Total Estimate -> Score */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-default">
             <div className="flex items-center justify-between mb-3">
               <p className="text-sm font-semibold text-slate-500">Total Score</p>
               <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center border border-orange-100 dark:border-orange-900/50"><Target size={16} /></div>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white">{result.totalScore}</p>
             <div className="flex items-center justify-between mt-3">
               <p className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">{scorePercentage}% Mastered</p>
               <span className="text-xs font-medium text-slate-400">/ {result.totalMarks} Total</span>
             </div>
           </div>
           
           {/* Changes Order -> Class Average */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-default">
             <div className="flex items-center justify-between mb-3">
               <p className="text-sm font-semibold text-slate-500">Class Average</p>
               <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900/50"><Users size={16} /></div>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white">{result.classAverage || 0}%</p>
             <p className="text-xs font-semibold text-slate-500 mt-3 flex items-center gap-1"><TrendingUp size={12} className="text-slate-400" /> Relative performance</p>
           </div>

           {/* Invoices -> Peer Standing */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-default">
             <div className="flex items-center justify-between mb-3">
               <p className="text-sm font-semibold text-slate-500">Peer Standing</p>
               <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center border border-purple-100 dark:border-purple-900/50"><Sparkles size={16} /></div>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white">Top {100 - (result.globalStanding || 0)}%</p>
             <p className="text-xs font-semibold text-slate-500 mt-3">Among classmates</p>
           </div>

           {/* Overdue -> Overall Grade */}
           <div className={cn("rounded-2xl border p-5 shadow-sm flex flex-col justify-between", gColor)}>
             <div className="flex items-center justify-between mb-1">
               <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Overall Grade</p>
             </div>
             <p className="text-4xl font-black">{grade}</p>
             <p className="text-xs font-bold mt-2 opacity-90">{result.velocity > 0 ? `+${result.velocity}% Improvement` : `${result.velocity}% Velocity`}</p>
           </div>
        </div>

        {/* Tabs and Data Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tabs header */}
          <div className="flex items-center gap-6 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            <button 
              onClick={() => setActiveTab('subjects')}
              className={cn("py-4 text-sm font-bold border-b-2 transition-colors relative", activeTab === 'subjects' ? "border-pink-600 text-pink-600 dark:text-pink-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              Subject Results ({result.subjects?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={cn("py-4 text-sm font-bold border-b-2 transition-colors relative flex items-center gap-2", activeTab === 'insights' ? "border-pink-600 text-pink-600 dark:text-pink-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
            >
              Intelligence Insights
              {result.hasAiInsightAccess && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-0 bg-white dark:bg-slate-900">
             {activeTab === 'subjects' && (
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                         <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-10">ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Percentage</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {result.subjects?.map((sub: Record<string, any>, i: number) => {
                          const percent = Math.round((sub.score / (sub.totalMarks || 1)) * 100);
                          let statusColor = "text-rose-600 border-rose-200 dark:border-rose-900/50";
                          let statusText = "Fail";
                          if (percent >= 75) { statusColor = "text-emerald-600 border-emerald-200 dark:border-emerald-900/50"; statusText = "Distinction"; }
                          else if (percent >= 50) { statusColor = "text-blue-600 border-blue-200 dark:border-blue-900/50"; statusText = "Credit"; }
                          else if (percent >= 40) { statusColor = "text-amber-600 border-amber-200 dark:border-amber-900/50"; statusText = "Pass"; }
                          
                          return (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                               <td className="px-6 py-4">
                                 <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-pink-200 group-hover:text-pink-500 transition-colors">
                                   {(i + 1).toString().padStart(2, '0')}
                                 </span>
                               </td>
                               <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors"><FileText size={14} /></div>
                                   <span className="font-semibold text-slate-800 dark:text-white">{sub.subjectName || sub.subjectPaper?.subject?.name || sub.subject?.name || 'Unknown Subject'}</span>
                                 </div>
                               </td>
                               <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                                 {sub.score} <span className="text-slate-400 text-sm font-medium">/ {sub.totalMarks}</span>
                               </td>
                               <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                   <span className="font-semibold text-slate-700 dark:text-slate-300 w-8">{percent}%</span>
                                   <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                     <div className={cn("h-full rounded-full transition-all duration-500", percent >= 50 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${percent}%` }} />
                                   </div>
                                 </div>
                               </td>
                               <td className="px-6 py-4 text-right">
                                 <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider bg-transparent", statusColor)}>
                                   {statusText}
                                 </span>
                               </td>
                            </tr>
                          );
                        })}
                      </tbody>
                   </table>
                </div>
             )}

             {activeTab === 'insights' && (
                <div className="p-6 md:p-8 space-y-6">
                  {/* AI Analysis Panel */}
                  <div className="relative p-6 md:p-8 rounded-2xl bg-pink-50/30 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800/30 flex flex-col md:flex-row gap-6 items-start">
                     <div className={cn("shrink-0 h-12 w-12 rounded-full bg-white dark:bg-slate-800 border flex items-center justify-center shadow-sm", result.hasAiInsightAccess ? "text-pink-600 border-pink-200 dark:border-pink-800" : "text-slate-400 border-slate-200 dark:border-slate-700")}>
                        <BrainCircuit size={24} />
                     </div>
                     <div className="flex-1 relative w-full">
                        <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-base font-bold text-slate-900 dark:text-white">AI Analysis Insights</h4>
                           {result.hasAiInsightAccess ? (
                               <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-pink-200 dark:border-pink-800/50">
                                   <Sparkles size={10} /> Active
                               </span>
                           ) : (
                               <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200 dark:border-amber-800/50">
                                   <Lock size={10} /> Premium
                               </span>
                           )}
                        </div>
                        
                        <div className="relative mt-4">
                            <Quote className="absolute -top-3 -left-3 text-pink-600/10 w-8 h-8 transform -rotate-12" />
                            <p className={cn(
                                "text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium pl-6 relative z-10",
                                !result.hasAiInsightAccess && type === 'exam' && "blur-[4px] select-none opacity-60"
                            )}>
                                {result.performanceInsight || "Premium AI insights analyze your strengths and weaknesses to provide personalized recommendations. Upgrade your plan to see detailed analysis, study guides, and predictive scoring based on this exam performance."}
                            </p>
                        </div>
                        
                        {/* Premium Overlay */}
                        {!result.hasAiInsightAccess && type === 'exam' && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-[2px] rounded-xl">
                                <Button className="h-9 px-6 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-sm border-0 gap-2 text-xs">
                                    <Sparkles size={14} /> Upgrade Plan for Insights
                                </Button>
                            </div>
                        )}
                     </div>
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
