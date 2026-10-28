'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Class } from './type';
import PageHeader from './PageHeader';
import FilterChips from './FilterChips';
import ClassGrid from './ClassGrid';
import ClassList from './ClassList';
import EmptyState from './EmptyState';
import ViewToggle, { ViewType } from './ViewToggle';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { ClassesSkeleton } from './ClassesSkeleton';
import { Users, GraduationCap, ClipboardList, CheckSquare, Sparkles } from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

export default function MyClassesPage() {
    const router = useRouter();
    const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
    const { user } = useAuthStore();
    const [viewType, setViewType] = useState<ViewType>('List View');

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setViewType('Grid View');
        }
    }, []);
    const [filters, setFilters] = useState({
        academicYear: '',
        term: '',
        level: '',
        class: '',
        subject: '',
    });

    const isPersonal = selectedSchoolId === user?.id;

    const { data: classes = [], isLoading } = useQuery({
        queryKey: ['teacher-classes', selectedSchoolId],
        queryFn: async () => {
            const filterId = isPersonal ? undefined : selectedSchoolId;
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

    const filterOptions = useMemo(() => {
        const options = {
            academicYear: new Set<string>(),
            term: new Set<string>(),
            level: new Set<string>(),
            class: new Set<string>(),
            subject: new Set<string>(),
        };

        classes.forEach(cls => {
            if (cls.academicYear) options.academicYear.add(cls.academicYear);
            if (cls.term) options.term.add(cls.term);
            if (cls.level) options.level.add(cls.level);
            if (cls.name) options.class.add(cls.name);
            if (cls.subject) options.subject.add(cls.subject);
        });

        return {
            academicYear: Array.from(options.academicYear).sort(),
            term: Array.from(options.term).sort(),
            level: Array.from(options.level).sort(),
            class: Array.from(options.class).sort(),
            subject: Array.from(options.subject).sort(),
        };
    }, [classes]);

    const handleClassClick = (classId: string) => {
        router.push(`/dashboard/teacher/my-classes/${classId}`);
    };

    const totalStudents = filteredClasses.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
    const avgAttendance = filteredClasses.length > 0 
        ? Math.round(filteredClasses.reduce((sum, cls) => sum + (cls.attendance || 0), 0) / filteredClasses.length) 
        : 0;
    const pendingItems = filteredClasses.reduce((sum, cls) => sum + (cls.assignments || 0) + (cls.exams || 0), 0);

    return (
        <main className="min-h-screen bg-transparent p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="w-full space-y-6 sm:space-y-8">
                <PageHeader
                    title="Academic Registry"
                    description={isPersonal 
                        ? "Managing coursework delivery across your entire institutional network." 
                        : `Course modules currently assigned at ${selectedSchoolName}.`}
                    isPersonal={isPersonal}
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    <StatCard 
                        label="Active Modules" 
                        value={filteredClasses.length} 
                        icon={GraduationCap} 
                        color="text-emerald-500"
                        bgColor="bg-emerald-500/10"
                        tooltip="Counts all active classrooms and cohort sections currently assigned to you for teaching. Use this to track your total section load and quickly confirm your assigned curriculum coverage."
                    />
                    <StatCard 
                        label="Enrolled Scholars" 
                        value={totalStudents.toLocaleString()} 
                        icon={Users} 
                        color="text-emerald-500"
                        bgColor="bg-emerald-500/10"
                        tooltip="Aggregates total enrolled students across all your active classes. Use this to verify roster completeness and understand your cumulative student reach."
                    />
                    <StatCard 
                        label="Avg. Session Attendance" 
                        value={`${avgAttendance}%`} 
                        icon={CheckSquare} 
                        color="text-emerald-500"
                        bgColor="bg-emerald-500/10"
                        tooltip="Computes average daily student attendance across your assigned classes. Use this metric to track classroom engagement and identify cohorts that may need attendance follow-ups."
                    />
                    <StatCard 
                        label="Pending Assessments" 
                        value={pendingItems} 
                        icon={ClipboardList} 
                        color="text-rose-500"
                        bgColor="bg-rose-500/10"
                        tooltip="Tallies all active assignments and examinations that are awaiting grading or review. Use this to prioritize your upcoming grading backlog before report cards and grade deadlines."
                    />
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 sm:p-6 bg-white dark:bg-emerald-950/60 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0">
                                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Class Intelligence</h3>
                                    <HeaderTooltip content="Allows you to dynamically filter your classes by Academic Year, Term, Grade Level, Cohort Name, or Subject. Use this to isolate specific teaching groups or switch between List and Grid layout views." />
                                </div>
                                <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1">Filter & Manage Academic Modules</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                            <ViewToggle viewType={viewType} onViewChange={setViewType} />
                        </div>
                    </div>

                    <FilterChips
                        filters={filters}
                        options={filterOptions}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </motion.div>

                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <ClassesSkeleton viewType={viewType} />
                            </motion.div>
                        ) : filteredClasses.length > 0 ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {viewType === 'List View' ? (
                                    <ClassList classes={filteredClasses} onClassClick={handleClassClick} />
                                ) : (
                                    <ClassGrid classes={filteredClasses} onClassClick={handleClassClick} />
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <EmptyState 
                                    onResetFilters={handleClearFilters} 
                                    hasActiveFilters={Boolean(filters.academicYear || filters.term || filters.level || filters.class || filters.subject)}
                                    totalClasses={classes.length}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}

function StatCard({ 
    label, 
    value, 
    icon: Icon, 
    color, 
    bgColor, 
    tooltip 
}: { 
    label: string; 
    value: string | number; 
    icon: React.ElementType; 
    color: string; 
    bgColor: string; 
    tooltip: string; 
}) {
    return (
        <motion.div 
            whileHover={{ y: -2, scale: 1.01 }}
            className="p-3 sm:p-5 md:p-6 bg-white dark:bg-emerald-950/60 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`p-2 sm:p-3 md:p-3.5 rounded-lg sm:rounded-xl ${bgColor} ${color} transition-transform group-hover:scale-105 shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                <HeaderTooltip content={tooltip} />
            </div>
            <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-500 transition-colors line-clamp-1">{label}</p>
                <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1">{value}</p>
            </div>
        </motion.div>
    );
}
