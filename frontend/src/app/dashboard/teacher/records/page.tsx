"use client";

import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

import { ShieldAlert, Download, SlidersHorizontal, User, Phone, Mail, MoreHorizontal, ChevronLeft, ChevronRight, ChevronDown, Plus, Users, FileCheck, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { toast } from "react-toastify";

import { useClassSubjectResults, useStudentTermResults, useCreateClassSubjectResult } from "@/lib/api/hooks/useRecords";
import { useClasses } from "@/lib/api/hooks/useClasses";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { useSchoolSubjects, useSchoolDepartments } from "@/lib/api/hooks/useSchool";

export default function RecordsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"subject" | "student">("subject");
  
  // Pagination state
  const [subjectPage, setSubjectPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const PAGE_SIZE = 10;

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
  const { data: studentResults, isLoading: isLoadingStudents } = useStudentTermResults();

  // Compute summary stats dynamically
  const totalRecords = activeTab === "student" ? (studentResults?.length || 0) : (subjectResults?.length || 0);
  const completedRecords = activeTab === "student" 
    ? (studentResults?.filter((r: any) => r.status === "PUBLISHED").length || 0)
    : (subjectResults?.filter((r: any) => r.status === "PUBLISHED").length || 0);
  const pendingRecords = totalRecords - completedRecords;
  const completionRate = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0;
  
  // Compute average score only from student results
  const validScores = studentResults?.filter((r: any) => r.averageScore != null).map((r: any) => r.averageScore) || [];
  const averageScore = validScores.length > 0 
    ? (validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length).toFixed(1)
    : "0.0";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;



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
          router.push(`/dashboard/teacher/records/new?id=${res.data.id}`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create result configuration");
        },
      }
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[95%] mx-auto font-sans bg-slate-50/50 dark:bg-[#0f1015] min-h-screen">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1b2e] dark:text-white tracking-tight">Final Results</h1>
          <div className="flex items-center text-sm text-slate-500 mt-1 font-medium">
            <User className="w-4 h-4 mr-1.5" /> Total: {totalRecords}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export data
          </button>
          <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
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
                  <input type="text" placeholder="e.g. Term 1 Mathematics Result" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class</label>
                    {isLoadingClasses ? (
                      <div className="w-full h-[38px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                    ) : (
                      <select value={formData.classId} onChange={(e) => setFormData({...formData, classId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
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
                      <select value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
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
                      <select value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
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
                      <select value={formData.sessionId} onChange={(e) => setFormData({...formData, sessionId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
                        <option value="">Select Session</option>
                        {sessions.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Term</label>
                    <select value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
                      <option value="FIRST">First Term</option>
                      <option value="SECOND">Second Term</option>
                      <option value="THIRD">Third Term</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reveal Date</label>
                    <input type="date" value={formData.revealDate} onChange={(e) => setFormData({...formData, revealDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Release Date</label>
                    <input type="date" value={formData.releaseDate} onChange={(e) => setFormData({...formData, releaseDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all" />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Include Assessments & Max Marks</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Assignment Max</label>
                      <input type="number" value={formData.assignmentMax} onChange={(e) => setFormData({...formData, assignmentMax: Number(e.target.value)})} placeholder="Max (e.g. 10)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all text-center mt-2" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quiz Max</label>
                      <input type="number" value={formData.quizMax} onChange={(e) => setFormData({...formData, quizMax: Number(e.target.value)})} placeholder="Max (e.g. 10)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all text-center mt-2" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">CA Max</label>
                      <input type="number" value={formData.caMax} onChange={(e) => setFormData({...formData, caMax: Number(e.target.value)})} placeholder="Max (e.g. 20)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all text-center mt-2" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Exam Max</label>
                      <input type="number" value={formData.examMax} onChange={(e) => setFormData({...formData, examMax: Number(e.target.value)})} placeholder="Max (e.g. 60)" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all text-center mt-2" />
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
                <button onClick={handleCreateSubmit} disabled={isCreating} className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-sm font-semibold transition-colors text-center disabled:opacity-70">
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
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total {activeTab === "student" ? "Students" : "Subjects"}</span>
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
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Completed Records</span>
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
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Pending Records</span>
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
          <div className="flex items-center gap-3 mb-4 text-white/90 relative z-10">
            <span className="text-sm font-bold tracking-wide">Average Score</span>
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
              ? "border-[#10b981] text-[#10b981]"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Subject Final Result
        </button>
        <button
          onClick={() => setActiveTab("student")}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "student"
              ? "border-[#10b981] text-[#10b981]"
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
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject Final Results</h2>
            <div className="flex flex-wrap items-center gap-3">
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
                <option>All Classes</option>
                <option>JSS 1 A</option>
                <option>JSS 1 B</option>
              </select>
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
                <option>All Sessions</option>
                <option>2023/2024</option>
                <option>2024/2025</option>
              </select>
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
                <option>All Terms</option>
                <option>First Term</option>
                <option>Second Term</option>
                <option>Third Term</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                  <th className="px-6 py-3 w-12">#</th>
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
                      <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div></td>
                      <td className="px-4 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div></td>
                      <td className="px-4 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16"></div></td>
                      <td className="px-6 py-4 flex justify-end"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12"></div></td>
                    </tr>
                  ))
                ) : subjectResults?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      No subject results found.
                    </td>
                  </tr>
                ) : (
                  subjectResults?.slice((subjectPage - 1) * PAGE_SIZE, subjectPage * PAGE_SIZE).map((res: any, index: number) => {
                    const globalIdx = (subjectPage - 1) * PAGE_SIZE + index + 1;
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors group">
                        <td className="px-6 py-4 text-xs text-slate-400">{globalIdx}</td>
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
                            onClick={() => router.push(res.createdById === user?.id ? `/dashboard/teacher/records/new?id=${res.id}` : `/dashboard/teacher/records/preview?id=${res.id}`)}
                            className="inline-block px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-[#10b981] hover:text-[#10b981] dark:hover:border-[#10b981] rounded text-xs font-bold transition-colors"
                          >
                            {res.createdById === user?.id ? "Edit" : "Preview"}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {subjectResults && subjectResults.length > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
              <span className="text-xs text-slate-500">
                Showing {(subjectPage - 1) * PAGE_SIZE + 1} - {Math.min(subjectPage * PAGE_SIZE, subjectResults.length)} of {subjectResults.length}
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
                  Page {subjectPage} of {Math.ceil(subjectResults.length / PAGE_SIZE)}
                </div>
                <button 
                  onClick={() => setSubjectPage(p => Math.min(Math.ceil(subjectResults.length / PAGE_SIZE), p + 1))}
                  disabled={subjectPage === Math.ceil(subjectResults.length / PAGE_SIZE)}
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
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Students Final Results</h2>
            <div className="flex flex-wrap items-center gap-3">
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
                <option>All Classes</option>
                <option>JSS 1 A</option>
                <option>JSS 1 B</option>
              </select>
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
                <option>All Sessions</option>
                <option>2023/2024</option>
                <option>2024/2025</option>
              </select>
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#10b981]/50 transition-all cursor-pointer">
                <option>All Terms</option>
                <option>First Term</option>
                <option>Second Term</option>
                <option>Third Term</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                  <th className="px-6 py-3 w-12">#</th>
                  <th className="px-4 py-3">STUDENT NAME</th>
                  <th className="px-4 py-3">CLASS</th>
                  <th className="px-4 py-3">SESSION & TERM</th>
                  <th className="px-4 py-3">AVERAGE</th>
                  <th className="px-4 py-3">POSITION</th>
                  <th className="px-4 py-3">STATUS</th>
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
                ) : studentResults?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      No student results found.
                    </td>
                  </tr>
                ) : (
                  studentResults?.slice((studentPage - 1) * PAGE_SIZE, studentPage * PAGE_SIZE).map((res: any, index: number) => {
                    const globalIdx = (studentPage - 1) * PAGE_SIZE + index + 1;
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors group">
                        <td className="px-6 py-4 text-xs text-slate-400">{globalIdx}</td>
                        <td className="px-4 py-4 text-slate-900 dark:text-slate-100 font-bold">{res.student?.name}</td>
                        <td className="px-4 py-4">{res.class?.name}</td>
                        <td className="px-4 py-4">
                          <span className="block text-slate-900 dark:text-slate-100">{res.session?.name}</span>
                          <span className="text-xs text-slate-400">{res.term}</span>
                        </td>
                        <td className="px-4 py-4 font-bold text-[#10b981]">{res.averageScore ? `${res.averageScore}%` : "-"}</td>
                        <td className="px-4 py-4 text-slate-500 font-medium">
                          {res.position ? res.position + (["st", "nd", "rd"][((res.position + 90) % 100 - 10) % 10 - 1] || "th") : "-"}
                        </td>
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
                          <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-[#10b981] hover:text-[#10b981] dark:hover:border-[#10b981] rounded text-xs font-bold transition-colors">
                            View Report
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {studentResults && studentResults.length > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
              <span className="text-xs text-slate-500">
                Showing {(studentPage - 1) * PAGE_SIZE + 1} - {Math.min(studentPage * PAGE_SIZE, studentResults.length)} of {studentResults.length}
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
                  Page {studentPage} of {Math.ceil(studentResults.length / PAGE_SIZE)}
                </div>
                <button 
                  onClick={() => setStudentPage(p => Math.min(Math.ceil(studentResults.length / PAGE_SIZE), p + 1))}
                  disabled={studentPage === Math.ceil(studentResults.length / PAGE_SIZE)}
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
