"use client";

import { useState, useMemo } from 'react';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useStudentExamAttempts, useStudentStats } from '@/lib/api/hooks/useExams';
import { useGrades } from '@/lib/api/hooks/useGrades';
import { ClassHeader } from './components/ClassHeader';
import { ClassStats } from './components/ClassStats';
import { ClassList } from './components/ClassList';
import { AcademicSummary } from './components/AcademicSummary';
import { ClassItem } from './components/ClassCard';

export default function StudentClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: enrollments, isLoading } = useClasses();
  const { data: attemptsData } = useStudentExamAttempts();
  const { data: standaloneGradesData } = useGrades();
  const { data: statsData } = useStudentStats();

  const attempts = attemptsData?.attempts || [];
  const standaloneGrades = standaloneGradesData?.grades || [];

  const classesList: ClassItem[] = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return [];
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
    return enrollments.map((en: any, index: number) => {
      const cls = en.class;
      return {
        id: cls.id,
        title: cls.name,
        subject: cls.subjects?.[0]?.subject?.name || 'General Subject',
        teacher: cls.teachers?.[0]?.teacher?.name || 'Unassigned Teacher',
        room: cls.section || 'General Classroom',
        progress: 0,
        assignmentsDue: 0,
        nextSession: 'TBD',
        days: ['Mon', 'Wed', 'Fri'],
        description: cls.subjects?.map((s: any) => s.subject?.name).join(', ') || 'Academic registered subject.',
        color: colors[index % colors.length],
      };
    });
  }, [enrollments]);

  // Count unique subjects across all enrolled classes
  const totalSubjects = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return 0;
    const subjectNames = new Set<string>();
    enrollments.forEach((en: any) => {
      en.class?.subjects?.forEach((s: any) => {
        const name = s.subject?.name;
        if (name) subjectNames.add(name);
      });
    });
    return subjectNames.size;
  }, [enrollments]);

  // Total marks scored across all exam attempts + standalone grades
  const totalMarks = useMemo(() => {
    let total = 0;
    attempts.forEach((a: any) => { total += a.totalScore || 0; });
    standaloneGrades.forEach((g: any) => { total += g.score || 0; });
    return total;
  }, [attempts, standaloneGrades]);

  // Class position from student global stats — backend returns { overallRank, totalStudentsInClass }
  const classPosition = useMemo(() => {
    const rank = (statsData as any)?.overallRank;
    const total = (statsData as any)?.totalStudentsInClass;
    if (!rank || rank === 0) return null;
    const padded = `#${String(rank).padStart(2, '0')}`;
    return total ? `${padded} / ${total}` : padded;
  }, [statsData]);

  const filteredClasses = useMemo(() => {
    return classesList.filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, classesList]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 pb-40">
      <div className="max-w-7xl mx-auto space-y-12">
        <ClassHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ClassStats totalClasses={classesList.length} />
        <ClassList isLoading={isLoading} filteredClasses={filteredClasses} />
        <AcademicSummary
          totalSubjects={totalSubjects}
          totalMarks={totalMarks}
          classPosition={classPosition}
        />
      </div>
    </div>
  );
}
