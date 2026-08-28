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
      <div className="md:hidden flex flex-col divide-y divide-gray-100 dark:divide-white/5">
        {students.map((student: any, index: number) => {
          const isSelected = selectedIds.includes(student.id);
          const studentClass = student.classes?.[0]?.class;

          return (
            <div
              key={student.id}
              className={cn(
                "flex items-start gap-3 p-4 transition-colors",
                isSelected && "bg-indigo-50/40 dark:bg-indigo-500/5"
              )}
            >
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-gray-300 cursor-pointer accent-indigo-600"
                checked={isSelected}
                onChange={(e) => toggleSelect(e, student.id)}
              />
              <div className="size-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                {student.profileImage ? (
                  <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={15} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/dashboard/admin/students/${student.id}`}>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{student.name}</p>
                </Link>
                <p className="text-[11px] text-gray-400 truncate">{student.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {studentClass && (
                    <span className="text-[11px] text-gray-500 font-medium">
                      {studentClass.name}{studentClass.section ? `-${studentClass.section}` : ""}
                    </span>
                  )}
                  <GenderBadge gender={student.gender} />
                  <StatusDot verified={student.verified} />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="size-7 rounded-lg text-gray-400 shrink-0">
                <MoreHorizontal size={15} />
              </Button>
            </div>
          );
        })}
      </div>

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
            <span className="mr-2 text-gray-400">Rows per page: 10</span>
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
