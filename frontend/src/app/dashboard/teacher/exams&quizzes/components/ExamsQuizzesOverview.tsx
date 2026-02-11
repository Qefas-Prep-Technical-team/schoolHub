'use client';

import { useState } from 'react';
import PageHeader from './PageHeader';
import FilterChips from './FilterChips';
import ExamsTable from './ExamsTable';
import { Exam } from './types';


export default function ExamsQuizzesOverview() {
  const [activeTab, setActiveTab] = useState<'exams' | 'quizzes'>('exams');
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    status: '',
    date: '',
  });

  const exams: Exam[] = [
    {
      id: '1',
      title: 'Mid-Term Algebra Test',
      class: 'Grade 10A',
      subject: 'Mathematics',
      marks: 100,
      questions: 25,
      status: 'published',
      dateCreated: 'Oct 26, 2023',
      type: 'exam',
    },
    {
      id: '2',
      title: 'Final Chemistry Exam',
      class: 'Grade 10A',
      subject: 'Chemistry',
      marks: 150,
      questions: 50,
      status: 'completed',
      dateCreated: 'Oct 22, 2023',
      type: 'exam',
    },
    {
      id: '3',
      title: 'Unit 1 Biology Test',
      class: 'Grade 11B',
      subject: 'Biology',
      marks: 75,
      questions: 30,
      status: 'draft',
      dateCreated: 'Oct 20, 2023',
      type: 'exam',
    },
    {
      id: '4',
      title: 'Week 5 English Quiz',
      class: 'Grade 9C',
      subject: 'English',
      marks: 50,
      questions: 20,
      status: 'published',
      dateCreated: 'Oct 18, 2023',
      type: 'quiz',
    },
    {
      id: '5',
      title: 'Physics Motion Quiz',
      class: 'Grade 11A',
      subject: 'Physics',
      marks: 60,
      questions: 25,
      status: 'draft',
      dateCreated: 'Oct 15, 2023',
      type: 'quiz',
    },
  ];
  const normalizedTab = activeTab === "exams" ? "exam" : "quiz";

  const handleCreateNew = () => {
    console.log('Create new exam/quiz');
    // Implement creation logic
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      class: '',
      subject: '',
      status: '',
      date: '',
    });
  };

  const filteredExams = exams.filter(exam => {
    if (filters.class && exam.class !== filters.class) return false;
    if (filters.subject && exam.subject !== filters.subject) return false;
    if (filters.status && exam.status !== filters.status) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Exams & Quizzes" 
          onCreateNew={handleCreateNew}
        />
        
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm p-4 md:p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-4 md:gap-8">
              <button
                onClick={() => setActiveTab('exams')}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-3 transition-colors ${
                  activeTab === 'exams'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                <span className="text-sm font-bold leading-normal">Exams</span>
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-3 transition-colors ${
                  activeTab === 'quizzes'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                <span className="text-sm font-bold leading-normal">Quizzes</span>
              </button>
            </div>
          </div>

          <FilterChips
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

       <ExamsTable 
  exams={filteredExams.filter(exam => exam.type === normalizedTab)} 
  activeTab={activeTab}
/>
        </div>
      </div>
    </main>
  );
}