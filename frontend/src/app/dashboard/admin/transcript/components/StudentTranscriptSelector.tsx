"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/adminService";
import { useClasses } from "@/lib/api/hooks/useClasses";
import { useSchoolDepartments } from "@/lib/api/hooks/useSchool";
import {
  GraduationCap,
  Search,
  Filter,
  Users,
  Building2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  ArrowRight,
  FileText,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StudentTranscriptSelectorProps {
  schoolId: string;
  onSelectStudent: (studentId: string) => void;
  primaryColor?: string;
}

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  gender?: string;
  verified?: boolean;
  department?: { id: string; name: string };
  classes?: Array<{
    class: {
      id: string;
      name: string;
      section?: string;
    };
  }>;
  profileImage?: string | null;
}

function StudentAvatar({ name, profileImage }: { name: string; profileImage?: string | null }) {
  const [hasError, setHasError] = useState(false);
  const initial = (name || "S").trim().charAt(0).toUpperCase();

  if (profileImage && !hasError) {
    return (
      <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 shadow-xs">
        <img
          src={profileImage}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60 shadow-xs select-none">
      {initial}
    </div>
  );
}

// ── SKELETON LOADERS ─────────────────────────────────────────────────────────

function StudentTableSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900/70 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Scholar</th>
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Class / Cohort</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-3 text-center">Gender</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-3.5 px-4 text-center">
                  <div className="h-4 w-4 bg-slate-200 dark:bg-zinc-800 rounded mx-auto" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                      <div className="h-3 w-44 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-5 w-20 bg-blue-100/60 dark:bg-blue-950/30 rounded-md" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
                </td>
                <td className="py-3.5 px-4">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                </td>
                <td className="py-3.5 px-3 text-center">
                  <div className="h-5 w-14 bg-slate-200 dark:bg-zinc-800 rounded-full mx-auto" />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="h-8 w-32 bg-slate-200 dark:bg-zinc-800 rounded-xl ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentMobileCardsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 space-y-3 animate-pulse shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-3 w-24 bg-blue-100/60 dark:bg-blue-950/30 rounded-md" />
            </div>
            <div className="h-5 w-12 bg-slate-200 dark:bg-zinc-800 rounded-full shrink-0" />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="h-5 w-24 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-4 w-20 bg-slate-100 dark:bg-zinc-800 rounded-md" />
          </div>
          <div className="h-9 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function StudentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 space-y-4 animate-pulse shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <div className="h-4 w-28 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                <div className="h-3 w-16 bg-blue-100/60 dark:bg-blue-950/30 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-12 bg-slate-200 dark:bg-zinc-800 rounded-full" />
          </div>
          <div className="space-y-2 py-2 border-y border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between">
              <div className="h-3 w-12 bg-slate-100 dark:bg-zinc-800 rounded" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-slate-100 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
          <div className="h-9 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function StudentTranscriptSelector({
  schoolId,
  onSelectStudent,
  primaryColor = "#2563eb",
}: StudentTranscriptSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    classId: string;
    departmentId: string;
    gender: string;
    status: string;
  }>({
    classId: "",
    departmentId: "",
    gender: "",
    status: "",
  });
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Debounce search term to prevent rapid request floods & flickering
  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setIsDebouncing(false);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Clean filter parameters (only non-empty values passed)
  const cleanFilters = useMemo(() => {
    const obj: Record<string, string> = {};
    if (filters.classId) obj.classId = filters.classId;
    if (filters.departmentId) obj.departmentId = filters.departmentId;
    if (filters.gender) obj.gender = filters.gender;
    if (filters.status) obj.status = filters.status;
    return obj;
  }, [filters]);

  // Fetch classes and departments for filters
  const { data: classesData = [], isLoading: isClassesLoading } = useClasses(schoolId);
  const { data: departmentsData = [], isLoading: isDepartmentsLoading } = useSchoolDepartments(schoolId);

  // Fetch school students
  const {
    data: studentsResponse,
    isLoading: isStudentsLoading,
    isFetching: isStudentsFetching,
  } = useQuery({
    queryKey: ["school-students-transcript-picker", schoolId, page, debouncedSearchTerm, cleanFilters],
    queryFn: () => adminService.getSchoolStudents(schoolId, page, 12, debouncedSearchTerm, cleanFilters),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 2,
  });

  const students: StudentRecord[] = studentsResponse?.data || [];
  const totalStudents = studentsResponse?.total || 0;
  const totalPages = studentsResponse?.totalPages || 1;

  const hasActiveFilters = Boolean(
    searchTerm || filters.classId || filters.departmentId || filters.gender || filters.status
  );

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setFilters({ classId: "", departmentId: "", gender: "", status: "" });
    setPage(1);
  };

  // Active filter pills for quick 1-click removal
  const activeFiltersList = useMemo(() => {
    const list: { key: string; label: string; onRemove: () => void }[] = [];
    if (debouncedSearchTerm) {
      list.push({
        key: "search",
        label: `Search: "${debouncedSearchTerm}"`,
        onRemove: () => {
          setSearchTerm("");
          setDebouncedSearchTerm("");
          setPage(1);
        },
      });
    }
    if (filters.classId) {
      const cls = classesData.find((c: any) => c.id === filters.classId);
      list.push({
        key: "class",
        label: `Class: ${cls ? `${cls.name} ${cls.section || ""}`.trim() : "Selected Class"}`,
        onRemove: () => handleFilterChange("classId", ""),
      });
    }
    if (filters.departmentId) {
      const dept = departmentsData.find((d: any) => d.id === filters.departmentId);
      list.push({
        key: "department",
        label: `Dept: ${dept ? dept.name : "Selected Dept"}`,
        onRemove: () => handleFilterChange("departmentId", ""),
      });
    }
    if (filters.gender) {
      list.push({
        key: "gender",
        label: `Gender: ${filters.gender === "MALE" ? "Male" : "Female"}`,
        onRemove: () => handleFilterChange("gender", ""),
      });
    }
    if (filters.status) {
      list.push({
        key: "status",
        label: "Status: Verified Only",
        onRemove: () => handleFilterChange("status", ""),
      });
    }
    return list;
  }, [debouncedSearchTerm, filters, classesData, departmentsData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── 1. Top Metrics Banner ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Total Scholars
            </span>
            <Users size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isStudentsLoading ? <Skeleton className="h-8 w-16" /> : totalStudents}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            Active roster candidates
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Active Classes
            </span>
            <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isClassesLoading ? <Skeleton className="h-8 w-12" /> : classesData.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            Classroom cohorts
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Academic Standard
            </span>
            <Award size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
            5.00 CGPA
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
            WAEC / Universal Scale
          </p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Certification Mode
            </span>
            <ShieldCheck size={16} className="text-amber-500" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate">
            Registrar Seal
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            Institutional verification
          </p>
        </div>
      </div>

      {/* ── 2. Filter & Search Controls ──────────────────────────────────── */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Live Debounced Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
            />
            <Input
              type="text"
              placeholder="Search scholar by name, student code (e.g. STU-...), or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setDebouncedSearchTerm(searchTerm.trim());
                  setIsDebouncing(false);
                  setPage(1);
                }
              }}
              className="pl-10 pr-10 h-10 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-medium focus-visible:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {(isDebouncing || isStudentsFetching) && (
                <Loader2 size={13} className="text-blue-600 animate-spin" />
              )}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setPage(1);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
                )}
                title="Table List View"
              >
                <List size={15} />
                <span className="text-xs">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
                )}
                title="Card Grid View"
              >
                <LayoutGrid size={15} />
                <span className="text-xs">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters (Mobile Stack, Desktop Grid/Flex) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          {/* Class Filter */}
          <div>
            {isClassesLoading ? (
              <div className="w-full h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
            ) : (
              <select
                value={filters.classId}
                onChange={(e) => handleFilterChange("classId", e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">All Classes & Arms</option>
                {classesData.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section ? `(${cls.section})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Department Filter */}
          <div>
            {isDepartmentsLoading ? (
              <div className="w-full h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
            ) : (
              <select
                value={filters.departmentId}
                onChange={(e) => handleFilterChange("departmentId", e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">All Departments</option>
                {departmentsData.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange("gender", e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male Scholars</option>
              <option value="FEMALE">Female Scholars</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">All Verification Statuses</option>
              <option value="verified">Verified Only</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips / Reset */}
        {activeFiltersList.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal size={12} />
              Active Filters:
            </span>
            {activeFiltersList.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs"
              >
                <span>{item.label}</span>
                <button
                  type="button"
                  onClick={item.onRemove}
                  className="hover:text-blue-950 dark:hover:text-white p-0.5 rounded transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline ml-auto flex items-center gap-1 py-1 px-1.5"
            >
              <RotateCcw size={11} />
              <span>Reset all</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Students Table / Grid / Mobile Cards ───────────────────────── */}
      {isStudentsLoading ? (
        viewMode === "list" ? (
          <>
            <div className="hidden sm:block">
              <StudentTableSkeleton />
            </div>
            <div className="block sm:hidden">
              <StudentMobileCardsSkeleton />
            </div>
          </>
        ) : (
          <StudentGridSkeleton />
        )
      ) : students.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Users size={26} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            No scholars match your criteria
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting a different class arm, or resetting your filters.
          </p>
          {hasActiveFilters && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="rounded-xl text-xs font-bold h-9 px-4 gap-1.5"
              >
                <RotateCcw size={12} />
                <span>Clear all filters</span>
              </Button>
            </div>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* ── List View: Desktop Table + Mobile Cards ─────────────────────── */
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block bg-white dark:bg-zinc-900/70 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Scholar</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Class / Cohort</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-3 text-center">Gender</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {students.map((student, idx) => {
                    const currentClass =
                      student.classes?.[0]?.class?.name
                        ? `${student.classes[0].class.name} ${student.classes[0].class.section || ""}`.trim()
                        : "Unassigned";

                    return (
                      <tr
                        key={student.id}
                        onClick={() => onSelectStudent(student.id)}
                        className="hover:bg-blue-50/40 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                          {(page - 1) * 12 + idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <StudentAvatar name={student.name} profileImage={student.profileImage} />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {student.name}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                {student.email || "No email on record"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {student.studentCode || "—"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-zinc-300">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                            {currentClass}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                          {student.department?.name || "General Studies"}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {student.gender || "—"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStudent(student.id);
                            }}
                            className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 ml-auto group-hover:shadow-md group-hover:shadow-blue-600/20 transition-all cursor-pointer"
                          >
                            <FileText size={13} />
                            <span>Preview Transcript</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Optimized Cards List */}
          <div className="block sm:hidden space-y-3">
            {students.map((student) => {
              const currentClass =
                student.classes?.[0]?.class?.name
                  ? `${student.classes[0].class.name} ${student.classes[0].class.section || ""}`.trim()
                  : "Unassigned";

              return (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student.id)}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800/60 shadow-xs space-y-3 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <StudentAvatar name={student.name} profileImage={student.profileImage} />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {student.name}
                        </h4>
                        <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {student.studentCode || "No ID"}
                        </p>
                      </div>
                    </div>
                    {student.gender && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                        {student.gender}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                      {currentClass}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate max-w-[150px]">
                      {student.department?.name || "General"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStudent(student.id);
                    }}
                    className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText size={14} />
                    <span>Preview Transcript</span>
                    <ArrowRight size={13} />
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* ── Grid View ───────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {students.map((student) => {
            const currentClass =
              student.classes?.[0]?.class?.name
                ? `${student.classes[0].class.name} ${student.classes[0].class.section || ""}`.trim()
                : "Unassigned";

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className="group p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <StudentAvatar name={student.name} profileImage={student.profileImage} />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {student.name}
                      </h4>
                      <p className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {student.studentCode || "N/A"}
                      </p>
                    </div>
                  </div>
                  {student.gender && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                      {student.gender}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs py-2 border-y border-slate-100 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                    <span className="text-[11px]">Class:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{currentClass}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                    <span className="text-[11px]">Department:</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[150px]">
                      {student.department?.name || "General"}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStudent(student.id);
                  }}
                  className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 group-hover:shadow-md group-hover:shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Preview Transcript</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. Pagination Controls ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
          <p className="text-slate-500 dark:text-zinc-400 text-center sm:text-left">
            Showing Page <span className="font-bold text-slate-800 dark:text-zinc-200">{page}</span> of{" "}
            <span className="font-bold text-slate-800 dark:text-zinc-200">{totalPages}</span> ({totalStudents} total scholars)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 px-3.5 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-800"
            >
              <ChevronLeft size={14} className="mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 px-3.5 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-800"
            >
              Next
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
