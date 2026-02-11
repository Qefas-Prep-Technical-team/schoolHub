'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, PlusCircle } from 'lucide-react';
import BreadcrumbsV3 from './components/BreadcrumbsV3';
import ExamCard from './components/ExamCard';
import FilterButton from './components/FilterButton';
import { Exam, ExamType, ExamStatus } from './components/types';

// Mock data
const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Chapter 5: Cell Division Quiz',
    type: 'quiz',
    status: 'completed',
    subjectId: 'bio-101',
    subjectName: 'Biology',
    classId: 'bio-101-class',
    className: 'Biology 101',
    totalMarks: 50,
    duration: 45,
    date: '2023-11-15',
    questions: 20,
    totalStudents: 30,
    completedStudents: 30,
    averageScore: 85,
    createdBy: 'Dr. Eleanor Vance',
    createdAt: '2023-10-01',
    updatedAt: '2023-11-20'
  },
  {
    id: '2',
    title: 'Midterm Exam',
    type: 'midterm',
    status: 'completed',
    subjectId: 'bio-101',
    subjectName: 'Biology',
    classId: 'bio-101-class',
    className: 'Biology 101',
    totalMarks: 100,
    duration: 90,
    date: '2023-10-20',
    questions: 50,
    totalStudents: 30,
    completedStudents: 28,
    averageScore: 78,
    createdBy: 'Dr. Eleanor Vance',
    createdAt: '2023-09-01',
    updatedAt: '2023-10-25'
  },
  {
    id: '3',
    title: 'Genetics & Heredity Test',
    type: 'test',
    status: 'active',
    subjectId: 'bio-101',
    subjectName: 'Biology',
    classId: 'bio-101-class',
    className: 'Biology 101',
    totalMarks: 75,
    duration: 60,
    date: '2023-12-01',
    questions: 35,
    totalStudents: 30,
    completedStudents: 5,
    averageScore: undefined,
    createdBy: 'Dr. Eleanor Vance',
    createdAt: '2023-11-10',
    updatedAt: '2023-11-30'
  },
  {
    id: '4',
    title: 'Final Exam Practice',
    type: 'practice',
    status: 'scheduled',
    subjectId: 'bio-101',
    subjectName: 'Biology',
    classId: 'bio-101-class',
    className: 'Biology 101',
    totalMarks: 150,
    duration: 120,
    date: '2023-12-15',
    questions: 60,
    totalStudents: 30,
    completedStudents: 0,
    averageScore: undefined,
    createdBy: 'Dr. Eleanor Vance',
    createdAt: '2023-11-25',
    updatedAt: '2023-11-25'
  },
  {
    id: '5',
    title: 'Photosynthesis Quiz',
    type: 'quiz',
    status: 'draft',
    subjectId: 'bio-101',
    subjectName: 'Biology',
    classId: 'bio-101-class',
    className: 'Biology 101',
    totalMarks: 40,
    duration: 30,
    date: '2023-12-05',
    questions: 15,
    totalStudents: 30,
    completedStudents: 0,
    averageScore: undefined,
    createdBy: 'Dr. Eleanor Vance',
    createdAt: '2023-11-28',
    updatedAt: '2023-11-28'
  },
  {
    id: '6',
    title: 'Quarterly Assessment',
    type: 'test',
    status: 'graded',
    subjectId: 'bio-101',
    subjectName: 'Biology',
    classId: 'bio-101-class',
    className: 'Biology 101',
    totalMarks: 80,
    duration: 75,
    date: '2023-09-30',
    questions: 40,
    totalStudents: 30,
    completedStudents: 30,
    averageScore: 72,
    createdBy: 'Dr. Eleanor Vance',
    createdAt: '2023-08-15',
    updatedAt: '2023-10-05'
  }
];

const examTypeOptions = [
  { label: 'All', value: 'all' },
  { label: 'Quiz', value: 'quiz' },
  { label: 'Test', value: 'test' },
  { label: 'Midterm', value: 'midterm' },
  { label: 'Final', value: 'final' },
  { label: 'Practice', value: 'practice' }
];

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Graded', value: 'graded' }
];

const subjectOptions = [
  { label: 'All', value: 'all' },
  { label: 'Biology', value: 'biology' },
  { label: 'Chemistry', value: 'chemistry' },
  { label: 'Physics', value: 'physics' }
];

export default function ClassExamsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [filters, setFilters] = useState({
    examType: 'all',
    status: 'all',
    subject: 'all'
  });

  const [filteredExams, setFilteredExams] = useState<Exam[]>(mockExams);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Classes', href: '/classes' },
    { label: 'Biology 101', href: `/class/${classId}` },
    { label: 'Exams & Quizzes' }
  ];

  React.useEffect(() => {
    let filtered = [...mockExams];

    if (filters.examType !== 'all') {
      filtered = filtered.filter(exam => exam.type === filters.examType);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(exam => exam.status === filters.status);
    }

    if (filters.subject !== 'all') {
      filtered = filtered.filter(exam => 
        exam.subjectName.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    setFilteredExams(filtered);
  }, [filters]);

  const handleCreateExam = () => {
    router.push(`/class/${classId}/exams/create`);
  };

  const handleImportQuestions = () => {
    console.log('Import questions');
    // Implement import logic
  };

  const handleEditExam = (exam: Exam) => {
    router.push(`/exam/${exam.id}/edit`);
  };

  const handleViewResults = (exam: Exam) => {
    router.push(`/exam/${exam.id}/results`);
  };

  return (
    <div className="relative flex min-h-screen w-full">
      <main className="flex-1 p-8">
        <div className="w-full max-w-7xl mx-auto">
          <BreadcrumbsV3 items={breadcrumbItems} />
          
          {/* Page Heading and Actions */}
          <header className="sticky top-0 z-10 py-4 bg-background-light dark:bg-background-dark">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-[#0e101b] dark:text-white text-3xl font-bold leading-tight">
                Biology 101 - Exams & Quizzes
              </h1>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleImportQuestions}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-gray-200/80 dark:bg-gray-800 text-[#0e101b] dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload size={18} />
                  <span className="truncate">Import Questions</span>
                </button>
                
                <button
                  onClick={handleCreateExam}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-opacity"
                >
                  <PlusCircle size={18} />
                  <span className="truncate">Create Exam/Quiz</span>
                </button>
              </div>
            </div>
          </header>
          
          {/* Filters */}
          <div className="flex gap-3 flex-wrap pt-4 pb-6">
            <FilterButton
              label="Exam type"
              value={filters.examType}
              options={examTypeOptions}
              onChange={(value) => setFilters({ ...filters, examType: value })}
            />
            
            <FilterButton
              label="Status"
              value={filters.status}
              options={statusOptions}
              onChange={(value) => setFilters({ ...filters, status: value })}
            />
            
            <FilterButton
              label="Subject"
              value={filters.subject}
              options={subjectOptions}
              onChange={(value) => setFilters({ ...filters, subject: value })}
            />
          </div>
          
          {/* Exams List */}
          <div className="space-y-4">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                onEdit={handleEditExam}
                onViewResults={handleViewResults}
              />
            ))}
          </div>

          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <PlusCircle className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#0e101b] dark:text-white mb-2">
                No exams found
              </h3>
              <p className="text-[#4f5c96] dark:text-gray-400 mb-6">
                {filters.examType !== 'all' || filters.status !== 'all' || filters.subject !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first exam or quiz'
                }
              </p>
              <button
                onClick={handleCreateExam}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Create Exam
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}