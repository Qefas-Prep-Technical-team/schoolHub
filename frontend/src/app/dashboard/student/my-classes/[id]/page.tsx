"use client";

import { use, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { TabPanel } from 'react-tabs';

import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useStudentProfile, useStudentAttendance } from '@/lib/api/hooks/useStudent';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';

import ClassHeader from './components/ClassHeader';
import Breadcrumbs from './components/Breadcrumbs';
import ClassBanner from './components/ClassBanner';
import ClassStats from './components/ClassStats';
import ClassTabs from './components/ClassTabs';
import AssignmentsTable from './components/AssignmentsTable';
import LoadingState from './components/LoadingState';
import MaterialsPage from './components/materials/page';
import AttendancePage from './components/attendance/page';
import DiscussionsPage from './components/discussions/page';
import TimetablePage from './components/timetable/page';

interface ClassDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'assessments' | 'materials' | 'timetable' | 'attendance' | 'discussions'>('assessments');

  const { data: classData, isLoading, isError } = useSingleClass(id);
  const { data: attemptsData } = useStudentExamAttempts();
  const { data: standaloneGradesData } = useGrades();
  const { data: studentProfile } = useStudentProfile();
  const { data: attendanceData } = useStudentAttendance((studentProfile as any)?.id || '');
  const { data: assignmentsData } = useStudentAssignments({ limit: 100 });

  const attempts = attemptsData?.attempts || [];
  const standaloneGrades = standaloneGradesData?.grades || [];

  // Department the student has selected (null if not yet set)
  const studentDepartmentId: string | null = (studentProfile as any)?.departmentId || null;
  const studentDepartmentName: string | null = (studentProfile as any)?.department?.name || null;
  const hasDepartment = !!studentDepartmentId;

  const classItem = useMemo(() => {
    if (!classData) return null;

    const allClassTeachers = classData.teachers?.map((t: any) => t.teacher).filter(Boolean) || [];
    const allSubjects: string[] = classData.subjects?.map((s: any) => s.subject?.name).filter(Boolean) || [];
    const primarySubject = allSubjects[0] || 'General';

    // ─── Department subject scoping ─────────────────────────────────────────────
    // Collect all subject IDs and names that belong to the student's department
    const deptSubjectIds = new Set<string>();
    const deptSubjectNames = new Set<string>();

    if (hasDepartment) {
      // 1. Through classData.departments
      (classData.departments || []).forEach((cd: any) => {
        const d = cd.department || cd;
        const dId = d.id || cd.departmentId;
        if (dId === studentDepartmentId && d.subjects) {
          d.subjects.forEach((ds: any) => {
            const s = ds.subject || ds;
            if (s.id) deptSubjectIds.add(s.id);
            if (s.name) deptSubjectNames.add(s.name.toLowerCase().trim());
          });
        }
      });

      // 2. Through classData.subjects
      (classData.subjects || []).forEach((cs: any) => {
        const s = cs.subject || cs;
        if (s.departments && Array.isArray(s.departments)) {
          const belongsToDept = s.departments.some((d: any) => 
            (d.departmentId === studentDepartmentId) || (d.department?.id === studentDepartmentId) || (d.id === studentDepartmentId)
          );
          if (belongsToDept) {
            if (s.id) deptSubjectIds.add(s.id);
            if (s.name) deptSubjectNames.add(s.name.toLowerCase().trim());
          }
        }
      });
    }

    // Helper to test if a subject belongs to the student's department
    const isSubjectInStudentDept = (subjectId?: string | null, subjectName?: string | null): boolean => {
      if (!hasDepartment) return true; // If student is not in a department (e.g. Junior secondary), allow all
      if (deptSubjectIds.size === 0 && deptSubjectNames.size === 0) return true; // If no department mapping configured, do not block everything
      if (subjectId && deptSubjectIds.has(subjectId)) return true;
      if (subjectName && deptSubjectNames.has(subjectName.toLowerCase().trim())) return true;
      return false;
    };

    // ─── Real Attendance calculation ────────────────────────────────────────────
    const studentAttendance = attendanceData || [];
    const classAttendanceRecords = studentAttendance.filter((rec: any) => rec.classId === id);
    const presentCount = classAttendanceRecords.filter((rec: any) => rec.status === 'present' || rec.status === 'late').length;
    const attendanceRate = classAttendanceRecords.length > 0
      ? Math.round((presentCount / classAttendanceRecords.length) * 100)
      : 0;

    // ─── Real Assignments calculation ───────────────────────────────────────────
    const studentAssignments = assignmentsData?.assignments || [];
    const classAssignments = studentAssignments.filter((a: any) => {
      if (a.classId !== id) return false;
      // Filter out assignments whose subject does not belong to student's department
      if (hasDepartment) {
        if (a.departmentId && a.departmentId !== studentDepartmentId) return false;
        const subjName = a.subject?.name || a.subjectName || '';
        if (!isSubjectInStudentDept(a.subjectId, subjName)) return false;
      }
      return true;
    });
    const completedAssignments = classAssignments.filter((a: any) => a.status === 'graded' || a.status === 'submitted');

    const assignmentsCompleted = completedAssignments.length;
    const assignmentsTotal = classAssignments.length;

    // ─── Assessment filtering by department / scope ────────────────────────────
    const classExams: any[] = classData.exams || [];
    const classAttempts = attempts.filter((a: any) => a.classId === id || a.exam?.classId === id);

    const filteredExams = classExams.filter((exam: any) => {
      // Students should only see published or ongoing assessments
      if (exam.status && !['PUBLISHED', 'ONGOING'].includes(exam.status)) return false;

      // Department scoping: if student has a department, the exam MUST belong to their department
      if (hasDepartment) {
        // Check explicit exam-department links
        const examDeptIds: string[] = (exam.departments || []).map((d: any) =>
          d.departmentId || d.department?.id || d.id
        );
        if (examDeptIds.length > 0) {
          if (!examDeptIds.includes(studentDepartmentId!)) return false;
        }

        // If exam is explicitly DEPARTMENT scoped but doesn't include student's dept
        if (exam.scope === 'DEPARTMENT') {
          if (!examDeptIds.includes(studentDepartmentId!)) return false;
        }

        // Check if the exam subject belongs to student's department
        const examSubjId = exam.subjectId || exam.subject?.id;
        const examSubjName = exam.subject?.name;
        if (examSubjId || examSubjName) {
          if (!isSubjectInStudentDept(examSubjId, examSubjName)) return false;
        }

        // Check subject papers within this exam (if any)
        if (exam.subjectExamPapers && Array.isArray(exam.subjectExamPapers) && exam.subjectExamPapers.length > 0) {
          const hasMatchingPaper = exam.subjectExamPapers.some((sep: any) => {
            const paperSubj = sep.subjectPaper?.subject;
            if (!paperSubj) return true;
            return isSubjectInStudentDept(paperSubj.id, paperSubj.name);
          });
          if (!hasMatchingPaper) return false;
        }
      }

      return true;
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

      // Do NOT show "Subject Paper". Use real assessment category: Test (Quiz), Continuous Assessment, or Exam
      const type = exam.category === 'QUIZ' 
        ? 'Test (Quiz)' 
        : exam.category === 'CA'
          ? 'Continuous Assessment'
          : 'Exam';

      return {
        id: idx + 1,
        title: exam.title || `Assessment ${idx + 1}`,
        dueDate: end ? format(end, 'MMM d, yyyy') : (start ? format(start, 'MMM d, yyyy') : 'TBD'),
        status,
        grade: gradeStr,
        type,
        timestamp: end ? end.getTime() : (start ? start.getTime() : 0),
        link: `/dashboard/student/exams&quizzes/${exam.id}`,
      };
    });

    // Class homework assignments
    const assignmentsAsAssessments = classAssignments.map((a: any, idx: number) => {
      const dueDateVal = a.dueDate ? new Date(a.dueDate) : null;
      return {
        id: examsAsAssessments.length + idx + 1,
        title: a.title,
        dueDate: dueDateVal ? format(dueDateVal, 'MMM d, yyyy') : 'N/A',
        status: a.status as 'graded' | 'submitted' | 'upcoming' | 'overdue',
        grade: a.grade || undefined,
        type: 'Assignment',
        timestamp: dueDateVal ? dueDateVal.getTime() : 0,
        link: `/dashboard/student/assignments/${a.id}`,
      };
    });

    // Standalone CA grades for subjects taught in this class matching student's department
    const subjectNames = new Set(allSubjects.map((s: string) => s.toLowerCase()));
    const classGrades = (standaloneGrades as any[]).filter((g) => {
      const subjName = (g.subject || '').toLowerCase();
      if (!subjectNames.has(subjName)) return false;
      if (hasDepartment && !isSubjectInStudentDept(g.subjectId, g.subject)) return false;
      return true;
    });
    
    const gradesAsAssessments = classGrades.map((g, idx) => {
      const gDate = g.createdAt ? new Date(g.createdAt) : null;
      return {
        id: examsAsAssessments.length + assignmentsAsAssessments.length + idx + 1,
        title: `${g.subject} — ${g.examTitle || 'Assessment'}`,
        dueDate: gDate ? format(gDate, 'MMM d, yyyy') : 'N/A',
        status: 'graded' as const,
        grade: `${g.score}/${g.maxMarks}`,
        type: 'CA',
        timestamp: gDate ? gDate.getTime() : 0,
        link: '#',
      };
    });

    const combinedAssessments = [
      ...examsAsAssessments,
      ...assignmentsAsAssessments,
      ...gradesAsAssessments,
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((item, index) => ({
        ...item,
        id: index + 1,
      }));

    // ─── Real Grade calculation ────────────────────────────────────────────────
    let totalScoreSum = 0;
    let gradedCount = 0;

    // A. Exam attempts
    classAttempts.forEach((a: any) => {
      if (a.totalScore != null && a.totalMarks) {
        totalScoreSum += (a.totalScore / a.totalMarks) * 100;
        gradedCount++;
      }
    });

    // B. Graded homework assignments
    classAssignments.forEach((a: any) => {
      if (a.status === 'graded' && a.grade) {
        let score = 0;
        let max = 100;
        if (a.grade.includes('/')) {
          const [sPart, mPart] = a.grade.split('/');
          score = parseFloat(sPart);
          max = parseFloat(mPart);
        } else {
          score = parseFloat(a.grade.replace(/[^0-9.]/g, ''));
        }
        if (!isNaN(score) && max > 0) {
          totalScoreSum += (score / max) * 100;
          gradedCount++;
        }
      }
    });

    // C. CA grades
    classGrades.forEach((g: any) => {
      if (g.score != null && g.maxMarks) {
        totalScoreSum += (g.score / g.maxMarks) * 100;
        gradedCount++;
      }
    });

    let gradeLabel = 'N/A';
    if (gradedCount > 0) {
      const avg = totalScoreSum / gradedCount;
      if (avg >= 75) gradeLabel = 'A';
      else if (avg >= 60) gradeLabel = 'B';
      else if (avg >= 50) gradeLabel = 'C';
      else if (avg >= 45) gradeLabel = 'D';
      else gradeLabel = 'F';
    }

    // ─── Real Last Activity calculation ─────────────────────────────────────────
    let datesList: Date[] = [];
    classAttempts.forEach((a: any) => {
      if (a.submittedAt) datesList.push(new Date(a.submittedAt));
    });
    classAssignments.forEach((a: any) => {
      if (a.submissionDate) datesList.push(new Date(a.submissionDate));
    });
    classGrades.forEach((g: any) => {
      if (g.createdAt) datesList.push(new Date(g.createdAt));
    });

    const validDates = datesList.filter(d => !isNaN(d.getTime()));
    let lastActivity = 'No activity yet';
    if (validDates.length > 0) {
      const latestDate = new Date(Math.max(...validDates.map(d => d.getTime())));
      lastActivity = format(latestDate, 'MMM d');
    }

    // Build mapped teachers list
    const teachersList = allClassTeachers.map((teacher: any) => {
      const name = teacher.name || 'Unassigned Teacher';
      const mockPhone = `+234 80${(name.charCodeAt(0) % 9) + 1} ${Math.floor(100 + (name.charCodeAt(1) || 0) * 8.7)}-${Math.floor(1000 + (name.charCodeAt(2) || 0) * 7.3)}`;

      return {
        name,
        title: teacher.email ? `Teacher — ${teacher.email}` : 'Class Teacher',
        avatar: teacher.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`,
        email: teacher.email || '',
        phone: mockPhone,
      };
    });

    return {
      id: classData.id,
      title: classData.name,
      name: classData.name,
      code: classData.code || classData.section || primarySubject,
      subject: allSubjects.join(', ') || 'General',
      subjects: classData.subjects || [],
      teachers: teachersList,
      description: allSubjects.length > 0
        ? `This class covers ${allSubjects.join(', ')}. It is part of the ${classData.session || 'current'} academic session${classData.term ? ` — ${classData.term} Term` : ''}${studentDepartmentName ? `. Your department: ${studentDepartmentName}.` : ''}`
        : `${classData.name} — ${classData.session || 'Current Session'}`,
      stats: {
        attendance: attendanceRate,
        assignments: {
          completed: assignmentsCompleted,
          total: assignmentsTotal,
        },
        grade: gradeLabel,
        lastActivity,
      },
      assessments: combinedAssessments,
    };
  }, [classData, attempts, standaloneGrades, id, studentDepartmentId, studentDepartmentName, hasDepartment, attendanceData, assignmentsData]);

  if (isLoading) return <LoadingState />;
  if (isError || (!isLoading && !classItem)) {
    notFound();
    return null;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-16 md:pb-6 space-y-4 sm:space-y-6 font-sans animate-in fade-in duration-500">
      <ClassHeader classItem={classItem!} />
      <Breadcrumbs classTitle={classItem!.title} />

      <div className="space-y-4">
        <ClassBanner
          title={classItem!.title}
          description={classItem!.description}
          onContactClick={() => console.log('Contact')}
          onMaterialsClick={() => setActiveTab('materials')}
        />
        <ClassStats
          attendance={classItem!.stats.attendance}
          assignments={classItem!.stats.assignments}
          grade={classItem!.stats.grade}
          lastActivity={classItem!.stats.lastActivity}
        />
      </div>

      <div className="pt-2">
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
            <TimetablePage />
          </TabPanel>
          <TabPanel>
            <AttendancePage />
          </TabPanel>
          <TabPanel>
            <DiscussionsPage />
          </TabPanel>
        </ClassTabs>
      </div>
    </div>
  );
}