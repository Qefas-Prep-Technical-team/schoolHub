'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, PlusCircle } from 'lucide-react';
import ExamCard from './components/ExamCard';
import FilterButton from './components/FilterButton';
import { Exam } from './components/types';

interface ClassExamsTabProps {
  exams?: any[];
}

export default function ClassExamsTab({ exams = [] }: ClassExamsTabProps) {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  // Map real exam data to Exam type
  const mappedExams: Exam[] = exams.map(e => ({
    id: e.id,
    title: e.title,
    type: e.type || e.scope.toLowerCase(), // fallbacks
    status: e.status.toLowerCase() as Exam['status'],
    subjectId: e.subjectId,
    subjectName: e.subject?.name || 'General',
    classId: e.classId,
    className: '',
    totalMarks: e.totalMarks || 0,
    duration: e.durationMinutes || 0,
    date: new Date(e.createdAt).toLocaleDateString(),
    questions: 0, 
    totalStudents: 0,
    completedStudents: 0,
    averageScore: undefined,
    createdBy: '',
    createdAt: e.createdAt,
    updatedAt: e.updatedAt
  }));

  const [filters, setFilters] = useState({
    examType: 'all',
    status: 'all',
    subject: 'all'
  });

  const [filteredExams, setFilteredExams] = useState<Exam[]>(mappedExams);

  useEffect(() => {
    let filtered = [...mappedExams];

    if (filters.examType !== 'all') {
      filtered = filtered.filter(exam => exam.type === filters.examType);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(exam => exam.status === filters.status);
    }

    setFilteredExams(filtered);
  }, [filters, exams, mappedExams]);

  const handleCreateExam = () => {
    router.push(`/dashboard/admin/classes/${classId}/exams/create`);
  };

  const handleImportQuestions = () => {
    // console.log('Import questions');
  };

  const handleEditExam = (exam: Exam) => {
    router.push(`/dashboard/admin/exams/${exam.id}/edit`);
  };

  const handleViewResults = (exam: Exam) => {
    router.push(`/dashboard/admin/exams/${exam.id}/results`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Heading and Actions */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-gray-900 dark:text-white text-xl font-bold">
          Exams & Quizzes
        </h2>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleImportQuestions}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload size={18} />
            <span className="truncate">Import</span>
          </button>
          
          <button
            onClick={handleCreateExam}
            className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-opacity"
          >
            <PlusCircle size={18} />
            <span className="truncate">Create New</span>
          </button>
        </div>
      </header>
      
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <FilterButton
          label="Exam type"
          value={filters.examType}
          options={[{label: 'All', value: 'all'}, {label: 'Exam', value: 'exam'}, {label: 'Quiz', value: 'quiz'}]}
          onChange={(value) => setFilters({ ...filters, examType: value })}
        />
        
        <FilterButton
          label="Status"
          value={filters.status}
          options={[{label: 'All', value: 'all'}, {label: 'Active', value: 'active'}, {label: 'Draft', value: 'draft'}]}
          onChange={(value) => setFilters({ ...filters, status: value })}
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
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <PlusCircle className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No exams found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
            This class doesn&apos;t have any exams or quizzes scheduled yet.
          </p>
          <button
            onClick={handleCreateExam}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-bold"
          >
            Create First Exam
          </button>
        </div>
      )}
    </div>
  );
}
