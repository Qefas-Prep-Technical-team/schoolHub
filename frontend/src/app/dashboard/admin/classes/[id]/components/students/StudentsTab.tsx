'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FiltersToolbar from './components/FiltersToolbar';
import StudentCard from './components/StudentCard';
import BulkActions from './components/BulkActions';
import { Student, FilterOptions } from './components/types';
import Pagination from '@/components/ui/Pagination';
import StudentDetailsModal from './components/StudentDetailsModal';

interface ClassStudentsPageProps {
  enrollments?: any[];
}

export default function ClassStudentsPage({ enrollments = [] }: ClassStudentsPageProps) {
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

  const handleExport = () => {
    // console.log('Exporting class list for:', classId);
  };

  const handleSendAnnouncement = () => {
    // console.log('Sending announcement to class:', classId);
  };

  const handlePrintAttendance = () => {
    // console.log('Printing attendance sheet for:', classId);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <FiltersToolbar
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onClick={handleStudentClick}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
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
        />
      )}
      
      <BulkActions
        onExport={handleExport}
        onSendAnnouncement={handleSendAnnouncement}
        onPrintAttendance={handlePrintAttendance}
      />

      <StudentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
}