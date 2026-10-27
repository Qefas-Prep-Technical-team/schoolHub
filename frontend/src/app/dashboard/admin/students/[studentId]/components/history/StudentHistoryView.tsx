"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  GraduationCap,
  Layers,
  Calendar,
  BookOpen,
  Award,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  UserMinus,
  CheckCircle2,
  RotateCcw,
  Percent,
  ListFilter,
  BarChart3,
  Flame,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  StudentHistoryResponse,
  AcademicHistoryCohort,
  SubjectHistoryRecord,
  StudentHistoryTimelineItem,
} from "@/lib/api/services/studentService";
import { HistoryDetailsModal } from "../../../components/HistoryDetailsModal";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

interface StudentHistoryViewProps {
  studentId: string;
  student?: Record<string, unknown> | null;
  historyData?: StudentHistoryResponse | StudentHistoryTimelineItem[] | null;
  isLoading: boolean;
  primaryColor?: string;
}

export default function StudentHistoryView({
  studentId,
  student,
  historyData,
  isLoading,
  primaryColor = "#2563eb",
}: StudentHistoryViewProps) {
  // Normalize history data response
  const timeline: StudentHistoryTimelineItem[] = useMemo(() => {
    if (!historyData) return [];
    if (Array.isArray(historyData)) return historyData;
    return historyData.timeline || [];
  }, [historyData]);

  const academicHistory: AcademicHistoryCohort[] = useMemo(() => {
    if (!historyData || Array.isArray(historyData)) return [];
    return historyData.academicHistory || [];
  }, [historyData]);

  const summary = useMemo(() => {
    if (!historyData || Array.isArray(historyData)) {
      return {
        totalClasses: 0,
        totalSessions: 0,
        totalSubjects: 0,
        overallAverage: 0,
      };
    }
    return historyData.summary;
  }, [historyData]);

  // Tab mode: "ledger" (Academic Gradebook) vs "timeline" (Milestones & Lifecycle)
  const [activeSubTab, setActiveSubTab] = useState<"ledger" | "timeline">("ledger");

  // Filters state for Academic Ledger & Timeline
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // Timeline modal state
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch school sessions from API
  const { user } = useAuthStore();
  const effectiveSchoolId =
    (user?.schools?.[0]?.schoolId as string) ||
    (user?.tenantId as string) ||
    ((student?.schoolId || (student?.school as Record<string, unknown>)?.id) as string) ||
    "";
  const { data: sessionsData } = useSessions(effectiveSchoolId);
  const schoolSessions = useMemo(() => {
    if (Array.isArray(sessionsData?.data)) return sessionsData.data;
    if (Array.isArray(sessionsData)) return sessionsData;
    return [];
  }, [sessionsData]);

  // Term normalization helper
  const normalizeTerm = (term?: string | null): string => {
    if (!term) return "";
    const t = term.toUpperCase().trim();
    if (t.includes("FIRST") || t.includes("1ST") || t === "1") return "FIRST";
    if (t.includes("SECOND") || t.includes("2ND") || t === "2") return "SECOND";
    if (t.includes("THIRD") || t.includes("3RD") || t === "3") return "THIRD";
    return t;
  };

  // Available unique sessions for dropdown:
  // Combines sessions from academic cohorts, timeline events, and school sessions
  const availableSessions = useMemo(() => {
    const set = new Set<string>();
    academicHistory.forEach((c) => {
      if (c.session) set.add(c.session.trim());
    });
    timeline.forEach((t) => {
      if (t.meta?.session) set.add((t.meta.session as string).trim());
    });
    schoolSessions.forEach((s: any) => {
      const name = s.name || s.session || s.title;
      if (name) set.add(String(name).trim());
    });
    return Array.from(set).sort();
  }, [academicHistory, timeline, schoolSessions]);

  // Toggle expanded assessment drawer for a subject
  const toggleSubjectExpand = (key: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filtered academic cohorts and subjects
  const filteredCohorts = useMemo(() => {
    return academicHistory
      .filter((cohort) => {
        if (sessionFilter !== "all" && cohort.session?.trim() !== sessionFilter.trim()) return false;
        if (termFilter !== "all" && normalizeTerm(cohort.term) !== normalizeTerm(termFilter)) return false;
        return true;
      })
      .map((cohort) => {
        if (!searchQuery.trim()) return cohort;
        const q = searchQuery.toLowerCase();
        const matchingSubjects = cohort.subjects.filter(
          (s) =>
            s.subjectName.toLowerCase().includes(q) ||
            (s.subjectCode && s.subjectCode.toLowerCase().includes(q))
        );
        return {
          ...cohort,
          subjects: matchingSubjects,
        };
      })
      .filter((cohort) => cohort.subjects.length > 0 || !searchQuery.trim());
  }, [academicHistory, sessionFilter, termFilter, searchQuery]);

  // Filtered chronological timeline
  const filteredTimeline = useMemo(() => {
    return timeline.filter((event) => {
      if (sessionFilter !== "all") {
        const evSession = event.meta?.session as string | undefined;
        if (evSession && evSession.trim() !== sessionFilter.trim()) return false;
      }
      if (termFilter !== "all") {
        const evTerm = event.meta?.term as string | undefined;
        if (evTerm && normalizeTerm(evTerm) !== normalizeTerm(termFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title?.toLowerCase().includes(q);
        const matchesDesc = event.description?.toLowerCase().includes(q);
        const eventSubjects = Array.isArray(event.meta?.subjects)
          ? (event.meta.subjects as Array<{ subjectName?: string; subjectCode?: string }>)
          : [];
        const matchesSubject = eventSubjects.some(
          (s) =>
            (s.subjectName && s.subjectName.toLowerCase().includes(q)) ||
            (s.subjectCode && s.subjectCode.toLowerCase().includes(q))
        );
        if (!matchesTitle && !matchesDesc && !matchesSubject) return false;
      }
      return true;
    });
  }, [timeline, sessionFilter, termFilter, searchQuery]);

  const handleOpenEventModal = (event: StudentHistoryTimelineItem) => {
    setSelectedEvent(event as unknown as Record<string, unknown>);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div
          className="size-10 rounded-full border-2 border-slate-200 dark:border-white/10 animate-spin"
          style={{ borderTopColor: primaryColor }}
        />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading Academic & Lifecycle History...
        </p>
      </div>
    );
  }

  return (
    <div className="w-[98%] mx-auto px-2 sm:px-4 md:px-8 mt-6 pb-20 space-y-8">
      {/* ── Top Summary Metric Pills ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Classes Cohort */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Enrolled Cohorts
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {summary.totalClasses || academicHistory.length || (student?.classes ? 1 : 0)}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate">
            {academicHistory[0]?.className || "Active Class Cohort"}
          </p>
        </div>

        {/* Sessions Tracked */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 rounded-l-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Academic Sessions
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {summary.totalSessions || availableSessions.length || 1}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate">
            {availableSessions[0] || "Academic Session"}
          </p>
        </div>

        {/* Total Evaluated Subjects */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Subjects Evaluated
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {summary.totalSubjects || academicHistory[0]?.totalSubjects || 0}
              </h3>
            </div>
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            Active subject assessments
          </p>
        </div>

        {/* Overall Academic Average */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Overall Average
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {summary.overallAverage || academicHistory[0]?.termAverage || 0}
                </span>
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-2">
            Grade: {academicHistory[0]?.termGrade || "N/A"} ({academicHistory[0]?.termGradeLabel || "General"})
          </p>
        </div>
      </div>

      {/* ── Sub-Tab Selector & Controls Bar ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-2.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center p-1 bg-white dark:bg-slate-950 rounded-xl shadow-xs gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab("ledger")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
              activeSubTab === "ledger"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <BarChart3 size={14} />
            <span>Academic Gradebook</span>
          </button>
          <button
            onClick={() => setActiveSubTab("timeline")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
              activeSubTab === "timeline"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Flame size={14} />
            <span>Chronological Timeline</span>
          </button>
        </div>

        {/* Filters Bar: Always Visible for Both Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56 min-w-[160px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={activeSubTab === "ledger" ? "Search subject name or code..." : "Search timeline events..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Session Selector (ALWAYS Visible) */}
          <div className="relative">
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              aria-label="Filter by Academic Session"
              className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
            >
              <option value="all">All Sessions</option>
              {availableSessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Calendar
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 pointer-events-none"
            />
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Term Selector */}
          <div className="relative">
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              aria-label="Filter by Term"
              className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
            >
              <option value="all">All Terms</option>
              <option value="FIRST">First Term</option>
              <option value="SECOND">Second Term</option>
              <option value="THIRD">Third Term</option>
            </select>
            <Layers
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400 pointer-events-none"
            />
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ── Active Filters Reset Strip ───────────────────────────────────────── */}
      {(searchQuery || sessionFilter !== "all" || termFilter !== "all") && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Active filters:</span>
          {sessionFilter !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
              <Calendar size={11} className="text-indigo-500" />
              <span>Session: {sessionFilter}</span>
              <button
                onClick={() => setSessionFilter("all")}
                className="ml-0.5 text-indigo-400 hover:text-indigo-700 dark:hover:text-white cursor-pointer"
                title="Remove session filter"
              >
                ×
              </button>
            </span>
          )}
          {termFilter !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
              <Layers size={11} className="text-indigo-500" />
              <span>Term: {termFilter === "FIRST" ? "First Term" : termFilter === "SECOND" ? "Second Term" : termFilter === "THIRD" ? "Third Term" : termFilter}</span>
              <button
                onClick={() => setTermFilter("all")}
                className="ml-0.5 text-indigo-400 hover:text-indigo-700 dark:hover:text-white cursor-pointer"
                title="Remove term filter"
              >
                ×
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
              <Search size={11} className="text-indigo-500" />
              <span>Query: &quot;{searchQuery}&quot;</span>
              <button
                onClick={() => setSearchQuery("")}
                className="ml-0.5 text-indigo-400 hover:text-indigo-700 dark:hover:text-white cursor-pointer"
                title="Clear search"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery("");
              setSessionFilter("all");
              setTermFilter("all");
            }}
            className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline cursor-pointer ml-2"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── VIEW 1: Academic Ledger & Subject Grades ─────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "ledger" && (
        <div className="space-y-8">
          {filteredCohorts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="size-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <SlidersHorizontal size={24} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                No Academic Records Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No subjects or examination grades match your active filters. Try resetting the session or term filter.
              </p>
            </div>
          ) : (
            filteredCohorts.map((cohort) => (
              <div
                key={cohort.cohortId}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden"
              >
                {/* Cohort Header Bar */}
                <div className="px-5 py-4.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Class Pill */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-2xs">
                      <GraduationCap size={14} />
                      <span>{cohort.className}</span>
                    </span>

                    {/* Session Pill */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/60 dark:border-slate-700/60">
                      <Layers size={13} className="text-indigo-500" />
                      <span>{cohort.session}</span>
                    </span>

                    {/* Term Pill */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/80 dark:border-indigo-800/60">
                      <Calendar size={13} className="text-indigo-500" />
                      <span>{cohort.termDisplay}</span>
                    </span>

                    <span className="text-xs font-semibold text-slate-400 hidden lg:inline">
                      Enrolled: {format(new Date(cohort.enrolledAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {/* Right Cohort Average / Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        Term Average:
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {cohort.termAverage}%
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black uppercase",
                          cohort.termGrade === "A1" || cohort.termGrade === "B2"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : cohort.termGrade.startsWith("C") || cohort.termGrade.startsWith("B")
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                            : cohort.termGrade.startsWith("D") || cohort.termGrade.startsWith("E")
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                        )}
                      >
                        {cohort.termGrade} ({cohort.termGradeLabel})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subjects Grid */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cohort.subjects.map((sub) => {
                      const subjectKey = `${cohort.cohortId}_${sub.subjectName}`;
                      const isExpanded = !!expandedSubjects[subjectKey];

                      return (
                        <div
                          key={sub.subjectName}
                          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-4 sm:p-5 hover:border-indigo-500/40 transition-all shadow-2xs space-y-3"
                        >
                          {/* Subject Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                  {sub.subjectName}
                                </h4>
                                {sub.subjectCode && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {sub.subjectCode}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                {sub.assessmentsCount}{" "}
                                {sub.assessmentsCount === 1 ? "assessment" : "assessments recorded"}
                              </p>
                            </div>

                            {/* Final Subject Score Badge */}
                            <div className="flex flex-col items-end shrink-0">
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                  {sub.percentage}%
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                                  sub.gradeColor === "emerald"
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                                    : sub.gradeColor === "indigo"
                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                                    : sub.gradeColor === "amber"
                                    ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                                )}
                              >
                                {sub.grade} • {sub.gradeLabel}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                sub.gradeColor === "emerald"
                                  ? "bg-emerald-500"
                                  : sub.gradeColor === "indigo"
                                  ? "bg-indigo-500"
                                  : sub.gradeColor === "amber"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              )}
                              style={{ width: `${Math.min(100, Math.max(0, sub.percentage))}%` }}
                            />
                          </div>

                          {/* Expandable Assessment Breakdown Drawer */}
                          {sub.assessments.length > 0 && (
                            <div className="pt-1">
                              <button
                                onClick={() => toggleSubjectExpand(subjectKey)}
                                className="flex items-center justify-between w-full py-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                              >
                                <span>
                                  {isExpanded
                                    ? "Hide assessment components"
                                    : `View ${sub.assessments.length} assessment breakdown`}
                                </span>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>

                              {isExpanded && (
                                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                                  {sub.assessments.map((a) => (
                                    <div
                                      key={a.id}
                                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs"
                                    >
                                      <div className="min-w-0 pr-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                            {a.category}
                                          </span>
                                          <p className="font-bold text-slate-900 dark:text-white truncate">
                                            {a.title}
                                          </p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                          {format(new Date(a.date), "MMM d, yyyy")}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                          <span className="font-black text-slate-900 dark:text-white">
                                            {a.score} / {a.maxMarks}
                                          </span>
                                          <span className="text-[10px] font-bold text-slate-400 ml-1">
                                            ({a.percentage}%)
                                          </span>
                                        </div>
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                          {a.gradeLetter}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── VIEW 2: Chronological Milestone Timeline ─────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "timeline" && (
        <div className="relative space-y-0">
          {/* Top Activity Beacon Anchor */}
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
                Permanent Academic & Lifecycle Ledger
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                • {filteredTimeline.length} {filteredTimeline.length === 1 ? "milestone recorded" : "milestones recorded"}
              </span>
            </div>
          </div>

          {/* Timeline Nodes */}
          {filteredTimeline.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 my-4">
              <Calendar className="size-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No timeline milestones match active filters
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No events found for session &quot;{sessionFilter}&quot; or term &quot;{termFilter}&quot;. Try selecting &quot;All Sessions&quot; or clearing active filters.
              </p>
            </div>
          ) : (
            filteredTimeline.map((event, index) => {
              const isFirst = index === 0;
              const isLast = index === filteredTimeline.length - 1;

              const isAcademic = event.eventType === "ACADEMIC_RECORD";
              const isEnrollment = event.eventType === "ENROLLMENT" || event.eventType === "JOINED_SCHOOL";
            const isPrefect = event.eventType.includes("PREFECT");
            const isExit = event.eventType === "EXITED_SCHOOL" || event.eventType === "WITHDRAWAL";

            const metaSession = (event.meta?.session as string) || null;
            const metaTerm = (event.meta?.term as string) || null;
            const metaClass = (event.meta?.className as string) || null;
            const metaAverage = (event.meta?.termAverage as number) || null;

            return (
              <div key={event.id} className="relative flex items-stretch gap-3 sm:gap-4.5 group">
                {/* Spine Column: mathematically centered */}
                <div className="w-10 sm:w-12 shrink-0 flex flex-col items-center relative">
                  {/* Upper vertical stem */}
                  <div
                    className={cn(
                      "w-1 rounded-full transition-all duration-300",
                      isFirst
                        ? "h-2.5 bg-gradient-to-b from-indigo-500/80 to-indigo-500"
                        : "h-3.5 bg-gradient-to-b from-indigo-500 via-indigo-500 to-indigo-500 dark:from-indigo-500 dark:via-indigo-500/80 dark:to-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.2)]"
                    )}
                  />

                  {/* Node Icon Badge */}
                  <div className="relative my-0.5 flex items-center justify-center">
                    {isFirst && (
                      <div className="absolute -inset-1.5 rounded-2xl bg-indigo-500/25 dark:bg-indigo-500/35 blur-xs animate-pulse" />
                    )}

                    <div
                      className={cn(
                        "relative size-10 sm:size-11 rounded-2xl flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-500/25 group-hover:shadow-lg z-10",
                        isAcademic
                          ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border-indigo-200 dark:border-indigo-800"
                          : isEnrollment
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                          : isPrefect
                          ? "bg-amber-50 dark:bg-amber-950 text-amber-600 border-amber-200 dark:border-amber-800"
                          : isExit
                          ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200 dark:border-rose-800"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700",
                        isFirst
                          ? "ring-4 ring-indigo-500/30 dark:ring-indigo-500/40"
                          : "ring-4 ring-slate-100 dark:ring-slate-800/90 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-950/70"
                      )}
                    >
                      {isAcademic ? (
                        <GraduationCap size={18} />
                      ) : isEnrollment ? (
                        <UserCheck size={18} />
                      ) : isPrefect ? (
                        <ShieldCheck size={18} />
                      ) : isExit ? (
                        <UserMinus size={18} />
                      ) : (
                        <BookOpen size={18} />
                      )}
                    </div>

                    {/* Micro Chain Ringlet */}
                    <div className="absolute -right-1.5 size-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-xs z-20 group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Lower vertical chain stem */}
                  <div
                    className={cn(
                      "flex-1 w-1 relative flex items-center justify-center rounded-full transition-all duration-300 min-h-[30px]",
                      isLast
                        ? "bg-gradient-to-b from-indigo-500 via-indigo-400 to-transparent dark:from-indigo-500 dark:via-indigo-500/40"
                        : "bg-gradient-to-b from-indigo-500 via-indigo-400/80 to-indigo-500 dark:from-indigo-500 dark:via-indigo-500/60 dark:to-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.2)] group-hover:bg-indigo-500"
                    )}
                  >
                    {!isLast && (
                      <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
                        <span className="w-1.5 h-3.5 rounded-full border-2 border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs group-hover:border-indigo-600 dark:group-hover:border-indigo-300 group-hover:scale-110 transition-all" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Horizontal Branch & Event Card */}
                <div className="relative flex-1 pb-5 sm:pb-6 min-w-0 pt-0.5">
                  {/* Branch Arm */}
                  <div className="absolute -left-3 sm:-left-[1.125rem] top-[21px] sm:top-[23px] flex items-center pointer-events-none z-0">
                    <div className="w-3 sm:w-[1.125rem] h-[2px] bg-gradient-to-r from-indigo-500 via-indigo-300 to-slate-200 dark:from-indigo-500 dark:via-indigo-600/70 dark:to-slate-700 group-hover:from-indigo-600 group-hover:to-indigo-400 transition-colors" />
                    <div className="size-1.5 rounded-full bg-indigo-500 -ml-0.5 shadow-xs group-hover:scale-125 transition-transform" />
                  </div>

                  {/* Card Content */}
                  <div
                    onClick={() => handleOpenEventModal(event)}
                    className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group/card relative"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Event Category Badge */}
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {event.eventType}
                        </span>

                        {/* Session / Term Badge */}
                        {(metaSession || metaTerm || metaClass) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                            <Layers size={11} className="text-indigo-500" />
                            <span>
                              {[metaClass, metaSession, metaTerm].filter(Boolean).join(" • ")}
                            </span>
                          </span>
                        )}

                        <span className="text-xs font-semibold text-slate-400">
                          {format(new Date(event.date), "MMMM d, yyyy")}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {event.title}
                      </h4>

                      {event.description && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Right Action & Trajectory Indicator */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      {metaAverage !== null && (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black uppercase text-slate-400">
                            Score
                          </span>
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                            {metaAverage}%
                          </span>
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
          })
        )}

          {/* Timeline Terminal Cap */}
          <div className="flex items-center gap-3 sm:gap-4.5 pt-1">
            <div className="w-10 sm:w-12 shrink-0 flex justify-center">
              <div className="size-7 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-500" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Student Inception & Permanent Record</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Details Modal ─────────────────────────────────────────────── */}
      {selectedEvent && (
        <HistoryDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          eventData={selectedEvent}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}
