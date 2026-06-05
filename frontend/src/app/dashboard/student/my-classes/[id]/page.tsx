"use client";

import { use, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { TabPanel } from 'react-tabs';

import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';

import ClassHeader from './components/ClassHeader';
import Breadcrumbs from './components/Breadcrumbs';
import ClassOverview from './components/ClassOverview';
import ClassStats from './components/ClassStats';
import ClassTabs from './components/ClassTabs';
import AssignmentsTable from './components/AssignmentsTable';
import LoadingState from './components/LoadingState';
import MaterialsPage from './components/materials/page';
import AttendancePage from './components/attendance/page';
import DiscussionsPage from './components/discussions/page';

interface ClassDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'assessments' | 'materials' | 'attendance' | 'discussions'>('assessments');

  const { data: classData, isLoading, isError } = useSingleClass(id);
  const { data: attemptsData } = useStudentExamAttempts();
  const { data: standaloneGradesData } = useGrades();
  const { data: studentProfile } = useStudentProfile();

  const attempts = attemptsData?.attempts || [];
  const standaloneGrades = standaloneGradesData?.grades || [];

  // Department the student has selected (null if not yet set)
  const studentDepartmentId: string | null = (studentProfile as any)?.departmentId || null;
  const studentDepartmentName: string | null = (studentProfile as any)?.department?.name || null;
  const hasDepartment = !!studentDepartmentId;

  const classItem = useMemo(() => {
    if (!classData) return null;

    const primaryTeacher = classData.teachers?.[0]?.teacher;
    const allSubjects: string[] = classData.subjects?.map((s: any) => s.subject?.name).filter(Boolean) || [];
    const primarySubject = allSubjects[0] || 'General';

    // Derive grade letter from attempts scoped to this class
    const classAttempts = attempts.filter((a: any) => a.classId === id || a.exam?.classId === id);
    let gradeLabel = 'N/A';
    if (classAttempts.length > 0) {
      const avg = classAttempts.reduce((sum: number, a: any) =>
        sum + ((a.totalScore || 0) / (a.totalMarks || 1)) * 100, 0) / classAttempts.length;
      if (avg >= 75) gradeLabel = 'A';
      else if (avg >= 60) gradeLabel = 'B';
      else if (avg >= 50) gradeLabel = 'C';
      else if (avg >= 45) gradeLabel = 'D';
      else gradeLabel = 'F';
    }

    // Last activity: latest scored attempt for this class
    const lastAttempt = classAttempts
      .filter((a: any) => a.submittedAt)
      .sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
    const lastActivity = lastAttempt?.submittedAt
      ? format(new Date(lastAttempt.submittedAt), 'MMM d')
      : 'No activity yet';

    // ─── Assessment filtering by department / scope ────────────────────────────
    //
    // Priority order for which exams show:
    //  1. If student HAS a department → show DEPARTMENT-scoped exams matching their dept,
    //     plus CLASS-scoped exams for this class, plus SCHOOL-scoped exams.
    //  2. If student has NO department → show CLASS-scoped and SCHOOL-scoped only.
    //  3. NEVER show DEPARTMENT exams from a different department.
    //
    const classExams: any[] = classData.exams || [];

    const filteredExams = classExams.filter((exam: any) => {
      const scope: string = exam.scope || 'CLASS';

      if (scope === 'SCHOOL') return true; // Always visible

      if (scope === 'CLASS') return true; // Always visible for this class

      if (scope === 'DEPARTMENT') {
        if (!hasDepartment) return false; // No dept set → skip dept exams
        // Match if any department on the exam matches the student's department
        const examDeptIds: string[] = (exam.departments || []).map((d: any) =>
          d.departmentId || d.department?.id || d.id
        );
        return examDeptIds.includes(studentDepartmentId!);
      }

      return false; // Unknown scope — exclude
    });

    const examsAsAssessments = filteredExams.map((exam: any, idx: number) => {
      const now = new Date();
      const end = exam.endDate ? new Date(exam.endDate) : null;
      const start = exam.startDate ? new Date(exam.startDate) : null;
      const attempted = attempts.some((a: any) => a.examId === exam.id);

      let status: 'graded' | 'submitted' | 'upcoming' | 'overdue' = 'upcoming';
      if (attempted) {
        const a = attempts.find((a: any) => a.examId === exam.id);
        status = a?.status === 'SCORED' ? 'graded' : 'submitted';
      } else if (end && now > end) {
        status = 'overdue';
      }

      const matchedAttempt = attempts.find((a: any) => a.examId === exam.id);
      const gradeStr = matchedAttempt?.totalScore != null && matchedAttempt?.totalMarks
        ? `${matchedAttempt.totalScore}/${matchedAttempt.totalMarks}`
        : undefined;

      // Label: append exam category (EXAM / QUIZ) for clarity
      const typeLabel = exam.category === 'QUIZ' ? 'Quiz' : exam.scope === 'DEPARTMENT' ? 'Dept Exam' : 'Exam';

      return {
        id: idx + 1,
        title: `[${typeLabel}] ${exam.title || `Assessment ${idx + 1}`}`,
        dueDate: end ? format(end, 'MMM d, yyyy') : (start ? format(start, 'MMM d, yyyy') : 'TBD'),
        status,
        grade: gradeStr,
      };
    });

    // Standalone CA grades for subjects taught in this class
    const subjectNames = new Set(allSubjects.map((s: string) => s.toLowerCase()));
    const gradesAsAssessments = (standaloneGrades as any[])
      .filter((g) => subjectNames.has((g.subject || '').toLowerCase()))
      .map((g, idx) => ({
        id: examsAsAssessments.length + idx + 1,
        title: `[CA] ${g.subject} — ${g.examTitle || 'Assessment'}`,
        dueDate: g.createdAt ? format(new Date(g.createdAt), 'MMM d, yyyy') : 'N/A',
        status: 'graded' as const,
        grade: `${g.score}/${g.maxMarks}`,
      }));

    const combinedAssessments = [...examsAsAssessments, ...gradesAsAssessments];

    return {
      id: classData.id,
      title: classData.name,
      code: classData.code || classData.section || primarySubject,
      subject: allSubjects.join(', ') || 'General',
      teacher: {
        name: primaryTeacher?.name || 'Unassigned Teacher',
        title: primaryTeacher?.email ? `Teacher — ${primaryTeacher.email}` : 'Class Teacher',
        avatar: primaryTeacher?.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(primaryTeacher?.name || 'T')}&background=6366f1&color=fff&size=128`,
        email: primaryTeacher?.email || '',
      },
      description: allSubjects.length > 0
        ? `This class covers ${allSubjects.join(', ')}. It is part of the ${classData.session || 'current'} academic session${classData.term ? ` — ${classData.term} Term` : ''}${studentDepartmentName ? `. Your department: ${studentDepartmentName}.` : ''}`
        : `${classData.name} — ${classData.session || 'Current Session'}`,
      stats: {
        attendance: classData.attendanceRate ?? 0,
        assignments: {
          completed: combinedAssessments.filter(a => a.status === 'graded' || a.status === 'submitted').length,
          total: combinedAssessments.length,
        },
        grade: gradeLabel,
        lastActivity,
      },
      assessments: combinedAssessments,
    };
  }, [classData, attempts, standaloneGrades, id, studentDepartmentId, studentDepartmentName, hasDepartment]);

  if (isLoading) return <LoadingState />;
  if (isError || (!isLoading && !classItem)) {
    notFound();
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <ClassHeader classItem={classItem!} />
      <Breadcrumbs classTitle={classItem!.title} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ClassOverview
            teacher={classItem!.teacher}
            description={classItem!.description}
          />
        </div>
        <div>
          <ClassStats
            attendance={classItem!.stats.attendance}
            assignments={classItem!.stats.assignments}
            grade={classItem!.stats.grade}
            lastActivity={classItem!.stats.lastActivity}
          />
        </div>
      </div>

      <ClassTabs activeTab={activeTab} onTabChange={setActiveTab}>
        <TabPanel>
          <AssignmentsTable
            assignments={classItem!.assessments}
            hasDepartment={hasDepartment}
          />
        </TabPanel>
        <TabPanel>
          <MaterialsPage />
        </TabPanel>
        <TabPanel>
          <AttendancePage />
        </TabPanel>
        <TabPanel>
          <DiscussionsPage />
        </TabPanel>
      </ClassTabs>
    </div>
  );
}