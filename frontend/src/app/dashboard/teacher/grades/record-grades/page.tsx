'use client';

import { useState } from 'react';
import PageHeader from './components/PageHeader';
import GradeFilters from './components/GradeFilters';
import GradeTable from './components/GradeTable';
import FormActions from './components/FormActions';
import { Class, StudentGrade, Subject, Term } from './components/types';


const initialStudents: StudentGrade[] = [
  {
    id: '1',
    name: 'Olivia Chen',
    studentCode: 'S001',
    subjectPaper: 'Mathematics',
    assessmentType: 'Assignment',
    score: 18,
    total: 18,
    grade: 'A-',
    isSelected: false,
  },
  {
    id: '2',
    name: 'Benjamin Carter',
    studentCode: 'S002',
    subjectPaper: 'Mathematics',
    assessmentType: 'Assignment',
    score: 15,
    total: 15,
    grade: 'B',
    isSelected: false,
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    studentCode: 'S003',
    subjectPaper: 'Mathematics',
    assessmentType: 'Exam',
    score: 20,
    total: 20,
    grade: 'A',
    isSelected: false,
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
  },
  {
    id: '5',
    name: 'Ava Nguyen',
    studentCode: 'S005',
    subjectPaper: 'Mathematics',
    assessmentType: 'Assignment',
    score: 19,
    total: 19,
    grade: 'A-',
    isSelected: false,
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
  const [students, setStudents] = useState<StudentGrade[]>(initialStudents);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFilterChange = (filters: {
    term: string;
    class: string;
    subject: string;
  }) => {
    console.log('Filters changed:', filters);
    // Implement filter logic here
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...', students);
    // Implement save draft logic
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

      console.log('Submitting final grades...', students);
      // Implement submission logic
      
      // Simulate API call
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
      />
      
      <FormActions
        onSaveDraft={handleSaveDraft}
        onSubmitFinal={handleSubmitFinal}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
