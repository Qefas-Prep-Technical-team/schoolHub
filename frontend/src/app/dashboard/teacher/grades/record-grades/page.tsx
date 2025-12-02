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
    studentId: 'S001',
    caScore: 18,
    assignmentScore: 23,
    examScore: 48,
    total: 89,
    grade: 'A-',
    isSelected: false,
  },
  {
    id: '2',
    name: 'Benjamin Carter',
    studentId: 'S002',
    caScore: 15,
    assignmentScore: 20,
    examScore: 40,
    total: 75,
    grade: 'B',
    isSelected: false,
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    studentId: 'S003',
    caScore: 20,
    assignmentScore: 25,
    examScore: 50,
    total: 95,
    grade: 'A',
    isSelected: false,
  },
  {
    id: '4',
    name: 'Liam Goldberg',
    studentId: 'S004',
    caScore: 120,
    assignmentScore: 18,
    examScore: 35,
    total: 173,
    grade: 'Invalid',
    isSelected: false,
    hasError: true,
  },
  {
    id: '5',
    name: 'Ava Nguyen',
    studentId: 'S005',
    caScore: 19,
    assignmentScore: 22,
    examScore: 45,
    total: 86,
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
          student.caScore < 0 ||
          student.caScore > 100 ||
          student.assignmentScore < 0 ||
          student.assignmentScore > 100 ||
          student.examScore < 0 ||
          student.examScore > 100
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