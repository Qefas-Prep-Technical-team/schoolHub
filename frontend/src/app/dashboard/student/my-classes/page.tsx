"use client";

import { useState, useMemo } from 'react';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { ClassHeader } from './components/ClassHeader';
import { ClassStats } from './components/ClassStats';
import { ClassList } from './components/ClassList';
import { AcademicSummary } from './components/AcademicSummary';
import { ClassItem } from './components/ClassCard';

export default function StudentClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: enrollments, isLoading } = useClasses();

  const classesList: ClassItem[] = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return [];
    
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
    
    // The backend returns ClassEnrollment[] for students
    return enrollments.map((en: any, index: number) => {
      const cls = en.class;
      return {
        id: cls.id,
        title: cls.name,
        subject: cls.subjects?.[0]?.subject?.name || 'General Subject',
        teacher: cls.teachers?.[0]?.teacher?.name || 'Unassigned Teacher',
        room: cls.section || 'General Classroom',
        progress: 0, // Pending backend CA score integration
        assignmentsDue: 0,
        nextSession: 'TBD',
        days: ['Mon', 'Wed', 'Fri'], // Placeholder pending timetable module integration
        description: cls.subjects?.map((s: any) => s.subject?.name).join(', ') || 'Academic registered subject.',
        color: colors[index % colors.length], // Deterministic color assignment based on index
      };
    });
  }, [enrollments]);

  const filteredClasses = useMemo(() => {
    return classesList.filter(c => 
      (c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       c.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, classesList]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 pb-40">
      <div className="max-w-7xl mx-auto space-y-12">
        <ClassHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ClassStats totalClasses={classesList.length} />
        <ClassList isLoading={isLoading} filteredClasses={filteredClasses} />
        <AcademicSummary totalClasses={classesList.length} />
      </div>
    </div>
  );
}
