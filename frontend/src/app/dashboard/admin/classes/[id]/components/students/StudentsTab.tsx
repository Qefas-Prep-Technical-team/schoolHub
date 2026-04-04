'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FiltersToolbar from './components/FiltersToolbar';
import StudentCard from './components/StudentCard';
import BulkActions from './components/BulkActions';
import { Student, FilterOptions } from './components/types';

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

  // Map real enrollment data to Student type
  const students: Student[] = enrollments.map(e => ({
    id: e.student.id,
    studentId: e.student.studentCode,
    firstName: e.student.name.split(' ')[0],
    lastName: e.student.name.split(' ').slice(1).join(' '),
    fullName: e.student.name,
    email: e.student.email,
    gender: 'other', // Not in current schema
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

  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);

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
  }, [filters, enrollments]);

  const handleExport = () => {
    console.log('Exporting class list for:', classId);
  };

  const handleSendAnnouncement = () => {
    console.log('Sending announcement to class:', classId);
  };

  const handlePrintAttendance = () => {
    console.log('Printing attendance sheet for:', classId);
  };

  const handleStudentClick = (student: Student) => {
    router.push(`/dashboard/admin/students/${student.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <FiltersToolbar
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student) => (
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
      
      <BulkActions
        onExport={handleExport}
        onSendAnnouncement={handleSendAnnouncement}
        onPrintAttendance={handlePrintAttendance}
      />
    </div>
  );
}