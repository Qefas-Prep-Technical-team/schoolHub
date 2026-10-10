"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Assignment } from "./components/types";
import PageHeader from "./components/PageHeader";
import Button from "./components/ui/Button";
import AssignmentFilters from "./components/AssignmentFilters";
import AssignmentCard from "./components/AssignmentCard";
import Pagination from "./components/Pagination";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useAdminAssignments } from "@/lib/api/hooks/useAssignments";
import { useSchoolSubjects, useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { AssignmentsSkeleton } from "./components/AssignmentsSkeleton";
import {
  PlusCircle,
  SearchX,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  FileEdit,
  AlertTriangle,
} from "lucide-react";
import { useDeleteAssignment } from "@/lib/api/hooks/useAssignments";
import { toast } from "react-toastify";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { generatePDF } from "@/utils/pdfGenerator";
import { Download, Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


export default function AssignmentsPage() {
  const router = useRouter();
  const { selectedSchoolId } = useDashboardStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", subject: "" });
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setView("grid");
    }
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);
  const { data: schoolProfile } = useSchoolProfile(selectedSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || "");

  const handleExport = async (targetFormat: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const dataToExport = filteredAssignments || [];
      if (!dataToExport || dataToExport.length === 0) {
        toast.info("No assignments to export.");
        return;
      }
      
      const headers = ["#", "Title", "Subject", "Class", "Deadline", "Progress", "Status"];
      const rows = dataToExport.map((assignment: any, index: number) => {
        const totalStudents = typeof assignment.totalTargetedStudents === "number" ? assignment.totalTargetedStudents : typeof assignment.class === "object" && assignment.class?._count?.enrollments ? assignment.class._count.enrollments : 0;
        const submitted = assignment._count?.submissions || 0;
        const progress = totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0;
        return [
          (index + 1).toString(),
          assignment.title || "N/A",
          typeof assignment.subject === "string" ? assignment.subject : assignment.subject?.name || "General",
          typeof assignment.class === "string" ? assignment.class : assignment.class?.name || "All Classes",
          assignment.dueDate ? format(new Date(assignment.dueDate), "yyyy-MM-dd") : "No Deadline",
          progress + "%",
          assignment.status || "draft"
        ];
      });

      const dateStr = format(new Date(), "yyyy-MM-dd");
      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || (user as any)?.tenant?.name || "School";
      const sanitizedSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileNameBase = `${sanitizedSchoolName}_assignments_export_${dateStr}`;

      if (targetFormat === 'csv') {
        const csvContent = [];
        csvContent.push(`"${schoolName.toUpperCase()}"`);
        if (schoolProfile?.motto) csvContent.push(`"${schoolProfile.motto}"`);
        csvContent.push("");
        csvContent.push(`"Assignments Report"`);
        csvContent.push(`"Generated on: ${dateStr}"`);
        csvContent.push("");
        
        csvContent.push(headers.join(","));
        rows.forEach((r: any[]) => {
            const safeRow = r.map((item: any) => `"${String(item).replace(/"/g, '""')}"`);
            csvContent.push(safeRow.join(","));
        });

        const csv = csvContent.join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileNameBase}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        await generatePDF({
          title: `${schoolName} Assignments Report`,
          filename: `${fileNameBase}.pdf`,
          schoolProfile: schoolProfile,
          metaData: [
            { label: 'Date', value: dateStr },
            { label: 'Total Assignments', value: dataToExport.length.toString() }
          ],
          tableHeaders: [headers],
          tableData: rows
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to export assignments as ${targetFormat.toUpperCase()}.`);
    } finally {
      setIsExporting(false);
    }
  };

  const itemsPerPage = 8;

  const isPersonal = false; // Admins oversee the whole school
  const effectiveSchoolId =
    selectedSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const { data: assignmentsData, isLoading } = useAdminAssignments(
    effectiveSchoolId,
    filters.status === "all" ? undefined : filters.status,
  );

  const { mutate: deleteAssignment, isPending: isDeleting } =
    useDeleteAssignment(effectiveSchoolId);

  const { data: subjectsData } = useSchoolSubjects(effectiveSchoolId);
  const availableSubjects = Array.isArray(subjectsData)
    ? subjectsData
    : subjectsData?.data || subjectsData?.subjects || [];

  const assignments = assignmentsData?.assignments || [];

  // Filter and search assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment: any) => {
      const matchesSearch =
        !searchQuery ||
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !filters.status ||
        assignment.status?.toLowerCase() === filters.status.toLowerCase();

      // Handle subject matching if nested
      const subjectName = assignment.subject?.name || assignment.subject || "";
      const matchesSubject =
        !filters.subject ||
        subjectName.toLowerCase() === filters.subject.toLowerCase();

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [assignments, searchQuery, filters]);

  // Paginate assignments
  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAssignments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAssignments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  // Calculate Stats
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter(
      (a: any) => a.status?.toLowerCase() === "published",
    ).length;
    const overdue = assignments.filter((a: any) => {
      if (a.status?.toLowerCase() === "overdue") return true;
      if (
        a.dueDate &&
        new Date(a.dueDate) < new Date() &&
        a.status?.toLowerCase() !== "published"
      )
        return true;
      return false;
    }).length;
    const drafts = assignments.filter(
      (a: any) => a.status?.toLowerCase() === "draft",
    ).length;

    return [
      {
        title: "Total Assignments",
        value: total,
        icon: FileText,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        info: "Total number of assignments created across the school."
      },
      {
        title: "Active (Published)",
        value: active,
        icon: CheckCircle2,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        info: "Assignments that are currently visible to students."
      },
      {
        title: "Overdue",
        value: overdue,
        icon: Clock,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        info: "Assignments where the submission deadline has passed."
      },
      {
        title: "Drafts",
        value: drafts,
        icon: FileEdit,
        color: "text-slate-500",
        bg: "bg-slate-500/10",
        border: "border-slate-500/20",
        info: "Assignments that are saved but not yet published to students."
      },
    ];
  }, [assignments]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: {
    status: string;
    subject: string;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const confirmDelete = () => {
    if (!assignmentToDelete) return;
    deleteAssignment(assignmentToDelete, {
      onSuccess: () => {
        toast.success("Assignment deleted successfully");
        setAssignmentToDelete(null);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.error || "Failed to delete assignment",
        );
        setAssignmentToDelete(null);
      },
    });
  };

  return (
    <main className="min-h-screen bg-transparent p-2 md:p-4 lg:p-6">
      <div className="w-[98%] mx-auto space-y-10">
        {/* Page Header Modernized */}
        <PageHeader
          title="Assignments"
          description={"School-wide classroom tasks."}
          action={
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isExporting}
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
                  >
                    {isExporting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                    ) : (
                      <Download size={18} strokeWidth={2} />
                    )}
                    {isExporting ? "Generating..." : "Export"}
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-xl">
                  <DropdownMenuItem 
                    onClick={() => handleExport('csv')}
                    className="rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 py-2.5 px-3"
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('pdf')}
                    className="rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 py-2.5 px-3 mt-1"
                  >
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/dashboard/admin/assignments/create-assignment">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-md hover:bg-primary/90 transition-all duration-200 dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600 dark:hover:from-indigo-600 dark:hover:to-violet-700 dark:shadow-lg dark:shadow-indigo-500/20 border border-primary/20 dark:border-indigo-400/20"
                >
                  <PlusCircle size={18} strokeWidth={2} />
                  Create New Assignment
                </motion.button>
              </Link>
            </div>
          }
        />

        {/* Analytics Hub Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {stat.title}
                    </p>
                    {stat.info && (
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                        <Info size={14} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                    {stat.info}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                  </div>
                </div>
                
                <div className="flex items-end justify-between mt-auto">
                  <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {isLoading ? "-" : stat.value}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>View all</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

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
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Assignments
                    </h3>
                    <TooltipProvider>
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                                <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                    <Info size={16} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl text-left">
                                View and manage all student assignments.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Manage coursework and deadlines
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary font-medium text-sm bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
              <Sparkles size={14} className="animate-pulse" />
              {isPersonal ? "Global View" : "Local School View"}
            </div>
          </div>

          <AssignmentFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onViewChange={setView}
            availableSubjects={availableSubjects}
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
                <AssignmentsSkeleton view={view} />
              </motion.div>
            ) : filteredAssignments.length > 0 ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="pt-4"
              >
                {view === "list" && (
                  <div className="overflow-x-auto custom-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                    <div className="min-w-[900px]">
                      <div className="grid grid-cols-[0.5fr_2.5fr_1.5fr_1.5fr_1.5fr_1fr_auto] gap-4 px-8 py-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-transparent">
                        <div>#</div>
                        <div>Assignment Details</div>
                        <div>Class</div>
                        <div>Deadline</div>
                        <div>Progress</div>
                        <div>Status</div>
                        <div className="text-right">Actions</div>
                      </div>
                      <div className="flex flex-col bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800">
                        {paginatedAssignments.map(
                          (assignment: any, index: number) => {
                            const totalStudents =
                              typeof assignment.totalTargetedStudents ===
                              "number"
                                ? assignment.totalTargetedStudents
                                : typeof assignment.class === "object" &&
                                    assignment.class?._count?.enrollments
                                  ? assignment.class._count.enrollments
                                  : 0;
                            const submitted =
                              assignment._count?.submissions || 0;
                            const progress =
                              totalStudents > 0
                                ? Math.round((submitted / totalStudents) * 100)
                                : 0;
                            return (
                              <AssignmentCard
                                key={assignment.id}
                                index={
                                  (currentPage - 1) * itemsPerPage + index + 1
                                }
                                assignment={{
                                  ...assignment,
                                  subject:
                                    typeof assignment.subject === "string"
                                      ? assignment.subject
                                      : assignment.subject?.name || "General",
                                  className:
                                    typeof assignment.class === "string"
                                      ? assignment.class
                                      : assignment.class?.name || "All Classes",
                                  dueDate: assignment.dueDate
                                    ? new Date(
                                        assignment.dueDate,
                                      ).toLocaleDateString()
                                    : "No Deadline",
                                  submitted,
                                  totalStudents,
                                  progress,
                                }}
                                viewMode={view}
                                onEdit={() =>
                                  router.push(
                                    `/dashboard/admin/assignments/${assignment.id}?edit=true`,
                                  )
                                }
                                onGrade={() =>
                                  router.push(
                                    `/dashboard/admin/assignments/${assignment.id}`,
                                  )
                                }
                                onDelete={() =>
                                  setAssignmentToDelete(assignment.id)
                                }
                                onViewDetails={() =>
                                  router.push(
                                    `/dashboard/admin/assignments/${assignment.id}`,
                                  )
                                }
                              />
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {view === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedAssignments.map(
                      (assignment: any, index: number) => {
                        const totalStudents =
                          typeof assignment.totalTargetedStudents === "number"
                            ? assignment.totalTargetedStudents
                            : typeof assignment.class === "object" &&
                                assignment.class?._count?.enrollments
                              ? assignment.class._count.enrollments
                              : 0;
                        const submitted = assignment._count?.submissions || 0;
                        const progress =
                          totalStudents > 0
                            ? Math.round((submitted / totalStudents) * 100)
                            : 0;
                        return (
                          <AssignmentCard
                            key={assignment.id}
                            index={(currentPage - 1) * itemsPerPage + index + 1}
                            assignment={{
                              ...assignment,
                              subject:
                                typeof assignment.subject === "string"
                                  ? assignment.subject
                                  : assignment.subject?.name || "General",
                              className:
                                typeof assignment.class === "string"
                                  ? assignment.class
                                  : assignment.class?.name || "All Classes",
                              dueDate: assignment.dueDate
                                ? new Date(
                                    assignment.dueDate,
                                  ).toLocaleDateString()
                                : "No Deadline",
                              submitted,
                              totalStudents,
                              progress,
                            }}
                            viewMode={view}
                            onEdit={() =>
                              router.push(
                                `/dashboard/admin/assignments/${assignment.id}?edit=true`,
                              )
                            }
                            onGrade={() =>
                              router.push(
                                `/dashboard/admin/assignments/${assignment.id}`,
                              )
                            }
                            onDelete={() =>
                              setAssignmentToDelete(assignment.id)
                            }
                            onViewDetails={() =>
                              router.push(
                                `/dashboard/admin/assignments/${assignment.id}`,
                              )
                            }
                          />
                        );
                      },
                    )}
                  </div>
                )}
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
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  No Assignments Found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
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
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                  Delete Assignment?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                  This action cannot be undone. This will permanently delete the
                  assignment, all its questions, and any student submissions.
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
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
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
