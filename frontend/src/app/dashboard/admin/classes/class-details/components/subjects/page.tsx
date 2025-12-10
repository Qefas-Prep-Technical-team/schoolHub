'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import BreadcrumbsV2 from './components/BreadcrumbsV2';
import SubjectCard from './components/SubjectCard';
import AddSubjectModal from './components/AddSubjectModal';
import { Subject, ClassInfo } from './components/types';

// Mock data
const mockClassInfo: ClassInfo = {
  id: '10A',
  name: 'Grade 10',
  section: 'Section A',
  grade: '10',
  semester: 'Fall 2024',
  academicYear: '2024-2025',
  totalStudents: 42,
  teacherId: 'teacher-1',
  teacherName: 'Dr. Evans'
};

const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Algebra II',
    code: 'MATH-201',
    description: 'Advanced algebraic concepts and functions',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Evans',
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGLaD_HI6FMhDmp_EBvUMo_WwCDs3vlX20ebxV44c7guYEMLxK7hlAJPTGeP8V5tty2yjvvSfHrf2N36dZjgQXtEdNbIvj1m0pBPYBjYUIEJx38PI0zwnl7g-nie9paeoESqjVrn_LPqM9CM3M78JTw99oAUENkAVjGUnThshmVAZNsj5Sbxij5c3wp7DSRcvV2-RCLfh1ypDLuuPl86n5G4EOYT0nJxkkYbBylUR74ju3QqyLHJqbl2O8CNzTPKKn964AVDq9VSc',
    assignments: 12,
    exams: 3,
    averageScore: 82,
    classPerformance: 82,
    enrolledStudents: 42,
    credits: 4,
    semester: 'fall',
    academicYear: '2024-2025'
  },
  {
    id: '2',
    name: 'Biology',
    code: 'BIO-201',
    description: 'Study of living organisms and life processes',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Evans',
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4kqrvCxBhfqZipTLVBmMt7Ke7ywjqfwgXXn8hmbmiV235ygrd-E8fF2Pwjll8x-2iEpnezEEezyRqfe6_I91OZYrAXutNFT5Ekrc3gcP3AtwMx7KIfngDlw9NE964gm1A0TE_lG-QrHAhrdm3Vp4X6uf-juG2hFXFCWWiq5YalFWFbD7dKXLSns4dhPypOEU3AUI2HYZXbmryb9kc-9mlk4q0dLhCT09fWweKo7G3UhvCQV5yeQDMcRqyHIgkOxDhHiqfO55upms',
    assignments: 15,
    exams: 4,
    averageScore: 75,
    classPerformance: 75,
    enrolledStudents: 42,
    credits: 4,
    semester: 'fall',
    academicYear: '2024-2025'
  },
  {
    id: '3',
    name: 'History',
    code: 'HIS-201',
    description: 'World history and civilizations',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Evans',
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiiWOeB037Hu6cZFs82kcPtekJ1Jf7ST9yukwm3m22Z9sD2Co3reoRxeIMFF6EN6ElxtAaWtQpkgkUpeaVNd_kSifZpyL0GyHp1xqLzlAhpemoYjly6CLaui15q-OAMTdrYCd6MwfOx1vWbL3ODtVClSDiI0Jen5zSILkYBLHp0A-EfJE6UOKiP3YXRXhe6IvvUNEdLEjtHS1aU9EI3GUUqkjcHda90fK9A4rRJ-dztJelcELYE6f72Y8Pzuo7ay-fOum2IcKDbA0',
    assignments: 10,
    exams: 2,
    averageScore: 88,
    classPerformance: 88,
    enrolledStudents: 42,
    credits: 3,
    semester: 'fall',
    academicYear: '2024-2025'
  },
  {
    id: '4',
    name: 'Literature',
    code: 'LIT-201',
    description: 'Study of literary works and analysis',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Evans',
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsmQ0hLWS6PhNCX4BdGplWim1kOIdf4HCMsJjOJ-XO4GwJU2klMFWwrvLP14q5KSmCP0bJACJzq0jTGu1PZPhYW9ytZbEaQ0u5clk6MHUVguPClTDlj5UQLDez5xA4Sz4Lgk4ylxkdTAK211Sasd6h0pLVCJFGa67GzZLbHrrR9loDu7TpG-RMxcBiFczjloXbwJ5zedSpNqGvbiE7bkakGn_YqsElEcyfVkxJfiRp9HINApSxr9CmeQNI3HuUeaRYmpK0QlswRPU',
    assignments: 14,
    exams: 3,
    averageScore: 91,
    classPerformance: 91,
    enrolledStudents: 42,
    credits: 3,
    semester: 'fall',
    academicYear: '2024-2025'
  },
  {
    id: '5',
    name: 'Chemistry',
    code: 'CHEM-201',
    description: 'Principles of chemistry and laboratory work',
    teacherId: 'teacher-2',
    teacherName: 'Dr. Smith',
    assignments: 18,
    exams: 5,
    averageScore: 78,
    classPerformance: 78,
    enrolledStudents: 42,
    credits: 4,
    semester: 'fall',
    academicYear: '2024-2025'
  },
  {
    id: '6',
    name: 'Physics',
    code: 'PHYS-201',
    description: 'Fundamental principles of physics',
    teacherId: 'teacher-3',
    teacherName: 'Mr. Johnson',
    assignments: 16,
    exams: 4,
    averageScore: 85,
    classPerformance: 85,
    enrolledStudents: 42,
    credits: 4,
    semester: 'fall',
    academicYear: '2024-2025'
  },
  {
    id: '7',
    name: 'Geography',
    code: 'GEO-201',
    description: 'Study of Earth\'s landscapes and environments',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Evans',
    assignments: 8,
    exams: 2,
    averageScore: 79,
    classPerformance: 79,
    enrolledStudents: 42,
    credits: 3,
    semester: 'fall',
    academicYear: '2024-2025'
  },
  {
    id: '8',
    name: 'Computer Science',
    code: 'CS-201',
    description: 'Introduction to programming and algorithms',
    teacherId: 'teacher-4',
    teacherName: 'Ms. Davis',
    assignments: 20,
    exams: 6,
    averageScore: 87,
    classPerformance: 87,
    enrolledStudents: 42,
    credits: 4,
    semester: 'fall',
    academicYear: '2024-2025'
  }
];

export default function ClassSubjectsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [showAddModal, setShowAddModal] = useState(false);

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Classes', href: '/classes' },
    { label: `${mockClassInfo.name} - ${mockClassInfo.section}` }
  ];

  const handleSubjectClick = (subject: Subject) => {
    router.push(`/subject/${subject.id}`);
  };

  const handleAddSubject = (subjectData: Partial<Subject>) => {
    const newSubject: Subject = {
      ...subjectData as Subject,
      id: `subject-${Date.now()}`,
      assignments: 0,
      exams: 0,
      averageScore: 0,
      classPerformance: 0,
      enrolledStudents: mockClassInfo.totalStudents,
      teacherId: 'teacher-1',
      teacherName: 'Dr. Evans',
      icon: ''
    };
    
    setSubjects([newSubject, ...subjects]);
  };

  return (
    <div className="flex h-screen w-full">
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <BreadcrumbsV2 items={breadcrumbItems} />
            
            {/* Page Header */}
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div className="flex flex-col">
                <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">
                  {mockClassInfo.name} - {mockClassInfo.section}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                  {mockClassInfo.semester}
                </p>
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
              >
                <Plus size={18} />
                <span className="truncate">Add Subject</span>
              </button>
            </header>
            
            {/* Subjects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onClick={handleSubjectClick}
                />
              ))}
            </div>

            {subjects.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Plus className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No subjects yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Add your first subject to get started
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Add Subject
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddSubjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSubject}
        classId={classId}
      />
    </div>
  );
}