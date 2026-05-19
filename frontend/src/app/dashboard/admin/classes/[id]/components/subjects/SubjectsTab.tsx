'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import SubjectCard from './components/SubjectCard';
import AddSubjectModal from './components/AddSubjectModal';
import { Subject } from './components/types';
import Pagination from '@/components/ui/Pagination';
import SubjectDetailsModal from './components/SubjectDetailsModal';

interface ClassSubjectsPageProps {
  classSubjects?: any[];
  className?: string;
  classId?: string;
}

export default function ClassSubjectsPage({ 
  classSubjects = [], 
  className = '',
  classId: propClassId
}: ClassSubjectsPageProps) {
  const router = useRouter();
  const params = useParams();
  const classId = propClassId || (params.id as string);

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

  const [currentSubjects, setCurrentSubjects] = useState<Subject[]>(subjects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    setCurrentSubjects(subjects);
    setCurrentPage(1);
  }, [subjects]);

  // Calculate Paginated Subjects
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return currentSubjects.slice(startIndex, startIndex + itemsPerPage);
  }, [currentSubjects, currentPage]);

  const totalPages = Math.ceil(currentSubjects.length / itemsPerPage);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailsOpen(true);
  };

  const handleAddSubject = (subjectData: Partial<Subject>) => {
    // In real app, this would refresh the parent class data or call an API
    console.log('Adding subject to class:', subjectData);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <header className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-gray-900 dark:text-white text-xl font-bold">
          Class Subjects
        </h2>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span className="truncate">Add Subject</span>
        </button>
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

      {currentSubjects.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No subjects yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">
            This class has no subjects assigned to it yet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-bold"
          >
            Add Subject
          </button>
        </div>
      )}

      {currentSubjects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          totalItems={currentSubjects.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <AddSubjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSubject}
        classId={classId}
      />

      <SubjectDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
}