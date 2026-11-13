"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useExams, useExam, useExamAttempts } from '@/lib/api/hooks/useExams';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import ExportResultScopeModal, { ExportScopeMode, ExportStudentOption } from '../../components/ExportResultScopeModal';
import { downloadIndividualResultsAsZip, downloadSingleStudentPdf, downloadCombinedAssessmentPdf } from '../../utils/batchPDFDownloader';
import { AssessmentCohortView } from '../components/AssessmentCohortView';
import { DedicatedDetailedStudentResult } from '../components/DedicatedDetailedStudentResult';

export default function AssessmentGradesDedicatedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const examId = String(params.examId || '');
  const urlStudentId = searchParams.get('studentId');

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: school } = useSchoolProfile(schoolId);
  const primaryColor = school?.brandSettings?.primaryColor || '#2563eb';

  const { data: exams } = useExams();
  const { data: detailedExam } = useExam(examId);
  const { data: attempts, isLoading: isLoadingAttempts } = useExamAttempts(examId);
  const { data: sessionsRes } = useSessions(schoolId);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(urlStudentId);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedStudentForExport, setSelectedStudentForExport] = useState<string | undefined>(undefined);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

  useEffect(() => {
    if (urlStudentId) {
      setSelectedStudentId(urlStudentId);
    }
  }, [urlStudentId]);

  const exam = useMemo(() => {
    return detailedExam || exams?.find((e: any) => e.id === examId);
  }, [detailedExam, exams, examId]);

  const activeSessionName = useMemo(() => {
    const examObj = exam as any;
    if (examObj?.session?.name) return examObj.session.name;
    if (examObj?.academicSession?.name) return examObj.academicSession.name;
    if (examObj?.sessionName) return examObj.sessionName;

    const sessionsList = Array.isArray(sessionsRes?.data) ? sessionsRes.data : (Array.isArray(sessionsRes) ? sessionsRes : []);
    if (examObj?.sessionId && sessionsList.length > 0) {
      const match = sessionsList.find((s: any) => s.id === examObj.sessionId);
      if (match?.name) return match.name;
    }

    const currentSession = sessionsList.find((s: any) => s.isCurrent || s.isActive || s.status === 'ACTIVE');
    if (currentSession?.name) return currentSession.name;

    const schoolObj = school as any;
    if (schoolObj?.currentSession?.name) return schoolObj.currentSession.name;
    if (schoolObj?.session?.name) return schoolObj.session.name;

    const currentYear = new Date().getFullYear();
    return `${currentYear}/${currentYear + 1}`;
  }, [exam, sessionsRes, school]);

  const exportStudentOptions = useMemo<ExportStudentOption[]>(() => {
    if (!attempts) return [];
    return attempts.map((a: any) => {
      const studentClass =
        a.className ||
        exam?.class?.name ||
        a.student?.class?.name ||
        (a.student?.classes?.[0]?.class?.name ? `${a.student.classes[0].class.name}${a.student.classes[0].class.section ? ` (${a.student.classes[0].class.section})` : ''}` : '') ||
        'N/A';
      return {
        id: a.studentId || a.id,
        name: a.student?.name || 'Student',
        studentCode: a.student?.studentCode || 'N/A',
        className: studentClass,
        score: a.totalScore !== undefined ? a.totalScore : a.percentage,
        totalMarks: a.totalMarks,
        rawItem: a,
      };
    });
  }, [attempts, exam]);

  const papers = useMemo(() => {
    if (attempts && attempts.length > 0) {
      const firstAttempt = attempts.find((a) => {
        const subs = a.subjectExamAttempts || a.subjectAttempts || [];
        return subs.length > 0;
      });
      if (firstAttempt) {
        const subs = firstAttempt.subjectExamAttempts || firstAttempt.subjectAttempts || [];
        return subs.map((sa) => ({
          id: sa.subjectPaperId,
          name: sa.subjectPaper?.subject?.name || sa.subjectPaper?.title || 'Unknown Paper',
        }));
      }
    }
    const examPapersList = exam?.subjectPapers || [];
    if (Array.isArray(examPapersList) && examPapersList.length > 0) {
      return examPapersList.map((sp) => ({
        id: sp.id,
        name: sp.subject?.name || sp.title || 'Unknown Paper',
      }));
    }
    return [];
  }, [attempts, exam]);

  const handleExportScope = async (mode: ExportScopeMode, selectedList: ExportStudentOption[]) => {
    if (!selectedList.length) return;
    setIsBatchDownloading(true);
    try {
      const title = exam?.title || 'Assessment';
      const sessionName = activeSessionName;
      if (mode === 'combined_pdf') {
        await downloadCombinedAssessmentPdf({
          exam: exam ? { ...exam, sessionName } : { title, sessionName },
          attempts: attempts || [],
          school,
          sessionName,
        });
      } else if (mode === 'all_zip' || (mode === 'custom' && selectedList.length > 1)) {
        await downloadIndividualResultsAsZip({
          results: selectedList.map(s => s.rawItem),
          school,
          examTitle: title,
          className: exam?.class?.name || 'Class Results',
          sessionName,
        });
      } else {
        await downloadSingleStudentPdf({
          result: selectedList[0].rawItem,
          school,
          examTitle: title,
          className: selectedList[0].className,
          sessionName,
        });
      }
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsBatchDownloading(false);
    }
  };

  const handleSelectStudent = (sId: string) => {
    setSelectedStudentId(sId);
    router.push(`/dashboard/admin/grades/assessments/${examId}?studentId=${sId}`);
  };

  const handleBackToCohort = () => {
    setSelectedStudentId(null);
    router.push(`/dashboard/admin/grades/assessments/${examId}`);
  };

  const handleBackToGrades = () => {
    router.push('/dashboard/admin/grades');
  };

  if (selectedStudentId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto">
          <DedicatedDetailedStudentResult
            examId={examId}
            studentId={selectedStudentId}
            onBack={handleBackToCohort}
            school={school}
            primaryColor={primaryColor}
            examTitle={exam?.title}
            attempts={attempts}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300 pb-20">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handleBackToGrades}
            variant="ghost"
            className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-bold gap-2 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to All Grades</span>
          </Button>

          <Button
            onClick={() => {
              setSelectedStudentForExport(undefined);
              setIsExportModalOpen(true);
            }}
            disabled={isBatchDownloading || !attempts?.length}
            className="h-10 px-5 rounded-xl font-bold uppercase tracking-wider gap-2 shadow-sm text-white text-xs border-0 hover:opacity-95 transition-all cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            {isBatchDownloading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Export Class Results</span>
          </Button>
        </div>

        {/* Modular Cohort View */}
        <AssessmentCohortView
          exam={exam}
          attempts={attempts}
          isLoadingAttempts={isLoadingAttempts}
          papers={papers}
          selectedPaperId={selectedPaperId}
          setSelectedPaperId={setSelectedPaperId}
          onSelectStudent={handleSelectStudent}
          onOpenExportModal={() => {
            setSelectedStudentForExport(undefined);
            setIsExportModalOpen(true);
          }}
          primaryColor={primaryColor}
          school={school}
        />

        {/* Scope Export Modal */}
        <ExportResultScopeModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExport={handleExportScope}
          isExporting={isBatchDownloading}
          students={exportStudentOptions}
          currentStudentId={selectedStudentForExport}
          title={`Export ${exam?.title || 'Exam'} Results`}
          description="Select export format (PDF, Excel, CSV) and packaging options for official academic records."
          primaryColor={primaryColor}
          school={school}
          examTitle={exam?.title || 'Exam'}
          className={exam?.class?.name}
          sessionName={activeSessionName}
        />
      </div>
    </div>
  );
}
