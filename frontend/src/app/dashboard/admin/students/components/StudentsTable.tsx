"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/adminService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  ShieldCheck,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentsTableProps {
  searchTerm: string;
  filters: {
    classId: string;
    gender: string;
    status: string;
  };
  page: number;
  onPageChange: (page: number) => void;
  viewMode?: "list" | "grid";
}

const GenderBadge = ({ gender }: { gender?: string }) => {
  if (!gender) return <span className="text-xs text-gray-400">—</span>;
  const isMale = gender.toUpperCase() === "MALE";
  const isOther = gender.toUpperCase() === "OTHER";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        isMale
          ? "bg-blue-50 text-blue-600"
          : isOther
          ? "bg-purple-50 text-purple-600"
          : "bg-pink-50 text-pink-500"
      )}
    >
      <span className="text-[10px]">{isMale ? "♂" : isOther ? "⚧" : "♀"}</span>
      {gender.charAt(0) + gender.slice(1).toLowerCase()}
    </span>
  );
};

const StatusDot = ({ verified }: { verified: boolean }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 text-xs font-medium",
      verified ? "text-emerald-600" : "text-amber-500"
    )}
  >
    <span
      className={cn(
        "size-1.5 rounded-full",
        verified ? "bg-emerald-500" : "bg-amber-400"
      )}
    />
    {verified ? "Active" : "Pending"}
  </span>
);

export default function StudentsTable({
  searchTerm,
  filters,
  page,
  onPageChange,
  viewMode = "list",
}: StudentsTableProps) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
  const { data: settings } = useSchoolSettings(schoolId!);
  const primaryColor = settings?.themeColor || "#6366f1";

  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["school-students", schoolId, searchTerm, filters, page],
    queryFn: () =>
      adminService.getSchoolStudents(schoolId!, page, 10, searchTerm, filters),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 2,
  });

  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;
  const students = data?.data || [];

  const verifyMutation = useMutation({
    mutationFn: (studentId: string) => adminService.verifyStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-students"] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Student successfully authorized!", { theme: "colored" });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to authorize student."
      );
    },
  });

  const handleVerify = (e: React.MouseEvent, studentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    verifyMutation.mutate(studentId);
  };

  const toggleSelect = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((existingId) => existingId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s: any) => s.id));
    }
    setSelectAll(!selectAll);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 dark:bg-slate-800/50">
          {["w-4", "w-6", "w-32", "w-20", "w-16", "w-16", "w-24", "w-16", "w-16"].map(
            (w, i) => (
              <Skeleton key={i} className={`h-3 ${w} rounded`} />
            )
          )}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="size-4 rounded" />
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-3 w-36 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="size-6 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="p-12 text-center text-sm text-red-500 font-medium">
        Failed to load students. Please refresh and try again.
      </div>
    );
  }

  // ── Smart page numbers ────────────────────────────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
      pages.push(p);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col">
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
          {students.map((student: any, index: number) => {
            const isSelected = selectedIds.includes(student.id);
            const studentClass = student.classes?.[0]?.class;
            const studentCode = student.studentCode ? String(student.studentCode).padStart(8, "0") : "—";
            const rowNumber = (page - 1) * 10 + index + 1;
            return (
              <div
                key={student.id}
                className={cn(
                  "bg-white dark:bg-slate-900 border border-gray-150 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative group",
                  isSelected && "border-indigo-400 dark:border-indigo-500 ring-1 ring-indigo-400 dark:ring-indigo-500"
                )}
              >
                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-300 dark:border-white/20 cursor-pointer accent-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    style={{ opacity: isSelected ? 1 : undefined }}
                    checked={isSelected}
                    onChange={(e) => toggleSelect(e, student.id)}
                  />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tabular-nums border border-slate-200/60 dark:border-slate-700/60">
                    #{rowNumber}
                  </span>
                </div>
                <div className="absolute top-3.5 right-3.5 z-10">
                  <StatusDot verified={student.verified} />
                </div>
                
                <div className="flex flex-col items-center text-center mt-2">
                  <div className="size-20 rounded-full overflow-hidden border-4 border-gray-50 dark:border-slate-800 bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 mb-4 shadow-sm">
                    {student.profileImage ? (
                      <img
                        src={student.profileImage}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  
                  <Link href={`/dashboard/admin/students/${student.id}`} className="hover:text-indigo-600 transition-colors">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">{student.name}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 font-mono">{studentCode}</p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                    {studentClass && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {studentClass.name}{studentClass.section ? `-${studentClass.section}` : ""}
                      </span>
                    )}
                    <GenderBadge gender={student.gender} />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 w-full flex items-center justify-between">
                    <StatusDot verified={student.verified} />
                    <Link
                      href={`/dashboard/admin/students/${student.id}`}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* ── Desktop table ─────────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-slate-800/30">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300 dark:border-white/20 cursor-pointer accent-indigo-600"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-10">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-40">
                Student Code
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                Full Name
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                Class
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                Gender
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                Guardian
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                Status
              </th>

            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
            {students.map((student: any, index: number) => {
              const isSelected = selectedIds.includes(student.id);
              const studentClass = student.classes?.[0]?.class;
              const rowNumber = (page - 1) * 10 + index + 1;
              const studentCode = student.studentCode
                ? String(student.studentCode).padStart(8, "0")
                : "—";

              return (
                <tr
                  key={student.id}
                  className={cn(
                    "group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors",
                    isSelected && "bg-indigo-50/50 dark:bg-indigo-500/5"
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300 dark:border-white/20 cursor-pointer accent-indigo-600"
                      checked={isSelected}
                      onChange={(e) => toggleSelect(e, student.id)}
                    />
                  </td>

                  {/* # sequential */}
                  <td className="px-3 py-3">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tabular-nums">
                      {rowNumber}
                    </span>
                  </td>

                  {/* Student code */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-700 dark:text-gray-300 tabular-nums font-medium tracking-wide">
                      {studentCode}
                    </span>
                  </td>

                  {/* Full Name + avatar */}
                  <td className="px-3 py-3">
                    <Link
                      href={`/dashboard/admin/students/${student.id}`}
                      className="flex items-center gap-2.5 group/link"
                    >
                      <div className="size-8 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        {student.profileImage ? (
                          <img
                            src={student.profileImage}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={14} className="text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate group-hover/link:text-indigo-600 transition-colors">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{student.email}</p>
                      </div>
                      {student.verified && (
                        <ShieldCheck size={13} className="text-blue-500 shrink-0" />
                      )}
                    </Link>
                  </td>

                  {/* Grade / Class */}
                  <td className="px-3 py-3">
                    {studentClass ? (
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {studentClass.name}
                        {studentClass.section ? `-${studentClass.section}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Gender */}
                  <td className="px-3 py-3">
                    <GenderBadge gender={student.gender} />
                  </td>

                  {/* Guardian */}
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {student.parentName || student.guardianName || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    <StatusDot verified={student.verified} />
                  </td>


                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ──────────────────────────────────────────────────── */}
      {selectedIds.length > 0 && (
        <div className="md:hidden flex items-center justify-between p-2.5 px-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 m-2.5 mb-1 shadow-2xs">
          <span>{selectedIds.length} student{selectedIds.length > 1 ? 's' : ''} selected</span>
          <button type="button" onClick={() => setSelectedIds([])} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Clear
          </button>
        </div>
      )}

      <div className="md:hidden flex flex-col gap-2.5 p-2.5 sm:p-4 bg-slate-50/50 dark:bg-slate-950/30">
        {students.map((student: any, index: number) => {
          const isSelected = selectedIds.includes(student.id);
          const studentClass = student.classes?.[0]?.class;
          const rowNumber = (page - 1) * 10 + index + 1;
          const studentCode = student.studentCode
            ? String(student.studentCode).padStart(8, "0")
            : "—";

          return (
            <div
              key={student.id}
              className={cn(
                "bg-white dark:bg-slate-900 border rounded-2xl p-3.5 shadow-2xs transition-all relative",
                isSelected 
                  ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-400" 
                  : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {/* Header row: Checkbox + Numbering + Student Code + Status */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-gray-300 dark:border-slate-700 cursor-pointer accent-indigo-600 shrink-0"
                    checked={isSelected}
                    onChange={(e) => toggleSelect(e, student.id)}
                  />
                  <span className="inline-flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tabular-nums border border-slate-200/70 dark:border-slate-700/70">
                    #{rowNumber}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                    {studentCode}
                  </span>
                </div>
                
                <StatusDot verified={student.verified} />
              </div>

              {/* Student main info: Avatar + Name + Email */}
              <Link
                href={`/dashboard/admin/students/${student.id}`}
                className="flex items-center gap-3 pt-3 group"
              >
                <div className="size-11 rounded-full overflow-hidden border-2 border-slate-200/80 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-indigo-400 transition-colors">
                  {student.profileImage ? (
                    <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {student.name}
                    </p>
                    {student.verified && (
                      <ShieldCheck size={13} className="text-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {student.email || "No email registered"}
                  </p>
                </div>

                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
              </Link>

              {/* Attributes / Details chips: Class, Gender, Parent/Guardian */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {studentClass ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                      <GraduationCap size={11} className="text-slate-400" />
                      {studentClass.name}{studentClass.section ? `-${studentClass.section}` : ""}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No class</span>
                  )}
                  <GenderBadge gender={student.gender} />
                </div>

                {(student.parentName || student.guardianName) && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Guardian:</span> {student.parentName || student.guardianName}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {students.length === 0 && (
        <div className="py-16 text-center flex flex-col items-center gap-3">
          <div className="size-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
            <GraduationCap size={28} />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-white">No Students Found</p>
          <p className="text-xs text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-slate-800/20 text-xs text-gray-500">
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {totalItems}
            </span>
          </span>

          <div className="flex items-center gap-1">
            <span className="mr-2 text-gray-400 hidden sm:inline-block">Rows per page: 10</span>
            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-lg border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
            </Button>

            {getPageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-gray-400">…</span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  className={cn(
                    "size-7 rounded-lg text-xs font-medium p-0",
                    p === page ? "text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  )}
                  style={p === page ? { backgroundColor: primaryColor } : {}}
                  onClick={() => onPageChange(p as number)}
                >
                  {p}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-lg border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
