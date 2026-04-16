'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Class } from './type';
import PageHeader from './PageHeader';
import FilterChips from './FilterChips';
import ClassGrid from './ClassGrid';
import EmptyState from './EmptyState';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Loader2 } from 'lucide-react';


export default function MyClassesPage() {
    const router = useRouter();
    const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
    const { user } = useAuthStore();
    const [filters, setFilters] = useState({
        academicYear: '',
        term: '',
        level: '',
        class: '',
        subject: '',
    });

    const { data: classes = [], isLoading } = useQuery({
        queryKey: ['teacher-classes', selectedSchoolId],
        queryFn: async () => {
            const filterId = selectedSchoolId === user?.id ? undefined : selectedSchoolId;
            const data = await teacherService.getClasses({ 
                schoolId: filterId || undefined 
            });
            return data as Class[];
        }
    });


    const filteredClasses = classes.filter(cls => {
        if (filters.academicYear && !cls.level.includes(filters.academicYear)) return false;
        if (filters.level && cls.level !== filters.level) return false;
        if (filters.class && !cls.name.includes(filters.class)) return false;
        if (filters.subject && cls.subject !== filters.subject) return false;
        return true;
    });

    const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            academicYear: '',
            term: '',
            level: '',
            class: '',
            subject: '',
        });
    };

    const handleClassClick = (classId: string) => {
        router.push(`/dashboard/teacher/my-classes/${classId}`);
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-4 sm:p-6 lg:p-10">
            <div className="max-w-screen-xl mx-auto">
                <PageHeader
                    title="My Classes"
                    description={selectedSchoolId === user?.id 
                        ? "Viewing all your assigned classes across connected schools." 
                        : `Viewing assigned classes for ${selectedSchoolName}.`}
                />

                <FilterChips
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading your classes...</p>
                    </div>
                ) : filteredClasses.length > 0 ? (
                    <ClassGrid
                        classes={filteredClasses}
                        onClassClick={handleClassClick}
                    />
                ) : (
                    <EmptyState onResetFilters={handleClearFilters} />
                )}

                {/* Stats Summary */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredClasses.length}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {filteredClasses.reduce((sum, cls) => sum + cls.studentCount, 0)}
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Attendance</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {filteredClasses.length > 0 
                              ? Math.round(filteredClasses.reduce((sum, cls) => sum + cls.attendance, 0) / filteredClasses.length) 
                              : 0}%
                        </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pending Grading</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {filteredClasses.reduce((sum, cls) => sum + cls.assignments + cls.exams, 0)}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}