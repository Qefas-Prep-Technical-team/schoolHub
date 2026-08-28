'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Edit2
} from "lucide-react";
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
          <title>School Subjects Report</title>
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
            .motto {
              font-size: 14px;
              font-style: italic;
              color: #475569;
              margin: 8px 0;
            }
            .subtitle {
              font-size: 12px;
              color: #64748b;
              margin-top: 15px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .school-logo {
              max-height: 80px;
              margin-bottom: 15px;
              border-radius: 8px;
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
            .scope-badge {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 4px 8px;
              border-radius: 12px;
            }
            .scope-school {
              background-color: #ecfdf5 !important;
              color: #059669;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .scope-personal {
              background-color: #fffbeb !important;
              color: #d97706;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
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
            ${schoolProfile?.logo ? `<img src="${schoolProfile.logo}" alt="School Logo" class="school-logo" />` : ''}
            <h1 class="title">${schoolProfile?.name || 'School Subjects Report'}</h1>
            ${schoolProfile?.motto ? `<p class="motto">"${schoolProfile.motto}"</p>` : ''}
            <h2 class="subtitle">Curriculum Report | Generated on ${new Date().toLocaleDateString()}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Teachers</th>
                <th>Classes</th>
                <th>Scope</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSubjects.map(sub => `
                <tr>
                  <td><strong>${sub.name}</strong></td>
                  <td><span class="code">${sub.code}</span></td>
                  <td class="metric">${sub.teachersCount || 0}</td>
                  <td class="metric">${sub.classesCount || 0}</td>
                  <td>
                    <span class="scope-badge ${sub.scope === 'SCHOOL' ? 'scope-school' : 'scope-personal'}">
                      ${sub.scope === 'SCHOOL' ? 'School-wide' : 'Private'}
                    </span>
                  </td>
                  <td><em>${sub.description || 'No description provided.'}</em></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Qefas Prep Hub © ${new Date().getFullYear()} - Curriculum Management Suite
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
      
      // Cleanup after print dialogue opens
      setTimeout(() => {
        document.body.removeChild(iframe);
        setIsExporting(false);
      }, 1000);
    }, 1500); // Premium loading state transition
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curriculum Management</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Subjects<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Manage your school curriculum, departmental alignment, and academic subject planning.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleCreate}
              style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}4D` }}
              className="h-16 px-10 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 hover:scale-105 active:scale-95 transition-all border-0"
            >
              <Plus size={20} strokeWidth={3} />
              Add New Subject
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Subjects</p>
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
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Departments</p>
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

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">System Status</p>
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
        <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="relative group flex-1 max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2rem] focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                />
            </div>
            
            <div className="flex items-center gap-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="h-16 w-[240px] rounded-[2rem] bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest px-8 shadow-sm">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl border-2 border-slate-100 dark:border-white/5 p-2">
                        <SelectItem value="all" className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">All Departments</SelectItem>
                        {departments.map(dep => (
                            <SelectItem key={dep.id} value={dep.departmentId || dep.id} className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">{dep.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedScope} onValueChange={setSelectedScope}>
                    <SelectTrigger className="h-16 w-[200px] rounded-[2rem] bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest px-8 shadow-sm">
                        <SelectValue placeholder="Global Scope" />
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl border-2 border-slate-100 dark:border-white/5 p-2">
                        <SelectItem value="all" className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">All Types</SelectItem>
                        <SelectItem value="SCHOOL" className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Globe size={12} className="inline mr-2" /> School-wide
                        </SelectItem>
                        <SelectItem value="PERSONAL" className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Lock size={12} className="inline mr-2" /> Private
                        </SelectItem>
                    </SelectContent>
                </Select>
                <Button 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    variant="outline" 
                    className="h-16 px-8 rounded-3xl border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-3 flex hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                    {isExporting ? (
                      <div className="size-4 rounded-full border-2 border-slate-400 border-t-slate-800 animate-spin" />
                    ) : (
                      <Download size={18} strokeWidth={3} className="text-slate-400" />
                    )}
                    {isExporting ? "Generating..." : "Export PDF"}
                </Button>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[2rem] h-16 items-center border border-slate-200/50 dark:border-white/5 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "h-full px-6 rounded-[1.5rem] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            viewMode === "grid" 
                                ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-md" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        <LayoutGrid size={14} strokeWidth={2.5} />
                        Grid
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "h-full px-6 rounded-[1.5rem] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            viewMode === "list" 
                                ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-md" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        <List size={14} strokeWidth={2.5} />
                        List
                    </button>
                </div>
            </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedSubjectIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-200"
          >
            <div className="flex items-center gap-4">
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
              className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest gap-2"
            >
              <Trash2 size={16} />
              Delete Selected
            </Button>
          </motion.div>
        )}

        {/* Subjects List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 rounded-[4rem] bg-white dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)}
            </div>
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

