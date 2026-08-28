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
  Download
} from "lucide-react";
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
import { useSchoolSettings, useSchoolStats } from "@/lib/api/hooks/useSchool";
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
  
  const { user } = useAuthStore();
  const schoolIdFromStore = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const [schoolId, setSchoolId] = useState<string | null>(schoolIdFromStore || null);
  const { data: settings } = useSchoolSettings(schoolId || '');
  const { data: schoolStats } = useSchoolStats(schoolId || '');
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

  const handleExportPDF = () => {
    setIsExporting(true);

    // Create a temporary hidden iframe to prevent pop-up blocking
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      toast.error("Failed to generate PDF export.");
      setIsExporting(false);
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>School Departments Report</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
            }
            .title {
              font-size: 28px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: -0.5px;
              margin: 0;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              border-bottom: 2px solid #cbd5e1;
              text-align: left;
              padding: 12px 16px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #475569;
              letter-spacing: 0.5px;
            }
            td {
              padding: 16px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }
            .code {
              font-family: monospace;
              font-weight: 700;
              background-color: #f1f5f9 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
            }
            .metric {
              font-weight: 700;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">School Departments Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()} | Verified School Schema</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Code</th>
                <th>Subjects</th>
                <th>Classes</th>
                <th>Students</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${departments.map(dept => `
                <tr>
                  <td><strong>${dept.name}</strong></td>
                  <td><span class="code">${dept.code}</span></td>
                  <td class="metric">${dept.subjects?.length || 0}</td>
                  <td class="metric">${dept._count?.classes || 0}</td>
                  <td class="metric">${dept._count?.students || 0}</td>
                  <td><em>${dept.description || 'No description provided.'}</em></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Qefas Prep Hub © ${new Date().getFullYear()} - Administrative Management Suite
          </div>
        </body>
      </html>
    `;

    doc.write(htmlContent);
    doc.close();

    // Trigger printing once loaded
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      
      // Cleanup after print dialog opens
      setTimeout(() => {
        document.body.removeChild(iframe);
        setIsExporting(false);
      }, 1000);
    }, 1500); // Elegant 1.5s delay to display loading micro-animation
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
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">School Departments</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Departments<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Manage your school's departments, assign coordinators, and organize academic subject mappings.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
              className="h-16 px-10 rounded-[2rem] font-black uppercase tracking-widest gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="size-5 rounded-full border-2 border-slate-400 border-t-slate-800 animate-spin" />
              ) : (
                <Download size={20} strokeWidth={3} />
              )}
              {isExporting ? "Generating..." : "Export PDF"}
            </Button>
            <Button 
              onClick={() => {
                setSelectedDepartment(null);
                setIsModalOpen(true);
              }}
              style={{ backgroundColor: primaryColor }}
              className="h-16 px-10 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Add Department
            </Button>
          </div>
        </div>

        {/* Department & School Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Departments</p>
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
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Teachers</p>
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
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Subjects</p>
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
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Students</p>
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
        <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="relative group flex-1 max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-3xl focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                />
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-inner">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                    >
                      <LayoutGrid size={20} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                    >
                      <List size={20} strokeWidth={3} />
                    </button>
                 </div>
                 <Button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    variant="outline" 
                    className="h-16 px-8 rounded-3xl border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-3 hidden sm:flex hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                 >
                    {isExporting ? (
                      <div className="size-4 rounded-full border-2 border-slate-400 border-t-slate-800 animate-spin" />
                    ) : (
                      <Download size={18} strokeWidth={3} />
                    )}
                    {isExporting ? "Generating..." : "Export PDF"}
                 </Button>
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
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
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

