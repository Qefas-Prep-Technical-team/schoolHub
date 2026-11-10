import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { StudentAssignmentExportModal } from '@/app/dashboard/student/assignments/components/StudentAssignmentExportModal';
import { Assignment } from '@/app/dashboard/student/assignments/components/types';

interface StudentData {
  name?: string;
  studentCode?: string;
  currentClass?: { name?: string };
  school?: Record<string, unknown>;
  recentGrades?: Array<{
    subject?: string;
    score?: number;
    maxMarks?: number;
  }>;
  assignments?: Array<{
    id?: string;
    title?: string;
    subject?: string;
    status?: string;
    grade?: string;
    dueDate?: string;
    instructor?: string;
  }>;
}

interface StatsData {
  attendanceRate?: number;
  averageGrade?: number;
}

interface DownloadReportButtonProps {
  student?: StudentData | null;
  stats?: StatsData | null;
}

export default function DownloadReportButton({ student, stats }: DownloadReportButtonProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Map student's assignments to Assignment format for StudentAssignmentExportModal
  const mappedAssignments: Assignment[] = (student?.assignments || []).map((a, idx) => ({
    id: a.id || `assign-${idx}`,
    title: a.title || 'Coursework Assignment',
    subject: a.subject || 'General Studies',
    instructor: a.instructor || 'Class Instructor',
    dueDate: a.dueDate || new Date().toISOString(),
    status: (a.status === 'graded' ? 'graded' : a.status === 'submitted' ? 'submitted' : 'pending'),
    progress: a.status === 'graded' || a.status === 'submitted' ? 100 : 0,
    color: 'orange',
    grade: a.grade || undefined,
  }));

  return (
    <>
      <button
        onClick={() => setIsExportModalOpen(true)}
        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-xs justify-center active:scale-95 text-xs sm:text-sm cursor-pointer"
        title="Export student assignment portfolio"
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Export Portfolio</span>
        <span className="inline sm:hidden">Export</span>
      </button>

      {/* Multi-Format Academic Export Modal with Quota Management */}
      <StudentAssignmentExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        assignments={mappedAssignments}
        schoolProfile={student?.school}
        schoolId={student?.school?.id as string | undefined}
        studentName={student?.name || 'Student'}
        className={student?.currentClass?.name || 'Class Cohort'}
      />
    </>
  );
}
