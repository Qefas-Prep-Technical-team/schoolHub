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
            <div className="p-10 rounded-[3rem] bg-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Building2 size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner text-[#38bdf8]">
                        <Layers size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Departments</p>
                        <h3 className="text-4xl font-black tracking-tighter uppercase">{departments.length}</h3>
                    </div>
                </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Users size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-primary">
                        <Users size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Teachers</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                            {schoolStats?.teachers ?? 0}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <GraduationCap size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-emerald-600">
                        <Zap size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Subjects</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                            {schoolStats?.subjects ?? 0}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Building2 size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-[#ec4899]">
                        <Building2 size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Students</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                            {schoolStats?.students ?? 0}
                        </h3>
                    </div>
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

        {/* Departments List Table */}
        <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
                <motion.div 
                    key="list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department Name</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Code</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subjects</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classes</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Students</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="size-16 rounded-full border-4 border-slate-100 dark:border-white/5 border-t-primary animate-spin" style={{ borderTopColor: primaryColor }} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading departments...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredDepartments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-30">
                                                <Layers size={80} strokeWidth={1} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">No departments found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDepartments.map((dept, index) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={dept.code} 
                                            className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all duration-300"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="size-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                                                            {dept.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="inline-flex px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 font-mono text-xs font-black text-slate-500">
                                                    {dept.code}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center dark:bg-indigo-500/20 dark:text-indigo-400">
                                                        <Zap size={14} />
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">
                                                        {dept.subjects?.length || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center dark:bg-emerald-500/20 dark:text-emerald-400">
                                                        <Layers size={14} />
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">
                                                        {dept._count?.classes || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center dark:bg-rose-500/20 dark:text-rose-400">
                                                        <Users size={14} />
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">
                                                        {dept._count?.students || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="max-w-[240px] truncate text-sm font-medium text-slate-500 leading-relaxed italic">
                                                    "{dept.description || "No description provided."}"
                                                </p>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                    <Button 
                                                        onClick={() => {
                                                            setSelectedDepartment(dept);
                                                            setIsModalOpen(true);
                                                        }}
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-12 rounded-2xl hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                                    >
                                                        <Edit2 size={18} className="text-slate-400" />
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleArchive(dept.code)}
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-12 rounded-2xl hover:bg-rose-500 hover:text-white shadow-sm border border-transparent transition-all"
                                                    >
                                                        <Archive size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {loading ? (
                         [1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-[3.5rem] bg-white dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)
                    ) : paginatedDepartments.map((dept, index) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            key={dept.code} 
                            onClick={() => {
                                setSelectedDepartment(dept);
                                setIsModalOpen(true);
                            }}
                            className="group relative overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                        >
                             <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] -mt-10 -mr-10 transition-colors duration-700" style={{ backgroundColor: `${primaryColor}10` }} />
                             
                             <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                                        <Building2 size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        {dept.code}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-[1.1] uppercase tracking-tighter mb-3" style={{ '--primary': primaryColor } as any}>
                                        {dept.name}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 line-clamp-2 italic">
                                        "{dept.description || "No description provided."}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-slate-50 dark:border-white/5">
                                    <div className="space-y-1 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100/50 dark:border-white/5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Subjects</span>
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{dept.subjects?.length || 0}</span>
                                    </div>
                                    <div className="space-y-1 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100/50 dark:border-white/5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Classes</span>
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{dept._count?.classes || 0}</span>
                                    </div>
                                    <div className="space-y-1 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100/50 dark:border-white/5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Students</span>
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{dept._count?.students || 0}</span>
                                    </div>
                                    <div className="space-y-1 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100/50 dark:border-white/5">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Exams</span>
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{dept._count?.exams || 0}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to Edit Department</span>
                                    <div 
                                        className="size-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:text-white text-slate-400 transition-all duration-500 shadow-sm group-hover:bg-[var(--hover-bg)]" 
                                        style={{ '--hover-bg': primaryColor } as any}
                                    >
                                        <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                             </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
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

