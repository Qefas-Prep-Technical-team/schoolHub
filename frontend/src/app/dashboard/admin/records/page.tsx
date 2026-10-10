"use client";

import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { AdminRole } from "../components/adminFeatureFlags";
import { ShieldAlert, Download, SlidersHorizontal, User, Phone, Mail, MoreHorizontal, ChevronLeft, ChevronRight, ChevronDown, Plus, Users, FileCheck, Clock, TrendingUp, Loader2, LayoutGrid, List, Info, Search } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { generatePDF } from "@/utils/pdfGenerator";
import { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { useClassSubjectResults, useStudentTermResults, useCreateClassSubjectResult } from "@/lib/api/hooks/useRecords";
import { useClasses } from "@/lib/api/hooks/useClasses";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { useSchoolSubjects, useSchoolDepartments, useSchoolProfile, useSchoolStudents } from "@/lib/api/hooks/useSchool";

export default function RecordsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"subject" | "student">("subject");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  // Mobile defaults to grid view
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode("grid");
    }
  }, []);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);
  
  // Pagination state
  const [subjectPage, setSubjectPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  // Filter state
  const [filterClass, setFilterClass] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const PAGE_SIZE = 10;

  // Export popup state
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [exportTargetFormat, setExportTargetFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportFilterClass, setExportFilterClass] = useState("");
  const [exportFilterSession, setExportFilterSession] = useState("");
  const [exportFilterTerm, setExportFilterTerm] = useState("");

  // Popup form state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    classId: "",
    subjectId: "",
    departmentId: "",
    sessionId: "",
    term: "FIRST",
    revealDate: "",
    releaseDate: "",
    assignmentMax: 10,
    quizMax: 10,
    caMax: 20,
    examMax: 60,
  });

  const { mutate: createResult, isPending: isCreating } = useCreateClassSubjectResult();
  
  const effectiveSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId);

  // Data hooks for dropdowns
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(effectiveSchoolId);
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions(effectiveSchoolId);
  const { data: subjectsData, isLoading: isLoadingSubjectsList } = useSchoolSubjects(effectiveSchoolId);
  const { data: departmentsData, isLoading: isLoadingDepartments } = useSchoolDepartments(effectiveSchoolId);

  const classes = Array.isArray(classesData) ? classesData : classesData?.data || [];
  const sessions = Array.isArray(sessionsData) ? sessionsData : sessionsData?.data || [];
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || [];
  const departments = Array.isArray(departmentsData) ? departmentsData : departmentsData?.data || [];

  const { data: subjectResults, isLoading: isLoadingSubjects } = useClassSubjectResults();
  
  const { data: studentsData, isLoading: isLoadingStudents } = useSchoolStudents(effectiveSchoolId, { search: studentSearchQuery });
  const studentResults = Array.isArray(studentsData) ? studentsData : studentsData?.data || [];

  // Filter logic
  const filteredSubjectResults = subjectResults?.filter((res: any) => {
    if (filterClass && res.classId !== filterClass) return false;
    if (filterSession && res.sessionId !== filterSession) return false;
    if (filterTerm && res.term !== filterTerm) return false;
    return true;
  }) || [];

  const filteredStudentResults = studentResults?.filter((res: any) => {
    if (filterClass && res.currentClassId !== filterClass) return false;
    return true;
  }) || [];

  // Compute summary stats dynamically
  const totalRecords = activeTab === "student" ? filteredStudentResults.length : filteredSubjectResults.length;
  const completedRecords = activeTab === "student" 
    ? filteredStudentResults.filter((r: any) => r.status === "PUBLISHED").length
    : filteredSubjectResults.filter((r: any) => r.status === "PUBLISHED").length;
  const pendingRecords = totalRecords - completedRecords;
  const completionRate = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0;
  
  // Compute average score only from student results
  const validScores = filteredStudentResults.filter((r: any) => r.averageScore != null).map((r: any) => r.averageScore);
  const averageScore = validScores.length > 0 
    ? (validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length).toFixed(1)
    : "0.0";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const adminRole = (user?.adminRole || user?.role) as AdminRole | undefined;
  const allowedRoles: AdminRole[] = ["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR"];

  if (!adminRole || !allowedRoles.includes(adminRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center space-y-6">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
          <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            You do not have permission to view the Records page. This page is restricted to School Owners, Principals, and Registrars.
          </p>
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Your current role: <span className="font-bold text-primary">{adminRole || "UNKNOWN"}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleScoreChange = (id: string, field: "ca" | "exam", value: string) => {
    // Keep this for any future inline edits if needed
  };

  const handleCreateSubmit = () => {
    if (!formData.name || !formData.classId || !formData.subjectId || !formData.sessionId) {
      toast.error("Please fill in all required fields (Name, Class, Subject, Session).");
      return;
    }

    createResult(
      {
        ...formData,
        departmentId: formData.departmentId || null,
        revealDate: formData.revealDate ? new Date(formData.revealDate).toISOString() : null,
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : null,
      },
      {
        onSuccess: (res) => {
          toast.success("Final result configured successfully!");
          setIsPopupOpen(false);
          router.push(`/dashboard/admin/records/new?id=${res.data.id}`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create result configuration");
        },
      }
    );
  };
  
  const handleExport = async (targetFormat: 'csv' | 'pdf') => {
    setIsExporting(targetFormat);
    try {
      const rawData = activeTab === "subject" ? subjectResults : studentResults;
      const dataToExport = rawData?.filter((res: any) => {
        if (exportFilterClass && res.classId !== exportFilterClass) return false;
        if (exportFilterSession && res.sessionId !== exportFilterSession) return false;
        if (exportFilterTerm && res.term !== exportFilterTerm) return false;
        return true;
      }) || [];
      
      if (!dataToExport || dataToExport.length === 0) {
        toast.info("No records to export with the selected filters.");
        return;
      }
      
      const exportFormat = targetFormat;
      
      let headers: string[] = [];
      let rows: string[][] = [];
      
      if (activeTab === "subject") {
        headers = ["#", "Name", "Session", "Term", "Class", "Subject", "Status", "Date Saved"];
        rows = dataToExport.map((res: any, index: number) => [
          (index + 1).toString(),
          res.name || "N/A",
          res.session?.name || "N/A",
          res.term || "N/A",
          res.class?.name || "N/A",
          res.subject?.name || "N/A",
          res.status || "DRAFT",
          format(new Date(res.createdAt), "yyyy-MM-dd")
        ]);
      } else {
        headers = ["#", "Student Name", "Class", "Session", "Term", "Average", "Position", "Status"];
        rows = dataToExport.map((res: any, index: number) => [
          (index + 1).toString(),
          res.student?.name || "N/A",
          res.class?.name || "N/A",
          res.session?.name || "N/A",
          res.term || "N/A",
          res.averageScore ? `${res.averageScore}%` : "N/A",
          res.position ? res.position.toString() : "N/A",
          res.status || "DRAFT"
        ]);
      }

      const dateStr = format(new Date(), "yyyy-MM-dd");
      const tabName = activeTab === "subject" ? "subjects" : "students";
      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || (user as any)?.tenant?.name || "School";
      const sanitizedSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileNameBase = `${sanitizedSchoolName}_records_${tabName}_export_${dateStr}`;

      if (exportFormat === 'csv') {
        const csvContent = [];
        
        csvContent.push(`"${schoolName.toUpperCase()}"`);
        if (schoolProfile?.motto) csvContent.push(`"${schoolProfile.motto}"`);
        if (schoolProfile?.address) csvContent.push(`"${schoolProfile.address}"`);
        if (schoolProfile?.phone || schoolProfile?.schoolEmail) csvContent.push(`"${[schoolProfile?.phone, schoolProfile?.schoolEmail].filter(Boolean).join(' | ')}"`);
        csvContent.push("");
        csvContent.push(`"Records Report - ${tabName.charAt(0).toUpperCase() + tabName.slice(1)} View"`);
        csvContent.push(`"Generated on: ${dateStr}"`);
        csvContent.push("");

        let csvRows: string[][] = [];
        if (activeTab === "subject") {
          csvRows = dataToExport.map((res: any, index: number) => [
            (index + 1).toString(),
            `"${(res.name || "").replace(/"/g, '""')}"`,
            `"${(res.session?.name || "").replace(/"/g, '""')}"`,
            `"${(res.term || "").replace(/"/g, '""')}"`,
            `"${(res.class?.name || "").replace(/"/g, '""')}"`,
            `"${(res.subject?.name || "").replace(/"/g, '""')}"`,
            res.status || "DRAFT",
            `="${format(new Date(res.createdAt), "yyyy-MM-dd")}"`
          ]);
        } else {
          csvRows = dataToExport.map((res: any, index: number) => [
            (index + 1).toString(),
            `"${(res.student?.name || "").replace(/"/g, '""')}"`,
            `"${(res.class?.name || "").replace(/"/g, '""')}"`,
            `"${(res.session?.name || "").replace(/"/g, '""')}"`,
            `"${(res.term || "").replace(/"/g, '""')}"`,
            res.averageScore ? `${res.averageScore}%` : "N/A",
            res.position ? res.position.toString() : "N/A",
            res.status || "DRAFT"
          ]);
        }
        
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
          title: `Records Report - ${tabName.charAt(0).toUpperCase() + tabName.slice(1)} View`,
          filename: `${fileNameBase}.pdf`,
          schoolProfile,
          metaData: [
            { label: 'Date', value: dateStr },
            { label: 'Total Records', value: dataToExport.length.toString() }
          ],
          tableHeaders: [headers],
          tableData: rows
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to export records as ${targetFormat.toUpperCase()}.`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[95%] mx-auto font-sans bg-slate-50/50 dark:bg-[#0f1015] min-h-screen">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-[#1a1b2e] dark:text-white tracking-tight">Records</h1>
            <TooltipProvider>
              <UITooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 focus:outline-none transition-colors">
                    <Info size={24} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  View and manage term results for students and subjects. This data is computed from aggregated assessments.
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center text-sm text-slate-500 mt-1 font-medium">
            <User className="w-4 h-4 mr-1.5" /> Total: {totalRecords}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isExportPopupOpen} onOpenChange={setIsExportPopupOpen}>
            <DialogTrigger asChild>
              <button
                disabled={totalRecords === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] dark:bg-[#1a1b2e] dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Export Data</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Filter the records you want to export.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class (Optional)</label>
                  <select value={exportFilterClass} onChange={(e) => setExportFilterClass(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                    <option value="">All Classes</option>
                    {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Session (Optional)</label>
                  <select value={exportFilterSession} onChange={(e) => setExportFilterSession(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                    <option value="">All Sessions</option>
                    {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term (Optional)</label>
                  <select value={exportFilterTerm} onChange={(e) => setExportFilterTerm(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                    <option value="">All Terms</option>
                    <option value="FIRST">First Term</option>
                    <option value="SECOND">Second Term</option>
                    <option value="THIRD">Third Term</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={isExporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isExporting === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isExporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#5B5CE6] hover:bg-[#4a4be5] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Add Final Result
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] dark:bg-[#1a1b2e] dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Add New Final Result</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Configure the settings for the new final result entry.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <input type="text" placeholder="e.g. Term 1 Mathematics Result" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class</label>
                    {isLoadingClasses ? (
                      <div className="w-full h-[38px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                    ) : (
                      <select value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">Select Class</option>
                        {classes.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                    {isLoadingSubjectsList ? (
                      <div className="w-full h-[38px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                    ) : (
                      <select value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">Select Subject</option>
                        {subjects.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                    {isLoadingDepartments ? (
                      <div className="w-full h-[38px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                    ) : (
                      <select value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">All Departments</option>
                        {departments.map((d: any) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Session</label>
                    {isLoadingSessions ? (
                      <div className="w-full h-[38px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                    ) : (
                      <select value={formData.sessionId} onChange={(e) => setFormData({...formData, sessionId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">Select Session</option>
                        {sessions.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term</label>
                    <select value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                      <option value="FIRST">First Term</option>
                      <option value="SECOND">Second Term</option>
                      <option value="THIRD">Third Term</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reveal Date</label>
                    <input type="date" value={formData.revealDate} onChange={(e) => setFormData({...formData, revealDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Release Date</label>
                    <input type="date" value={formData.releaseDate} onChange={(e) => setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all" />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Include Assessments & Max Marks</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Assignment Max</label>
                      <input type="number" value={formData.assignmentMax} onChange={(e) => setFormData({...formData, assignmentMax: Number(e.target.value)})} placeholder="Max (e.g. 10)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all text-center mt-2" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quiz Max</label>
                      <input type="number" value={formData.quizMax} onChange={(e) => setFormData({...formData, quizMax: Number(e.target.value)})} placeholder="Max (e.g. 10)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all text-center mt-2" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">CA Max</label>
                      <input type="number" value={formData.caMax} onChange={(e) => setFormData({...formData, caMax: Number(e.target.value)})} placeholder="Max (e.g. 20)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all text-center mt-2" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Exam Max</label>
                      <input type="number" value={formData.examMax} onChange={(e) => setFormData({...formData, examMax: Number(e.target.value)})} placeholder="Max (e.g. 60)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all text-center mt-2" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                </DialogClose>
                <button onClick={handleCreateSubmit} disabled={isCreating} className="px-4 py-2 bg-[#5B5CE6] hover:bg-[#4a4be5] text-white rounded-lg text-sm font-semibold transition-colors text-center disabled:opacity-70">
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              Total {activeTab === "student" ? "Students" : "Subjects"}
              <TooltipProvider>
                <UITooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                    The total number of results found based on the currently applied filters.
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalRecords}</h3>
            <div className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" />
              100%
            </div>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <FileCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              Completed Records
              <TooltipProvider>
                <UITooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                    Results that have been finalized and marked as PUBLISHED.
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{completedRecords}</h3>
            <div className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
              <TrendingUp className="w-3 h-3 mr-1" />
              {completionRate}%
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              Pending Records
              <TooltipProvider>
                <UITooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                    Results that are still in DRAFT mode and haven't been published yet.
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </span>
          </div>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pendingRecords}</h3>
            <div className="flex items-center text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">
              {totalRecords > 0 ? 100 - completionRate : 0}%
            </div>
          </div>
        </div>

        {/* Card 4 - Highlighted */}
        <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl border border-[#10b981]/20 p-5 shadow-lg shadow-[#10b981]/20 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-1.5 mb-4 text-white/90 relative z-10">
            <span className="text-sm font-bold tracking-wide">Average Score</span>
            <TooltipProvider>
              <UITooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-white/70 hover:text-white focus:outline-none">
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                  The overall average percentage score calculated from all valid student records.
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-end justify-between relative z-10">
            <h3 className="text-3xl font-black text-white">{averageScore}%</h3>
            <button className="px-3 py-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded text-xs font-bold backdrop-blur-sm cursor-pointer">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("subject")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "subject"
              ? "border-[#5B5CE6] text-[#5B5CE6]"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Subject Final Result
        </button>
        <button
          onClick={() => setActiveTab("student")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "student"
              ? "border-[#5B5CE6] text-[#5B5CE6]"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Students Final Result
        </button>
      </div>

      {/* List of Final Results */}
      {activeTab === "subject" && (
        <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject Final Results</h2>
              <TooltipProvider>
                <UITooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none ml-1">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                    A list of final results categorized by subjects.
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-[#5B5CE6]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-[#5B5CE6]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}><LayoutGrid className="w-4 h-4" /></button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter Results
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] dark:bg-[#1a1b2e] dark:border-slate-800">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">Filter Subject Results</DialogTitle>
                    <DialogDescription className="text-slate-500">
                      Narrow down the results by class, session, or term.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class</label>
                      <select value={filterClass} onChange={(e) => {setFilterClass(e.target.value); setSubjectPage(1);}} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">All Classes</option>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Session</label>
                      <select value={filterSession} onChange={(e) => {setFilterSession(e.target.value); setSubjectPage(1);}} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">All Sessions</option>
                        {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term</label>
                      <select value={filterTerm} onChange={(e) => {setFilterTerm(e.target.value); setSubjectPage(1);}} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">All Terms</option>
                        <option value="FIRST">First Term</option>
                        <option value="SECOND">Second Term</option>
                        <option value="THIRD">Third Term</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <button className="px-4 py-2 bg-[#5B5CE6] hover:bg-[#4a4be5] text-white rounded-lg text-sm font-semibold transition-colors">
                        Apply Filters
                      </button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                    <th className="px-6 py-3 w-12">#</th>
                    <th className="px-4 py-3">NAME</th>
                    <th className="px-4 py-3">SESSION & TERM</th>
                    <th className="px-4 py-3">CLASS</th>
                    <th className="px-4 py-3">SUBJECT</th>
                    <th className="px-4 py-3">DATE SAVED</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-6 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20 text-slate-600 dark:text-slate-300 font-medium">
                  {isLoadingSubjects ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                        <td className="px-4 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                        <td className="px-6 py-4 flex justify-end"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></td>
                      </tr>
                    ))
                  ) : filteredSubjectResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        No subject results found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubjectResults.slice((subjectPage - 1) * PAGE_SIZE, subjectPage * PAGE_SIZE).map((res: any, index: number) => {
                      const globalIdx = (subjectPage - 1) * PAGE_SIZE + index + 1;
                      return (
                        <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors group">
                          <td className="px-6 py-4 text-xs text-slate-400">{globalIdx}</td>
                          <td className="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">{res.name}</td>
                          <td className="px-4 py-4">
                            <span className="block text-slate-900 dark:text-slate-100">{res.session?.name}</span>
                            <span className="text-xs text-slate-400">{res.term}</span>
                          </td>
                          <td className="px-4 py-4">{res.class?.name}</td>
                          <td className="px-4 py-4 text-slate-900 dark:text-slate-100">{res.subject?.name}</td>
                          <td className="px-4 py-4 text-slate-500">{new Date(res.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              res.status === "PUBLISHED" 
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                            }`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => router.push(`/dashboard/admin/records/new?id=${res.id}`)}
                              className="inline-block px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-[#5B5CE6] hover:text-[#5B5CE6] dark:hover:border-[#5B5CE6] rounded text-xs font-bold transition-colors"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/20">
              {isLoadingSubjects ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-32 animate-pulse" />
                ))
              ) : filteredSubjectResults.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500">No subject results found.</div>
              ) : (
                filteredSubjectResults.slice((subjectPage - 1) * PAGE_SIZE, subjectPage * PAGE_SIZE).map((res: any, index: number) => {
                  const globalIdx = (subjectPage - 1) * PAGE_SIZE + index + 1;
                  return (
                  <div key={res.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm relative group">
                     <div className="flex justify-between items-start">
                       <div className="flex gap-2 max-w-[70%]">
                         <span className="text-xs font-black text-slate-400/70 mt-1 select-none">#{globalIdx}</span>
                         <div>
                           <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2" title={res.name}>{res.name}</h3>
                           <p className="text-xs text-slate-500 truncate">{res.session?.name} • {res.term}</p>
                         </div>
                       </div>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${res.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                         {res.status}
                       </span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                       <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                         <p className="text-slate-400 mb-0.5">Class</p>
                         <p className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={res.class?.name}>{res.class?.name}</p>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                         <p className="text-slate-400 mb-0.5">Subject</p>
                         <p className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={res.subject?.name}>{res.subject?.name}</p>
                       </div>
                     </div>
                     <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                       <span className="text-[10px] text-slate-400">{new Date(res.createdAt).toLocaleDateString()}</span>
                       <button onClick={() => router.push(`/dashboard/admin/records/new?id=${res.id}`)} className="text-xs font-bold text-[#5B5CE6] hover:text-[#4a4be5]">Edit Results</button>
                     </div>
                  </div>
                  )
                })
              )}
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredSubjectResults && filteredSubjectResults.length > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
              <span className="text-xs text-slate-500">
                Showing {(subjectPage - 1) * PAGE_SIZE + 1} - {Math.min(subjectPage * PAGE_SIZE, filteredSubjectResults.length)} of {filteredSubjectResults.length}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setSubjectPage(p => Math.max(1, p - 1))}
                  disabled={subjectPage === 1}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Page {subjectPage} of {Math.ceil(filteredSubjectResults.length / PAGE_SIZE)}
                </div>
                <button 
                  onClick={() => setSubjectPage(p => Math.min(Math.ceil(filteredSubjectResults.length / PAGE_SIZE), p + 1))}
                  disabled={subjectPage === Math.ceil(filteredSubjectResults.length / PAGE_SIZE)}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "student" && (
        <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Students Final Results</h2>
              <TooltipProvider>
                <UITooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none ml-1">
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 border-none shadow-xl">
                    A list of final results categorized by students.
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={studentSearchQuery} 
                  onChange={(e) => { setStudentSearchQuery(e.target.value); setStudentPage(1); }} 
                  className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all w-64"
                />
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-[#5B5CE6]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-[#5B5CE6]" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}><LayoutGrid className="w-4 h-4" /></button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter Results
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] dark:bg-[#1a1b2e] dark:border-slate-800">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">Filter Student Results</DialogTitle>
                    <DialogDescription className="text-slate-500">
                      Narrow down the results by class, session, or term.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class</label>
                      <select value={filterClass} onChange={(e) => {setFilterClass(e.target.value); setStudentPage(1);}} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">All Classes</option>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Session</label>
                      <select value={filterSession} onChange={(e) => {setFilterSession(e.target.value); setStudentPage(1);}} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">All Sessions</option>
                        {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term</label>
                      <select value={filterTerm} onChange={(e) => {setFilterTerm(e.target.value); setStudentPage(1);}} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all cursor-pointer">
                        <option value="">All Terms</option>
                        <option value="FIRST">First Term</option>
                        <option value="SECOND">Second Term</option>
                        <option value="THIRD">Third Term</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <button className="px-4 py-2 bg-[#5B5CE6] hover:bg-[#4a4be5] text-white rounded-lg text-sm font-semibold transition-colors">
                        Apply Filters
                      </button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {viewMode === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                    <th className="px-6 py-3 w-12">#</th>
                    <th className="px-4 py-3">STUDENT NAME</th>
                    <th className="px-4 py-3">STUDENT CODE</th>
                    <th className="px-4 py-3">GENDER</th>
                    <th className="px-4 py-3">CLASS</th>
                    <th className="px-6 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20 text-slate-600 dark:text-slate-300 font-medium">
                  {isLoadingStudents ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></td>
                        <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></td>
                        <td className="px-4 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                        <td className="px-6 py-4 flex justify-end"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      </tr>
                    ))
                  ) : filteredStudentResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        No student results found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudentResults.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE).map((res: any, index: number) => {
                      const globalIdx = (studentPage - 1) * PAGE_SIZE + index + 1;
                      return (
                        <tr key={res.id} onClick={() => router.push('/dashboard/admin/records/student/' + res.id)} className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors group">
                          <td className="px-6 py-4 text-xs text-slate-400">{globalIdx}</td>
                          <td className="px-4 py-4 text-slate-900 dark:text-slate-100 font-bold">{res.name} {res.lastName || ''}</td>
                          <td className="px-4 py-4">{res.studentCode || "-"}</td>
                          <td className="px-4 py-4">{res.gender || "-"}</td>
                          <td className="px-4 py-4">{res.classes?.[0]?.class?.name || res.gradeLevel || "-"}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={(e) => { e.stopPropagation(); router.push('/dashboard/admin/records/student/' + res.id); }} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-[#5B5CE6] hover:text-[#5B5CE6] dark:hover:border-[#5B5CE6] rounded text-xs font-bold transition-colors">
                              View Record
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/20">
              {isLoadingStudents ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-32 animate-pulse" />
                ))
              ) : filteredStudentResults.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500">No student results found.</div>
              ) : (
                filteredStudentResults.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE).map((res: any, index: number) => {
                  const globalIdx = (studentPage - 1) * PAGE_SIZE + index + 1;
                  return (
                  <div key={res.id} onClick={() => router.push('/dashboard/admin/records/student/' + res.id)} className="cursor-pointer bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm relative group">
                     <div className="flex justify-between items-start">
                       <div className="flex gap-2 max-w-[70%]">
                         <span className="text-xs font-black text-slate-400/70 mt-1 select-none">#{globalIdx}</span>
                         <div>
                           <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2" title={`${res.name} ${res.lastName || ''}`}>{res.name} {res.lastName || ''}</h3>
                           <p className="text-xs text-slate-500 truncate">{res.studentCode || "No Student Code"}</p>
                         </div>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-xs">
                       <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded text-center">
                         <p className="text-slate-400 mb-0.5">Gender</p>
                         <p className="font-black text-[#5B5CE6]">{res.gender || "-"}</p>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded text-center">
                         <p className="text-slate-400 mb-0.5">Class</p>
                         <p className="font-black text-slate-700 dark:text-slate-300">{res.classes?.[0]?.class?.name || res.gradeLevel || "-"}</p>
                       </div>
                     </div>
                     <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center">
                       <button className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">View Record</button>
                     </div>
                  </div>
                  )
                })
              )}
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredStudentResults && filteredStudentResults.length > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
              <span className="text-xs text-slate-500">
                Showing {(studentPage - 1) * PAGE_SIZE + 1} - {Math.min(studentPage * PAGE_SIZE, filteredStudentResults.length)} of {filteredStudentResults.length}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                  disabled={studentPage === 1}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Page {studentPage} of {Math.ceil(filteredStudentResults.length / PAGE_SIZE)}
                </div>
                <button 
                  onClick={() => setStudentPage(p => Math.min(Math.ceil(filteredStudentResults.length / PAGE_SIZE), p + 1))}
                  disabled={studentPage === Math.ceil(filteredStudentResults.length / PAGE_SIZE)}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
