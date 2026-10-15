"use client";

import { useState, useMemo, useEffect } from 'react';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts, useStudentStats } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { ClassHeader } from './components/ClassHeader';
import { ClassStats } from './components/ClassStats';
import { ClassList } from './components/ClassList';
import { AcademicSummary } from './components/AcademicSummary';
import { ClassItem } from './components/ClassTable';

interface SubjectEntry {
  subject?: {
    name?: string;
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
  
  const { data: enrollmentsData, isLoading } = useClasses();
  const { data: attemptsData } = useStudentExamAttempts();
  const { data: standaloneGradesData } = useGrades();
  const { data: statsData } = useStudentStats();

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
    return enrollments.map((en, index) => {
      const cls = en.class;
      return {
        id: cls.id,
        title: cls.name,
        subject: cls.subjects?.[0]?.subject?.name || 'General Subject',
        teacher: cls.teachers?.[0]?.teacher?.name || 'Assigned Instructor',
        room: cls.section || 'General Room',
        progress: 0,
        assignmentsDue: 0,
        nextSession: 'TBD',
        days: ['Mon', 'Wed', 'Fri'],
        description: cls.subjects?.map((s) => s.subject?.name).filter(Boolean).join(', ') || 'Core registered subject.',
        color: colors[index % colors.length],
      };
    });
  }, [enrollments]);

  // Count unique subjects across all enrolled classes
  const totalSubjects = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return 0;
    const subjectNames = new Set<string>();
    enrollments.forEach((en) => {
      en.class?.subjects?.forEach((s) => {
        const name = s.subject?.name;
        if (name) subjectNames.add(name);
      });
    });
    return subjectNames.size;
  }, [enrollments]);

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
        />
        
        {/* Grid / Table Class View */}
        <ClassList 
          isLoading={isLoading} 
          filteredClasses={filteredClasses} 
          viewMode={viewMode}
          onClearSearch={() => setSearchQuery('')}
        />

      </div>
    </div>
  );
}
