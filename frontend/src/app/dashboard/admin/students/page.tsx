"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings, useSchoolTodayAttendance } from "@/lib/api/hooks/useSchool";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/adminService";
import { apiClient } from "@/lib/api/client";
import {
  GraduationCap,
  UserPlus,
  Search,
  Download,
  ShieldCheck,
  Activity,
  Zap,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentsTable from "./components/StudentsTable";
import AddStudentDialog from "./components/AddStudentDialog";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#6366f1";

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ classId: "", gender: "", status: "" });

  useEffect(() => {
    if (searchParams.get("showAdd") === "true") setOpen(true);
  }, [searchParams]);

  const { data: studentStats } = useQuery({
    queryKey: ["school-students-stats", schoolId],
    queryFn: () => adminService.getSchoolStudents(schoolId!, 1, 1),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: todayAttendance = [] } = useSchoolTodayAttendance(schoolId);

  const attendanceRate = useMemo(() => {
    if (!todayAttendance.length) return null;
    const totalPresent = todayAttendance.reduce((sum, c) => sum + (c.present ?? 0), 0);
    const totalStudents = todayAttendance.reduce((sum, c) => sum + (c.total ?? 0), 0);
    if (totalStudents === 0) return null;
    return Math.round((totalPresent / totalStudents) * 100);
  }, [todayAttendance]);

  const { data: classesData = [] } = useQuery({
    queryKey: ["school-classes", schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${schoolId}`);
      return data.data || [];
    },
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 10,
  });

  const classFilters = [
    { id: "", name: "All Classes" },
    ...classesData.map((c: any) => ({
      id: c.id,
      name: `${c.name} ${c.section || ""}`.trim(),
    })),
  ];

  const genderOptions = ["MALE", "FEMALE", "OTHER"];
  const statusOptions = ["Verified", "Pending"];
  const hasFilters = Object.values(filters).some((v) => v !== "");

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ classId: "", gender: "", status: "" });
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const stats = [
    {
      label: "Total Students",
      value: studentStats?.total ?? 0,
      icon: GraduationCap,
      iconBg: "#ede9fe",
      iconColor: "#7c3aed",
      note: "vs last year",
    },
    {
      label: "Active Students",
      value: studentStats?.verifiedCount ?? 0,
      icon: ShieldCheck,
      iconBg: "#d1fae5",
      iconColor: "#059669",
      note: "vs last semester",
    },
    {
      label: "On Leave",
      value: studentStats?.pendingCount ?? 0,
      icon: Zap,
      iconBg: "#fef3c7",
      iconColor: "#d97706",
      note: "This Semester",
    },
    {
      label: "Avg Attendance",
      value: `${attendanceRate ?? 0}%`,
      icon: Activity,
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      note: "This Semester",
    },
  ];

  const handleExport = async () => {
    try {
      const result = await adminService.getSchoolStudents(schoolId!, 1, 10000, searchTerm, filters);
      const rows = result?.data || [];
      if (!rows.length) return;
      const headers = ["#", "Name", "Email", "Code", "Class", "Department", "Status"];
      const csv = [
        headers.join(","),
        ...rows.map((s: any, i: number) =>
          [
            i + 1,
            `"${s.name || ""}"`,
            `"${s.email || ""}"`,
            `"${s.studentCode || "UNASSIGNED"}"`,
            `"${s.classes?.[0]?.class?.name || ""} ${s.classes?.[0]?.class?.section || ""}"`,
            `"${s.department?.name || ""}"`,
            `"${s.verified ? "Verified" : "Pending"}"`,
          ].join(",")
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      /* silent */
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and monitor students</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                <div
                  className="size-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
                >
                  <stat.icon size={15} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <p className="text-[11px] text-gray-400 mt-1">{stat.note}</p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center gap-2 p-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search Students"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Class filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 px-3 rounded-lg text-sm font-medium gap-1.5 border-gray-200 dark:border-white/10 hover:bg-gray-50",
                    filters.classId ? "border-indigo-300 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {filters.classId ? classFilters.find((c) => c.id === filters.classId)?.name || "Class" : "Class"}
                  <ChevronDown size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-xl shadow-lg">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Filter by Class</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {classFilters.map((cls) => (
                  <DropdownMenuItem key={cls.id} onClick={() => handleFilterChange("classId", cls.id)} className={cn("text-sm rounded-lg", filters.classId === cls.id && "font-semibold")}>
                    {cls.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Gender filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 px-3 rounded-lg text-sm font-medium gap-1.5 border-gray-200 dark:border-white/10 hover:bg-gray-50",
                    filters.gender ? "border-indigo-300 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {filters.gender ? filters.gender.charAt(0) + filters.gender.slice(1).toLowerCase() : "Gender"}
                  <ChevronDown size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 rounded-xl shadow-lg">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Filter by Gender</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange("gender", "")} className="text-sm rounded-lg">All</DropdownMenuItem>
                {genderOptions.map((opt) => (
                  <DropdownMenuItem key={opt} onClick={() => handleFilterChange("gender", opt)} className={cn("text-sm rounded-lg", filters.gender === opt && "font-semibold")}>
                    {opt.charAt(0) + opt.slice(1).toLowerCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Status filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 px-3 rounded-lg text-sm font-medium gap-1.5 border-gray-200 dark:border-white/10 hover:bg-gray-50",
                    filters.status ? "border-indigo-300 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  {filters.status || "Status"}
                  <ChevronDown size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 rounded-xl shadow-lg">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange("status", "")} className="text-sm rounded-lg">All</DropdownMenuItem>
                {statusOptions.map((opt) => (
                  <DropdownMenuItem key={opt} onClick={() => handleFilterChange("status", opt)} className={cn("text-sm rounded-lg", filters.status === opt && "font-semibold")}>
                    {opt}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="h-9 px-3 rounded-lg text-sm text-gray-500 hover:text-red-500 gap-1.5">
                <X size={13} />
                Reset Filters
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" onClick={handleExport} className="h-9 px-4 rounded-lg text-sm font-medium gap-2 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50">
                <Download size={14} />
                Export
              </Button>
              <Button
                onClick={() => setOpen(true)}
                className="h-9 px-4 rounded-lg text-sm font-semibold text-white gap-2 shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <UserPlus size={14} />
                Add Student
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <StudentsTable
            searchTerm={searchTerm}
            filters={filters}
            page={page}
            onPageChange={setPage}
          />
        </div>
      </div>

      <AddStudentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

