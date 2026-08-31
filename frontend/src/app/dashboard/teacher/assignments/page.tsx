'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Assignment } from './components/types';
import PageHeader from './components/PageHeader';
import Button from './components/ui/Button';
import AssignmentFilters from './components/AssignmentFilters';
import AssignmentCard from './components/AssignmentCard';
import AssignmentList from './components/AssignmentList';
import Pagination from './components/Pagination';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useTeacherAssignments, useDeleteAssignment } from '@/lib/api/hooks/useAssignments';
import { AssignmentsSkeleton } from './components/AssignmentsSkeleton';
import { PlusCircle, SearchX, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const getNormalizedStatus = (assignment: any): 'published' | 'overdue' | 'due-soon' | 'draft' => {
    const rawStatus = (assignment.status || 'DRAFT').toLowerCase();
    if (rawStatus === 'draft') return 'draft';
    
    // If it's published, check if it's overdue or due soon
    if (rawStatus === 'published' && assignment.dueDate) {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        if (dueDate < now) {
            return 'overdue';
        }
        // If due in the next 24 hours, it's due-soon
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        if (hoursDiff > 0 && hoursDiff <= 24) {
            return 'due-soon';
        }
    }
    return 'published';
};

export default function AssignmentsPage() {
    const router = useRouter();
    const { selectedSchoolId } = useDashboardStore();
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '', subject: '', classId: '' });
    const [view, setView] = useState<'list' | 'grid'>('list');
    const [currentPage, setCurrentPage] = useState(1);
    const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
    const itemsPerPage = 8;

    const isPersonal = selectedSchoolId === user?.id;
    const effectiveSchoolId = selectedSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || "";

    const { data: assignmentsData, isLoading } = useTeacherAssignments(
        effectiveSchoolId,
        filters.status === 'all' ? undefined : filters.status
    );

    const { mutate: deleteAssignment, isPending: isDeleting } = useDeleteAssignment(effectiveSchoolId);

    const assignments = assignmentsData?.assignments || [];

    // Extract dynamic filters based on available assignments
    const subjectOptions = useMemo(() => {
        const uniqueSubjects = new Set(
            assignments.map((a: any) => a.subject?.name).filter(Boolean)
        );
        return [
            { value: '', label: 'All Subjects' },
            ...Array.from(uniqueSubjects).map((subj: any) => ({
                value: subj.toLowerCase(),
                label: subj as string
            }))
        ];
    }, [assignments]);

    const classOptions = useMemo(() => {
        const uniqueClasses = new Map<string, string>();
        assignments.forEach((a: any) => {
            if (a.class?.id && a.class?.name) {
                uniqueClasses.set(a.class.id, a.class.name);
            }
        });
        return [
            { value: '', label: 'All Classes' },
            ...Array.from(uniqueClasses.entries()).map(([id, name]) => ({
                value: id,
                label: name
            }))
        ];
    }, [assignments]);

    // Filter and search assignments
    const filteredAssignments = useMemo(() => {
        return assignments.filter((assignment: any) => {
            const matchesSearch =
                !searchQuery ||
                assignment.title.toLowerCase().includes(searchQuery.toLowerCase());

            const normalizedStatus = getNormalizedStatus(assignment);
            const matchesStatus = !filters.status || normalizedStatus === filters.status;
            
            // Handle subject matching if nested
            const subjectName = assignment.subject?.name || "";
            const matchesSubject = !filters.subject || subjectName.toLowerCase() === filters.subject.toLowerCase();

            // Handle class matching
            const matchesClass = !filters.classId || assignment.classId === filters.classId;

            return matchesSearch && matchesStatus && matchesSubject && matchesClass;
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

    const handleFilterChange = (newFilters: { status: string; subject: string; classId: string }) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const confirmDelete = () => {
        if (!assignmentToDelete) return;
        deleteAssignment(assignmentToDelete, {
            onSuccess: () => {
                toast.success('Assignment deleted successfully');
                setAssignmentToDelete(null);
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.error || 'Failed to delete assignment');
                setAssignmentToDelete(null);
            }
        });
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-slate-50/50 dark:bg-slate-950/50">
            <div className="space-y-6">
                {/* Page Header Modernized */}
                <PageHeader
                    title="Assignments"
                    description={isPersonal ? "All assignments across your schools." : "Classroom assignments for this school."}
                    action={
                        <Link href="/dashboard/teacher/assignments/create-assignment">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary/90 transition-all duration-200"
                            >
                                <PlusCircle size={18} strokeWidth={2} />
                                Create New
                            </motion.button>
                        </Link>
                    }
                />

                {/* Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 md:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                         <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <BookOpen size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Assignments</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Manage & Grade Modules</p>
                            </div>
                         </div>
                    </div>

                    <AssignmentFilters
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        onViewChange={setView}
                        subjectOptions={subjectOptions}
                        classOptions={classOptions}
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
                            view === 'list' ? (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="pt-4"
                                >
                                    <AssignmentList 
                                        assignments={paginatedAssignments.map((assignment: any) => ({
                                            ...assignment,
                                            status: getNormalizedStatus(assignment),
                                            subject: assignment.subject?.name || "General",
                                            className: assignment.class?.name || "All Classes",
                                            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No Deadline",
                                            submitted: assignment._count?.submissions || 0,
                                            totalStudents: typeof assignment.totalTargetedStudents === 'number' ? assignment.totalTargetedStudents : (assignment.class?._count?.enrollments || 0),
                                            progress: (typeof assignment.totalTargetedStudents === 'number' ? assignment.totalTargetedStudents : (assignment.class?._count?.enrollments || 0)) > 0 
                                                ? Math.round(((assignment._count?.submissions || 0) / (typeof assignment.totalTargetedStudents === 'number' ? assignment.totalTargetedStudents : (assignment.class?._count?.enrollments || 0))) * 100) 
                                                : 0
                                        }))}
                                        onEdit={(id) => router.push(`/dashboard/teacher/assignments/${id}?edit=true`)}
                                        onGrade={(id) => router.push(`/dashboard/teacher/assignments/${id}`)}
                                        onDelete={(id) => setAssignmentToDelete(id)}
                                        onViewDetails={(id) => router.push(`/dashboard/teacher/assignments/${id}`)}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="grid gap-6 pt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                >
                                    {paginatedAssignments.map((assignment: any) => (
                                        <AssignmentCard
                                            key={assignment.id}
                                            assignment={{
                                                ...assignment,
                                                status: getNormalizedStatus(assignment),
                                                subject: assignment.subject?.name || "General",
                                                className: assignment.class?.name || "All Classes",
                                                dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No Deadline",
                                                submitted: assignment._count?.submissions || 0,
                                                totalStudents: typeof assignment.totalTargetedStudents === 'number' ? assignment.totalTargetedStudents : (assignment.class?._count?.enrollments || 0),
                                                progress: (typeof assignment.totalTargetedStudents === 'number' ? assignment.totalTargetedStudents : (assignment.class?._count?.enrollments || 0)) > 0 
                                                    ? Math.round(((assignment._count?.submissions || 0) / (typeof assignment.totalTargetedStudents === 'number' ? assignment.totalTargetedStudents : (assignment.class?._count?.enrollments || 0))) * 100) 
                                                    : 0
                                            }}
                                            onEdit={() => router.push(`/dashboard/teacher/assignments/${assignment.id}?edit=true`)}
                                            onGrade={() => router.push(`/dashboard/teacher/assignments/${assignment.id}`)}
                                            onDelete={() => setAssignmentToDelete(assignment.id)}
                                            onViewDetails={() => router.push(`/dashboard/teacher/assignments/${assignment.id}`)}
                                        />
                                    ))}
                                </motion.div>
                            )
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
                                    Adjust your search or create a new assignment for your students.
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

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {assignmentToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAssignmentToDelete(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-8"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                                    <AlertTriangle size={32} strokeWidth={2} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Delete Assignment?</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                                    This action cannot be undone. This will permanently delete the assignment, all its questions, and any student submissions.
                                </p>
                                <div className="flex items-center gap-3 w-full">
                                    <button
                                        onClick={() => setAssignmentToDelete(null)}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}

// Ensure the button in empty state matches
