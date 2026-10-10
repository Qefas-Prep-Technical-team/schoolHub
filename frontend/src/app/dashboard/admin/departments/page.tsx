'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Archive, 
  ChevronRight,
  Filter,
  Zap,
  Layers,
  ArrowRight,
  LayoutGrid,
  List,
  Users,
  GraduationCap,
  Activity,
  History,
  ShieldCheck,
  TrendingUp,
  Download,
  Info
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { departmentService, Department } from "./services/departmentService";
import { apiClient } from "@/lib/api/client";
import { useSchoolSettings, useSchoolStats, useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { generatePDF } from "@/utils/pdfGenerator";
import { format } from "date-fns";
import DepartmentModal from "./components/DepartmentModal";
import Pagination from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);
  
  const { user } = useAuthStore();
  const schoolIdFromStore = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const [schoolId, setSchoolId] = useState<string | null>(schoolIdFromStore || null);
  const { data: settings } = useSchoolSettings(schoolId || '');
  const { data: schoolStats } = useSchoolStats(schoolId || '');
  const { data: schoolProfile } = useSchoolProfile(schoolId || '');
  const primaryColor = settings?.themeColor || '#2563eb';

  const fetchSchoolId = useCallback(async () => {
    if (schoolId) return;
    if (!user?.email) return;
    try {
      const response = await apiClient.get(`/admin/admin-status/${user.email}`);
      const data = response.data;
      if (data.success && data.data.schoolAdmins?.[0]?.school?.id) {
        setSchoolId(data.data.schoolAdmins[0].school.id);
      }
    } catch (error) {
      console.error("Failed to fetch school ID:", error);
    }
  }, [user?.email, schoolId]);

  const fetchDepartments = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const data = await departmentService.getDepartments(schoolId);
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSchoolId();
  }, [fetchSchoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchDepartments();
    }
  }, [schoolId, fetchDepartments]);

  const handleSave = async (data: any) => {
    try {
      if (selectedDepartment) {
        await departmentService.updateDepartment(selectedDepartment.code, data);
        toast.success("Department updated successfully");
      } else {
        await departmentService.createDepartment(data);
        toast.success("Department created successfully");
      }
      fetchDepartments();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save department");
    }
  };

  const handleArchive = async (code: string) => {
    if (confirm("Are you sure you want to archive this department?")) {
      try {
        await departmentService.archiveDepartment(code);
        toast.success("Department archived successfully");
        fetchDepartments();
      } catch (error) {
        toast.error("Failed to archive department");
      }
    }
  };

  const handleExport = async (targetFormat: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const dataToExport = departments || [];
      if (!dataToExport || dataToExport.length === 0) {
        toast.info("No departments to export.");
        return;
      }
      
      const headers = ["#", "Department Name", "Code", "Subjects", "Classes", "Students"];
      const rows = dataToExport.map((dept, index) => [
        (index + 1).toString(),
        dept.name || "N/A",
        dept.code || "N/A",
        (dept.subjects?.length || 0).toString(),
        (dept._count?.classes || 0).toString(),
        (dept._count?.students || 0).toString()
      ]);

      const dateStr = format(new Date(), "yyyy-MM-dd");
      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || (user as any)?.tenant?.name || "School";
      const sanitizedSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileNameBase = `${sanitizedSchoolName}_departments_export_${dateStr}`;

      if (targetFormat === 'csv') {
        const csvContent = [];
        csvContent.push(`"${schoolName.toUpperCase()}"`);
        if (schoolProfile?.motto) csvContent.push(`"${schoolProfile.motto}"`);
        csvContent.push("");
        csvContent.push(`"Departments Report"`);
        csvContent.push(`"Generated on: ${dateStr}"`);
        csvContent.push("");

        const csvRows = dataToExport.map((dept, index) => [
          (index + 1).toString(),
          `"${(dept.name || "").replace(/"/g, '""')}"`,
          `"${(dept.code || "").replace(/"/g, '""')}"`,
          (dept.subjects?.length || 0).toString(),
          (dept._count?.classes || 0).toString(),
          (dept._count?.students || 0).toString()
        ]);
        
        csvContent.push(headers.join(","));
        csvRows.forEach(r => csvContent.push(r.join(",")));

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
          title: `School Departments Report`,
          filename: `${fileNameBase}.pdf`,
          schoolProfile,
          metaData: [
            { label: 'Date', value: dateStr },
            { label: 'Total Departments', value: dataToExport.length.toString() }
          ],
          tableHeaders: [headers],
          tableData: rows
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to export records as ${targetFormat.toUpperCase()}.`);
    } finally {
      setIsExporting(false);
    }
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDepartments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDepartments, currentPage]);

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12">
        
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">School Departments</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                  Departments<span style={{ color: primaryColor }}>.</span>
                </h1>
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none mt-2">
                                <Info size={28} strokeWidth={2.5} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl text-left">
                            Manage all academic departments within the institution.
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </div>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Manage your school's departments, assign coordinators, and organize academic subject mappings.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 w-full lg:w-auto mt-6 lg:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  disabled={isExporting}
                  variant="outline"
                  className="group w-full sm:w-auto h-14 md:h-16 px-6 md:px-8 rounded-xl font-bold tracking-wide gap-3 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-white/20 disabled:opacity-50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  {isExporting ? (
                    <div className="size-5 rounded-full border-2 border-slate-400 border-t-slate-800 dark:border-slate-600 dark:border-t-white animate-spin" />
                  ) : (
                    <Download size={20} strokeWidth={2.5} className="text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                  )}
                  {isExporting ? "Generating..." : "Export Data"}
                </Button>
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
            <Button 
              onClick={() => {
                setSelectedDepartment(null);
                setIsModalOpen(true);
              }}
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, #3b82f6)`,
                boxShadow: `0 10px 30px -10px ${primaryColor}80` 
              }}
              className="group w-full sm:w-auto h-14 md:h-16 px-6 md:px-8 rounded-xl text-white font-bold tracking-wide gap-3 hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden border-0"
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Plus size={22} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Department
            </Button>
          </div>
        </div>

        {/* Department & School Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Departments</p>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                        <Info size={14} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                    Number of functional academic departments currently active.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Layers size={20} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {departments.length}
                    </h3>
                    <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1">
                        <span>All operational</span>
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Teachers</p>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                        <Info size={14} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                    Total number of active teaching staff across all departments.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Users size={20} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {schoolStats?.teachers ?? 0}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <span>Across school</span>
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Subjects</p>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                        <Info size={14} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                    Total number of subjects configured across the school.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Zap size={20} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {schoolStats?.subjects ?? 0}
                    </h3>
                    <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1">
                        <span>Active curriculum</span>
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Students</p>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                        <Info size={14} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                    Total number of enrolled students across all departments.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="size-10 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                        <GraduationCap size={20} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {schoolStats?.students ?? 0}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <span>Enrolled</span>
                    </p>
                </div>
            </div>
        </div>

        {/* Operational Terminal Control */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-[2rem] lg:rounded-[2.5rem] bg-white dark:bg-[#15171e] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100/80 dark:border-white/5 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_40px_rgb(0,0,0,0.3)]">
            <div className="relative group w-full md:max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="text-slate-400 group-focus-within:text-primary transition-colors duration-300" size={20} strokeWidth={2.5} style={{ color: searchQuery ? primaryColor : undefined }} />
                </div>
                <input 
                    type="text" 
                    placeholder="Search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 border border-transparent focus:border-primary/30 dark:focus:border-primary/30 rounded-[1.5rem] pl-14 pr-6 text-[15px] font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none transition-all duration-300 focus:shadow-[0_0_0_4px_var(--tw-ring-color)]"
                    style={{ '--tw-ring-color': `${primaryColor}15` } as any}
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="flex w-full md:w-auto bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[1.2rem] md:rounded-2xl p-1.5 shadow-inner">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn("flex-1 md:flex-none h-11 md:size-12 rounded-[1rem] md:rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                    >
                      <LayoutGrid size={18} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn("flex-1 md:flex-none h-11 md:size-12 rounded-[1rem] md:rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                    >
                      <List size={18} strokeWidth={3} />
                    </button>
                 </div>
            </div>
        </div>

        {/* Departments List / Grid */}
        <AnimatePresence mode="wait">
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pt-4"
            >
              {viewMode === 'list' && (
                  <div className="hidden md:grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
                      <div>Department Details</div>
                      <div>Code</div>
                      <div className="text-center">Subjects</div>
                      <div className="text-center">Classes</div>
                      <div className="text-center">Students</div>
                      <div className="text-right">Actions</div>
                  </div>
              )}

              <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "flex flex-col bg-white dark:bg-slate-900 rounded-b-2xl border border-t-0 border-slate-200 dark:border-slate-800 shadow-sm"
              }>
                {loading ? (
                    viewMode === 'grid' 
                        ? [1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-2xl bg-slate-50 dark:bg-slate-800/50 animate-pulse border border-slate-100 dark:border-white/5" />)
                        : [1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800/50 animate-pulse border-b border-slate-100 dark:border-white/5" />)
                ) : filteredDepartments.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center col-span-full">
                        <Layers size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No departments found</p>
                    </div>
                ) : (
                    paginatedDepartments.map((dept, index) => {
                        const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                        if (viewMode === 'grid') {
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={dept.code} 
                                    onClick={() => {
                                        setSelectedDepartment(dept);
                                        setIsModalOpen(true);
                                    }}
                                    whileHover={{ y: -4, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.1)' }}
                                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col min-h-[200px] shadow-sm"
                                >
                                    {/* Top Header: Icon & Actions */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div 
                                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                        >
                                            <Building2 size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDepartment(dept);
                                                    setIsModalOpen(true);
                                                }}
                                                variant="ghost" 
                                                size="icon" 
                                                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleArchive(dept.code);
                                                }}
                                                variant="ghost" 
                                                size="icon" 
                                                className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-colors"
                                            >
                                                <Archive size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <div className="flex-1 mb-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                                                <span className="text-sm font-black text-slate-300 dark:text-slate-600">#{globalIndex}</span>
                                                {dept.name}
                                            </h3>
                                            <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">
                                                {dept.code}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {dept.description || "No description provided."}
                                        </p>
                                    </div>

                                    {/* Footer Metrics */}
                                    <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                    <Zap size={12} />
                                                    Subjects
                                                </span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {dept.subjects?.length || 0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                    <Users size={12} />
                                                    Students
                                                </span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {dept._count?.students || 0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 hidden sm:flex">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                                    <Layers size={12} />
                                                    Classes
                                                </span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {dept._count?.classes || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }

                        // LIST VIEW RENDER
                        return (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={dept.code}
                                onClick={() => {
                                    setSelectedDepartment(dept);
                                    setIsModalOpen(true);
                                }}
                                className="group relative grid grid-cols-1 md:grid-cols-[2.5fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                            >
                                {/* Absolute overlay for smooth hover background without breaking structure */}
                                <div className="absolute inset-0 bg-slate-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-none first:rounded-t-none last:rounded-b-2xl" />

                                <div className="relative z-10 flex items-center gap-4">
                                    <span className="font-mono text-sm font-bold text-slate-400 dark:text-slate-500 w-6">#{globalIndex}</span>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                                        <Building2 size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {dept.name}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {dept.description || "No description provided"}
                                        </span>
                                    </div>
                                </div>

                                <div className="relative z-10 hidden md:block">
                                    <span className="font-mono text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">
                                        {dept.code}
                                    </span>
                                </div>

                                <div className="relative z-10 hidden md:block text-center">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {dept.subjects?.length || 0}
                                    </span>
                                </div>

                                <div className="relative z-10 hidden md:block text-center">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {dept._count?.classes || 0}
                                    </span>
                                </div>

                                <div className="relative z-10 hidden md:block text-center">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {dept._count?.students || 0}
                                    </span>
                                </div>

                                <div className="relative z-10 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDepartment(dept);
                                            setIsModalOpen(true);
                                        }}
                                        variant="ghost" 
                                        size="icon"
                                        className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleArchive(dept.code);
                                        }}
                                        variant="ghost" 
                                        size="icon"
                                        className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                                    >
                                        <Archive size={14} />
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
              </div>
            </motion.div>
        </AnimatePresence>

        {/* Dynamic Pagination */}
        {filteredDepartments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            totalItems={filteredDepartments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            theme="blue"
          />
        )}

        {/* Verified School Schema Badge */}
        <div className="flex justify-center pt-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" strokeWidth={3} /> Verified School Schema
            </div>
        </div>
      </div>

      <DepartmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        department={selectedDepartment}
        schoolId={schoolId}
      />
    </div>
  );
}

