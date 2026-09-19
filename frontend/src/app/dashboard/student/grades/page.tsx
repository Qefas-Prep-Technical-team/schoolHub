"use client";

import React, { useState, useEffect, useMemo, Fragment } from 'react';
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
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProgressCircle from '@/components/ui/ProgressCircle';
import Pagination from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import IndividualStudentReport, { ComprehensiveTranscriptReport } from '@/app/dashboard/admin/grades/components/IndividualStudentReport';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

function generateAIClassTeacherRemark(studentName: string, overallAverage: number): string {
  const name = studentName || "The student";
  if (overallAverage >= 75) {
    return `${name} has shown outstanding brilliance and academic maturity this term. A highly dedicated and self-motivated student whose performance is exemplary. Keep up the excellent work!`;
  } else if (overallAverage >= 60) {
    return `${name} has demonstrated strong academic capability and consistent effort. Quite active and cooperative in class activities. With sustained focus, higher achievements are well within reach.`;
  } else if (overallAverage >= 50) {
    return `${name} is a student of average capability who has made satisfactory progress. However, there is a clear need for more consistent study habits to improve performance in weaker subjects.`;
  } else {
    return `${name} has struggled significantly this term and has performed below the required academic standard. Closer supervision, regular revision, and remedial assistance are highly recommended to help them catch up.`;
  }
}

function generateAIPrincipalRemark(studentName: string, overallAverage: number): string {
  const name = studentName || "The student";
  if (overallAverage >= 75) {
    return `An excellent and commendable result. ${name} is a credit to the school. Highly recommended for promotion with distinction. Keep it up!`;
  } else if (overallAverage >= 60) {
    return `A very good result showing promising prospects. With dedication and hard work, ${name} can attain academic excellence. Promotion approved.`;
  } else if (overallAverage >= 50) {
    return `A fair performance. There is ample room for improvement. ${name} must sit up and work much harder next term to achieve better grades. Promotion approved.`;
  } else {
    return `A poor result that is not acceptable. ${name} must put in double effort and undergo remedial studies. Promotion is currently under review.`;
  }
}


function getWAECGradeAndRemark(score: number): { grade: string, remark: string } {
  if (score >= 75) return { grade: 'A1', remark: 'EXCELLENT' };
  if (score >= 70) return { grade: 'B2', remark: 'VERY GOOD' };
  if (score >= 65) return { grade: 'B3', remark: 'GOOD' };
  if (score >= 60) return { grade: 'C4', remark: 'CREDIT' };
  if (score >= 55) return { grade: 'C5', remark: 'CREDIT' };
  if (score >= 50) return { grade: 'C6', remark: 'CREDIT' };
  if (score >= 45) return { grade: 'D7', remark: 'PASS' };
  if (score >= 40) return { grade: 'E8', remark: 'PASS' };
  return { grade: 'F9', remark: 'FAIL' };
}

export default function StudentGradesPage() {
  const router = useRouter();
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [activeTab, setActiveTab ] = useState<'exams' | 'assessments' | 'transcript'>('exams');
  const [caTab, setCaTab] = useState<'ALL' | 'CA' | 'ASSIGNMENT' | 'TEST/QUIZ' | 'SUBJECT PAPER'>('ALL');
  const [selectedTerm, setSelectedTerm] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [examsPage, setExamsPage] = useState(1);
  const [gradesPage, setGradesPage] = useState(1);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const itemsPerPage = 6;
  
  const { user } = useAuthStore();

  // Data fetching
  const { data: profile } = useStudentProfile();
  const schoolId = profile?.schoolId || user?.schools?.[0]?.schoolId || '';
  const { data: sessionsRes, isLoading: isLoadingSessions } = useSessions(schoolId);
  const sessions = sessionsRes?.data || (Array.isArray(sessionsRes) ? sessionsRes : []);

  const { data: allAttemptsRes } = useStudentExamAttempts({ limit: 1000 });
  const { data: allGradesRes } = useGrades(undefined, { limit: 1000 });

  const allAttempts = allAttemptsRes?.attempts || [];
  const allGrades = allGradesRes?.grades || [];

  const availableTerms = ['ALL', 'FIRST', 'SECOND', 'THIRD'];

  const filteredAllAttempts = useMemo(() => {
    let filtered = allAttempts;
    if (selectedSession !== 'ALL') {
      filtered = filtered.filter((a: any) => a.sessionId === selectedSession || a.exam?.sessionId === selectedSession);
    }
    if (selectedTerm !== 'ALL') {
      filtered = filtered.filter((a: any) => a.exam?.term === selectedTerm || a.term === selectedTerm);
    }
    return filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allAttempts, selectedTerm, selectedSession]);

  const filteredAllGrades = useMemo(() => {
    let filtered = allGrades;
    if (selectedSession !== 'ALL') {
      filtered = filtered.filter((g: any) => g.sessionId === selectedSession || g.assessment?.sessionId === selectedSession);
    }
    if (selectedTerm !== 'ALL') {
      filtered = filtered.filter((g: any) => g.term === selectedTerm || g.assessment?.term === selectedTerm);
    }
    return filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allGrades, selectedTerm, selectedSession]);

  const paginatedAttempts = useMemo(() => {
    const startIndex = (examsPage - 1) * itemsPerPage;
    return filteredAllAttempts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAllAttempts, examsPage, itemsPerPage]);

  const gradesFilteredForUI = useMemo(() => {
    return filteredAllGrades.filter((g: any) => g.assessmentType?.toUpperCase() !== 'EXAM' || !!g.subjectPaperId);
  }, [filteredAllGrades]);

  const paginatedGrades = useMemo(() => {
    let filteredByTab = gradesFilteredForUI;
    if (caTab !== 'ALL') {
      filteredByTab = filteredByTab.filter((g: any) => {
        const type = g.assessmentType?.toUpperCase();
        if (caTab === 'TEST/QUIZ') return type === 'TEST' || type === 'QUIZ' || type === 'TEST/QUIZ';
        if (caTab === 'SUBJECT PAPER') return type === 'SUBJECT PAPER' || type === 'PAPER' || type === 'SUBJECT_PAPER' || !!g.subjectPaperId;
        return type === caTab.toUpperCase();
      });
    }
    const startIndex = (gradesPage - 1) * itemsPerPage;
    return filteredByTab.slice(startIndex, startIndex + itemsPerPage);
  }, [gradesFilteredForUI, caTab, gradesPage, itemsPerPage]);

  const examPagination = { total: filteredAllAttempts.length, totalPages: Math.ceil(filteredAllAttempts.length / itemsPerPage) };
  const gradesFilteredForTab = gradesFilteredForUI.filter((g: any) => {
    if (caTab === 'ALL') return true;
    const type = g.assessmentType?.toUpperCase();
    if (caTab === 'TEST/QUIZ') return type === 'TEST' || type === 'QUIZ' || type === 'TEST/QUIZ';
    if (caTab === 'SUBJECT PAPER') return type === 'SUBJECT PAPER' || type === 'PAPER' || type === 'SUBJECT_PAPER' || !!g.subjectPaperId;
    return type === caTab.toUpperCase();
  });
  const gradePagination = { 
    total: gradesFilteredForTab.length, 
    totalPages: Math.ceil(gradesFilteredForTab.length / itemsPerPage) 
  };

  const studentClassId = allGrades.find((g: any) => g.classId)?.classId || allAttempts.find((a: any) => a.classId)?.classId;
  const { data: leaderboardData } = useClassLeaderboard(studentClassId);

  const attempts = paginatedAttempts;
  const standaloneGrades = paginatedGrades;
  const isLoadingAttempts = !allAttemptsRes;
  const isLoadingGrades = !allGradesRes;


  useEffect(() => {
    if (isTranscriptOpen) {
      setIsAiThinking(true);
      const timer = setTimeout(() => setIsAiThinking(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isTranscriptOpen]);

  const transcriptData = useMemo(() => {
    if (!user) return null;

    const subjectsMap: Record<string, {
      subjectName: string;
      examScore: number;
      examMax: number;
      caScore: number;
      caMax: number;
      quizScore: number;
      quizMax: number;
      assignmentScore: number;
      assignmentMax: number;
      totalScore: number;
      totalMax: number;
    }> = {};

    // 1. Process Exams
    filteredAllAttempts.forEach((attempt: any) => {
      attempt.subjects?.forEach((sub: any) => {
        const sName = (sub.subjectName || 'General').toUpperCase();
        if (!subjectsMap[sName]) {
          subjectsMap[sName] = {
            subjectName: sName,
            examScore: 0,
            examMax: 0,
            caScore: 0,
            caMax: 0,
            quizScore: 0,
            quizMax: 0,
            assignmentScore: 0,
            assignmentMax: 0,
            totalScore: 0,
            totalMax: 0,
          };
        }
        subjectsMap[sName].examScore += sub.score || 0;
        subjectsMap[sName].examMax += sub.totalMarks || 0;
      });
    });

    // 2. Process Standalone Grades (CA, QUIZ, ASSIGNMENT)
    filteredAllGrades.forEach((grade: any) => {
      const sName = (grade.subject || 'General').toUpperCase();
      if (!subjectsMap[sName]) {
        subjectsMap[sName] = {
          subjectName: sName,
          examScore: 0,
          examMax: 0,
          caScore: 0,
          caMax: 0,
          quizScore: 0,
          quizMax: 0,
          assignmentScore: 0,
          assignmentMax: 0,
          totalScore: 0,
          totalMax: 0,
        };
      }
      const score = grade.score || 0;
      const maxMarks = grade.maxMarks || 0;
      
      const type = (grade.assessmentType || grade.category || '').toUpperCase();
      
      if (type === 'EXAM') {
        subjectsMap[sName].examScore += score;
        subjectsMap[sName].examMax += maxMarks;
      } else if (type === 'QUIZ') {
        subjectsMap[sName].quizScore += score;
        subjectsMap[sName].quizMax += maxMarks;
      } else if (type === 'ASSIGNMENT') {
        subjectsMap[sName].assignmentScore += score;
        subjectsMap[sName].assignmentMax += maxMarks;
      } else {
        // Any other type (CA, test, midterm, etc.) counts as CA
        subjectsMap[sName].caScore += score;
        subjectsMap[sName].caMax += maxMarks;
      }
    });

    const subjects = Object.values(subjectsMap).map((sub) => {
      let weightedSum = 0;
      let totalWeight = 0;

      if (sub.assignmentMax > 0) {
        weightedSum += (sub.assignmentScore / sub.assignmentMax) * 0.2;
        totalWeight += 0.2;
      }
      if (sub.quizMax > 0) {
        weightedSum += (sub.quizScore / sub.quizMax) * 0.2;
        totalWeight += 0.2;
      }
      if (sub.caMax > 0) {
        weightedSum += (sub.caScore / sub.caMax) * 0.6;
        totalWeight += 0.6;
      }

      const hasCa = totalWeight > 0;
      const caPct = hasCa ? (weightedSum / totalWeight) : 0;
      const examMax = sub.examMax;
      const examScore = sub.examScore;

      let normalizedCa: number | string = 0;
      let normalizedExam: number | string = 0;
      let total = 0;

      if (hasCa && examMax > 0) {
        const caVal = Math.round(caPct * 40);
        const examVal = Math.round((examScore / examMax) * 60);
        normalizedCa = caVal;
        normalizedExam = examVal;
        total = caVal + examVal;
      } else if (hasCa) {
        total = Math.round(caPct * 100);
        normalizedCa = Math.round(caPct * 40);
        normalizedExam = '-';
      } else if (examMax > 0) {
        const percent = examScore / examMax;
        total = Math.round(percent * 100);
        normalizedCa = '-';
        normalizedExam = Math.round(percent * 60);
      } else {
        normalizedCa = '-';
        normalizedExam = '-';
        total = 0;
      }

      const gradeInfo = getWAECGradeAndRemark(total);

      return {
        subjectName: sub.subjectName,
        caScore: normalizedCa,
        examScore: normalizedExam,
        totalScore: total,
        totalMax: 100,
        percent: total,
        grade: gradeInfo.grade,
        remark: gradeInfo.remark,
      };
    });

    let totalScoreSum = 0;
    const totalMaxSum = subjects.length * 100;
    
    subjects.forEach((s) => {
      totalScoreSum += s.totalScore;
    });

    const overallAverage = subjects.length > 0 ? Math.round(totalScoreSum / subjects.length) : 0;
    const gpa = (overallAverage / 25).toFixed(1);
    
    const aiClassTeacherRemark = generateAIClassTeacherRemark(user.name, overallAverage);
    const aiGeneralRemark = generateAIPrincipalRemark(user.name, overallAverage);

    const primaryClass = profile?.classes?.[0]?.class;
    const className = primaryClass?.name || 'General Class';
    const sessionName = primaryClass?.session || 'Academic Session';
    const school = (profile?.school || user?.schools?.[0] || {}) as any;

    return {
      student: {
        name: profile?.name || user.name,
        gender: profile?.gender || (user as any).gender || 'N/A',
        studentCode: profile?.studentCode || user.studentCode || 'N/A',
        profileImage: profile?.profileImage || user.profileImage || null,
      },
      school,
      className,
      sessionName,
      subjects,
      totalScore: totalScoreSum,
      totalMax: totalMaxSum,
      overallAverage,
      gpa,
      aiClassTeacherRemark,
      aiGeneralRemark,
    };
  }, [filteredAllAttempts, filteredAllGrades, user, profile]);

  const calculateCumulativeAvg = () => {
    const examPercents = filteredAllAttempts.map((a: Record<string, any>) => (a.totalScore / (a.totalMarks || 1)) * 100);
    const standalonePercents = filteredAllGrades.map((g: Record<string, any>) => (g.score / (g.maxMarks || 1)) * 100);
    const allPercents = [...examPercents, ...standalonePercents];  
    if (allPercents.length === 0) return "0.0"; 
    const avg = allPercents.reduce((acc, curr) => acc + (curr || 0), 0) / allPercents.length;
    return (avg / 25).toFixed(1); // Rough conversion to 4.0 scale
  };
  const gpa = calculateCumulativeAvg();
  const progressPercent = Math.round((parseFloat(gpa) / 4.0) * 100);

  // selectedExamId logic removed to use dedicated route

    return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#191C1D] font-lexend selection:bg-pink-100 p-6 lg:p-10 pb-32">
      <main className="w-[95%] max-w-[95%] mx-auto space-y-8">
        
        {/* Top Summary Header (Mediwave Style) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Grades Overview</h1>
            <p className="text-sm text-slate-500">Track your academic progress</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {(isLoadingSessions || isLoadingAttempts || isLoadingGrades) ? (
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">Session:</span>
                  <select
                    value={selectedSession}
                    onChange={(e) => { setSelectedSession(e.target.value); setExamsPage(1); setGradesPage(1); }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 cursor-pointer"
                  >
                    <option value="ALL">All Sessions</option>
                    {sessions.map((session: any) => (
                      <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-500">Term:</span>
                  <select
                    value={selectedTerm}
                    onChange={(e) => { setSelectedTerm(e.target.value); setExamsPage(1); setGradesPage(1); }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 cursor-pointer"
                  >
                    {availableTerms.map(term => (
                      <option key={term} value={term}>{term === 'ALL' ? 'All Terms' : `${term} TERM`}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 flex flex-col justify-between text-white">
            <span className="text-sm font-semibold text-blue-100">Overall GPA</span>
            <div className="mt-4 flex items-baseline gap-2">
              {(isLoadingAttempts || isLoadingGrades) ? (
                <Skeleton className="h-10 w-24 bg-blue-400/50" />
              ) : (
                <>
                  <span className="text-4xl font-bold">{gpa}</span>
                  <span className="text-sm font-medium text-blue-200">/ 4.0</span>
                </>
              )}
            </div>
          </div>

          <div 
            onClick={() => setIsLeaderboardOpen(true)}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg shadow-purple-500/20 flex flex-col justify-between text-white cursor-pointer hover:shadow-xl hover:shadow-purple-500/30 transition-shadow"
          >
            <span className="text-sm font-semibold text-purple-100">Distinction Track</span>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-4xl font-bold">{progressPercent}%</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-6 shadow-lg shadow-orange-500/20 flex flex-col justify-between text-white">
            <span className="text-sm font-semibold text-orange-100">Exams Taken</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{filteredAllAttempts.length}</span>
              <span className="text-sm font-medium text-orange-200">recorded</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-lg shadow-emerald-500/20 flex flex-col justify-between text-white">
            <span className="text-sm font-semibold text-emerald-100">Assessments</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{gradesFilteredForUI.length}</span>
              <span className="text-sm font-medium text-emerald-200">recorded</span>
            </div>
          </div>
        </div>

        {/* Tabs and Content Section */}
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit overflow-x-auto shadow-sm">
            {['exams', 'assessments', 'transcript'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap", 
                  activeTab === tab 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                {tab === 'exams' ? 'Main Examinations' : tab}
              </button>
            ))}
          </div>

          <div className="w-full">
            {activeTab === 'exams' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Main Examinations</h3>
                </div>
                
                <div className="flex-1 overflow-x-auto p-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-4 pb-4 w-16">#</th>
                        <th className="px-6 py-4 pb-4">Status</th>
                        <th className="px-6 py-4 pb-4">Title</th>
                        <th className="px-6 py-4 pb-4">Score</th>
                        <th className="px-6 py-4 pb-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {isLoadingAttempts ? (
                        <tr><td colSpan={5} className="p-6"><Skeleton className="h-10 w-full rounded-xl" /></td></tr>
                      ) : attempts.map((attempt: Record<string, any>, index: number) => {
                        const scorePercent = Math.round((attempt.totalScore / (attempt.totalMarks || 1)) * 100);
                        let grade = "C"; let color = "text-pink-600 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400"; 
                        if (scorePercent >= 75) { grade = "A"; color = "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400"; }
                        else if (scorePercent >= 65) { grade = "B"; color = "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"; }
                        else if (scorePercent < 50) { grade = "F"; color = "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400"; }
                        const isExpanded = expandedExamId === attempt.examId;
                        return (
                          <Fragment key={attempt.id}>
                            <tr onClick={() => router.push(`/dashboard/student/grades/view/exam/${attempt.examId}`)} className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group", isExpanded && "bg-slate-50 dark:bg-slate-800/30")}>
                              <td className="px-6 py-5 text-sm font-semibold text-slate-400">
                                <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">{(examsPage - 1) * itemsPerPage + index + 1}</span>
                              </td>
                              <td className="px-6 py-5">
                                <span className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm", color)}>{grade}</span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="font-bold text-slate-800 dark:text-white text-base line-clamp-1 group-hover:text-pink-600 transition-colors">{attempt.exam.title}</div>
                                <div className="text-xs font-medium text-slate-400 mt-0.5">{attempt.exam.code}</div>
                              </td>
                              <td className="px-6 py-5">
                                <span className="font-bold text-slate-800 dark:text-white text-lg">{attempt.totalScore}</span> <span className="text-sm font-medium text-slate-400">/ {attempt.totalMarks}</span>
                                <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{scorePercent}%</span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button onClick={(e) => { e.stopPropagation(); setExpandedExamId(isExpanded ? null : attempt.examId); }} className="text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all p-2 rounded-full inline-flex border border-transparent hover:border-pink-100 dark:hover:border-pink-900/30">
                                  <ChevronRight size={20} className={cn("transition-transform duration-300", isExpanded && "rotate-90 text-pink-500")} />
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-50/50 dark:bg-slate-800/10">
                                <td colSpan={5} className="p-0 border-b border-slate-100 dark:border-slate-800">
                                  <div className="px-10 py-6 max-h-[400px] overflow-y-auto">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div> Subject Papers
                                    </h4>
                                    {(attempt.subjects || attempt.subjectExamAttempts) && (attempt.subjects || attempt.subjectExamAttempts).length > 0 ? (
                                      <div className="grid gap-3">
                                        {(attempt.subjects || attempt.subjectExamAttempts).map((sub: any, i: number) => {
                                          const subPercent = Math.round((sub.score / (sub.totalMarks || 1)) * 100);
                                          return (
                                            <div key={i} onClick={() => router.push(`/dashboard/student/grades/view/subject-paper/${sub.subjectPaperId || sub.subjectPaper?.id || sub.id}?examId=${attempt.examId}`)} className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                                              <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 flex items-center justify-center shrink-0">
                                                  <FileText size={18} />
                                                </div>
                                                <div>
                                                  <p className="text-base font-bold text-slate-800 dark:text-white">{sub.subjectName || sub.subjectPaper?.subject?.name || sub.subject?.name || 'Unknown Subject'}</p>
                                                  <p className="text-xs font-medium text-slate-500 mt-0.5">{sub.grade || '-'} • {sub.remark || '-'}</p>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-base font-bold text-slate-800 dark:text-white">{sub.score} <span className="text-sm font-medium text-slate-400">/ {sub.totalMarks}</span></p>
                                                <p className="text-xs font-bold text-pink-500 mt-0.5">{subPercent}%</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-sm text-slate-500 py-4 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">No subject papers found for this exam.</div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {examPagination && (
                  <div className="p-4 flex justify-center border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <Pagination currentPage={examsPage} totalPages={examPagination.totalPages} totalItems={examPagination.total} itemsPerPage={itemsPerPage} onPageChange={setExamsPage} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assessments' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Assessments</h3>
                  <div className="flex gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    {['ALL', 'CA', 'ASSIGNMENT', 'TEST/QUIZ', 'SUBJECT PAPER'].map(tab => (
                      <button 
                        key={tab} onClick={() => { setCaTab(tab as any); setGradesPage(1); }}
                        className={cn("px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all", caTab === tab ? "bg-white dark:bg-slate-700 text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[500px] p-6">
                  <div className="space-y-3">
                    {isLoadingGrades ? (
                      <Skeleton className="h-24 w-full rounded-2xl" />
                    ) : standaloneGrades.length === 0 ? (
                      <div className="text-center text-slate-500 py-10">No assessments found.</div>
                    ) : standaloneGrades.map((grade: Record<string, any>, index: number) => (
                      <div key={grade.id} onClick={() => router.push(`/dashboard/student/grades/view/assessment/${grade.id}`)} className="p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm group">
                        <div className="flex items-center gap-5">
                          <div className="w-6 text-right shrink-0 text-sm font-bold text-slate-400 group-hover:text-pink-500 transition-colors">
                            {(gradesPage - 1) * itemsPerPage + index + 1}.
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-pink-500 flex items-center justify-center shrink-0">
                            {grade.assessmentType === 'QUIZ' ? <Zap size={18} /> : <FileText size={18} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-pink-600 transition-colors">{grade.subject}</h4>
                            <p className="text-xs font-medium text-slate-400 mt-1">{format(new Date(grade.createdAt), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800 dark:text-white text-lg">{grade.score} <span className="text-sm text-slate-400 font-medium">/ {grade.maxMarks}</span></div>
                          <span className="inline-block mt-1 px-3 py-1 rounded-md text-[10px] font-bold uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 shadow-sm">
                            {grade.subjectPaperId ? 'SUBJECT PAPER' : (grade.assessmentType || 'TEST')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {gradePagination && gradePagination.total > 0 && (
                  <div className="p-4 flex justify-center border-t border-slate-100 dark:border-slate-800 mt-auto bg-white dark:bg-slate-900">
                    <Pagination currentPage={gradesPage} totalPages={gradePagination.totalPages} totalItems={gradePagination.total} itemsPerPage={itemsPerPage} onPageChange={setGradesPage} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transcript' && transcriptData && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Academic Transcript</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-pink-50 dark:bg-pink-900/10 p-6 rounded-xl border border-pink-100 dark:border-pink-900/30">
                    <div><p className="text-xs text-slate-500">Student Name</p><p className="font-semibold text-slate-800 dark:text-white">{transcriptData.student.name}</p></div>
                    <div><p className="text-xs text-slate-500">Class</p><p className="font-semibold text-slate-800 dark:text-white">{transcriptData.className}</p></div>
                    <div><p className="text-xs text-slate-500">Total Score</p><p className="font-semibold text-pink-600">{transcriptData.totalScore} / {transcriptData.totalMax}</p></div>
                    <div><p className="text-xs text-slate-500">Overall Grade</p><p className="font-semibold text-pink-600">{getWAECGradeAndRemark(transcriptData.overallAverage).grade}</p></div>
                  </div>
                  
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-3 font-medium">Subject</th>
                        <th className="py-3 font-medium text-center">Score</th>
                        <th className="py-3 font-medium text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {transcriptData.subjects.map((sub, idx) => (
                        <tr key={idx} className="text-slate-800 dark:text-slate-200">
                          <td className="py-3 font-semibold">{sub.subjectName}</td>
                          <td className="py-3 text-center">{sub.totalScore}%</td>
                          <td className="py-3 text-center">
                            <span className="px-2 py-1 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded text-xs font-bold inline-block">
                              {sub.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Teacher's Remark</p>
                    <p className="text-sm italic text-slate-700 dark:text-slate-300">"{transcriptData.aiClassTeacherRemark}"</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <PDFDownloadLink document={<ComprehensiveTranscriptReport transcript={transcriptData} />} fileName="transcript.pdf" className="flex-1">
                    {({ loading }) => (
                      <button disabled={loading} className="w-full md:w-auto px-8 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-colors flex justify-center items-center gap-2">
                        <Download size={18} /> {loading ? 'Preparing...' : 'Download PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLeaderboardOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center"><Trophy size={20} /></div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Class Top 5</h3>
            </div>
            <div className="space-y-2">
              {(!leaderboardData || leaderboardData.length === 0) ? (
                <p className="text-center text-sm text-slate-500 py-4">No scores available.</p>
              ) : leaderboardData.map((score, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">#{index + 1}</span>
                    <span className="font-semibold text-sm text-slate-800 dark:text-white">Student</span>
                  </div>
                  <span className="font-bold text-pink-600">{score}%</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setIsLeaderboardOpen(false)}
              className="mt-6 w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
