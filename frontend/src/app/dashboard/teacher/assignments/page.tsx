'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Assignment } from './components/types';
import PageHeader from './components/PageHeader';
import Button from './components/ui/Button';
import AssignmentFilters from './components/AssignmentFilters';
import AssignmentCard from './components/AssignmentCard';
import Pagination from './components/Pagination';
import Link from 'next/link';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { AssignmentsSkeleton } from './components/AssignmentsSkeleton';
import { PlusCircle, SearchX, Sparkles, BookOpen } from 'lucide-react';

export default function AssignmentsPage() {
    const { selectedSchoolId } = useDashboardStore();
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '', subject: '' });
    const [view, setView] = useState<'list' | 'grid'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const isPersonal = selectedSchoolId === user?.id;

    const { data: assignments = [], isLoading } = useQuery({
        queryKey: ['teacher-assignments', selectedSchoolId],
        queryFn: async () => {
            const filterId = isPersonal ? undefined : selectedSchoolId;
            const data = await teacherService.getExams({ 
                schoolId: filterId || undefined,
                category: 'ASSIGNMENT'
            });
            return data;
        }
    });

    // Filter and search assignments
    const filteredAssignments = useMemo(() => {
        return assignments.filter((assignment: any) => {
            const matchesSearch =
                !searchQuery ||
                assignment.title.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = !filters.status || assignment.status === filters.status;
            
            // Handle subject matching if nested
            const subjectName = assignment.subject?.name || "";
            const matchesSubject = !filters.subject || subjectName.toLowerCase() === filters.subject.toLowerCase();

            return matchesSearch && matchesStatus && matchesSubject;
        });
    }, [assignments, searchQuery, filters]);

    // Paginate assignments
    const paginatedAssignments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAssignments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAssignments, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleFilterChange = (newFilters: { status: string; subject: string }) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    return (
        <main className="min-h-screen bg-transparent p-4 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Page Header Modernized */}
                <PageHeader
                    title="Assignments"
                    description={isPersonal ? "All task assignments across your schools." : "Classroom tasks for this institution."}
                    action={
                        <Link href="/dashboard/teacher/assignments/create-assignment">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all hover:bg-primary/90"
                            >
                                <PlusCircle size={18} strokeWidth={2.5} />
                                Create New Assignment
                            </motion.button>
                        </Link>
                    }
                />

                {/* Filters with Glow */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                         <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <BookOpen size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 italic tracking-tight underline architecture-none decoration-primary/30">Task Registry</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manage Coursework & Deadlines</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                            <Sparkles size={14} className="animate-pulse" />
                            {isPersonal ? "Global View" : "Local School View"}
                        </div>
                    </div>

                    <AssignmentFilters
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        onViewChange={setView}
                    />
                </motion.div>

                {/* Assignments Content Area */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="pt-4"
                            >
                                <AssignmentsSkeleton />
                            </motion.div>
                        ) : filteredAssignments.length > 0 ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className={`grid gap-8 pt-4 ${view === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                    : 'grid-cols-1'
                                    }`}
                            >
                                {paginatedAssignments.map((assignment: any) => (
                                    <AssignmentCard
                                        key={assignment.id}
                                        assignment={{
                                            ...assignment,
                                            subject: assignment.subject?.name || "General",
                                            className: assignment.class?.name || "All Classes",
                                            dueDate: assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "No Deadline",
                                            submitted: assignment.examAttempts?.length || 0,
                                            totalStudents: assignment.class?._count?.enrollments || 30, // Fallback
                                            progress: assignment.examAttempts?.length ? Math.round((assignment.examAttempts.length / 30) * 100) : 0
                                        }}
                                        onEdit={() => {}}
                                        onGrade={() => {}}
                                        onDelete={() => {}}
                                        onViewDetails={() => {}}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-24 text-center"
                            >
                                <div className="p-8 rounded-[2rem] bg-slate-100 dark:bg-slate-800 mb-6">
                                    <SearchX className="w-16 h-16 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">No Assignments Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm font-bold uppercase tracking-widest leading-relaxed">
                                    Adjust your search or start a new task for your students.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Pagination Modernized */}
                {filteredAssignments.length > 0 && (
                    <div className="pt-10">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredAssignments.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}

// Ensure the button in empty state matches
