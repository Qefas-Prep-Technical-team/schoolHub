'use client';

import { useState } from 'react';
import PageHeader from './components/PageHeader';
import GradeFilters from './components/GradeFilters';
import GradeTable from './components/GradeTable';
import FormActions from './components/FormActions';
import { Class, StudentGrade, Subject, Term } from './components/types';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';


const initialStudents: StudentGrade[] = [
  {
    id: '1',
    name: 'Olivia Chen',
    studentCode: 'S001',
    subjectPaper: 'Mathematics',
    assessmentType: 'Assignment',
    score: 88,
    total: 88,
    grade: 'A',
    isSelected: false,
    recordedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Benjamin Carter',
    studentCode: 'S002',
    subjectPaper: 'Mathematics',
    assessmentType: 'Assignment',
    score: 64,
    total: 64,
    grade: 'B',
    isSelected: false,
    recordedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    studentCode: 'S003',
    subjectPaper: 'Mathematics',
    assessmentType: 'Exam',
    score: 92,
    total: 92,
    grade: 'A+',
    isSelected: false,
    recordedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Liam Goldberg',
    studentCode: 'S004',
    subjectPaper: 'Mathematics',
    assessmentType: 'Assignment',
    score: 120,
    total: 120,
    grade: 'Invalid',
    isSelected: false,
    hasError: true,
    recordedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '5',
    name: 'Ava Nguyen',
    studentCode: 'S005',
    subjectPaper: 'Mathematics',
    assessmentType: 'Assignment',
    score: 76,
    total: 76,
    grade: 'A',
    isSelected: false,
    recordedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const terms: Term[] = [
  { id: 'fall-2024', name: 'Fall Semester 2024' },
  { id: 'spring-2024', name: 'Spring Semester 2024' },
];

const classes: Class[] = [
  { id: 'grade10a', name: 'Grade 10 - Section A' },
  { id: 'grade10b', name: 'Grade 10 - Section B' },
];

const subjects: Subject[] = [
  { id: 'math', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
];

export default function RecordGradesPage() {
  const { selectedSchoolId } = useDashboardStore();
  const { user } = useAuthStore();
  const rawSchoolId = selectedSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const effectiveSchoolId = rawSchoolId === 'default-tenant-id' || rawSchoolId === 'personal' ? '' : rawSchoolId;
  const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId);

  const [students, setStudents] = useState<StudentGrade[]>(initialStudents);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilterChange = (filters: {
    term: string;
    class: string;
    subject: string;
  }) => {
    void filters;
  };

  const handleSaveDraft = () => {
    // Save draft logic
  };

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    try {
      // Validate all scores
      const hasErrors = students.some(
        (student) =>
          student.score < 0 ||
          student.score > 100
      );

      if (hasErrors) {
        alert('Please fix all errors before submitting.');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Grades submitted successfully!');
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit grades. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-6 p-4">
      <PageHeader title="Record Grades" />
      
      <GradeFilters
        terms={terms}
        classes={classes}
        subjects={subjects}
        onFilterChange={handleFilterChange}
      />
      
      <GradeTable
        students={students}
        onStudentsUpdate={setStudents}
        gradingSystem={schoolProfile?.gradingSystem}
      />
      
      <FormActions
        onSaveDraft={handleSaveDraft}
        onSubmitFinal={handleSubmitFinal}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
