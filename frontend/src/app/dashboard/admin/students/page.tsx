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
import { AnimatePresence, motion } from "framer-motion";
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

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFilters, setExportFilters] = useState({ classId: "", departmentId: "", subjectId: "" });
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);

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

  const generatePDFHeaderAndFooter = async (doc: any, title: string, orientation: 'portrait' | 'landscape' = 'portrait') => {
    const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || 'Qefas Prep School';
    const address = schoolProfile?.address || 'School Address Not Provided';
    const motto = schoolProfile?.motto || '';
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Add decorative background elements
    doc.setFillColor(241, 245, 249); // slate-100
    doc.circle(pageWidth, 0, 40, 'F');
    doc.setFillColor(226, 232, 240); // slate-200
    doc.circle(pageWidth, 0, 25, 'F');
    doc.setFillColor(248, 250, 252); // slate-50
    doc.circle(0, pageHeight, 60, 'F');
    
    // Header
    if (schoolProfile?.logo) {
        try {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = schoolProfile.logo;
            await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
            doc.addImage(img, 'PNG', pageWidth - 45, 10, 30, 30);
        } catch(e) {}
    }
    
    let yPos = 22;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(schoolName, 14, yPos);
    yPos += 7;
    
    if (motto) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`"${motto}"`, 14, yPos);
        yPos += 6;
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(address, 14, yPos);
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(title.toUpperCase(), 14, yPos);
    yPos += 7;
    
    // Horizontal line
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.line(14, yPos, pageWidth - 14, yPos);
    
    return yPos + 10; // startY for table
  };

  const addSignatureBlock = (doc: any, finalY: number) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const yPos = finalY + 30;
    doc.text('_________________________________', 14, yPos);
    doc.text('Authorized Signature', 14, yPos + 6);
    
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Date Generated: ${dateStr}`, doc.internal.pageSize.width - 14, yPos + 6, { align: 'right' });
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(format);
    try {
      const exportLimit = isFreePlan ? 10 : 10000;
      const result = await adminService.getSchoolStudents(schoolId!, 1, exportLimit, searchTerm, {
        ...filters,
        ...exportFilters
      });
      const rows = result?.data || [];
      if (!rows.length) {
        toast.info("No students found to export.");
        setIsExporting(null);
        return;
      }
      const headers = ["#", "Name", "Email", "Code", "Class", "Department", "Status"];
      const tableRows = rows.map((s: any, i: number) => [
        (i + 1).toString(),
        s.name || "",
        s.email || "",
        s.studentCode || "UNASSIGNED",
        `${s.classes?.[0]?.class?.name || ""} ${s.classes?.[0]?.class?.section || ""}`.trim(),
        s.department?.name || "",
        s.verified ? "Verified" : "Pending",
      ]);

      const schoolNameStr = (schoolProfile?.name || user?.schools?.[0]?.name || 'School').replace(/\s+/g, '_');
      const dateStr = new Date().toISOString().split("T")[0];
      const year = new Date().getFullYear();
      const fileNameBase = `${schoolNameStr}_students_${dateStr}_${year}`;

      if (format === 'csv') {
        const csv = [
          headers.join(","),
          ...tableRows.map((row: any[]) => row.map((c: any) => `"${c}"`).join(",")),
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileNameBase}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const { jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF('landscape');
        
        const startY = await generatePDFHeaderAndFooter(doc, 'STUDENTS PROFILES', 'landscape');

        autoTable(doc, { 
          head: [headers], 
          body: tableRows, 
          startY: startY, 
          theme: 'grid', 
          styles: { lineColor: [150, 150, 150], lineWidth: 0.3 }, 
          headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], lineColor: [150, 150, 150], lineWidth: 0.3 } 
        });
        
        addSignatureBlock(doc, (doc as any).lastAutoTable.finalY);
        doc.save(`${fileNameBase}.pdf`);
      }
      setIsExportModalOpen(false);
    } catch {
      toast.error("Failed to export students");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 lg:p-8 transition-colors duration-300">
      <div className="w-[95%] max-w-[1600px] mx-auto space-y-5">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Overview</h1>
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
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm p-3">
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

            {/* Export */}
            <div className="flex items-center shrink-0 w-full md:w-auto mt-1 md:mt-0">
              <Button variant="outline" onClick={() => setIsExportModalOpen(true)} className="w-full md:w-auto h-9 px-4 rounded-lg text-sm font-medium gap-2 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50">
                <Download size={14} />
                Export
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

      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Export Students</h2>
              <p className="text-sm text-gray-500 mb-5">Filter which students you want to export.</p>

              {isFreePlan && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    <span className="font-bold">Free Plan Limit:</span> You can only export a maximum of 10 students at a time. Upgrade your plan for unlimited exports.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Class Filter</label>
                  <select value={exportFilters.classId} onChange={(e) => setExportFilters(p => ({ ...p, classId: e.target.value }))} className="w-full h-9 px-2 text-sm border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                    <option value="">All Classes</option>
                    {classFilters.filter(c => c.id).map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Department Filter</label>
                  <select value={exportFilters.departmentId} onChange={(e) => setExportFilters(p => ({ ...p, departmentId: e.target.value }))} className="w-full h-9 px-2 text-sm border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                    <option value="">All Departments</option>
                    {departmentsData.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Subject Filter</label>
                  <select value={exportFilters.subjectId} onChange={(e) => setExportFilters(p => ({ ...p, subjectId: e.target.value }))} className="w-full h-9 px-2 text-sm border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
                    <option value="">All Subjects</option>
                    {subjectsData.map((subj: any) => (
                      <option key={subj.id} value={subj.id}>{subj.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleExport('csv')} disabled={isExporting !== null} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-sm font-semibold transition-colors disabled:opacity-50">
                    {isExporting === 'csv' ? <span className="animate-spin h-4 w-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" /> : <Download size={16} />} CSV
                  </button>
                  <button onClick={() => handleExport('pdf')} disabled={isExporting !== null} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-sm font-semibold transition-colors disabled:opacity-50">
                    {isExporting === 'pdf' ? <span className="animate-spin h-4 w-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full" /> : <Download size={16} />} PDF
                  </button>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 rounded-xl font-semibold text-sm" onClick={() => setIsExportModalOpen(false)} disabled={isExporting !== null}>Cancel</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

