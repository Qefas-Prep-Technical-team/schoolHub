"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Save, Search, Download, Loader2, Settings, Pencil, Check, UploadCloud, PenLine, Users, CheckCircle2, Clock, TrendingUp, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ResultRecordUploadModal, { UploadCategory } from "./components/ResultRecordUploadModal";
import { EditConfigModal } from "./components/EditConfigModal";
import { ScoreBreakdownModal } from "./components/ScoreBreakdownModal";
import { SyncProgressModal } from "./components/SyncProgressModal";
import { SummaryPanel } from "./components/SummaryPanel";
import { useClassSubjectResult, useStudentSubjectResults, useBulkSaveStudentSubjectResults, useUpdatePaperLinks, useCalculatePaperSync, usePublishClassSubjectResult, useUnpublishClassSubjectResult } from "@/lib/api/hooks/useRecords";
import { useSubjectPapers } from "@/lib/api/hooks/useExams";
import { useAdminAssignments } from "@/lib/api/hooks/useAssignments";
import { useStudents } from "@/lib/api/hooks/useStudent";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

export default function NewFinalResultDataEntryPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user } = useAuthStore();
  const effectiveSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  // Data Hooks
  const { data: config, isLoading: isLoadingConfig } = useClassSubjectResult(id || undefined);
  
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(
    effectiveSchoolId,
    { classId: config?.classId, limit: 500 },
    { enabled: !!config?.classId }
  );
  // studentsData is directly an array (service returns response.data.data)
  const rawStudents = Array.isArray(studentsData) ? studentsData : [];

  const { data: existingMarks, isLoading: isLoadingMarks } = useStudentSubjectResults({
    classId: config?.classId,
    subjectId: config?.subjectId,
    sessionId: config?.sessionId,
    term: config?.term
  });

  const { mutate: saveResults, isPending: isSaving } = useBulkSaveStudentSubjectResults();
  const calculateSyncMutation = useCalculatePaperSync();
  const { mutate: publishResult, isPending: isPublishing } = usePublishClassSubjectResult();
  const { mutate: unpublishResult, isPending: isUnpublishing } = useUnpublishClassSubjectResult();

  // Local State
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"academic" | "evaluation" | "details">("academic");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const PAGE_SIZE = 20;

  // Paper assignments per assessment category (multi-select)
  const [paperAssignments, setPaperAssignments] = useState<{
    exam: string[]; subjectPaper: string[]; ca: string[]; assignment: string[];
  }>({ exam: [], subjectPaper: [], ca: [], assignment: [] });
  const [paperSearch, setPaperSearch] = useState<{
    exam: string; subjectPaper: string; ca: string; assignment: string;
  }>({ exam: "", subjectPaper: "", ca: "", assignment: "" });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditConfigOpen, setIsEditConfigOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);
  
  const [breakdownModal, setBreakdownModal] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
    category: "ca" | "quiz" | "exam" | "assignment" | null;
    categoryMax: number | null;
  }>({ isOpen: false, studentId: "", studentName: "", category: null, categoryMax: null });

  // Update paper links mutation
  const { mutate: savePaperLinks, isPending: isSavingLinks } = useUpdatePaperLinks();

  const { data: subjectPapersResult, isLoading: isLoadingPapers } = useSubjectPapers(
    config?.subjectId ? { 
      subjectId: config.subjectId,
      classId: config.classId,
      sessionId: config.sessionId,
      term: config.term
    } : undefined
  );
  const subjectPapers: any[] = Array.isArray(subjectPapersResult) 
    ? subjectPapersResult 
    : (subjectPapersResult as any)?.data || [];

  const { data: assignmentsResult, isLoading: isLoadingAssignments } = useAdminAssignments(effectiveSchoolId);
  const assignments: any[] = assignmentsResult?.assignments || [];

  // Load existing paperLinks from config when it arrives
  useEffect(() => {
    if (config?.paperLinks) {
      const pl = config.paperLinks as any;
      setPaperAssignments({
        exam: pl.exam || [],
        subjectPaper: pl.subjectPaper || [],
        ca: pl.ca || [],
        assignment: pl.assignment || [],
      });
    }
  }, [config?.id]);

  // Sync loaded data into editable state
  useEffect(() => {
    if (rawStudents.length > 0) {
      let filteredRaw = rawStudents;
      if (config?.departmentId) {
        filteredRaw = rawStudents.filter((s: any) => s.departmentId === config.departmentId || s.department?.id === config.departmentId);
      }

      const merged = filteredRaw.map((student: any) => {
        const mark = Array.isArray(existingMarks) ? existingMarks.find(m => m.studentId === student.id) : undefined;
        return {
          id: student.id,
          name: student.name,
          code: student.studentCode || "-",
          profileImage: student.profileImage || null,
          assignment: mark?.assignmentScore ?? "",
          quiz: mark?.quizScore ?? "",
          ca: mark?.caScore ?? "",
          exam: mark?.examScore ?? "",
          scoreSources: mark?.scoreSources || {},
          politeness: "0",
          punctuality: "0",
          handwriting: "0",
          teacherRemark: "",
          principalRemark: ""
        };
      });
      setStudents(merged);
    }
  }, [rawStudents, existingMarks, config]);

  const handleScoreChange = (id: string, field: string, value: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value, scoreSources: { ...(s.scoreSources || {}), [field]: "MANUAL" } } : s))
    );
  };

  const handleUploadComplete = (mappedData: any[], category: UploadCategory) => {
    setStudents(prev => {
      let newStudents = [...prev];
      
      mappedData.forEach(row => {
        if (row.matched && row.studentId) {
          // If it's a new student, append it to the table
          if (row.isNew) {
            newStudents.push({
              id: row.studentId,
              name: row.studentName,
              code: "-",
              profileImage: null,
              assignment: category === "all" ? String(row.assignment || "") : category === "assignment" ? String(row.score || "") : "",
              quiz: category === "all" ? String(row.quiz || "") : category === "quiz" ? String(row.score || "") : "",
              ca: category === "all" ? String(row.ca || "") : category === "ca" ? String(row.score || "") : "",
              exam: category === "all" ? String(row.exam || "") : category === "exam" ? String(row.score || "") : "",
              politeness: "0",
              punctuality: "0",
              handwriting: "0",
              teacherRemark: "",
              principalRemark: "",
              scoreSources: {
                ...(category === "all" || category === "assignment" ? { assignment: "CSV/AI" } : {}),
                ...(category === "all" || category === "quiz" ? { quiz: "CSV/AI" } : {}),
                ...(category === "all" || category === "ca" ? { ca: "CSV/AI" } : {}),
                ...(category === "all" || category === "exam" ? { exam: "CSV/AI" } : {})
              }
            });
            return;
          }

          const idx = newStudents.findIndex(s => s.id === row.studentId);
          if (idx !== -1) {
             if (category === "all") {
                const updates: any = {};
                const sources: any = { ...(newStudents[idx].scoreSources || {}) };
                if (row.assignment !== undefined && row.assignment !== "") { updates.assignment = String(row.assignment); sources.assignment = "CSV/AI"; }
                if (row.quiz !== undefined && row.quiz !== "") { updates.quiz = String(row.quiz); sources.quiz = "CSV/AI"; }
                if (row.ca !== undefined && row.ca !== "") { updates.ca = String(row.ca); sources.ca = "CSV/AI"; }
                if (row.exam !== undefined && row.exam !== "") { updates.exam = String(row.exam); sources.exam = "CSV/AI"; }
                newStudents[idx] = { ...newStudents[idx], ...updates, scoreSources: sources };
             } else {
                if (row.score !== undefined && row.score !== "") {
                  newStudents[idx] = { 
                    ...newStudents[idx], 
                    [category]: String(row.score),
                    scoreSources: { ...(newStudents[idx].scoreSources || {}), [category]: "CSV/AI" }
                  };
                }
             }
          }
        }
      });
      return newStudents;
    });
    
    const count = mappedData.filter(d => d.matched).length;
    if (category === "all") {
       toast.success(`Successfully applied ${count} combined records`);
    } else {
       toast.success(`Successfully applied ${count} scores to ${category.toUpperCase()}`);
    }
  };

  const handleSave = () => {
    if (!config) return;

    const parseScore = (val: string | number | undefined) => {
      if (val === "" || val === null || val === undefined) return null;
      const parsed = parseFloat(String(val));
      return isNaN(parsed) ? null : parsed;
    };

    const payload = {
      classId: config.classId,
      subjectId: config.subjectId,
      sessionId: config.sessionId,
      term: config.term,
      scores: students.map(s => ({
        studentId: s.id,
        assignmentScore: parseScore(s.assignment),
        quizScore: parseScore(s.quiz),
        caScore: parseScore(s.ca),
        examScore: parseScore(s.exam),
      }))
    };

    saveResults(payload, {
      onSuccess: () => {
        toast.success("Scores saved successfully!");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to save scores");
      }
    });
  };

  const handlePublish = () => {
    if (!config?.id) return;
    publishResult(config.id, {
      onSuccess: () => {
        toast.success("Result published successfully!");
        setIsPublishModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to publish result");
      }
    });
  };

  const handleUnpublish = () => {
    if (!config?.id) return;
    unpublishResult(config.id, {
      onSuccess: () => {
        toast.success("Result unpublished successfully!");
        setIsUnpublishModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to unpublish result");
      }
    });
  };

  const isLoading = isLoadingConfig || isLoadingStudents || isLoadingMarks;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleEdit = (id: string) => {
    if (config?.status === "PUBLISHED") return toast.info("Cannot edit published results");
    setEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const scoresEntered = students.filter(s => !!s.assignment || !!s.quiz || !!s.ca || !!s.exam).length;
  const pendingEntry = students.length - scoresEntered;
  
  // Calculate class average
  let totalClassScore = 0;
  let studentsWithScores = 0;
  students.forEach(s => {
    const total = (parseFloat(s.assignment) || 0) + (parseFloat(s.quiz) || 0) + (parseFloat(s.ca) || 0) + (parseFloat(s.exam) || 0);
    if (total > 0) {
      totalClassScore += total;
      studentsWithScores++;
    }
  });
  const classAverage = studentsWithScores > 0 ? (totalClassScore / studentsWithScores).toFixed(1) : "0";

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[95%] mx-auto font-sans bg-[#f8f9fa] dark:bg-[#0f1015] min-h-screen">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/admin/records" 
            className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-[28px] font-bold text-[#1a1b2e] dark:text-white tracking-tight">
              {config ? config.name : "Loading..."}
            </h1>
            <div className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
              {config ? (
                <>
                  <span>{config.class?.name || "Class"}</span>
                  <span>•</span>
                  <span>{config.session?.name || "Session"}</span>
                </>
              ) : (
                <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => toast.info("Settings configuration coming soon")}
            className="flex items-center justify-center p-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Configuration Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
            <Download className="w-4 h-4" />
            Export data
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || isLoading || config?.status === "PUBLISHED"}
            className="flex items-center gap-2 px-4 py-2 bg-[#5B5CE6] hover:bg-[#4a4be5] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Results"}
          </button>
          {config?.status !== "PUBLISHED" ? (
            <button 
              onClick={() => setIsPublishModalOpen(true)}
              disabled={isPublishing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Publish
            </button>
          ) : (
            <button 
              onClick={() => setIsUnpublishModalOpen(true)}
              disabled={isUnpublishing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
            >
              {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              Unpublish
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="w-full space-y-6 mt-6 animate-pulse">
          {/* Skeleton for Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl h-28"></div>
            ))}
          </div>
          {/* Skeleton for Tabs */}
          <div className="flex gap-6 mt-8 mb-4 border-b border-slate-200 dark:border-slate-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
            ))}
          </div>
          {/* Skeleton for Table */}
          <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden h-96 flex flex-col">
            <div className="h-16 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20"></div>
            <div className="flex-1 p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards Overview */}
          <div className="mt-6 mb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1 */}
              <div className="bg-white dark:bg-[#1a1b2e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-[#4a8df5]/10 flex items-center justify-center mb-3">
                  <Users className="w-4 h-4 text-[#4a8df5]" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Total Students</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{students.length}</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-[#1a1b2e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-[#7854f5]/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#7854f5]" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Scores Entered</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{scoresEntered}</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-[#1a1b2e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-[#f06148]/10 flex items-center justify-center mb-3">
                  <Clock className="w-4 h-4 text-[#f06148]" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Pending Entry</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{pendingEntry}</div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white dark:bg-[#1a1b2e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-[#38b75e]/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-4 h-4 text-[#38b75e]" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Class Average</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{classAverage}%</div>
                </div>
              </div>

            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-8 mb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("academic")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "academic"
                  ? "text-[#5B5CE6]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Academic Scores
              {activeTab === "academic" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B5CE6] rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("evaluation")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "evaluation"
                  ? "text-[#5B5CE6]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Behavioral Evaluations & Remarks
              {activeTab === "evaluation" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B5CE6] rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "details"
                  ? "text-[#5B5CE6]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Configuration Details
              {activeTab === "details" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B5CE6] rounded-t-full" />}
            </button>
          </div>

          {/* Data Entry Grid - Academic */}
          {activeTab === "academic" && (
          <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden mt-4">
            
            {/* Search Bar & Actions */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 gap-4 bg-white dark:bg-[#1a1b2e]">
              <div className="relative w-full max-w-sm flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-[#f8f9fa] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#5B5CE6] transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={config?.status === "PUBLISHED"}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Grades
                </button>
                <button 
                  onClick={() => {
                    if (!config?.id) return;
                    const studentIds = paginatedStudents.map(s => s.id);
                    if (studentIds.length === 0) return;
                    setIsSyncModalOpen(true);
                  }}
                  disabled={config?.status === "PUBLISHED"}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Papers
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/50">
                    <th className="px-6 py-4 w-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">#</th>
                    <th className="px-4 py-4 min-w-[200px] text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Student</th>
                    <th className="px-4 py-4 w-24 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Class ID</th>
                    {config?.assignmentMax != null && <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment<br/><span className="text-[9px] font-medium opacity-70">(Max {config.assignmentMax})</span></th>}
                    {config?.quizMax != null && <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Quiz/Test<br/><span className="text-[9px] font-medium opacity-70">(Max {config.quizMax})</span></th>}
                    {config?.caMax != null && <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">CA<br/><span className="text-[9px] font-medium opacity-70">(Max {config.caMax})</span></th>}
                    {config?.examMax != null && <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Exam<br/><span className="text-[9px] font-medium opacity-70">(Max {config.examMax})</span></th>}
                    <th className="px-6 py-4 w-24 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                    <th className="px-4 py-4 w-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20 text-slate-600 dark:text-slate-300 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-slate-500">No students found.</td>
                    </tr>
                  ) : paginatedStudents.map((student, idx) => {
                    const isEditing = editingIds.has(student.id);
                    const assignNum = parseFloat(student.assignment) || 0;
                    const quizNum = parseFloat(student.quiz) || 0;
                    const caNum = parseFloat(student.ca) || 0;
                    const examNum = parseFloat(student.exam) || 0;
                    const total = assignNum + quizNum + caNum + examNum;
                    const globalIdx = (currentPage - 1) * PAGE_SIZE + idx;
                    
                    return (
                      <tr key={student.id} className={`group transition-colors border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isEditing ? "bg-slate-50 dark:bg-slate-800/30" : ""}`}>
                        <td className="px-6 py-4 text-center text-slate-400 font-normal text-sm">{String(globalIdx + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                            {student.profileImage ? (
                              <img 
                                src={student.profileImage} 
                                alt={student.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=e2e8f0`;
                                }}
                              />
                            ) : (
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=e2e8f0`} alt={student.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{student.name}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-400 font-normal text-sm">{student.code}</td>
                        {config?.assignmentMax != null && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={student.assignment}
                              onChange={(e) => handleScoreChange(student.id, "assignment", e.target.value)}
                              placeholder="-"
                              className="w-16 mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#5B5CE6] focus:border-[#5B5CE6] text-center font-medium text-slate-800 dark:text-slate-200 text-sm transition-all shadow-sm"
                            />
                          ) : (
                            <button onClick={() => setBreakdownModal({ isOpen: true, studentId: student.id, studentName: student.name, category: "assignment", categoryMax: config?.assignmentMax || null })} className="text-slate-500 font-medium hover:text-[#5B5CE6] transition-colors px-2 py-1 rounded text-sm">
                              {student.assignment || <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                        )}
                        {config?.quizMax != null && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={student.quiz}
                              onChange={(e) => handleScoreChange(student.id, "quiz", e.target.value)}
                              placeholder="-"
                              className="w-16 mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#5B5CE6] focus:border-[#5B5CE6] text-center font-medium text-slate-800 dark:text-slate-200 text-sm transition-all shadow-sm"
                            />
                          ) : (
                            <button onClick={() => setBreakdownModal({ isOpen: true, studentId: student.id, studentName: student.name, category: "quiz", categoryMax: config?.quizMax || null })} className="text-slate-500 font-medium hover:text-[#5B5CE6] transition-colors px-2 py-1 rounded text-sm">
                              {student.quiz || <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                        )}
                        {config?.caMax != null && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={student.ca}
                              onChange={(e) => handleScoreChange(student.id, "ca", e.target.value)}
                              placeholder="-"
                              className="w-16 mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#5B5CE6] focus:border-[#5B5CE6] text-center font-medium text-slate-800 dark:text-slate-200 text-sm transition-all shadow-sm"
                            />
                          ) : (
                            <button onClick={() => setBreakdownModal({ isOpen: true, studentId: student.id, studentName: student.name, category: "ca", categoryMax: config?.caMax || null })} className="text-slate-500 font-medium hover:text-[#5B5CE6] transition-colors px-2 py-1 rounded text-sm">
                              {student.ca || <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                        )}
                        {config?.examMax != null && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={student.exam}
                              onChange={(e) => handleScoreChange(student.id, "exam", e.target.value)}
                              placeholder="-"
                              className="w-16 mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#5B5CE6] focus:border-[#5B5CE6] text-center font-medium text-slate-800 dark:text-slate-200 text-sm transition-all shadow-sm"
                            />
                          ) : (
                            <button onClick={() => setBreakdownModal({ isOpen: true, studentId: student.id, studentName: student.name, category: "exam", categoryMax: config?.examMax || null })} className="text-slate-500 font-medium hover:text-[#5B5CE6] transition-colors px-2 py-1 rounded text-sm">
                              {student.exam || <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                        )}
                        <td className="px-6 py-4 text-center">
                          {student.assignment || student.quiz || student.ca || student.exam ? (
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold ${total < 40 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>{total}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleEdit(student.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          >
                            {isEditing ? <Check className="w-4 h-4 text-emerald-500" /> : <Pencil className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                <span className="text-xs text-slate-400 font-medium">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} students
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-500 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                        page === currentPage 
                          ? "bg-[#5B5CE6] text-white" 
                          : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-500 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          )}


          {/* Data Entry Grid - Evaluation */}
          {activeTab === "evaluation" && (
          <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden mt-4">
            
            {/* Search Bar */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 gap-4 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/50 transition-all"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-xs capitalize font-medium text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                    <th className="px-6 py-5 w-12 text-center">#</th>
                    <th className="px-4 py-5 min-w-[200px]">Name</th>
                    <th className="px-4 py-5 w-24 text-center">Politeness<br/><span className="text-[10px] text-slate-400">(1-5)</span></th>
                    <th className="px-4 py-5 w-24 text-center">Punctuality<br/><span className="text-[10px] text-slate-400">(1-5)</span></th>
                    <th className="px-4 py-5 w-24 text-center">Handwriting<br/><span className="text-[10px] text-slate-400">(1-5)</span></th>
                    <th className="px-4 py-5 w-64 text-left">Teacher Remark</th>
                    <th className="px-4 py-5 w-64 text-left">Principal Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20 text-slate-600 dark:text-slate-300 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No students found.</td>
                    </tr>
                  ) : filteredStudents.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                        <td className="px-6 py-5 text-center text-slate-400 font-normal">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=e2e8f0`} alt={student.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-slate-800 dark:text-slate-100">{student.name}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select 
                            value={student.politeness}
                            onChange={(e) => handleScoreChange(student.id, "politeness", e.target.value)}
                            className="w-16 mx-auto bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded px-2 py-1 outline-none transition-all text-center font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="0">-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select 
                            value={student.punctuality}
                            onChange={(e) => handleScoreChange(student.id, "punctuality", e.target.value)}
                            className="w-16 mx-auto bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded px-2 py-1 outline-none transition-all text-center font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="0">-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select 
                            value={student.handwriting}
                            onChange={(e) => handleScoreChange(student.id, "handwriting", e.target.value)}
                            className="w-16 mx-auto bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded px-2 py-1 outline-none transition-all text-center font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="0">-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            value={student.teacherRemark}
                            onChange={(e) => handleScoreChange(student.id, "teacherRemark", e.target.value)}
                            placeholder="Add remark..."
                            className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded px-3 py-1.5 outline-none transition-all placeholder:text-slate-300 text-sm text-slate-800 dark:text-slate-200"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            value={student.principalRemark}
                            onChange={(e) => handleScoreChange(student.id, "principalRemark", e.target.value)}
                            placeholder="Add remark..."
                            className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded px-3 py-1.5 outline-none transition-all placeholder:text-slate-300 text-sm text-slate-800 dark:text-slate-200"
                          />
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Configuration Details Tab */}
          {activeTab === "details" && config && (
            <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8 mt-4">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800/50 pb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Configuration Details
                </h2>
                <button
                  onClick={() => setIsEditConfigOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  Edit Configuration
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">General Information</h3>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Result Name</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.name}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Subject</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.subject?.name || "N/A"}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Class</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.class?.name || "N/A"}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Department</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.department?.name || "All Departments"}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Term</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{config.term?.toLowerCase()} Term</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Session</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.session?.name || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Score Configuration & Dates */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Assessment Limits & Dates</h3>
                  
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Assignment Max</span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-300">{config.assignmentMax || "-"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Quiz Max</span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-300">{config.quizMax || "-"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">CA Max</span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-300">{config.caMax || "-"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-[#5B5CE6]/10 rounded shadow-sm border border-[#5B5CE6]/20">
                      <span className="text-[10px] uppercase text-[#5B5CE6] font-bold mb-1">Exam Max</span>
                      <span className="text-lg font-black text-[#5B5CE6]">{config.examMax || "-"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Reveal Date</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {config.revealDate ? new Date(config.revealDate).toLocaleDateString() : "Not Set"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Release Date</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {config.releaseDate ? new Date(config.releaseDate).toLocaleDateString() : "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Paper Assignments */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Subject Paper Assignments</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Select one or more papers per assessment category. Changes are saved manually.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!id) return;
                      savePaperLinks(
                        { id, paperLinks: paperAssignments },
                        {
                          onSuccess: () => toast.success("Paper assignments saved!"),
                          onError: () => toast.error("Failed to save paper assignments"),
                        }
                      );
                    }}
                    disabled={isSavingLinks || !id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B5CE6] hover:bg-[#4a4bd4] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {isSavingLinks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Links
                  </button>
                </div>



                {(isLoadingPapers || isLoadingAssignments) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {([
                      { key: "exam" as const,         label: "Exam Papers",           category: "EXAM",       borderColor: "border-[#5B5CE6]/40",    headerBg: "bg-[#5B5CE6]/10",  dotColor: "bg-[#5B5CE6]",  textColor: "text-[#5B5CE6]",  checkColor: "accent-[#5B5CE6]" },
                      { key: "subjectPaper" as const, label: "Subject Paper (Quiz)",  category: "QUIZ",       borderColor: "border-amber-300/60",    headerBg: "bg-amber-50 dark:bg-amber-500/10",  dotColor: "bg-amber-500",  textColor: "text-amber-600 dark:text-amber-400",  checkColor: "accent-amber-500" },
                      { key: "ca" as const,           label: "CA Papers",             category: "CA",         borderColor: "border-emerald-300/60",  headerBg: "bg-emerald-50 dark:bg-emerald-500/10",  dotColor: "bg-emerald-500",  textColor: "text-emerald-600 dark:text-emerald-400",  checkColor: "accent-emerald-500" },
                      { key: "assignment" as const,   label: "Assignment Papers",     category: "ASSIGNMENT", borderColor: "border-rose-300/60",     headerBg: "bg-rose-50 dark:bg-rose-500/10",  dotColor: "bg-rose-500",  textColor: "text-rose-600 dark:text-rose-400",  checkColor: "accent-rose-500" },
                    ]).map(({ key, label, category, borderColor, headerBg, dotColor, textColor, checkColor }) => {
                      const selected = paperAssignments[key];
                      const searchKey = paperSearch[key];
                      const sourceList = key === "assignment" ? assignments : subjectPapers;
                      const filteredPapers = sourceList.filter((p: any) => {
                        const matchesSearch = !searchKey || (p.title || "").toLowerCase().includes(searchKey.toLowerCase());
                        
                        if (key === "assignment") {
                          const matchesClass = p.classId === config?.classId;
                          const matchesSubject = p.subjectId === config?.subjectId;
                          return matchesClass && matchesSubject && matchesSearch;
                        }

                        const hasExamConnections = p.exams && p.exams.length > 0;
                        
                        if (hasExamConnections) {
                          const isConnectedToThisCategory = p.exams.some((e: any) => e.exam?.category === category);
                          return isConnectedToThisCategory && matchesSearch;
                        }
                        
                        return p.category === category && matchesSearch;
                      });
                      const togglePaper = (paperId: string) => {
                        setPaperAssignments(prev => {
                          const cur = prev[key];
                          return {
                            ...prev,
                            [key]: cur.includes(paperId) ? cur.filter(x => x !== paperId) : [...cur, paperId],
                          };
                        });
                      };
                      return (
                        <div key={key} className={`rounded-xl border ${borderColor} overflow-hidden flex flex-col h-72`}>
                          <div className={`${headerBg} px-4 py-2.5 flex items-center justify-between flex-shrink-0`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                              <span className={`text-xs font-bold uppercase tracking-wide ${textColor}`}>{label}</span>
                            </div>
                            <span className={`text-[10px] font-semibold ${textColor}`}>
                              {selected.length} selected
                            </span>
                          </div>
                          
                          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder={`Search ${label}...`}
                                value={searchKey}
                                onChange={(e) => setPaperSearch(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#5B5CE6]/50 transition-all"
                              />
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-transparent">
                            {filteredPapers.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-4">No papers match your search.</p>
                            ) : filteredPapers.map((p: any) => {
                              const isChecked = selected.includes(p.id);
                              return (
                                <label
                                  key={p.id}
                                  className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isChecked ? "bg-slate-50 dark:bg-slate-900/50" : "hover:bg-slate-50/50 dark:hover:bg-slate-900/20"}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePaper(p.id)}
                                    className={`mt-0.5 w-4 h-4 rounded ${checkColor} flex-shrink-0`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                      {p.title || "Untitled Paper"}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {p.totalMarks ? `${p.totalMarks} marks` : "—"} · <span className={p.status === "PUBLISHED" ? "text-emerald-500" : "text-amber-500"}>{p.status}</span>
                                    </p>
                                  </div>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <SummaryPanel 
        students={students}
        config={config}
        subjectPapers={subjectPapers}
        assignments={assignments}
      />

      <ResultRecordUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        students={students}
        schoolId={effectiveSchoolId}
        classId={config?.classId || ""}
        onUploadComplete={handleUploadComplete}
      />

      <EditConfigModal
        isOpen={isEditConfigOpen}
        onClose={() => setIsEditConfigOpen(false)}
        config={config}
      />

      <ScoreBreakdownModal
        isOpen={breakdownModal.isOpen}
        onClose={() => setBreakdownModal(prev => ({ ...prev, isOpen: false }))}
        resultId={config?.id || ""}
        studentId={breakdownModal.studentId}
        studentName={breakdownModal.studentName}
        category={breakdownModal.category}
        categoryMax={breakdownModal.categoryMax}
      />

      <SyncProgressModal 
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        resultId={config?.id || ""}
        studentIds={paginatedStudents.map(s => s.id)}
        onComplete={(results) => {
          toast.success("Sync complete! Please remember to click 'Save Results' to persist your changes.", {
            autoClose: 6000,
            icon: "💾"
          });
          setStudents(prev => prev.map(student => {
            const syncedData = results.find((r: any) => r.studentId === student.id);
            if (syncedData) {
              const updates: any = {};
              const sources = { ...(student.scoreSources || {}) };
              if (syncedData.assignment !== undefined) { updates.assignment = syncedData.assignment?.toString() || "0"; sources.assignment = "SYNC"; }
              if (syncedData.quiz !== undefined) { updates.quiz = syncedData.quiz?.toString() || "0"; sources.quiz = "SYNC"; }
              if (syncedData.ca !== undefined) { updates.ca = syncedData.ca?.toString() || "0"; sources.ca = "SYNC"; }
              if (syncedData.exam !== undefined) { updates.exam = syncedData.exam?.toString() || "0"; sources.exam = "SYNC"; }
              
              return {
                ...student,
                ...updates,
                scoreSources: sources
              };
            }
            return student;
          }));
        }}
      />

      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-[#1a1b2e] dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Publish Results</DialogTitle>
            <DialogDescription className="text-slate-500">
              Are you sure you want to publish this result? This action will immediately notify students and teachers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-70"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Now"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUnpublishModalOpen} onOpenChange={setIsUnpublishModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-[#1a1b2e] dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Unpublish Results</DialogTitle>
            <DialogDescription className="text-slate-500">
              Are you sure you want to unpublish this result? It will revert to draft status and won't be visible to students until you publish it again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button 
              onClick={handleUnpublish}
              disabled={isUnpublishing}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-70"
            >
              {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unpublish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
