'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Toolbar } from './components/Toolbar';
import { StudentTable } from './components/StudentTable';
import { Pagination } from './components/Pagination';
import { Student } from './components/types';
import { teacherService } from '@/lib/api/services/teacherService';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-students', classId, searchQuery, currentPage],
    queryFn: () => teacherService.getStudents({
      classId,
      search: searchQuery,
      page: currentPage,
      limit: itemsPerPage
    }),
    enabled: !!classId,
  });

  const students: Student[] = data?.students?.map((s: any) => {
    console.log(`LOG: [StudentsPage] 🔄 Mapping Student: ${s.name} (UUID: ${s.id})`);
    return {
      id: s.id,
      name: s.name,
      studentId: `#${s.id.slice(-5).toUpperCase()}`,
      gender: s.gender || 'N/A',
      status: (s.status || 'Active').toLowerCase(),
      avatar: s.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`,
      performance: s.performance || 'Medium',
      attendance: s.attendance || 100
    };
  }) || [];

  console.log(`LOG: [StudentsPage] 📥 Total Synchronized Students: ${students.length}`);

  const totalItems = data?.total || 0;

  const handleViewStudent = (student: Student) => {
    console.log('Premium View student:', student);
  };

  const handleCallStudent = (student: Student) => {
    console.log('Call student initiated:', student);
  };

  const handleAddStudent = () => {
    console.log('Registering new student into module...');
  };

  const handleFilterClick = (filter: string) => {
    console.log('Applying context filter:', filter);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-4 md:p-0">
        <div className="flex justify-between gap-4">
           <Skeleton className="h-14 w-full max-w-md rounded-2xl" />
           <div className="flex gap-2">
             <Skeleton className="h-14 w-14 rounded-2xl" />
             <Skeleton className="h-14 w-40 rounded-2xl" />
           </div>
        </div>
        <div className="space-y-4">
           {Array.from({ length: 4 }).map((_, i) => (
             <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />
           ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-10 bg-rose-500/5 rounded-[3rem] border border-dashed border-rose-500/20 text-center">
             <h3 className="text-xl font-black text-rose-500 tracking-tight mb-2">Registry Access Refused</h3>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm">
                There was a synchronization error while attempting to retrieve the enrollment list. Please verify your clearance levels.
             </p>
        </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-8"
    >
      <div className="flex items-center justify-between">
           <Toolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddStudent={handleAddStudent}
            filters={['Performance', 'Attendance', 'Status']}
            onFilterClick={handleFilterClick}
          />
      </div>

      {students.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 w-fit mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {students.length} Students Synchronized
          </div>
      )}

      <StudentTable
        students={students}
        onView={handleViewStudent}
        onCall={handleCallStudent}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );
}