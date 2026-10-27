"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Calendar,
  GraduationCap,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
  UserMinus,
  Award,
  BookOpen,
  FileCheck2,
  ShieldAlert,
  Search,
  Clock,
  ChevronRight,
  Download,
  Info,
  CheckCircle2,
  ArrowRight,
  Building,
  RotateCcw,
  X,
  BadgeCheck,
  Layers,
  Sparkles,
  Filter,
  SlidersHorizontal,
  RefreshCw,
} from "lucide-react";
import { useClassHistory } from "@/lib/api/hooks/useClasses";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { ClassHistoryTimelineEvent } from "@/lib/api/services/classService";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generatePDF } from "@/utils/pdfGenerator";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface ClassHistoryClassData {
  enrollments?: unknown[];
  subjects?: unknown[];
  teachers?: unknown[];
  [key: string]: unknown;
}

interface ClassHistoryTabProps {
  classId: string;
  classData?: ClassHistoryClassData;
}

type EventFilterCategory = "all" | "students" | "promotions" | "staff" | "academics" | "conduct";

export default function ClassHistoryTab({ classId, classData }: ClassHistoryTabProps) {
  const { data: historyData, isLoading, refetch, isFetching } = useClassHistory(classId);
  const { user } = useAuthStore();
  const effectiveSchoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId);
  const { data: sessionsData } = useSessions(effectiveSchoolId);
  const sessions = Array.isArray(sessionsData?.data) ? sessionsData.data : (Array.isArray(sessionsData) ? sessionsData : []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventFilterCategory>("all");
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedEvent, setSelectedEvent] = useState<ClassHistoryTimelineEvent | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Raw timeline & metrics
  const timeline = historyData?.timeline || [];
  const metrics = historyData?.metrics || {
    currentEnrollments: classData?.enrollments?.length || 0,
    promotedOut: 0,
    promotedIn: 0,
    graduated: 0,
    totalEvents: 0,
    publishedResultsCount: 0,
    subjectsCount: classData?.subjects?.length || 0,
    teachersCount: classData?.teachers?.length || 0,
  };

  // Term normalization helper
  const normalizeTerm = (term?: string | null): string => {
    if (!term) return "";
    const t = term.toUpperCase();
    if (t.includes("FIRST") || t.includes("1ST") || t === "1") return "FIRST";
    if (t.includes("SECOND") || t.includes("2ND") || t === "2") return "SECOND";
    if (t.includes("THIRD") || t.includes("3RD") || t === "3") return "THIRD";
    return t;
  };

  const formatTermDisplay = (term?: string | null): string => {
    if (!term) return "";
    const norm = normalizeTerm(term);
    if (norm === "FIRST") return "First Term";
    if (norm === "SECOND") return "Second Term";
    if (norm === "THIRD") return "Third Term";
    return term;
  };

  // Extract all distinct sessions across API, class data, and historical events
  const availableSessions = useMemo(() => {
    const sessionSet = new Set<string>();

    if (sessions && Array.isArray(sessions)) {
      sessions.forEach((s: any) => {
        if (s.name && typeof s.name === "string") {
          sessionSet.add(s.name.trim());
        }
      });
    }

    if (classData?.session && typeof classData.session === "string") {
      sessionSet.add(classData.session.trim());
    }
    if (historyData?.classInfo?.session && typeof historyData.classInfo.session === "string") {
      sessionSet.add(historyData.classInfo.session.trim());
    }

    timeline.forEach((item) => {
      const sess = item.session || item.meta?.session;
      if (sess && typeof sess === "string") {
        sessionSet.add(sess.trim());
      }
    });

    return Array.from(sessionSet).sort().reverse();
  }, [sessions, classData, historyData, timeline]);

  // Check if an item matches the selected session
  const isMatchingSession = (item: ClassHistoryTimelineEvent, filterSession: string): boolean => {
    if (filterSession === "all") return true;
    const itemSession = item.session || item.meta?.session;
    if (!itemSession) return false;
    return itemSession.trim().toLowerCase() === filterSession.trim().toLowerCase();
  };

  // Check if an item matches the selected term
  const isMatchingTerm = (item: ClassHistoryTimelineEvent, filterTerm: string): boolean => {
    if (filterTerm === "all") return true;
    const itemTerm = item.term || item.meta?.term;
    if (!itemTerm) return false;
    return normalizeTerm(itemTerm) === filterTerm;
  };

  // Filtered & Sorted Timeline
  const filteredTimeline = useMemo(() => {
    return timeline
      .filter((item) => {
        // Category filter
        if (selectedCategory === "promotions") {
          if (item.type !== "PROMOTION_IN" && item.type !== "PROMOTION_OUT") return false;
        } else if (selectedCategory === "students") {
          if (item.category !== "students") return false;
        } else if (selectedCategory === "staff") {
          if (item.category !== "staff") return false;
        } else if (selectedCategory === "academics") {
          if (item.category !== "academics") return false;
        } else if (selectedCategory === "conduct") {
          if (item.type !== "BEHAVIOUR_ALERT") return false;
        }

        // Session filter
        if (!isMatchingSession(item, selectedSession)) return false;

        // Term filter
        if (!isMatchingTerm(item, selectedTerm)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchStudent =
            item.meta?.student?.name?.toLowerCase().includes(q) ||
            item.meta?.student?.studentCode?.toLowerCase().includes(q);
          const matchTeacher = item.meta?.teacher?.name?.toLowerCase().includes(q);
          const matchSubject = item.meta?.subject?.name?.toLowerCase().includes(q);
          const matchClass =
            item.meta?.toClassName?.toLowerCase().includes(q) ||
            item.meta?.fromClassName?.toLowerCase().includes(q);
          const matchSession = (item.session || item.meta?.session || "").toLowerCase().includes(q);
          const matchTerm = (item.term || item.meta?.term || "").toLowerCase().includes(q);

          return matchTitle || matchDesc || matchStudent || matchTeacher || matchSubject || matchClass || matchSession || matchTerm;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [timeline, selectedCategory, selectedSession, selectedTerm, searchQuery, sortOrder]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSession !== "all") count++;
    if (selectedTerm !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedSession, selectedTerm, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSession("all");
    setSelectedTerm("all");
  };

  // PDF Export
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const schoolName = schoolProfile?.name || "School";
      const className = classData?.name ? `${classData.name} ${classData.section || ""}`.trim() : "Class";

      const tableData = filteredTimeline.map((item, idx) => [
        String(idx + 1).padStart(2, "0"),
        format(new Date(item.date), "dd MMM yyyy, HH:mm"),
        item.title,
        item.type.replace(/_/g, " "),
        [item.session || item.meta?.session, formatTermDisplay(item.term || item.meta?.term)].filter(Boolean).join(" • ") || "N/A",
        item.description,
        item.actor?.name || "System",
      ]);

      await generatePDF({
        title: `${className} - Historical Lifecycle Log`,
        filename: `${className.replace(/\s+/g, "_")}_History_${format(new Date(), "yyyyMMdd")}.pdf`,
        schoolProfile,
        metaData: [
          { label: "Class", value: className },
          { label: "Academic Session", value: selectedSession === "all" ? "All Sessions" : selectedSession },
          { label: "Term", value: selectedTerm === "all" ? "All Terms" : formatTermDisplay(selectedTerm) },
          { label: "Category", value: selectedCategory.toUpperCase() },
          { label: "Current Enrollments", value: String(metrics.currentEnrollments) },
          { label: "Promoted Out", value: String(metrics.promotedOut) },
          { label: "Promoted In", value: String(metrics.promotedIn) },
          { label: "Graduated/Departed", value: String(metrics.graduated) },
          { label: "Certified Records", value: String(metrics.publishedResultsCount) },
        ],
        tableHeaders: [["#", "Date & Time", "Event Title", "Type", "Session / Term", "Description", "Logged By"]],
        tableData,
      });

      toast.success("Class history exported successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper for event icon and styling
  const getEventBadge = (type: ClassHistoryTimelineEvent["type"]) => {
    switch (type) {
      case "CLASS_CREATED":
        return {
          icon: Building,
          color: "text-indigo-600 dark:text-indigo-400",
          bg: "bg-indigo-50 dark:bg-indigo-500/10",
          border: "border-indigo-200 dark:border-indigo-800/40",
          ring: "ring-indigo-500/20",
          label: "Class Creation",
        };
      case "PROMOTION_OUT":
        return {
          icon: ArrowUpRight,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          border: "border-emerald-200 dark:border-emerald-800/40",
          ring: "ring-emerald-500/20",
          label: "Promoted Out",
        };
      case "PROMOTION_IN":
        return {
          icon: ArrowDownLeft,
          color: "text-sky-600 dark:text-sky-400",
          bg: "bg-sky-50 dark:bg-sky-500/10",
          border: "border-sky-200 dark:border-sky-800/40",
          ring: "ring-sky-500/20",
          label: "Promoted In",
        };
      case "ENROLLMENT":
        return {
          icon: UserCheck,
          color: "text-teal-600 dark:text-teal-400",
          bg: "bg-teal-50 dark:bg-teal-500/10",
          border: "border-teal-200 dark:border-teal-800/40",
          ring: "ring-teal-500/20",
          label: "Enrollment",
        };
      case "GRADUATION":
        return {
          icon: Award,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-500/10",
          border: "border-amber-200 dark:border-amber-800/40",
          ring: "ring-amber-500/20",
          label: "Graduation",
        };
      case "WITHDRAWAL":
        return {
          icon: UserMinus,
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-50 dark:bg-rose-500/10",
          border: "border-rose-200 dark:border-rose-800/40",
          ring: "ring-rose-500/20",
          label: "Departure",
        };
      case "TEACHER_ASSIGNED":
        return {
          icon: Users,
          color: "text-violet-600 dark:text-violet-400",
          bg: "bg-violet-50 dark:bg-violet-500/10",
          border: "border-violet-200 dark:border-violet-800/40",
          ring: "ring-violet-500/20",
          label: "Staff Assignment",
        };
      case "SUBJECT_ATTACHED":
        return {
          icon: BookOpen,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-500/10",
          border: "border-blue-200 dark:border-blue-800/40",
          ring: "ring-blue-500/20",
          label: "Curriculum",
        };
      case "RESULT_PUBLISHED":
        return {
          icon: FileCheck2,
          color: "text-emerald-700 dark:text-emerald-300",
          bg: "bg-emerald-100/70 dark:bg-emerald-500/20",
          border: "border-emerald-300 dark:border-emerald-700/50",
          ring: "ring-emerald-600/30",
          label: "Certified Results",
        };
      case "BEHAVIOUR_ALERT":
        return {
          icon: ShieldAlert,
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-500/10",
          border: "border-amber-200 dark:border-amber-800/40",
          ring: "ring-amber-500/20",
          label: "Conduct Note",
        };
      default:
        return {
          icon: Clock,
          color: "text-slate-600 dark:text-slate-400",
          bg: "bg-slate-50 dark:bg-slate-800",
          border: "border-slate-200 dark:border-slate-700",
          ring: "ring-slate-500/20",
          label: "General Event",
        };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Institutional Header ────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        {/* Subtle Ambient Background Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Class History & Lifecycle Ledger
            </h2>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <Info size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-md p-3 text-xs leading-relaxed">
                  <p className="font-bold mb-1">Comprehensive Class History Ledger</p>
                  <p>
                    Tracks the permanent chronological record of this classroom from inception: student promotions into and out of the cohort, new enrollments, staff assignments, curriculum updates, conduct logs, and certified final grade releases.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70">
              <Sparkles size={13} className="text-indigo-500 animate-pulse" />
              <span>Audit Trail</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Permanent institutional audit trail and student migration timeline for{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {classData?.name ? `${classData.name} ${classData.section ? `(${classData.section})` : ""}` : "this class"}
            </strong>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 z-10 self-start md:self-center shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            title="Refresh Timeline"
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={cn((isLoading || isFetching) && "animate-spin text-indigo-500")} />
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExporting || filteredTimeline.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} className={cn(isExporting && "animate-bounce")} />
            <span>{isExporting ? "Exporting PDF..." : "Export History"}</span>
          </button>
        </div>
      </header>

      {/* ── Metric Summary Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Active Roster</span>
            <div className="size-7 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/30">
              <Users size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {metrics.currentEnrollments}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Currently enrolled scholars</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Promoted Out</span>
            <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.promotedOut}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Advanced to higher classes</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Promoted In</span>
            <div className="size-7 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/30">
              <ArrowDownLeft size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {metrics.promotedIn}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Received from junior cohorts</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Graduated/Exit</span>
            <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30">
              <Award size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.graduated}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Completed or transferred</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Certified Records</span>
            <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/30">
              <FileCheck2 size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {metrics.publishedResultsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Published final score sheets</p>
        </div>
      </div>

      {/* ── Filter & Search Command Center ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, subjects, teachers, sessions, origin..."
              className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Session & Term Dropdowns + Sort Order */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Session Dropdown */}
            <div className="relative flex items-center min-w-[160px] sm:min-w-[180px]">
              <div className="absolute left-3 pointer-events-none text-slate-400">
                <Calendar size={14} className="text-indigo-500" />
              </div>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
              >
                <option value="all">All Sessions</option>
                {availableSessions.map((sess) => (
                  <option key={sess} value={sess}>
                    Session: {sess}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>

            {/* Term Dropdown */}
            <div className="relative flex items-center min-w-[140px] sm:min-w-[160px]">
              <div className="absolute left-3 pointer-events-none text-slate-400">
                <GraduationCap size={14} className="text-indigo-500" />
              </div>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full appearance-none pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
              >
                <option value="all">All Terms</option>
                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term</option>
              </select>
              <div className="absolute right-3 pointer-events-none text-slate-400">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              title="Toggle timeline chronological order"
              className="px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <Clock size={14} className="text-slate-400" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills & Results Counter */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All Events" },
              { id: "promotions", label: "Promotions" },
              { id: "students", label: "Students" },
              { id: "staff", label: "Staff" },
              { id: "academics", label: "Academics" },
              { id: "conduct", label: "Conduct" },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as EventFilterCategory)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 scale-102"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-900 dark:text-white">{filteredTimeline.length}</strong> of{" "}
              {timeline.length} events
            </span>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary Strip */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter size={11} /> Active:
            </span>

            {selectedSession !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span>Session: {selectedSession}</span>
                <button onClick={() => setSelectedSession("all")} className="hover:text-indigo-900 dark:hover:text-white">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedTerm !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span>Term: {formatTermDisplay(selectedTerm)}</span>
                <button onClick={() => setSelectedTerm("all")} className="hover:text-indigo-900 dark:hover:text-white">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory("all")} className="hover:text-indigo-900 dark:hover:text-white">
                  <X size={12} />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                <button onClick={() => setSearchQuery("")} className="hover:text-indigo-900 dark:hover:text-white">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Timeline Section ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse flex items-start gap-4"
            >
              <div className="size-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="size-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
            <SlidersHorizontal size={26} />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">No Historical Events Match Your Criteria</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {activeFiltersCount > 0
              ? "We couldn't find any class lifecycle events matching your active filters. Try adjusting your session, term, category, or search keywords."
              : "No historical lifecycle events have been recorded for this class cohort yet."}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw size={13} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline Stream Header Track Anchor */}
          <div className="flex items-center gap-3 sm:gap-4.5 pb-3">
            <div className="w-10 sm:w-12 shrink-0 flex justify-center">
              <div className="relative flex items-center justify-center size-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs">
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/70 px-3 py-1 rounded-full border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
                {sortOrder === "desc" ? "Latest Timeline Activity" : "Historical Cohort Inception"}
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                • {filteredTimeline.length} {filteredTimeline.length === 1 ? "event recorded" : "events recorded"}
              </span>
            </div>
          </div>

          {/* Timeline Interconnected Chain Nodes */}
          {filteredTimeline.map((item, index) => {
            const badge = getEventBadge(item.type);
            const Icon = badge.icon;
            const isFirst = index === 0;
            const isLast = index === filteredTimeline.length - 1;

            const itemSession = item.session || item.meta?.session;
            const itemTerm = item.term || item.meta?.term;

            return (
              <div key={item.id} className="relative flex items-stretch gap-3 sm:gap-4.5 group">
                {/* Spine Column: The interconnected chain link */}
                <div className="w-10 sm:w-12 shrink-0 flex flex-col items-center relative">
                  {/* Upper vertical chain segment */}
                  <div
                    className={cn(
                      "w-1 rounded-full transition-all duration-300",
                      isFirst
                        ? "h-2.5 bg-gradient-to-b from-indigo-500/80 to-indigo-500"
                        : "h-3.5 bg-gradient-to-b from-indigo-500 via-indigo-500 to-indigo-500 dark:from-indigo-500 dark:via-indigo-500/80 dark:to-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.2)]"
                    )}
                  />

                  {/* Chain Link Outer Track Halo + Node Icon */}
                  <div className="relative my-0.5 flex items-center justify-center">
                    {/* Subtle ambient pulse ring for the first item */}
                    {isFirst && (
                      <div className="absolute -inset-1.5 rounded-2xl bg-indigo-500/25 dark:bg-indigo-500/35 blur-xs animate-pulse" />
                    )}

                    {/* The Node Icon Badge */}
                    <div
                      className={cn(
                        "relative size-10 sm:size-11 rounded-2xl flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/25 group-hover:shadow-lg z-10",
                        badge.bg,
                        badge.border,
                        isFirst
                          ? "ring-4 ring-indigo-500/30 dark:ring-indigo-500/40"
                          : "ring-4 ring-slate-100 dark:ring-slate-800/90 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-950/70"
                      )}
                    >
                      <Icon size={17} className={cn(badge.color, "transition-transform group-hover:scale-110")} />
                    </div>

                    {/* Chain Connector Ringlet Pin on the branch side */}
                    <div className="absolute -right-1.5 size-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-xs z-20 group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Lower vertical chain segment */}
                  <div
                    className={cn(
                      "flex-1 w-1 relative flex items-center justify-center rounded-full transition-all duration-300 min-h-[30px]",
                      isLast
                        ? "bg-gradient-to-b from-indigo-500 via-indigo-400 to-transparent dark:from-indigo-500 dark:via-indigo-500/40"
                        : "bg-gradient-to-b from-indigo-500 via-indigo-400/80 to-indigo-500 dark:from-indigo-500 dark:via-indigo-500/60 dark:to-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.2)] group-hover:bg-indigo-500"
                    )}
                  >
                    {/* Authentic Interlocking Chain-Link Bead */}
                    {!isLast && (
                      <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
                        <span className="w-1.5 h-3.5 rounded-full border-2 border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs group-hover:border-indigo-600 dark:group-hover:border-indigo-300 group-hover:scale-110 transition-all" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Horizontal Connector Stem & Event Card */}
                <div className="relative flex-1 pb-5 sm:pb-6 min-w-0 pt-0.5">
                  {/* Branch link connecting the node to the card */}
                  <div className="absolute -left-3 sm:-left-[1.125rem] top-[21px] sm:top-[23px] flex items-center pointer-events-none z-0">
                    <div className="w-3 sm:w-[1.125rem] h-[2px] bg-gradient-to-r from-indigo-500 via-indigo-300 to-slate-200 dark:from-indigo-500 dark:via-indigo-600/70 dark:to-slate-700 group-hover:from-indigo-600 group-hover:to-indigo-400 transition-colors" />
                    <div className="size-1.5 rounded-full bg-indigo-500 -ml-0.5 shadow-xs group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Event Card */}
                  <div
                    onClick={() => setSelectedEvent(item)}
                    className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group/card relative"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                            badge.bg,
                            badge.color,
                            badge.border
                          )}
                        >
                          {badge.label}
                        </span>

                        {/* Session & Term Pill */}
                        {(itemSession || itemTerm) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                            <Layers size={11} className="text-indigo-500" />
                            <span>
                              {[itemSession, itemTerm ? formatTermDisplay(itemTerm) : null]
                                .filter(Boolean)
                                .join(" • ")}
                            </span>
                          </span>
                        )}

                        <span className="text-xs font-semibold text-slate-400">
                          {format(new Date(item.date), "MMMM d, yyyy • h:mm a")}
                        </span>

                        {item.actor?.name && (
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            By: {item.actor.name}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Right Action / Trajectory Indicator */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      {item.meta?.toClassName && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50">
                          <span>To:</span>
                          <span className="font-extrabold">{item.meta.toClassName}</span>
                        </div>
                      )}
                      {item.meta?.fromClassName && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800/50">
                          <span>From:</span>
                          <span className="font-extrabold">{item.meta.fromClassName}</span>
                        </div>
                      )}
                      <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Timeline Terminal Cap */}
          <div className="flex items-center gap-3 sm:gap-4.5 pt-1">
            <div className="w-10 sm:w-12 shrink-0 flex justify-center">
              <div className="size-7 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-500" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{sortOrder === "desc" ? "Cohort Genesis & Class Founding" : "End of Visible Ledger"}</span>
              {filteredTimeline.length > 0 && (
                <span className="text-[11px] text-slate-400 font-normal">
                  ({format(new Date(filteredTimeline[filteredTimeline.length - 1].date), "yyyy")})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Event Details Modal ─────────────────────────────────────────────── */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {selectedEvent.category.toUpperCase()}
                </span>
                {(selectedEvent.session || selectedEvent.meta?.session || selectedEvent.term || selectedEvent.meta?.term) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <Layers size={10} />
                    <span>
                      {[
                        selectedEvent.session || selectedEvent.meta?.session,
                        formatTermDisplay(selectedEvent.term || selectedEvent.meta?.term),
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-400">
                  {format(new Date(selectedEvent.date), "MMMM d, yyyy • h:mm a")}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {selectedEvent.description}
              </DialogDescription>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Event Metadata Breakdown */}
              {selectedEvent.meta?.student && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <UserCheck size={16} className="text-teal-500" />
                    <span>Student Profile</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Student Name</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedEvent.meta.student.name}</span>
                    </div>
                    {selectedEvent.meta.student.studentCode && (
                      <div>
                        <span className="text-slate-400 block">Admission Code</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedEvent.meta.student.studentCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Destination / Origin class for promotions */}
              {(selectedEvent.meta?.toClassName || selectedEvent.meta?.fromClassName) && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <GraduationCap size={16} className="text-indigo-500" />
                    <span>Promotion Trajectory</span>
                  </h5>
                  <div className="flex items-center gap-3">
                    {selectedEvent.meta.fromClassName && (
                      <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">From Class</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{selectedEvent.meta.fromClassName}</span>
                      </div>
                    )}
                    <ArrowRight size={18} className="text-slate-400" />
                    {selectedEvent.meta.toClassName && (
                      <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">To Class</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{selectedEvent.meta.toClassName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Academic achievements snapshot */}
              {selectedEvent.meta?.achievements?.termResults && selectedEvent.meta.achievements.termResults.length > 0 && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                    <Award size={16} className="text-amber-500" />
                    <span>Academic Snapshot at Movement</span>
                  </h5>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedEvent.meta.achievements.termResults.map((tr: any, idx: number) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {tr.term} Term ({tr.sessionName || "Session"})
                        </span>
                        <div className="flex items-center gap-3">
                          {tr.averageScore != null && (
                            <span className="font-bold text-slate-900 dark:text-white">Avg: {tr.averageScore}%</span>
                          )}
                          {tr.position != null && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              Pos: #{tr.position}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital signature stamp for certified results */}
              {selectedEvent.meta?.approval?.approvedByName && (
                <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                    <BadgeCheck size={16} />
                    <span>Official Administrative Certification</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Certified and published by <strong className="text-slate-900 dark:text-white">{selectedEvent.meta.approval.approvedByName}</strong>.
                  </p>
                  {selectedEvent.meta.approval.signature && (
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/40">
                      <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 block">
                        Verification Seal: {selectedEvent.meta.approval.signature}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Log Actor */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Record ID: {selectedEvent.id}</span>
                {selectedEvent.actor?.name && <span>Authorized by: {selectedEvent.actor.name}</span>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
