'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { generatePDF } from '@/utils/pdfGenerator';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  BookOpen, 
  Layers, 
  Zap, 
  MoreVertical, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Download,
  BookMarked,
  Cpu,
  Globe,
  Lock,
  Trash2,
  Edit2,
  Info
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import SubjectCard from "./components/SubjectCard";
import SubjectModal from "./components/SubjectModal";
import DeleteSubjectModal from "./components/DeleteSubjectModal";
import { subjectService, Subject } from "./services/subjectService";
import { departmentService, Department } from "../departments/services/departmentService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { apiClient } from "@/lib/api/client";
import { useSchoolSettings, useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SubjectsPage = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedScope, setSelectedScope] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // States for custom Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetSubject, setDeleteTargetSubject] = useState<Subject | null>(null);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode("grid");
    }
  }, []);

  useEffect(() => {
    if (schoolId) {
      fetchData();
    }
  }, [schoolId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsData, departmentsData] = await Promise.all([
        subjectService.getSubjects(schoolId),
        departmentService.getDepartments(schoolId)
      ]);
      
      setSubjects(subjectsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubject = (id: string) => {
    setSelectedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubjectIds.length === filteredSubjects.length) {
      setSelectedSubjectIds([]);
    } else {
      setSelectedSubjectIds(filteredSubjects.map(sub => sub.id));
    }
  };

  const handleDeleteSubject = (id: string) => {
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;
    setDeleteTargetSubject(sub);
    setIsBulkDeleteMode(false);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteSubject = async () => {
    if (!deleteTargetSubject) return;
    try {
      await subjectService.archiveSubject(deleteTargetSubject.id);
      toast.success("Subject successfully deleted/archived.");
      setSelectedSubjectIds(prev => prev.filter(x => x !== deleteTargetSubject.id));
      await fetchData();
    } catch (error) {
      console.error("Failed to delete subject", error);
      toast.error("Failed to delete subject.");
      throw error;
    }
  };

  const handleBulkDelete = () => {
    if (selectedSubjectIds.length === 0) return;
    setIsBulkDeleteMode(true);
    setDeleteTargetSubject(null);
    setIsDeleteModalOpen(true);
  };

  const executeBulkDelete = async () => {
    if (selectedSubjectIds.length === 0) return;
    try {
      await Promise.all(selectedSubjectIds.map(id => subjectService.archiveSubject(id)));
      toast.success("Successfully deleted selected subjects.");
      setSelectedSubjectIds([]);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete subjects", error);
      toast.error("Failed to delete some subjects.");
      throw error;
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesSearch = 
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "all" || 
          subject.departments?.some(d => d.departmentId === selectedDepartment);
      const matchesScope = selectedScope === "all" || subject.scope === selectedScope;
      
      return matchesSearch && matchesDepartment && matchesScope;
    });
  }, [subjects, searchQuery, selectedDepartment, selectedScope]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment, selectedScope]);

  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / itemsPerPage));
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleView = (subject: Subject) => {
    router.push(`/dashboard/admin/subjects/${subject.id}`);
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

    const handleExport = async (targetFormat: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const dataToExport = filteredSubjects || [];
      if (!dataToExport || dataToExport.length === 0) {
        toast.info("No subjects to export.");
        return;
      }
      
      const headers = ["#", "Subject Name", "Code", "Teachers", "Classes", "Scope"];
      const rows = dataToExport.map((sub, index) => [
        (index + 1).toString(),
        sub.name || "N/A",
        sub.code || "N/A",
        (sub.teachersCount || 0).toString(),
        (sub.classesCount || 0).toString(),
        sub.scope === 'SCHOOL' ? 'School-wide' : 'Private'
      ]);

      const dateStr = format(new Date(), "yyyy-MM-dd");
      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || (user as any)?.tenant?.name || "School";
      const sanitizedSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileNameBase = `${sanitizedSchoolName}_subjects_export_${dateStr}`;

      if (targetFormat === 'csv') {
        const csvContent = [];
        csvContent.push(`"${schoolName.toUpperCase()}"`);
        if (schoolProfile?.motto) csvContent.push(`"${schoolProfile.motto}"`);
        csvContent.push("");
        csvContent.push(`"Subjects Report"`);
        csvContent.push(`"Generated on: ${dateStr}"`);
        csvContent.push("");

        const csvRows = dataToExport.map((sub, index) => [
          (index + 1).toString(),
          `"${(sub.name || "").replace(/"/g, '""')}"`,
          `"${(sub.code || "").replace(/"/g, '""')}"`,
          (sub.teachersCount || 0).toString(),
          (sub.classesCount || 0).toString(),
          sub.scope === 'SCHOOL' ? 'School-wide' : 'Private'
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
          title: `School Subjects Report`,
          filename: `${fileNameBase}.pdf`,
          schoolProfile,
          metaData: [
            { label: 'Date', value: dateStr },
            { label: 'Total Subjects', value: dataToExport.length.toString() }
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


  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curriculum Management</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Subjects<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Manage your school curriculum, departmental alignment, and academic subject planning.
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
              onClick={handleCreate}
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, #3b82f6)`,
                boxShadow: `0 10px 30px -10px ${primaryColor}80` 
              }}
              className="group w-full sm:w-auto h-14 md:h-16 px-6 md:px-8 rounded-xl text-white font-bold tracking-wide gap-3 hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden border-0"
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Plus size={22} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
              Add New Subject
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
                    <div 
                        className="size-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                        <BookOpen size={20} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {subjects.length}
                    </h3>
                    <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1">
                        <span>Active curriculum</span>
                    </p>
                </div>
            </div>

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
                    <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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

            <div className="col-span-2 md:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">System Status</p>
                        <TooltipProvider>
                            <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                        <Info size={14} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                                    Current status of the subject synchronization system.
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <ShieldCheck size={20} strokeWidth={2.5} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Active
                    </h3>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <span>Last sync: just now</span>
                    </p>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 rounded-[2rem] lg:rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="relative group w-full xl:max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 md:h-16 pl-14 md:pl-16 pr-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[1.5rem] md:rounded-[2rem] focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                />
            </div>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full xl:w-auto">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
                  <Select value={selectedScope} onValueChange={setSelectedScope}>
                      <SelectTrigger className="flex-1 md:flex-none h-14 md:h-16 md:w-[200px] rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 px-6 md:px-8 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <Filter className="w-4 h-4 text-emerald-500" />
                            <SelectValue placeholder="All Types" />
                          </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 p-2 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                          <SelectItem value="all" className="rounded-xl py-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
                            All Types
                          </SelectItem>
                          <SelectItem value="SCHOOL" className="rounded-xl py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Globe size={14} className="text-slate-400" /> School-wide
                              </div>
                          </SelectItem>
                          <SelectItem value="PERSONAL" className="rounded-xl py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Lock size={14} className="text-slate-400" /> Private
                              </div>
                          </SelectItem>
                      </SelectContent>
                  </Select>

                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="flex-1 md:flex-none h-14 md:h-16 md:w-[240px] rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 px-6 md:px-8 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <Layers className="w-4 h-4 text-[#5B5CE6]" />
                            <SelectValue placeholder="All Departments" />
                          </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-[1.5rem] border border-slate-100 dark:border-white/5 p-2 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                          <SelectItem value="all" className="rounded-xl py-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
                            All Departments
                          </SelectItem>
                          {departments.map(dep => (
                              <SelectItem key={dep.id} value={dep.departmentId || dep.id} className="rounded-xl py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
                                {dep.name}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>

                
            </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedSubjectIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-200"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <input
                type="checkbox"
                checked={selectedSubjectIds.length === filteredSubjects.length}
                onChange={handleSelectAll}
                className="size-5 rounded border-red-300 text-red-600 focus:ring-red-500/20 cursor-pointer"
              />
              <span className="text-sm font-black uppercase tracking-wider">
                {selectedSubjectIds.length} {selectedSubjectIds.length === 1 ? "Subject" : "Subjects"} Selected
              </span>
            </div>
            <Button
              onClick={handleBulkDelete}
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest gap-2"
            >
              <Trash2 size={16} />
              Delete Selected
            </Button>
          </motion.div>
        )}

        {/* Subjects List */}
        <AnimatePresence mode="wait">
          {loading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 rounded-[4rem] bg-white dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                              <th className="p-4 w-12"><div className="h-4 w-4 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                              <th className="p-4"><div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                              <th className="p-4 text-center"><div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                              <th className="p-4"><div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                              <th className="p-4 text-center"><div className="h-4 w-12 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                              <th className="p-4 text-center"><div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                              <th className="p-4 w-24"><div className="h-4 w-12 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800/40">
                                  <td className="p-4 text-center"><div className="h-4 w-4 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                                  <td className="p-4">
                                      <div className="flex items-center gap-4">
                                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 animate-pulse" />
                                          <div className="space-y-2">
                                              <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                              <div className="h-3 w-48 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-4 text-center"><div className="h-6 w-16 rounded-lg bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                                  <td className="p-4"><div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" /></td>
                                  <td className="p-4 text-center"><div className="h-4 w-8 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                                  <td className="p-4 text-center"><div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                                  <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            )
          ) : filteredSubjects.length > 0 ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pt-4"
            >
              {viewMode === 'list' && (
                  <div className="hidden md:grid grid-cols-[auto_2.5fr_1.5fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
                      <div className="flex justify-center items-center">
                          <input
                              type="checkbox"
                              checked={selectedSubjectIds.length === filteredSubjects.length && filteredSubjects.length > 0}
                              onChange={handleSelectAll}
                              className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                          />
                      </div>
                      <div>Subject Details</div>
                      <div>Code</div>
                      <div>Departments</div>
                      <div className="text-center">Assigned</div>
                      <div className="text-center">Scope</div>
                      <div className="text-right">Actions</div>
                  </div>
              )}
              <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "flex flex-col bg-white dark:bg-slate-900 rounded-b-2xl border border-t-0 border-slate-200 dark:border-slate-800 shadow-sm"
              }>
                {paginatedSubjects.map((subject) => (
                  <SubjectCard 
                    key={subject.id} 
                    subject={subject} 
                    onEdit={handleEdit}
                    onView={handleView}
                    selected={selectedSubjectIds.includes(subject.id)}
                    onSelect={handleSelectSubject}
                    onDelete={handleDeleteSubject}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-48 bg-slate-50 dark:bg-white/[0.02] rounded-[5rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-8"
            >
              <div className="size-32 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                <BookOpen size={64} strokeWidth={1} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Subjects Found</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                  {searchQuery ? "No subjects found matching your search." : "Add your school's first subject to get started."}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={handleCreate} style={{ backgroundColor: primaryColor }} className="h-14 px-8 rounded-2xl text-white font-black uppercase tracking-widest gap-3 shadow-xl">
                    <Plus size={20} strokeWidth={3} /> Add Your First Subject
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {!loading && filteredSubjects.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 mt-8">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length} Entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="size-10 rounded-xl border-2 border-slate-200 dark:border-white/10"
                >
                  <ChevronLeft size={16} />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "size-10 rounded-xl font-bold",
                        currentPage === pageNum 
                          ? "" 
                          : "border-2 border-slate-200 dark:border-white/10 text-slate-500"
                      )}
                      style={currentPage === pageNum ? { backgroundColor: primaryColor, color: "white" } : {}}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="size-10 rounded-xl border-2 border-slate-200 dark:border-white/10"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
        )}

        {/* Verification Footer */}
        <div className="flex justify-center pt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" strokeWidth={3} /> Verified Subjects List
            </div>
        </div>
      </div>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        subject={editingSubject}
      />

      <DeleteSubjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetSubject(null);
          setIsBulkDeleteMode(false);
        }}
        onConfirm={isBulkDeleteMode ? executeBulkDelete : executeDeleteSubject}
        subjectName={deleteTargetSubject?.name}
        selectedCount={isBulkDeleteMode ? selectedSubjectIds.length : undefined}
      />
    </div>
  );
};

export default SubjectsPage;

