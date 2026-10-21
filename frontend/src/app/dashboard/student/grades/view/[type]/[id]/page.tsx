"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
  Users,
  LayoutGrid,
  List,
  Search,
  X,
  BarChart3,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExamResult } from '@/lib/api/hooks/useExams';
import { useGrade } from '@/lib/api/hooks/useGrades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import IndividualStudentReport from '@/app/dashboard/admin/grades/components/IndividualStudentReport';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { generatePDF } from '@/utils/pdfGenerator';
import { assertSchoolPayingPlan } from '@/utils/subscriptionPlanCheck';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface SubjectResultRecord {
  id?: string;
  subjectPaperId?: string;
  subjectId?: string;
  subjectName?: string;
  score: number;
  totalMarks: number;
  grade?: string;
  remark?: string;
  subjectPaper?: {
    id?: string;
    title?: string;
    subject?: {
      name?: string;
    };
  };
  subject?: {
    id?: string;
    name?: string;
  };
}

export default function ViewResultDetailsPage({ params }: { params: Promise<{ type: string, id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const [isReviewing, setIsReviewing] = useState(false);
  const [activeTab, setActiveTab] = useState<'subjects' | 'insights'>('subjects');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const { user } = useAuthStore();
  const { data: profile } = useStudentProfile();

  const { type, id } = React.use(params);

  // Sanitize ID in case URL contains comma-separated view mode (e.g. /exam/id,grid)
  const rawId = id || '';
  const [sanitizedId, urlViewParam] = rawId.includes(',') ? rawId.split(',') : [rawId, null];

  // Configure view mode based on screen size and URL param (defaults to Grid on mobile)
  useEffect(() => {
    if (urlViewParam === 'grid' || urlViewParam === 'table') {
      setViewMode(urlViewParam);
    } else if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, [urlViewParam]);

  // Fetch conditionally based on type
  const fetchExamId = type === 'exam' ? sanitizedId : (type === 'subject-paper' ? examId : '');
  const { data: examData, isLoading: isExamLoading } = useExamResult(fetchExamId || '');
  const { data: gradeRes, isLoading: isGradeLoading } = useGrade(type === 'assessment' ? sanitizedId : '');

  const gradeData = (gradeRes as any)?.data || gradeRes;
  const isLoading = (type === 'exam' || type === 'subject-paper') ? isExamLoading : isGradeLoading;

  const result = useMemo(() => {
    if (type === 'exam' && examData) return examData;

    if (type === 'subject-paper' && examData) {
      const targetSubject = examData.subjects?.find((s: any) =>
        s.id === sanitizedId ||
        s.subjectPaperId === sanitizedId ||
        s.subjectPaper?.id === sanitizedId ||
        s.subjectId === sanitizedId ||
        s.subject?.id === sanitizedId
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
  }, [type, sanitizedId, examData, gradeData]);

  const handleBack = () => {
    router.push('/dashboard/student/grades');
  };

  // Filter subjects by search query
  const filteredSubjects: SubjectResultRecord[] = useMemo(() => {
    const rawSubjects = (result?.subjects || []) as SubjectResultRecord[];
    if (!searchQuery.trim()) return rawSubjects;
    const q = searchQuery.toLowerCase();
    return rawSubjects.filter((sub) => {
      const name = (sub.subjectName || sub.subjectPaper?.subject?.name || sub.subject?.name || '').toLowerCase();
      const remark = (sub.remark || '').toLowerCase();
      return name.includes(q) || remark.includes(q);
    });
  }, [result?.subjects, searchQuery]);

  // Derived subject diagnostics for AI analysis tab (memoized per Rule 3.3)
  const aiDiagnostics = useMemo(() => {
    const subs = (result?.subjects || []) as SubjectResultRecord[];
    if (subs.length === 0) return { strengths: [], growthAreas: [] };

    const evaluated = subs.map((sub) => {
      const score = sub.score || 0;
      const total = sub.totalMarks || 100;
      const pct = Math.round(total > 0 ? (score / total) * 100 : 0);
      const name = sub.subjectName || sub.subjectPaper?.subject?.name || sub.subject?.name || 'Subject';
      return { name, pct, score, total };
    });

    const strengths = evaluated.filter((s) => s.pct >= 65);
    const growthAreas = evaluated.filter((s) => s.pct < 50);

    return { strengths, growthAreas };
  }, [result?.subjects]);

  // WAEC standard grade helper
  const getSubjectGradeDetails = (score: number, totalMarks: number) => {
    const percent = Math.round((score / (totalMarks || 1)) * 100);
    if (percent >= 75) {
      return {
        grade: "A1",
        statusText: "Distinction",
        colorClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50",
        barColor: "bg-emerald-500"
      };
    }
    if (percent >= 70) {
      return {
        grade: "B2",
        statusText: "Very Good",
        colorClass: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50",
        barColor: "bg-emerald-500"
      };
    }
    if (percent >= 65) {
      return {
        grade: "B3",
        statusText: "Good",
        colorClass: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-900/50",
        barColor: "bg-blue-500"
      };
    }
    if (percent >= 50) {
      return {
        grade: "C6",
        statusText: "Credit",
        colorClass: "text-pink-600 bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-900/50",
        barColor: "bg-pink-500"
      };
    }
    if (percent >= 45) {
      return {
        grade: "D7",
        statusText: "Pass",
        colorClass: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/50",
        barColor: "bg-amber-500"
      };
    }
    if (percent >= 40) {
      return {
        grade: "E8",
        statusText: "Pass",
        colorClass: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/50",
        barColor: "bg-amber-500"
      };
    }
    return {
      grade: "F9",
      statusText: "Fail",
      colorClass: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-900/50",
      barColor: "bg-rose-500"
    };
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-3 sm:p-6 md:p-8 font-lexend">
      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-2">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="flex gap-2 sm:gap-3">
            <div className="h-9 w-28 sm:w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-9 w-28 sm:w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Profile Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5 w-full">
            <div className="size-14 sm:size-16 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-40 sm:w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-4 w-56 sm:w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* 2x2 on Mobile, 4-col on Desktop Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-sm h-28 sm:h-32 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Content Tabs Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!result) return (
    <div className="min-h-[80vh] bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 flex items-center justify-center font-lexend">
      <div className="max-w-md w-full text-center p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-800">
          <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Result Unavailable</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          We couldn't find the detailed results for this assessment. It may have been removed or is not yet published.
        </p>
        <Button onClick={handleBack} className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Grades
        </Button>
      </div>
    </div>
  );

  const scorePercentage = Math.round((result.totalScore / (result.totalMarks || 1)) * 100);

  let overallGrade = "F9";
  let gColor = "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-900/30";
  if (scorePercentage >= 75) { overallGrade = "A1"; gColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"; }
  else if (scorePercentage >= 70) { overallGrade = "B2"; gColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"; }
  else if (scorePercentage >= 65) { overallGrade = "B3"; gColor = "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"; }
  else if (scorePercentage >= 50) { overallGrade = "C6"; gColor = "text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400 border-pink-100 dark:border-pink-900/30"; }
  else if (scorePercentage >= 45) { overallGrade = "D7"; gColor = "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"; }
  else if (scorePercentage >= 40) { overallGrade = "E8"; gColor = "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"; }

  const studentName = result.student?.name || result.student?.user?.name || 'Student';
  const displayImage = result.student?.profileImage || result.student?.user?.profileImage || result.student?.avatar || result.student?.user?.avatar;
  const studentInitial = studentName.charAt(0).toUpperCase();

  const handleExportOfficialPDF = async () => {
    if (!result) return;
    const schoolToVerify = profile?.school || result.school || user?.schools?.[0];
    if (!assertSchoolPayingPlan(schoolToVerify)) {
      return;
    }

    try {
      setIsExportingPDF(true);

      const tableHeaders = [
        ['#', 'Subject Paper / Component', 'Score Obtained', 'Max Obtainable', 'Percentage', 'Grade', 'Remark']
      ];

      const rawSubjects = (result.subjects || []) as SubjectResultRecord[];
      const tableData = rawSubjects.map((sub, idx) => {
        const score = sub.score || 0;
        const total = sub.totalMarks || 100;
        const pct = total > 0 ? Math.round((score / total) * 100) : 0;
        const gradeDetail = getSubjectGradeDetails(score, total);
        const name = sub.subjectName || sub.subjectPaper?.subject?.name || sub.subject?.name || `Component ${idx + 1}`;

        return [
          (idx + 1).toString(),
          name,
          score.toString(),
          total.toString(),
          `${pct}%`,
          sub.grade && sub.grade !== '-' ? sub.grade : gradeDetail.grade,
          sub.remark && sub.remark !== '-' ? sub.remark : gradeDetail.statusText
        ];
      });

      const dateStr = result.submittedAt ? format(new Date(result.submittedAt), 'PPpp') : format(new Date(), 'PPpp');
      const studentNameDisplay = result.student?.name || result.student?.user?.name || profile?.name || user?.name || 'Student';
      const studentIdDisplay = result.student?.studentCode || result.student?.user?.studentCode || profile?.studentCode || 'N/A';
      const categoryLabel = type === 'exam' ? 'Formal Examination' : type === 'subject-paper' ? 'Subject Paper Exam' : 'Continuous Assessment';

      const metaData = [
        { label: 'Student Name', value: studentNameDisplay },
        { label: 'Student ID', value: studentIdDisplay },
        { label: 'Class / Grade', value: profile?.classes?.[0]?.class?.name || 'Enrolled Class' },
        { label: 'Assessment Date', value: dateStr },
        { label: 'Assessment Title', value: result.title || 'Official Assessment' },
        { label: 'Category', value: categoryLabel },
        { label: 'Total Score', value: `${result.totalScore} / ${result.totalMarks || 100}` },
        { label: 'Percentage', value: `${scorePercentage}%` },
        { label: 'Grade Awarded', value: overallGrade },
        { label: 'Performance Status', value: scorePercentage >= 60 ? 'Commendable' : scorePercentage >= 50 ? 'Satisfactory' : 'Needs Intervention' },
      ];

      const additionalTables = result.performanceInsight ? [
        {
          title: 'Institutional Performance Feedback & Academic Remarks',
          headers: [['Evaluation Component', 'Remark / Diagnostic Finding']],
          data: [
            ['Academic Performance Insights', result.performanceInsight]
          ]
        }
      ] : undefined;

      await generatePDF({
        title: `${result.title || 'Assessment'} - Result Dossier`,
        filename: `${studentNameDisplay.replace(/\s+/g, '_')}_${(result.title || 'Assessment').replace(/\s+/g, '_')}_Dossier.pdf`,
        schoolProfile: schoolToVerify,
        metaData,
        tableHeaders,
        tableData,
        additionalTables,
        orientation: 'portrait'
      });
    } catch (err) {
      console.error('Error generating assessment PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-3 sm:p-6 md:p-8 font-lexend text-slate-800 dark:text-slate-200">
      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-16 md:pb-8">

        {/* Top Header Actions (Mobile Optimized) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-xs sm:text-sm font-semibold active:scale-95 self-start"
          >
            <ArrowLeft size={16} /> Back to grades
          </button>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button
              onClick={() => {
                setIsReviewing(true);
                router.push(`/dashboard/student/exams&quizzes/${type === 'subject-paper' ? examId : sanitizedId}/review${type === 'subject-paper' ? `?subjectId=${sanitizedId}` : ''}`);
              }}
              disabled={isReviewing}
              variant="outline"
              className="flex-1 sm:flex-none h-10 sm:h-9 px-3.5 sm:px-4 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              {isReviewing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5 text-pink-500" />}
              <span>Review Answers</span>
            </Button>

            <Button
              onClick={handleExportOfficialPDF}
              disabled={isExportingPDF}
              className="flex-1 sm:flex-none h-10 sm:h-9 px-3.5 sm:px-4 text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white rounded-xl border-0 shadow-sm shadow-pink-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {isExportingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isExportingPDF ? 'Exporting...' : 'Export Official PDF'}</span>
            </Button>
          </div>
        </div>

        {/* Profile / Hero Card (Mobile Responsive) */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600" />

          <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0 flex-1">
            <div className="size-14 sm:size-16 rounded-2xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xl sm:text-2xl font-bold border border-pink-200 dark:border-pink-800/50 shrink-0 overflow-hidden shadow-xs">
              {displayImage ? <img src={displayImage} alt={studentName} className="w-full h-full object-cover" /> : studentInitial}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">
                {studentName}
              </h1>

              {/* Metadata Pills */}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 dark:border-pink-900/40 text-pink-700 dark:text-pink-300 font-semibold text-[11px]">
                  <GraduationCap size={13} className="text-pink-500 shrink-0" />
                  <span className="truncate max-w-[150px]">{type === 'exam' ? 'Certified Transit Exam' : 'Assessment'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold truncate max-w-[200px]">
                  <FileText size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{result.title}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar size={13} className="text-pink-500 shrink-0" />
                  <span>{format(new Date(result.submittedAt || new Date()), "MMM d, yyyy")}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Teacher / Evaluator Card */}
          <div className="flex items-center gap-3 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80 w-full sm:w-auto shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-500 shadow-xs">
              <User size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Teacher / Evaluator</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">System Generated</p>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards (2-column on mobile, 4-column on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {/* Total Score */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500">Total Score</p>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center border border-orange-100 dark:border-orange-900/50 shrink-0">
                <Target size={14} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{result.totalScore}</p>
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] sm:text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                {scorePercentage}%
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-slate-400">/ {result.totalMarks} Marks</span>
            </div>
          </div>

          {/* Class Average */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500">Class Average</p>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shrink-0">
                <Users size={14} />
              </div>
            </div>
            {(() => {
              const rawAvg = Number(result.classAverage || 0);
              const avgPercent = result.totalMarks > 0 ? Math.round((rawAvg / result.totalMarks) * 100) : Math.round(rawAvg);
              return (
                <>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {avgPercent}%
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1 truncate">
                    <TrendingUp size={11} className="text-slate-400 shrink-0" />
                    <span>Avg {rawAvg} / {result.totalMarks} pts</span>
                  </p>
                </>
              );
            })()}
          </div>

          {/* Peer Standing */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500">Peer Standing</p>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center border border-purple-100 dark:border-purple-900/50 shrink-0">
                <Sparkles size={14} />
              </div>
            </div>
            {(() => {
              const totalP = Number(result.totalParticipants || 1);
              const pos = Number(result.position || 1);
              const standing = Number(result.globalStanding ?? 0);

              if (totalP <= 1) {
                return (
                  <>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      Rank #1
                    </p>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 truncate">
                      Single participant (Top score)
                    </p>
                  </>
                );
              }

              const topPercent = Math.max(1, Math.round(100 - standing));
              return (
                <>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                    Top {topPercent}%
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 truncate">
                    Rank #{pos} of {totalP} peers
                  </p>
                </>
              );
            })()}
          </div>

          {/* Overall WAEC Grade */}
          <div className={cn("rounded-2xl border p-3.5 sm:p-5 shadow-xs flex flex-col justify-between", gColor)}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Overall Grade</p>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/40 dark:bg-black/20 flex items-center justify-center shrink-0">
                <BarChart3 size={14} />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-black tracking-tight">{overallGrade}</p>
            <p className="text-[10px] sm:text-xs font-bold mt-2 pt-1 border-t border-current/20 opacity-90 truncate">
              {result.velocity > 0 ? `+${result.velocity}% Improvement` : `${result.velocity || 0}% Velocity`}
            </p>
          </div>
        </div>

        {/* Primary Content Container with Responsive Header & View Toggle */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tabs & Controls Header */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Tab navigation pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/70 rounded-xl">
              <button
                onClick={() => setActiveTab('subjects')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95",
                  activeTab === 'subjects'
                    ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <BookOpen size={14} />
                <span>Subject Results</span>
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300">
                  {result.subjects?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('insights')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95",
                  activeTab === 'insights'
                    ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <BrainCircuit size={14} />
                <span>AI Insights</span>
                {result.hasAiInsightAccess ? (
                  <span className="size-2 rounded-full bg-pink-500 animate-pulse" />
                ) : (
                  <Lock size={11} className="text-amber-500/80 ml-0.5" />
                )}
              </button>
            </div>

            {/* Right controls: Search & Grid/Table toggle (visible when on subjects tab) */}
            {activeTab === 'subjects' && (
              <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
                {/* Search input */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-7 h-9 rounded-xl bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-xs focus:ring-2 focus:ring-pink-500/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Perspective View Toggle (Grid default on mobile) */}
                <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/70 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid perspective"
                    title="Grid Cards View"
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer",
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    aria-label="Table perspective"
                    title="Table View"
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer",
                      viewMode === "table"
                        ? "bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tab Content Area */}
          <div className="p-3 sm:p-5 bg-white dark:bg-slate-900">
            {activeTab === 'subjects' && (
              <>
                {filteredSubjects.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <AlertCircle size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching subjects</p>
                    <p className="text-xs text-slate-400">Try adjusting your search criteria</p>
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-pink-600 hover:text-pink-700 font-semibold"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  /* ------------------------------------------------------------- */
                  /* RESPONSIVE GRID CARDS VIEW (DEFAULT ON MOBILE)                */
                  /* ------------------------------------------------------------- */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredSubjects.map((sub, i) => {
                      const percent = Math.round((sub.score / (sub.totalMarks || 1)) * 100);
                      const details = getSubjectGradeDetails(sub.score, sub.totalMarks || 100);
                      const subjectTitle = sub.subjectName || sub.subjectPaper?.subject?.name || sub.subject?.name || 'Unknown Subject';

                      return (
                        <div
                          key={sub.id || sub.subjectPaperId || i}
                          className="group relative bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                        >
                          {/* Ambient top border accent */}
                          <div className={cn("absolute top-0 left-0 right-0 h-1", details.barColor)} />

                          <div>
                            {/* Subject Header: Icon, Name, Index, and WAEC Grade Badge */}
                            <div className="flex items-start justify-between gap-2.5 mb-3">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="size-9 rounded-xl flex items-center justify-center bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                      #{(i + 1).toString().padStart(2, '0')}
                                    </span>
                                  </div>
                                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug truncate group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                    {subjectTitle}
                                  </h3>
                                </div>
                              </div>

                              {/* Square WAEC Letter Grade Badge */}
                              <div className={cn(
                                "size-9 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 shadow-xs",
                                details.colorClass
                              )}>
                                {details.grade}
                              </div>
                            </div>

                            {/* Score & Progress */}
                            <div className="space-y-1.5 my-3 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50">
                              <div className="flex items-baseline justify-between">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                    {sub.score}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-400">
                                    / {sub.totalMarks || 100}
                                  </span>
                                </div>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                                  {percent}%
                                </span>
                              </div>

                              {/* Visual Progress Bar */}
                              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full transition-all duration-700", details.barColor)}
                                  style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Card Footer: Status Pill & Evaluation Note */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider",
                              details.colorClass
                            )}>
                              {details.statusText}
                            </span>

                            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                              {sub.remark && sub.remark !== '-' ? sub.remark : 'Evaluated'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ------------------------------------------------------------- */
                  /* RESPONSIVE TABLE VIEW (DESKTOP/EXPANDED PERSPECTIVE)           */
                  /* ------------------------------------------------------------- */
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse min-w-[620px]">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                          <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider w-12 text-center">ID</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject Name</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Score</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Mastery</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Grade</th>
                          <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredSubjects.map((sub, i) => {
                          const percent = Math.round((sub.score / (sub.totalMarks || 1)) * 100);
                          const details = getSubjectGradeDetails(sub.score, sub.totalMarks || 100);
                          const subjectTitle = sub.subjectName || sub.subjectPaper?.subject?.name || sub.subject?.name || 'Unknown Subject';

                          return (
                            <tr key={sub.id || sub.subjectPaperId || i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                              <td className="px-5 py-3.5 text-center">
                                <span className="inline-flex size-6 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 items-center justify-center border border-slate-200 dark:border-slate-700">
                                  {(i + 1).toString().padStart(2, '0')}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="size-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                                    <BookOpen size={14} />
                                  </div>
                                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                                    {subjectTitle}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white text-sm">
                                {sub.score} <span className="text-slate-400 text-xs font-medium">/ {sub.totalMarks || 100}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs w-8">{percent}%</span>
                                  <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                    <div
                                      className={cn("h-full rounded-full transition-all duration-500", details.barColor)}
                                      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <span className={cn(
                                  "inline-flex size-7 rounded-lg items-center justify-center text-xs font-black border",
                                  details.colorClass
                                )}>
                                  {details.grade}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <span className={cn(
                                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                                  details.colorClass
                                )}>
                                  {details.statusText}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Intelligence Insights Tab */}
            {activeTab === 'insights' && (
              <div className="p-3 sm:p-6 md:p-8 space-y-6">
                {/* AI Analysis Panel */}
                <div className="relative p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-pink-50/60 to-rose-50/30 dark:from-pink-950/20 dark:to-rose-950/10 border border-pink-100 dark:border-pink-800/30 flex flex-col md:flex-row gap-5 sm:gap-6 items-start overflow-hidden">
                  <div className={cn("shrink-0 size-12 rounded-2xl bg-white dark:bg-slate-800 border flex items-center justify-center shadow-xs", result.hasAiInsightAccess ? "text-pink-600 border-pink-200 dark:border-pink-800" : "text-slate-400 border-slate-200 dark:border-slate-700")}>
                    <BrainCircuit size={24} />
                  </div>
                  <div className="flex-1 relative w-full">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">AI Pedagogical Analysis</h4>
                      {result.hasAiInsightAccess ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-pink-200 dark:border-pink-800/50">
                          <Sparkles size={11} /> Active AI Diagnostics
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200 dark:border-amber-800/50">
                          <Lock size={11} /> School Plan Required
                        </span>
                      )}
                    </div>

                    <div className="relative mt-3 sm:mt-4">
                      <Quote className="absolute -top-3 -left-2 sm:-left-3 text-pink-600/10 size-7 sm:size-8 transform -rotate-12" />
                      <p className={cn(
                        "text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium pl-5 sm:pl-6 relative z-10",
                        !result.hasAiInsightAccess && "blur-[4px] select-none opacity-50"
                      )}>
                        {result.performanceInsight || "Premium AI insights analyze your strengths and weaknesses to provide personalized recommendations. Upgrade your school plan to see detailed analysis, study guides, and predictive scoring based on this exam performance."}
                      </p>
                    </div>

                    {/* Plan Gating Overlay */}
                    {!result.hasAiInsightAccess && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/75 dark:bg-slate-900/80 backdrop-blur-[3px] rounded-xl p-5 text-center">
                        <div className="size-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 shadow-xs border border-amber-200 dark:border-amber-800/60">
                          <Lock size={18} />
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                          School AI Insights Required
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mb-3 leading-relaxed">
                          AI Pedagogical Insights are enabled when your school is subscribed to an AI-supported subscription plan. Ask your school administrator to enable AI features.
                        </p>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          <Sparkles size={11} className="text-pink-500" />
                          Requires School Plan with AI Insights
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Diagnostic Breakdown Cards (when AI access is active) */}
                {result.hasAiInsightAccess && (aiDiagnostics.strengths.length > 0 || aiDiagnostics.growthAreas.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Academic Strengths */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                        <CheckCircle2 size={16} />
                        <span>Academic Strengths</span>
                      </div>
                      {aiDiagnostics.strengths.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {aiDiagnostics.strengths.map((s, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs"
                            >
                              <span>{s.name}</span>
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-md">
                                {s.pct}%
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Aim to achieve 65%+ across subjects to establish designated strength domains.
                        </p>
                      )}
                    </div>

                    {/* Growth Opportunities */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-3">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs sm:text-sm">
                        <AlertCircle size={16} />
                        <span>Key Focus Areas</span>
                      </div>
                      {aiDiagnostics.growthAreas.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {aiDiagnostics.growthAreas.map((s, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs"
                            >
                              <span>{s.name}</span>
                              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md">
                                {s.pct}%
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          Solid baseline maintained! No critical subject deficiencies detected.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
