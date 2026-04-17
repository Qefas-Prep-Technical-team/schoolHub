'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Class } from './type';
import PageHeader from './PageHeader';
import FilterChips from './FilterChips';
import ClassGrid from './ClassGrid';
import EmptyState from './EmptyState';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { ClassesSkeleton } from './ClassesSkeleton';
import { Users, GraduationCap, ClipboardList, CheckSquare, Sparkles } from 'lucide-react';

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

    const handleClassClick = (classId: string) => {
        router.push(`/dashboard/teacher/my-classes/${classId}`);
    };

    const totalStudents = filteredClasses.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
    const avgAttendance = filteredClasses.length > 0 
        ? Math.round(filteredClasses.reduce((sum, cls) => sum + (cls.attendance || 0), 0) / filteredClasses.length) 
        : 0;
    const pendingItems = filteredClasses.reduce((sum, cls) => sum + (cls.assignments || 0) + (cls.exams || 0), 0);

    return (
        <main className="min-h-screen bg-transparent p-6 md:p-10 lg:p-14">
            <div className="max-w-screen-xl mx-auto space-y-14">
                <PageHeader
                    title="Academic Registry"
                    description={isPersonal 
                        ? "Managing coursework delivery across your entire institutional network." 
                        : `Course modules currently assigned at ${selectedSchoolName}.`}
                />

                {/* High-Impact Stat Wall (Promoted to top) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-14">
                    <StatCard 
                        label="Active Modules" 
                        value={filteredClasses.length} 
                        icon={GraduationCap} 
                        color="text-primary"
                        bgColor="bg-primary/5"
                    />
                    <StatCard 
                        label="Enrolled Scholars" 
                        value={totalStudents.toLocaleString()} 
                        icon={Users} 
                        color="text-blue-500"
                        bgColor="bg-blue-500/5"
                    />
                    <StatCard 
                        label="Avg. Session Attendance" 
                        value={`${avgAttendance}%`} 
                        icon={CheckSquare} 
                        color="text-emerald-500"
                        bgColor="bg-emerald-500/5"
                    />
                    <StatCard 
                        label="Pending Assessments" 
                        value={pendingItems} 
                        icon={ClipboardList} 
                        color="text-rose-500"
                        bgColor="bg-rose-500/5"
                    />
                </div>

                {/* Filter Section (Now at top with stats) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-10 bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl mb-14"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-lg shadow-primary/5">
                                <GraduationCap size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 italic tracking-tight underline decoration-primary/20">Class Intelligence</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Filter & Manage Academic Modules</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 text-primary font-black uppercase tracking-[0.2em] text-[10px] bg-primary/5 px-6 py-3 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5">
                            <Sparkles size={14} className="animate-pulse" />
                            {isPersonal ? "Global Academic Scope" : "Local School Instance"}
                        </div>
                    </div>

                    <FilterChips
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </motion.div>

                {/* Results Grid with staggered transition */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <ClassesSkeleton />
                            </motion.div>
                        ) : filteredClasses.length > 0 ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <ClassGrid
                                    classes={filteredClasses}
                                    onClassClick={handleClassClick}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <EmptyState onResetFilters={handleClearFilters} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>




            </div>
        </main>
    );
}

function StatCard({ label, value, icon: Icon, color, bgColor }: { label: string, value: string | number, icon: any, color: string, bgColor: string }) {
    return (
        <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            className="p-8 bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all group"
        >
            <div className="flex items-center gap-5">
                <div className={`p-5 rounded-2xl ${bgColor} ${color} transition-transform group-hover:scale-110 shadow-inner`}>
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1.5 leading-none tracking-tight">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}