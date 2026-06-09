'use client';

import React, { useState, useMemo } from 'react';
import SubjectCard from '@/app/dashboard/admin/classes/[id]/components/subjects/components/SubjectCard';
import StudentSubjectDetailsModal from './components/StudentSubjectDetailsModal';
import { Subject } from '@/app/dashboard/admin/classes/[id]/components/subjects/components/types';
import Pagination from '@/components/ui/Pagination';
import { BookOpen } from 'lucide-react';

interface StudentSubjectsPageProps {
  classSubjects?: any[];
  className?: string;
}

export default function SubjectsPage({ 
  classSubjects = [], 
  className = ''
}: StudentSubjectsPageProps) {
  // Map real classSubject data to Subject type
  const subjects: Subject[] = useMemo(() => {
    return classSubjects.map(cs => ({
      id: cs.subject.id,
      name: cs.subject.name,
      code: cs.subject.code,
      description: cs.subject.description || '',
      teacherName: cs.subject.teacher?.name || 'Not assigned',
      teacherId: cs.subject.teacherId || '',
      icon: '',
      assignments: 0,
      exams: cs.subject._count?.subjectExamPapers || 0,
      averageScore: 0,
      classPerformance: 0,
      enrolledStudents: 0,
      credits: 0,
      semester: 'fall',
      academicYear: ''
    }));
  }, [classSubjects]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Calculate Paginated Subjects
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return subjects.slice(startIndex, startIndex + itemsPerPage);
  }, [subjects, currentPage]);

  const totalPages = Math.ceil(subjects.length / itemsPerPage);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Page Header */}
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-gray-900 dark:text-white text-xl font-bold">
            Class Subjects
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View all subjects assigned to {className}
          </p>
        </div>
      </header>
      
      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedSubjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onClick={handleSubjectClick}
          />
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="text-blue-500" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No subjects assigned yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium max-w-sm mx-auto">
            There are currently no subjects assigned to this class. Check back later or contact your administrator.
          </p>
        </div>
      )}

      {subjects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          totalItems={subjects.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <StudentSubjectDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
}
