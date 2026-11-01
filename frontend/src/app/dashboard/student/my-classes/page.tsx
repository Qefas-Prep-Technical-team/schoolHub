"use client";

import { useState, useMemo, useEffect } from 'react';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts, useStudentStats } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { useUserStore } from '@/store/useUserStore';
import { ClassHeader } from './components/ClassHeader';
import { ClassStats } from './components/ClassStats';
import { ClassList } from './components/ClassList';
import { AcademicSummary } from './components/AcademicSummary';
import { ClassItem } from './components/ClassTable';
import { StudentClassSelectionModal } from '../components/StudentClassSelectionModal';

interface SubjectEntry {
  subject?: {
    id?: string;
    name?: string;
    departments?: Array<{
      departmentId?: string;
      department?: { id?: string; name?: string };
      id?: string;
    }>;
    scope?: string;
  };
}

interface TeacherEntry {
  teacher?: {
    name?: string;
  };
}

interface EnrolledClassItem {
  class: {
    id: string;
    name: string;
    section?: string;
    subjects?: SubjectEntry[];
    teachers?: TeacherEntry[];
  };
}

interface AttemptItem {
  totalScore?: number;
}

interface GradeItem {
  score?: number;
}

interface StudentRankStats {
  overallRank?: number;
  totalStudentsInClass?: number;
}

export default function StudentClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const { data: enrollmentsData, isLoading } = useClasses();
  const { data: attemptsData } = useStudentExamAttempts();
  const { data: standaloneGradesData } = useGrades();
  const { data: statsData } = useStudentStats();
  const { data: studentProfile } = useStudentProfile();
  const { username } = useUserStore();

  const schoolId = studentProfile?.schoolId;
  const schoolName = studentProfile?.school?.name || "your school";
  const studentName = studentProfile?.name || username || "Scholar";

  // Detect small screens and prefer grid view
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  const enrollments = (enrollmentsData as unknown as EnrolledClassItem[]) || [];
  const attempts = (attemptsData?.attempts as AttemptItem[]) || [];
  const standaloneGrades = (standaloneGradesData?.grades as GradeItem[]) || [];

  const classesList: ClassItem[] = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return [];
    const colors = ['#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'];

    const studentDeptId: string | null = (studentProfile as any)?.departmentId ||
      (studentProfile as any)?.department?.id || null;

    // Set of subject names / ids explicitly assigned to the student's department from profile
    const studentDeptProfileSubjectNames = new Set<string>();
    const studentDeptProfileSubjectIds = new Set<string>();
    const profileDeptSubjects = (studentProfile as any)?.department?.subjects;
    if (Array.isArray(profileDeptSubjects)) {
      profileDeptSubjects.forEach((ds: any) => {
        if (ds.subject?.name) studentDeptProfileSubjectNames.add(ds.subject.name);
        if (ds.subject?.id) studentDeptProfileSubjectIds.add(ds.subject.id);
        if (ds.subjectId) studentDeptProfileSubjectIds.add(ds.subjectId);
      });
    }

    return enrollments.map((en, index) => {
      const cls = en.class;

      // Build the set of subject names belonging to the student's assigned department
      const deptSubjectNames = new Set<string>();
      if (studentDeptId && cls.subjects) {
        cls.subjects.forEach((se: SubjectEntry) => {
          const s = se.subject;
          if (!s?.name) return;

          // Check if subject belongs to student's department via subject.departments
          const belongsToDeptRelation = s.departments?.some(
            (d) =>
              d.departmentId === studentDeptId ||
              d.department?.id === studentDeptId ||
              d.id === studentDeptId
          );

          // Check if subject matches profile department's subjects
          const belongsToDeptProfile =
            studentDeptProfileSubjectNames.has(s.name) ||
            (s.id && studentDeptProfileSubjectIds.has(s.id));

          if (belongsToDeptRelation || belongsToDeptProfile) {
            deptSubjectNames.add(s.name);
          }
        });
      }

      // All subject names (unfiltered) for fallback if student has no department
      const allSubjectNames: string[] = (cls.subjects || []).map((s: SubjectEntry) => s.subject?.name).filter(Boolean) as string[];
      
      // When student has an assigned department and department subjects exist for this class, ONLY show department subjects
      const hasDeptAssigned = Boolean(studentDeptId);
      const hasDeptSubjects = deptSubjectNames.size > 0;
      
      const visibleSubjectNames = (hasDeptAssigned && hasDeptSubjects)
        ? allSubjectNames.filter((n) => deptSubjectNames.has(n))
        : allSubjectNames;

      return {
        id: cls.id,
        title: cls.name,
        subject: visibleSubjectNames[0] || (hasDeptAssigned ? 'No Department Subjects' : 'General Subject'),
        subjects: visibleSubjectNames,
        teacher: cls.teachers?.[0]?.teacher?.name || 'Assigned Instructor',
        room: cls.section || 'General Room',
        progress: 0,
        assignmentsDue: 0,
        nextSession: 'TBD',
        days: ['Mon', 'Wed', 'Fri'],
        description: visibleSubjectNames.join(', ') || (hasDeptAssigned ? 'No subjects assigned for your department.' : 'Core registered subject.'),
        color: colors[index % colors.length],
        hasDeptFilter: hasDeptAssigned && hasDeptSubjects,
      };
    });
  }, [enrollments, studentProfile]);

  // Count unique subjects across all enrolled classes (reflecting student's department subjects when available)
  const totalSubjects = useMemo(() => {
    if (!classesList || classesList.length === 0) return 0;
    const subjectNames = new Set<string>();
    classesList.forEach((cls) => {
      cls.subjects?.forEach((name) => {
        if (name) subjectNames.add(name);
      });
    });
    return subjectNames.size;
  }, [classesList]);

  // Total marks scored across all exam attempts + standalone grades
  const totalMarks = useMemo(() => {
    let total = 0;
    attempts.forEach((a) => { total += a.totalScore || 0; });
    standaloneGrades.forEach((g) => { total += g.score || 0; });
    return total;
  }, [attempts, standaloneGrades]);

  // Class position from student global stats — backend returns { overallRank, totalStudentsInClass }
  const classPosition = useMemo(() => {
    const stats = statsData as unknown as StudentRankStats | undefined;
    const rank = stats?.overallRank;
    const total = stats?.totalStudentsInClass;
    if (!rank || rank === 0) return null;
    const padded = `#${String(rank).padStart(2, '0')}`;
    return total ? `${padded} / ${total}` : padded;
  }, [statsData]);

  const filteredClasses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return classesList;
    return classesList.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.teacher.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }, [searchQuery, classesList]);

  return (
    <div className="w-full space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Academic Overview Hero Banner */}
        <AcademicSummary 
          totalSubjects={totalSubjects} 
          totalMarks={totalMarks} 
          classPosition={classPosition} 
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
        />
        
        {/* Real-time Class Stats Grid */}
        <ClassStats 
          totalClasses={classesList.length} 
          totalSubjects={totalSubjects}
          attemptsCount={attempts.length}
          classPosition={classPosition}
        />
        
        {/* Class Directory Controls */}
        <ClassHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          totalClasses={classesList.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
        />
        
        {/* Grid / Table Class View */}
        <ClassList 
          isLoading={isLoading} 
          filteredClasses={filteredClasses} 
          viewMode={viewMode}
          onClearSearch={() => setSearchQuery('')}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
        />

        {/* Student Classroom Selection Modal with Test Data */}
        <StudentClassSelectionModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          schoolId={schoolId}
          schoolName={schoolName}
          studentName={studentName}
        />

      </div>
    </div>
  );
}
