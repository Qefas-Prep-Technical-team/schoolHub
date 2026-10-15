'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Assignment } from './components/types';
import PageHeader from './components/PageHeader';
import AssignmentFilters from './components/AssignmentFilters';
import AssignmentCard from './components/AssignmentCard';
import AssignmentList from './components/AssignmentList';
import Pagination from './components/Pagination';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useTeacherAssignments, useDeleteAssignment } from '@/lib/api/hooks/useAssignments';
import { AssignmentsSkeleton } from './components/AssignmentsSkeleton';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';
import { PlusCircle, SearchX, BookOpen, AlertTriangle, GraduationCap, Clock, CheckCircle2 } from 'lucide-react';
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
    const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
    const { user } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '', subject: '', classId: '' });
    const [view, setView] = useState<'list' | 'grid'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
    const itemsPerPage = 8;

    // Default to Grid View on mobile screens
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setView('grid');
        }
    }, []);

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

    // Summary KPIs for Stat Cards
    const activeAssignmentsCount = useMemo(() => {
        return assignments.filter((a: any) => getNormalizedStatus(a) !== 'draft').length;
    }, [assignments]);

    const totalSubmissions = useMemo(() => {
        return assignments.reduce((sum: number, a: any) => sum + (a._count?.submissions || 0), 0);
    }, [assignments]);

    const actionRequiredCount = useMemo(() => {
        return assignments.filter((a: any) => {
            const status = getNormalizedStatus(a);
            return status === 'overdue' || status === 'due-soon';
        }).length;
    }, [assignments]);

    const averageTurnInRate = useMemo(() => {
        if (assignments.length === 0) return 0;
        let totalTargeted = 0;
        let totalSubmitted = 0;
        assignments.forEach((a: any) => {
            const targeted = typeof a.totalTargetedStudents === 'number' ? a.totalTargetedStudents : (a.class?._count?.enrollments || 0);
            if (targeted > 0) {
                totalTargeted += targeted;
                totalSubmitted += (a._count?.submissions || 0);
            }
        });
        return totalTargeted > 0 ? Math.round((totalSubmitted / totalTargeted) * 100) : 0;
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
        <main className="min-h-screen w-full p-3.5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 bg-slate-50/50 dark:bg-transparent transition-colors duration-500 font-display">
            <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
                
                {/* Page Header */}
                <PageHeader
                    title="Course Assignments"
                    description={isPersonal ? "All coursework deliverables across your institutional network." : `Active student assignments for ${selectedSchoolName || "your school"}.`}
                    tooltip={`Centralized academic coursework and deliverables console. Use this to track student homework turn-ins, monitor evaluation deadlines, review completion velocity, and publish assignments across assigned cohorts. You are currently viewing ${assignments.length} total assignment${assignments.length === 1 ? '' : 's'}${filters.status ? ` filtered by status "${filters.status}"` : ''}.`}
                    action={
                        <Link href="/dashboard/teacher/assignments/create-assignment" className="w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all duration-200 cursor-pointer w-full sm:w-auto"
                            >
                                <PlusCircle size={18} strokeWidth={2.5} />
                                <span>Create New</span>
                            </motion.button>
                        </Link>
                    }
                />

                {/* Top Stat Cards — 2 Columns on Mobile, 4 Columns on Desktop */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    <StatCard 
                        label="Active Deliverables" 
                        value={activeAssignmentsCount} 
                        icon={BookOpen} 
                        color="text-emerald-500" 
                        bgColor="bg-emerald-500/10" 
                        tooltip="Total count of published assignments currently open for student submission across all your cohorts. Use this to track your active teaching payload and curriculum delivery." 
                    />
                    <StatCard 
                        label="Submissions Received" 
                        value={totalSubmissions} 
                        icon={GraduationCap} 
                        color="text-blue-500" 
                        bgColor="bg-blue-500/10" 
                        tooltip="Aggregates student response papers and coursework turned in across all assignments. Use this to gauge your grading queue and evaluate student submission momentum." 
                    />
                    <StatCard 
                        label="Action Required" 
                        value={actionRequiredCount} 
                        icon={Clock} 
                        color="text-amber-500" 
                        bgColor="bg-amber-500/10" 
                        tooltip="Tallies assignments that are either overdue or due within the next 24 hours. Use this to trigger reminder announcements or begin immediate grading for expired deadlines." 
                    />
                    <StatCard 
                        label="Turn-in Rate" 
                        value={`${averageTurnInRate}%`} 
                        icon={CheckCircle2} 
                        color="text-purple-500" 
                        bgColor="bg-purple-500/10" 
                        tooltip="Percentage of enrolled students who have submitted their required coursework. Use this benchmark to spot cohorts with submission drop-offs early." 
                    />
                </div>

                {/* Filters & Search Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 sm:p-5 md:p-6 bg-white dark:bg-emerald-950/40 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0">
                                <BookOpen size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Assignment Directory</h3>
                                    <HeaderTooltip content="Filter your assignments by publication status (Published, Overdue, Due Soon, Draft), subject discipline, and assigned class cohort. Use the View buttons to switch between visual Grid and detailed List layout perspectives." />
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Filter & Grade Deliverables</p>
                            </div>
                         </div>
                    </div>

                    <AssignmentFilters
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        onViewChange={setView}
                        subjectOptions={subjectOptions}
                        classOptions={classOptions}
                        currentView={view}
                    />
                </motion.div>

                {/* Assignments Content Area */}
                <div className="relative min-h-[350px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="skeleton"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="pt-2"
                            >
                                <AssignmentsSkeleton view={view} />
                            </motion.div>
                        ) : filteredAssignments.length > 0 ? (
                            view === 'list' ? (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="pt-2"
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
                                        currentUserId={user?.id}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="grid gap-4 sm:gap-6 pt-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
                                            currentUserId={user?.id}
                                        />
                                    ))}
                                </motion.div>
                            )
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200 dark:border-emerald-800/40 bg-white dark:bg-emerald-950/20 p-6"
                            >
                                <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-4 text-slate-400">
                                    <SearchX className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-1.5">No Assignments Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-xs sm:text-sm font-medium leading-relaxed mb-6">
                                    {searchQuery ? `No assignments match "${searchQuery}". Try clearing filters or altering search terms.` : "Create your first assignment to engage your students and track deliverables."}
                                </p>
                                <Link href="/dashboard/teacher/assignments/create-assignment">
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer">
                                        <PlusCircle size={16} />
                                        <span>Create Assignment</span>
                                    </button>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Pagination */}
                {filteredAssignments.length > 0 && (
                    <div className="pt-6 sm:pt-8">
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
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                                    <AlertTriangle size={28} strokeWidth={2} />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-1.5">Delete Assignment?</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 text-xs sm:text-sm leading-relaxed">
                                    This action cannot be undone. This will permanently delete the assignment, all attached questions, and student submission records.
                                </p>
                                <div className="flex items-center gap-3 w-full">
                                    <button
                                        onClick={() => setAssignmentToDelete(null)}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/20"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
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
      className="p-3 sm:p-5 md:p-6 bg-white dark:bg-emerald-950/40 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
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
