'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FiltersToolbar from './components/FiltersToolbar';
import StudentCard from './components/StudentCard';
import BulkActions from './components/BulkActions';
import { Student, FilterOptions } from './components/types';
import Pagination from '@/components/ui/Pagination';
import StudentDetailsModal from './components/StudentDetailsModal';
import PromoteStudentsModal from '../PromoteStudentsModal';
import SendAnnouncementModal from '../SendAnnouncementModal';
import { ClassRosterExportModal } from './components/ClassRosterExportModal';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { toast } from 'react-toastify';

interface ClassStudentsPageProps {
  enrollments?: any[];
  classData?: any;
}

export default function ClassStudentsPage({ enrollments = [], classData }: ClassStudentsPageProps) {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    gender: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [promoteModalMode, setPromoteModalMode] = useState<'promote' | 'graduate'>('promote');
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>(undefined);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Map real enrollment data to Student type
  const students: Student[] = useMemo(() => {
    return enrollments.map(e => ({
      id: e.student.id,
      studentId: e.student.studentCode,
      firstName: e.student.name.split(' ')[0],
      lastName: e.student.name.split(' ').slice(1).join(' '),
      fullName: e.student.name,
      email: e.student.email,
      gender: (e.student.gender?.toLowerCase() as 'male' | 'female' | 'other') || 'other',
      dateOfBirth: e.student.dateOfBirth || '',
      profileImage: e.student.profileImage || '',
      performance: 'good',
      attendance: 100,
      lastScore: 0,
      averageScore: 0,
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      address: '',
      joinedDate: new Date(e.enrolledAt).toLocaleDateString(),
    }));
  }, [enrollments]);

  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.gender]);

  useEffect(() => {
    let filtered = [...students];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower)
      );
    }

    if (filters.gender !== 'all') {
      filtered = filtered.filter(student => student.gender === filters.gender);
    }

    filtered.sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      switch (filters.sortBy) {
        case 'name':
          return order * a.fullName.localeCompare(b.fullName);
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [filters, students]);

  // Calculate Paginated Students
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const { data: schoolProfile } = useSchoolProfile(classData?.schoolId || '');

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleSendAnnouncement = () => {
    setIsAnnouncementOpen(true);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  const handleOpenPromote = (studentId?: string) => {
    setPromoteModalMode('promote');
    setPreselectedStudentId(studentId);
    setIsPromoteOpen(true);
  };

  const handleOpenGraduate = (studentId?: string) => {
    setPromoteModalMode('graduate');
    setPreselectedStudentId(studentId);
    setIsPromoteOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <FiltersToolbar
          filters={filters}
          onFiltersChange={setFilters}
        />
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleOpenPromote()}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-primary dark:bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-primary/90 dark:hover:bg-indigo-500 transition-colors shadow-sm dark:shadow-indigo-900/20 cursor-pointer"
          >
            Promote Students
          </button>
          <button
            type="button"
            onClick={() => handleOpenGraduate()}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 dark:bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-colors shadow-sm dark:shadow-emerald-900/20 cursor-pointer"
          >
            Mark as Graduated
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onClick={handleStudentClick}
            onPromote={(s) => handleOpenPromote(s.id)}
            onGraduate={(s) => handleOpenGraduate(s.id)}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
            No students found
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            There are no students enrolled in this class yet.
          </p>
        </div>
      )}

      {filteredStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          totalItems={filteredStudents.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          theme="blue"
        />
      )}

      <BulkActions
        onExport={handleExport}
        onSendAnnouncement={handleSendAnnouncement}
      />

      <ClassRosterExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        classData={classData}
        students={students}
        schoolProfile={schoolProfile}
      />

      <StudentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        student={selectedStudent}
        onPromote={(s) => handleOpenPromote(s.id)}
        onGraduate={(s) => handleOpenGraduate(s.id)}
      />

      <PromoteStudentsModal
        isOpen={isPromoteOpen}
        onClose={() => {
          setIsPromoteOpen(false);
          setPreselectedStudentId(undefined);
        }}
        classData={classData}
        initialStudentId={preselectedStudentId}
        initialMode={promoteModalMode}
      />

      <SendAnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        classId={classId}
      />
    </div>
  );
}