'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumbs from './components/Breadcrumbs';
import ClassHeader from './components/ClassHeader';
import FiltersToolbar from './components/FiltersToolbar';
import StudentCard from './components/StudentCard';
import BulkActions from './components/BulkActions';
import { Student, ClassInfo, FilterOptions } from './components/types';

// Mock data - in real app, fetch from API
const mockClassInfo: ClassInfo = {
  id: 'MTH-10A',
  name: 'Grade 10',
  code: 'MTH-10A',
  subject: 'Mathematics',
  teacher: 'Mr. Harrison',
  department: 'Mathematics Dept.',
  totalStudents: 42,
  semester: 'Spring 2024',
  academicYear: '2023-2024'
};

const mockStudents: Student[] = [
  {
    id: '1',
    studentId: '881023',
    firstName: 'Olivia',
    lastName: 'Chen',
    fullName: 'Olivia Chen',
    email: 'olivia.chen@school.edu',
    gender: 'female',
    dateOfBirth: '2008-03-15',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEmy0nUqUupEv86VSB6GOo0oBInEfbVReMHtuZKmqpNsbUZRt5Gfi2WpvtZw_rReWTFp2twJ3JDR51J-T6V9KKxd78ltsuY7GzfWWF-Xow76xalMEC_QsVMDkxVnqj1HHT51F0tzxv92SJ8loDm7ns-QFKSNezUxhayr9yzamzAH2cOD6bbmOauqUyGMh_5vZO2ZOYdcg16OrXKb2QF0SEQrdeYK9KTeMNspaxp0d_GW3XSxpM5bHMgvneUjNxkhW-98Zqflh9XyM',
    performance: 'excellent',
    attendance: 98,
    lastScore: 95,
    averageScore: 94,
    parentName: 'Michael Chen',
    parentEmail: 'michael.chen@email.com',
    parentPhone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY',
    joinedDate: '2022-09-01',
    notes: 'Excellent student, always participates in class.'
  },
  {
    id: '2',
    studentId: '881024',
    firstName: 'Liam',
    lastName: 'Rodriguez',
    fullName: 'Liam Rodriguez',
    email: 'liam.rodriguez@school.edu',
    gender: 'male',
    dateOfBirth: '2008-05-22',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkHfZEGyLq_YEstGgN_GHW_R0WE2TRzcaLJ81yGulUX5X6m4UHILIJRayzLxnpRYFb1Mhw2Hy2DEMKZmY7ONOngQ3PNtECzLTcu4_e3X4bvC5j7f0M4wLWS9r9MSNi9lCCr1xSvpSBpUnoVjB2qvnbmEuZP0bhBJQyQ-OlA7bKejuwSg0RSFt9OdaEEC3AoM6pkTGwDuESSjJpc1m9mTDcVEyF33MkQn_LJlXOFudPf-M5543G2pz8zbrKwKQKuEt8n58GHy4mRSs',
    performance: 'good',
    attendance: 95,
    lastScore: 88,
    averageScore: 86,
    parentName: 'Maria Rodriguez',
    parentEmail: 'maria.rodriguez@email.com',
    parentPhone: '+1 (555) 234-5678',
    address: '456 Oak Ave, Los Angeles, CA',
    joinedDate: '2022-09-01',
    notes: 'Hard working student, shows great improvement.'
  },
  {
    id: '3',
    studentId: '881025',
    firstName: 'Sophia',
    lastName: 'Patel',
    fullName: 'Sophia Patel',
    email: 'sophia.patel@school.edu',
    gender: 'female',
    dateOfBirth: '2008-07-30',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBojoy5P4MRTei-4L0gZKYyCl9HDrKFYSvyx0HcbQMRY_mD6LTKJebmJOMd3c34tBV7xefOGC2S7r6NG3m27qNZviJV5dGZbEPdzuzwuP5kHAqEgwfsymE4ScBc5q4l6-p4q7w7Rk9XDck2zOn4EqJI_BK9E06KkHhFk0z9-40AvJyVuiHQ-gxYASBOYwXFtzRz8KfmJfk-WAGCARVWWHE7xuWZeRE8_eq52qjKLojjJaLIvrbf1M28tGBwApEJuWjcxeJl4AIETHQ',
    performance: 'average',
    attendance: 91,
    lastScore: 76,
    averageScore: 78,
    parentName: 'Raj Patel',
    parentEmail: 'raj.patel@email.com',
    parentPhone: '+1 (555) 345-6789',
    address: '789 Pine St, Chicago, IL',
    joinedDate: '2022-09-01',
    notes: 'Needs help with advanced concepts.'
  },
  {
    id: '4',
    studentId: '881026',
    firstName: 'Noah',
    lastName: 'Kim',
    fullName: 'Noah Kim',
    email: 'noah.kim@school.edu',
    gender: 'male',
    dateOfBirth: '2008-01-18',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0maqrrtYQRgaf45NWnBZk3FlFh1pThFImVZyQ9fKb2T93HUN9bEajKv2J4ETvXSioOxj2bR-cDJHwcDyMVcwS3Nu0ModEXLybFsIKUS9rNUPC8C3DYPshbi3cvC2lP1TwAYvt93Lqn5IkIvU9AUVxyupK-W6GLNV33OtyKG2-nOoAM82INLzFtUvWKcWmZK6Zfv4khS2Yrtsz3AZGLlpNY8TMzjMsbdklq9l2nKahOgbYyRHuUcGePiA639zvQoRFeV18GDmLxHE',
    performance: 'weak',
    attendance: 82,
    lastScore: 58,
    averageScore: 62,
    parentName: 'Jin Kim',
    parentEmail: 'jin.kim@email.com',
    parentPhone: '+1 (555) 456-7890',
    address: '321 Elm St, Houston, TX',
    joinedDate: '2022-09-01',
    notes: 'Struggling with basic concepts. Needs extra tutoring.'
  },
  {
    id: '5',
    studentId: '881027',
    firstName: 'Ava',
    lastName: 'Williams',
    fullName: 'Ava Williams',
    email: 'ava.williams@school.edu',
    gender: 'female',
    dateOfBirth: '2008-04-12',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLRu07vGUpb3HWqTJr-Em8TB8VL36W5oM_HR-5oMDV82kkjHuB6SgvaCjHKalCR44AcrtquF2Wu6QpKpzMsS77VTU3S_94y3WR8ljmky8YBZomncF31IpC2Ea9kR5lsXeo30L9qCwwQ-1L02NMJm207EgbKPk965UvmsPdLnOUedrzk0I7R5il__pmbxTEMWGyPCL6QTrxUOgJncqDqv4bm5yPgKBGGH-GW3L50D4Xr4TT1-q_yhoI4s7iEm1zg4aLwDj378J8IJ8',
    performance: 'excellent',
    attendance: 99,
    lastScore: 92,
    averageScore: 93,
    parentName: 'James Williams',
    parentEmail: 'james.williams@email.com',
    parentPhone: '+1 (555) 567-8901',
    address: '654 Maple Ave, Phoenix, AZ',
    joinedDate: '2022-09-01'
  },
  {
    id: '6',
    studentId: '881028',
    firstName: 'Ethan',
    lastName: 'Jones',
    fullName: 'Ethan Jones',
    email: 'ethan.jones@school.edu',
    gender: 'male',
    dateOfBirth: '2008-06-25',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHBu9xwyTu9R8UaaePIzmGmI2LD9zuPW4_dSRMWP1-R9t4qZw4MwPzvPK8eszFNKBm2lA1kAlqvOww7t34ifp8dDOhHUXS-m3lNFq9h3yvhGCK1QQNWHqRSp5T16sAHJvIZ423vZdN8sWbxFb1VYfRaB6AFlLoO35DYiwmgOlywkrOlgREQuELTcs0yHXIjqKWi8aSbMI8ld0oFISDBw07OqdjMsV5pNa-WwmGLalR_3R-JWwJWB-j32krtSEZO7Rz-AsJXw0Ulc8',
    performance: 'good',
    attendance: 96,
    lastScore: 85,
    averageScore: 83,
    parentName: 'Sarah Jones',
    parentEmail: 'sarah.jones@email.com',
    parentPhone: '+1 (555) 678-9012',
    address: '987 Cedar St, Philadelphia, PA',
    joinedDate: '2022-09-01'
  },
  {
    id: '7',
    studentId: '881029',
    firstName: 'Isabella',
    lastName: 'Garcia',
    fullName: 'Isabella Garcia',
    email: 'isabella.garcia@school.edu',
    gender: 'female',
    dateOfBirth: '2008-08-08',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb8hUs9ng9rwkMEdRGwqV3oh-hGn0wpTUKl_NtSMTuzo8kqc1R5izyJJ-UkIWMUzQ7Z9KWUrOlNCZ0TapMJt3usWHCfgPBGq2WYjxUojpedih7MYjiEbGzdzItSzewX3ZVylN6gcd84POyIDBQh4DWPsSembPJ1T5gVm7tDXJP4t53bC9ORkf5wLDnRlNyMBFaXSl5CWbX8rNKbGVaA968ZGYw3-yb_DlezP9CfT_NqY-eWuobMnq-Y9UI4umbm8QunxN2VnjRNNE',
    performance: 'average',
    attendance: 89,
    lastScore: 79,
    averageScore: 77,
    parentName: 'Carlos Garcia',
    parentEmail: 'carlos.garcia@email.com',
    parentPhone: '+1 (555) 789-0123',
    address: '147 Birch St, San Antonio, TX',
    joinedDate: '2022-09-01'
  },
  {
    id: '8',
    studentId: '881030',
    firstName: 'Mason',
    lastName: 'Davis',
    fullName: 'Mason Davis',
    email: 'mason.davis@school.edu',
    gender: 'male',
    dateOfBirth: '2008-02-14',
    profileImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsYKf7YZHTqbNz9YHQlFozRT-KSyRW6aBjxxP8Kg3TY5Lx7cqWDaAW0GIg-gXCAgjRxwTSQw-rlGpqid4ot4HmZqcJr4v5YJ-D1ygk6yD3midf89NOyz-om1tJjuSy_8HIIR6mXnhQ9Ek1bw795x7A8XcHbkscgqMPJxSrD5l4ALEibrq55mQgZXRTUl0haoBNLbCPord8os2uMcV0ZQ4Dx5M00QamEnMZKifmgzyMH6qAETq_uPccq1anQ2i-T25zxIcVXnwAqYo',
    performance: 'good',
    attendance: 93,
    lastScore: 82,
    averageScore: 81,
    parentName: 'Emily Davis',
    parentEmail: 'emily.davis@email.com',
    parentPhone: '+1 (555) 890-1234',
    address: '258 Walnut St, San Diego, CA',
    joinedDate: '2022-09-01'
  }
];

export default function ClassStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    gender: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [filteredStudents, setFilteredStudents] = useState<Student[]>(mockStudents);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Classes', href: '/classes' },
    { label: `${mockClassInfo.name} – ${mockClassInfo.subject}` }
  ];

  useEffect(() => {
    // Filter and sort students
    let filtered = [...mockStudents];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        student.fullName.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower)
      );
    }

    // Gender filter
    if (filters.gender !== 'all') {
      filtered = filtered.filter(student => student.gender === filters.gender);
    }

    // Sort
    filtered.sort((a, b) => {
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      
      switch (filters.sortBy) {
        case 'name':
          return order * a.fullName.localeCompare(b.fullName);
        case 'performance':
          const performanceOrder = { excellent: 4, good: 3, average: 2, weak: 1 };
          return order * (performanceOrder[a.performance] - performanceOrder[b.performance]);
        case 'attendance':
          return order * (a.attendance - b.attendance);
        case 'score':
          return order * (a.averageScore - b.averageScore);
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [filters]);

  const handleTakeAttendance = () => {
    console.log('Taking attendance for class:', classId);
    // Implement attendance taking logic
  };

  const handleMessageAll = () => {
    console.log('Messaging all students in class:', classId);
    // Implement messaging logic
  };

  const handleStudentClick = (student: Student) => {
    router.push(`/student/${student.id}`);
  };

  const handleExport = () => {
    console.log('Exporting class list for:', classId);
    // Implement export logic
  };

  const handleSendAnnouncement = () => {
    console.log('Sending announcement to class:', classId);
    // Implement announcement logic
  };

  const handlePrintAttendance = () => {
    console.log('Printing attendance sheet for:', classId);
    // Implement print logic
  };

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} />
          
          <ClassHeader
            classInfo={mockClassInfo}
            onTakeAttendance={handleTakeAttendance}
            onMessageAll={handleMessageAll}
          />
          
          <FiltersToolbar
            filters={filters}
            onFiltersChange={setFilters}
          />
          
          {/* Student List */}
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
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">
                No students found
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
          
          <BulkActions
            onExport={handleExport}
            onSendAnnouncement={handleSendAnnouncement}
            onPrintAttendance={handlePrintAttendance}
          />
        </div>
      </main>
    </div>
  );
}