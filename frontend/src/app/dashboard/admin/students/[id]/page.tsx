"use client";

import React, { use } from 'react'
import StudentHeroCard from './components/StudentHeroCard'
import StudentTabs from './components/StudentTabs'
import { useQuery } from '@tanstack/react-query'
import { studentService } from '@/lib/api/services/studentService'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['admin-student-profile', id],
    queryFn: () => studentService.getStudentById(id),
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="flex flex-col lg:flex-row gap-6">
           <Skeleton className="h-[400px] w-full lg:w-[350px] rounded-[2.5rem]" />
           <Skeleton className="h-[600px] flex-1 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Student Not Found</h2>
        <p className="text-slate-500 mt-2">The student profile you are looking for does not exist or has been removed.</p>
        <Link 
          href="/dashboard/admin/students"
          className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background-light dark:bg-background-dark animate-in fade-in duration-700">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Link className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary" href="/dashboard/admin">
          Dashboard
        </Link>
        <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
        <Link className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary" href="/dashboard/admin/students">
          Students
        </Link>
        <span className="text-sm text-gray-500 dark:text-gray-400">/</span>
        <span className="text-sm font-medium text-text-light dark:text-text-dark font-bold">
          {student.name}
        </span>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
        <StudentHeroCard student={student} />
        <div className="flex-1 min-w-0 w-full"> 
          <StudentTabs student={student} />
        </div>
      </div>
    </main>
  )
}