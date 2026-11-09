"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings, useSchoolTodayAttendance, useSchoolDepartments, useSchoolSubjects, useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useSubscriptionUsage } from "@/lib/api/hooks/useSubscriptionUsage";
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
  List,
  LayoutGrid,
  Users,
  Award,
  UserX,
  ArrowRightLeft,
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
import { StudentExportModal } from "./components/export/StudentExportModal";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { toast } from "react-toastify";

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
  const [lifecycleTab, setLifecycleTab] = useState<"ALL" | "ENROLLED" | "GRADUATED" | "EXPELLED" | "TRANSFERRED">("ALL");
  const activeFilters = useMemo(
    () => ({
      ...filters,
      lifecycleStatus: lifecycleTab !== "ALL" ? lifecycleTab : "",
    }),
    [filters, lifecycleTab]
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { data: departmentsData = [] } = useSchoolDepartments(schoolId);
  const { data: subjectsData = [] } = useSchoolSubjects(schoolId);
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const { data: subUsage } = useSubscriptionUsage();

  const isFreePlan = subUsage?.planName?.toUpperCase() === 'FREE';

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
  const hasFilters = Object.values(filters).some((v) => v !== "") || lifecycleTab !== "ALL";

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ classId: "", gender: "", status: "" });
    setLifecycleTab("ALL");
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
      tooltip: "The cumulative count of all enrolled students in the database, including both active and pending accounts.",
    },
    {
      label: "Active Students",
      value: studentStats?.verifiedCount ?? 0,
      icon: ShieldCheck,
      iconBg: "#d1fae5",
      iconColor: "#059669",
      note: "vs last semester",
      tooltip: "Students who have completed the onboarding process and possess verified platform credentials.",
    },
    {
      label: "On Leave",
      value: studentStats?.pendingCount ?? 0,
      icon: Zap,
      iconBg: "#fef3c7",
      iconColor: "#d97706",
      note: "This Semester",
      tooltip: "Students marked as pending or temporarily absent from active classroom participation.",
    },
    {
      label: "Avg Attendance",
      value: `${attendanceRate ?? 0}%`,
      icon: Activity,
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      note: "This Semester",
      tooltip: "The overall average attendance rate calculated from today's active roll calls across all classes.",
    },
  ];

  const lifecycleTabs = [
    {
      id: "ALL" as const,
      label: "All Students",
      count: studentStats?.allCount ?? studentStats?.total ?? 0,
      icon: Users,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      activeColor: "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600",
      badgeColor: "bg-white/20 text-white",
      inactiveBadge: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300",
    },
    {
      id: "ENROLLED" as const,
      label: "Enrolled",
      count: studentStats?.enrolledCount ?? 0,
      icon: ShieldCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      activeColor: "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600",
      badgeColor: "bg-white/20 text-white",
      inactiveBadge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300",
    },
    {
      id: "GRADUATED" as const,
      label: "Graduated",
      count: studentStats?.graduatedCount ?? 0,
      icon: GraduationCap,
      iconColor: "text-amber-600 dark:text-amber-400",
      activeColor: "bg-amber-600 text-white shadow-sm ring-1 ring-amber-600",
      badgeColor: "bg-white/20 text-white",
      inactiveBadge: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300",
    },
    {
      id: "EXPELLED" as const,
      label: "Expelled",
      count: studentStats?.expelledCount ?? 0,
      icon: UserX,
      iconColor: "text-rose-600 dark:text-rose-400",
      activeColor: "bg-rose-600 text-white shadow-sm ring-1 ring-rose-600",
      badgeColor: "bg-white/20 text-white",
      inactiveBadge: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300",
    },
    {
      id: "TRANSFERRED" as const,
      label: "Transferred",
      count: studentStats?.transferredCount ?? 0,
      icon: ArrowRightLeft,
      iconColor: "text-purple-600 dark:text-purple-400",
      activeColor: "bg-purple-600 text-white shadow-sm ring-1 ring-purple-600",
      badgeColor: "bg-white/20 text-white",
      inactiveBadge: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-3.5 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="w-full sm:w-[95%] max-w-[1600px] mx-auto space-y-4 sm:space-y-5">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Overview</h1>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                    Comprehensive student directory. Manage individual student records, track status updates, and filter down by class, department, or gender.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and monitor students</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              onClick={() => setOpen(true)}
              className="h-9 px-4 rounded-lg text-sm font-semibold text-white gap-2 shadow-sm w-full sm:w-auto"
              style={{ backgroundColor: primaryColor }}
            >
              <UserPlus size={14} />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-white/10 rounded-2xl p-3.5 sm:p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                  {stat.tooltip && (
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-gray-400 hover:text-primary transition-colors focus:outline-none">
                            <Info size={12} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                          {stat.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div
                  className="size-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
                >
                  <stat.icon size={15} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <p className="text-[11px] text-gray-400 mt-1">{stat.note}</p>
            </div>
          ))}
        </div>

        {/* Lifecycle Status Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar sm:pb-0">
          {lifecycleTabs.map((tab) => {
            const isSelected = lifecycleTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setLifecycleTab(tab.id);
                  setPage(1);
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer border",
                  isSelected
                    ? `${tab.activeColor} border-transparent`
                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/80"
                )}
              >
                <tab.icon size={15} className={isSelected ? "text-white" : tab.iconColor} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold tabular-nums transition-colors",
                    isSelected ? tab.badgeColor : tab.inactiveBadge
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-white/10 rounded-2xl shadow-2xs p-3 sm:p-3.5">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search Students"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
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
                  Reset
                </Button>
              )}
            </div>

            {/* Export and View Toggle */}
            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mt-1 md:mt-0">
              <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 shrink-0 h-9 items-center border border-gray-200 dark:border-white/5">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-1.5 rounded-md transition-all h-full flex items-center justify-center", viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700")}
                  title="List View"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-1.5 rounded-md transition-all h-full flex items-center justify-center", viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700")}
                  title="Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>

              <Button variant="outline" onClick={() => setIsExportModalOpen(true)} className="flex-1 md:flex-none h-9 px-4 rounded-lg text-sm font-medium gap-2 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50">
                <Download size={14} />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Table / Grid */}
        <div className={cn("bg-white dark:bg-slate-900 rounded-2xl shadow-2xs overflow-hidden", viewMode === "list" ? "border border-gray-150 dark:border-white/10" : "bg-transparent shadow-none dark:bg-transparent border-none")}>
          <StudentsTable
            searchTerm={searchTerm}
            filters={activeFilters}
            page={page}
            onPageChange={setPage}
            viewMode={viewMode}
          />
        </div>
      </div>

      <AddStudentDialog open={open} onOpenChange={setOpen} />

      <StudentExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        schoolId={schoolId}
        schoolProfile={schoolProfile}
        searchTerm={searchTerm}
        activeFilters={activeFilters}
        classFilters={classFilters}
        departmentsData={departmentsData}
        subjectsData={subjectsData}
        userName={user?.name}
        userRole={user?.role || "ADMIN"}
      />
    </div>
  );
}

