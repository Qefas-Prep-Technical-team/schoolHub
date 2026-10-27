"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Users,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  School as SchoolIcon,
  Info,
} from "lucide-react";
import { useClasses, useRequestToJoinClass } from "@/lib/api/hooks/useClasses";
import { useLinkRequests } from "@/lib/api/hooks/useLinks";
import { useStudentProfile } from "@/lib/api/hooks/useStudent";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import SuccessLottie from "@/lotties/Success.json";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

// Dynamically import Lottie for SSR safety
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export interface EnrolledStudentItem {
  id: string;
  name: string;
  studentCode?: string;
  gender?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  classCode: string;
  level?: string;
  section?: string;
  schoolId?: string;
  teachers?: Array<{
    teacher?: {
      id: string;
      name: string;
      email?: string;
      bannerImage?: string;
    };
  }>;
  subjects?: Array<{
    subject?: {
      id: string;
      name: string;
      code?: string;
      category?: string;
    };
  }>;
  departments?: Array<{
    department?: {
      id: string;
      name: string;
    };
  }>;
  enrollments?: Array<{
    student?: EnrolledStudentItem;
  }>;
}

interface RawClassEnrollment {
  id?: string;
  classCode?: string;
  class?: {
    id?: string;
    classCode?: string;
    [key: string]: unknown;
  };
}

export interface StudentClassSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId?: string;
  schoolName?: string;
  studentName?: string;
}

const AVATAR_COLORS = [
  "bg-pink-500 text-white",
  "bg-indigo-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-white",
  "bg-purple-500 text-white",
  "bg-rose-500 text-white",
  "bg-cyan-500 text-white",
];

export function StudentClassSelectionModal({
  isOpen,
  onClose,
  schoolId,
  schoolName = "your school",
  studentName = "Scholar",
}: StudentClassSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "JOINED">("ALL");
  const [requestedClass, setRequestedClass] = useState<ClassItem | null>(null);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [localPendingCodes, setLocalPendingCodes] = useState<Set<string>>(new Set());

  // Current authenticated user & profile
  const { user } = useAuthStore();
  const { data: studentProfile } = useStudentProfile();

  // Fetch current student's personal enrollments list
  const { data: myEnrolledClassesRaw } = useClasses();

  // Fetch live active classes for the connected school
  const { data: rawClasses = [], isLoading: isLoadingClasses } = useClasses(schoolId);
  const classesList: ClassItem[] = useMemo(() => {
    if (!Array.isArray(rawClasses)) return [];
    // If returned items are wrapped in enrollment objects, extract `.class`
    return (rawClasses as RawClassEnrollment[]).map((item) =>
      item?.class ? (item.class as unknown as ClassItem) : (item as unknown as ClassItem)
    );
  }, [rawClasses]);

  const currentStudentId = user?.id || studentProfile?.id;
  const currentStudentCode = user?.studentCode || studentProfile?.studentCode;

  // Extract set of enrolled class IDs and class codes across profile and student enrollments query
  const enrolledIdentifiers = useMemo(() => {
    const ids = new Set<string>();
    const codes = new Set<string>();

    // 1. From studentProfile.classes
    if (studentProfile?.classes && Array.isArray(studentProfile.classes)) {
      studentProfile.classes.forEach((item) => {
        const c = item?.class;
        if (c?.id) ids.add(String(c.id));
        if (c?.name) codes.add(String(c.name)); // name fallback if classCode not on nested
      });
    }

    // 2. From myEnrolledClassesRaw (GET /classes without schoolId)
    if (myEnrolledClassesRaw && Array.isArray(myEnrolledClassesRaw)) {
      (myEnrolledClassesRaw as RawClassEnrollment[]).forEach((item) => {
        const c = item?.class || item;
        if (c?.id) ids.add(String(c.id));
        if (c?.classCode) codes.add(String(c.classCode));
      });
    }

    return { ids, codes };
  }, [studentProfile, myEnrolledClassesRaw]);

  // Helper to determine if a class has already been joined by the student
  const isClassAlreadyJoined = useMemo(() => {
    return (cls: ClassItem): boolean => {
      if (cls.id && enrolledIdentifiers.ids.has(cls.id)) return true;
      if (cls.classCode && enrolledIdentifiers.codes.has(cls.classCode)) return true;

      // Check roster enrollments for student id or student code
      if (cls.enrollments && Array.isArray(cls.enrollments)) {
        return cls.enrollments.some((e) => {
          const st = e.student;
          if (!st) return false;
          if (currentStudentId && st.id === currentStudentId) return true;
          if (currentStudentCode && st.studentCode && st.studentCode === currentStudentCode) return true;
          return false;
        });
      }

      return false;
    };
  }, [enrolledIdentifiers, currentStudentId, currentStudentCode]);

  // Count joined classes in the current school
  const joinedCountInSchool = useMemo(() => {
    return classesList.filter((c) => isClassAlreadyJoined(c)).length;
  }, [classesList, isClassAlreadyJoined]);

  // Fetch pending link requests for this student to detect already-requested classes
  const { data: pendingRequestsData } = useLinkRequests(
    { status: "PENDING", category: "classroom" },
    { enabled: isOpen }
  );

  const pendingClassCodes = useMemo(() => {
    interface PendingRequestItem {
      linkType?: string;
      classId?: string;
      targetCode?: string;
      class?: { classCode?: string };
    }
    const items = (pendingRequestsData as { items?: PendingRequestItem[] })?.items || [];
    const serverCodes = items
      .filter((r) => r.linkType === "STUDENT_CLASS" || r.classId)
      .map((r) => r.targetCode || r.class?.classCode || "")
      .filter(Boolean);
    return new Set([...serverCodes, ...Array.from(localPendingCodes)]);
  }, [pendingRequestsData, localPendingCodes]);

  const joinMutation = useRequestToJoinClass();

  // Extract distinct levels for filter chips from the active classes
  const availableLevels = useMemo(() => {
    const levels = new Set<string>();
    classesList.forEach((c) => {
      if (c.level) levels.add(c.level);
    });
    return Array.from(levels);
  }, [classesList]);

  // Filter classes by search, level, and enrollment status
  const filteredClasses = useMemo(() => {
    return classesList.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.classCode.toLowerCase().includes(q) ||
        (c.level && c.level.toLowerCase().includes(q)) ||
        (c.departments &&
          c.departments.some((d) =>
            d.department?.name.toLowerCase().includes(q)
          )) ||
        (c.subjects &&
          c.subjects.some((s) =>
            s.subject?.name.toLowerCase().includes(q)
          ));

      const matchesLevel = selectedLevel === "ALL" || c.level === selectedLevel;

      const isJoined = isClassAlreadyJoined(c);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "JOINED" && isJoined) ||
        (statusFilter === "AVAILABLE" && !isJoined);

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [classesList, searchQuery, selectedLevel, statusFilter, isClassAlreadyJoined]);

  const handleJoinClass = (cls: ClassItem) => {
    setRequestedClass(cls);

    joinMutation.mutate(
      {
        classCode: cls.classCode,
        note: requestNote || `Student requested to join class via student portal`,
      },
      {
        onSuccess: () => {
          setLocalPendingCodes((prev) => new Set([...prev, cls.classCode]));
          setIsSuccessView(true);
          toast.success(`Request to join ${cls.name} submitted successfully!`);
        },
        onError: (err: unknown) => {
          const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
          toast.error(apiErr?.response?.data?.message || apiErr?.message || "Failed to submit class request");
        },
      }
    );
  };

  const handleDismissSuccess = () => {
    setIsSuccessView(false);
    setRequestedClass(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl">
        <AnimatePresence mode="wait">
          {isSuccessView && requestedClass ? (
            /* ================= Success View with Onboarding Lottie ================= */
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                  <Lottie animationData={SuccessLottie} loop={true} className="w-full h-full" />
                </div>
              </div>

              <div className="space-y-3 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 size={14} />
                  Request Sent Successfully
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Class Request Submitted!
                </h3>
                <p className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
                  A request to join <span className="font-bold text-pink-600 dark:text-pink-400">{requestedClass.name}</span> has been sent to{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{schoolName}</span>. Once the school administration accepts, you will be allowed in and can start accessing class subjects, timetables, and assessments.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 max-w-md w-full flex items-start gap-3 text-left">
                <Clock className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  <strong>What happens next?</strong> School administrators or class teachers receive your request instantly. When approved, your enrolled subjects and timetable will update automatically.
                </p>
              </div>

              <Button
                onClick={handleDismissSuccess}
                className="w-full sm:w-auto px-8 h-12 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-lg shadow-pink-600/20"
              >
                Go to Dashboard
              </Button>
            </motion.div>
          ) : (
            /* ================= Class Grid View ================= */
            <motion.div
              key="grid-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 p-6 sm:p-8 text-white relative shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <DialogHeader className="relative z-10 text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <SchoolIcon size={14} />
                        {schoolName}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-pink-400/30 text-xs font-bold uppercase tracking-wider">
                        Welcome, {studentName}
                      </span>
                      {joinedCountInSchool > 0 && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-300" />
                          {joinedCountInSchool} {joinedCountInSchool === 1 ? "Class Joined" : "Classes Joined"}
                        </span>
                      )}
                    </div>
                  </div>
                  <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Select Your Classroom
                  </DialogTitle>
                  <DialogDescription className="text-pink-100 text-xs sm:text-sm font-medium max-w-xl">
                    Choose from the classes available at your connected school to request enrollment. Review current students, subjects, and teachers before joining.
                  </DialogDescription>
                </DialogHeader>

                {/* Search & Filter Bar */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-200" size={16} />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search classes by name, code, subject, or department..."
                        className="h-10 sm:h-11 pl-10 rounded-xl bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-pink-200 text-xs sm:text-sm focus-visible:ring-white/30"
                      />
                    </div>
                  </div>

                  {/* Filter Chips: Enrollment Status & Grade Levels */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("ALL")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                        statusFilter === "ALL"
                          ? "bg-white text-pink-700 shadow-sm"
                          : "bg-white/15 text-white hover:bg-white/25"
                      )}
                    >
                      All ({classesList.length})
                    </button>
                    {joinedCountInSchool > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("JOINED")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1",
                          statusFilter === "JOINED"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/40"
                        )}
                      >
                        <CheckCircle2 size={12} />
                        Already Joined ({joinedCountInSchool})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setStatusFilter("AVAILABLE")}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                        statusFilter === "AVAILABLE"
                          ? "bg-white text-pink-700 shadow-sm"
                          : "bg-white/15 text-white hover:bg-white/25"
                      )}
                    >
                      Available to Join ({classesList.length - joinedCountInSchool})
                    </button>

                    {availableLevels.length > 0 && (
                      <>
                        <div className="h-4 w-px bg-white/20 mx-1 shrink-0" />
                        <button
                          type="button"
                          onClick={() => setSelectedLevel("ALL")}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                            selectedLevel === "ALL"
                              ? "bg-white text-pink-700 shadow-sm"
                              : "bg-white/10 text-white hover:bg-white/20"
                          )}
                        >
                          All Levels
                        </button>
                        {availableLevels.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSelectedLevel(selectedLevel === lvl ? "ALL" : lvl)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                              selectedLevel === lvl
                                ? "bg-white text-pink-700 shadow-sm"
                                : "bg-white/10 text-white hover:bg-white/20"
                            )}
                          >
                            {lvl}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Class Grid Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
                {isLoadingClasses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-56 rounded-2xl bg-slate-100 dark:bg-zinc-900 animate-pulse border border-slate-200 dark:border-zinc-800" />
                    ))}
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="py-12 sm:py-16 text-center space-y-3 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-6">
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto">
                      <GraduationCap size={24} />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {classesList.length === 0 ? "No Active Classes Available" : "No Matching Classes Found"}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                      {classesList.length === 0
                        ? `Your connected school (${schoolName}) has not registered any active class streams yet. Please check back soon or contact your school administrator.`
                        : "Try adjusting your search query, status, or level filters to find your classroom."}
                    </p>
                    {classesList.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedLevel("ALL");
                          setStatusFilter("ALL");
                        }}
                        className="rounded-xl mt-2 text-xs font-bold"
                      >
                        Reset Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClasses.map((cls) => {
                      const enrollments = cls.enrollments || [];
                      const studentCount = enrollments.length;
                      const subjectsCount = cls.subjects?.length || 0;
                      const teacher = cls.teachers?.[0]?.teacher;
                      const isAlreadyJoined = isClassAlreadyJoined(cls);
                      const isPending = pendingClassCodes.has(cls.classCode);
                      const isCurrentMutating = joinMutation.isPending && requestedClass?.id === cls.id;

                      // Sort enrollments so current student's avatar is displayed first
                      const sortedEnrollments = [...enrollments].sort((a, b) => {
                        const aIsMe =
                          Boolean(currentStudentId && a.student?.id === currentStudentId) ||
                          Boolean(currentStudentCode && a.student?.studentCode === currentStudentCode);
                        const bIsMe =
                          Boolean(currentStudentId && b.student?.id === currentStudentId) ||
                          Boolean(currentStudentCode && b.student?.studentCode === currentStudentCode);
                        if (aIsMe && !bIsMe) return -1;
                        if (!aIsMe && bIsMe) return 1;
                        return 0;
                      });

                      return (
                        <div
                          key={cls.id}
                          className={cn(
                            "group border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 relative overflow-hidden",
                            isAlreadyJoined
                              ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800/70 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-sm"
                              : "bg-white dark:bg-zinc-900/70 border-slate-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-800/60 hover:shadow-lg hover:shadow-pink-500/5"
                          )}
                        >
                          <div className="space-y-3">
                            {/* Class Header & Badges */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={cn(
                                  "inline-block px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-bold tracking-wider uppercase mb-1",
                                  isAlreadyJoined
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                    : "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300"
                                )}>
                                  {cls.classCode}
                                </span>
                                <h4 className={cn(
                                  "text-base sm:text-lg font-black line-clamp-1 transition-colors",
                                  isAlreadyJoined
                                    ? "text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                                    : "text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400"
                                )}>
                                  {cls.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {cls.level && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                    {cls.level}
                                  </span>
                                )}
                                {isAlreadyJoined && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                                    <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                                    Already Joined
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Meta strip: Teacher & Subjects */}
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 pt-1">
                              <span className="inline-flex items-center gap-1 font-medium">
                                <BookOpen size={13} className="text-slate-400" />
                                {subjectsCount} {subjectsCount === 1 ? "Subject" : "Subjects"}
                              </span>
                              {teacher && (
                                <span className="inline-flex items-center gap-1 font-medium truncate">
                                  <GraduationCap size={13} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{teacher.name}</span>
                                </span>
                              )}
                            </div>

                            {/* Enrolled Students Section */}
                            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className={cn(
                                  "font-bold inline-flex items-center gap-1.5",
                                  isAlreadyJoined ? "text-emerald-800 dark:text-emerald-300" : "text-slate-700 dark:text-zinc-300"
                                )}>
                                  <Users size={13} className={isAlreadyJoined ? "text-emerald-600 dark:text-emerald-400" : "text-pink-600 dark:text-pink-400"} />
                                  Students in Class
                                </span>
                                <span className="font-bold text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                  {studentCount} {studentCount === 1 ? "student" : "students"}
                                </span>
                              </div>

                              {/* Student Avatars & Names preview */}
                              {studentCount > 0 ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center -space-x-2 overflow-hidden py-1">
                                    {sortedEnrollments.slice(0, 5).map((e, idx) => {
                                      const st = e.student;
                                      const isMe =
                                        Boolean(currentStudentId && st?.id === currentStudentId) ||
                                        Boolean(currentStudentCode && st?.studentCode === currentStudentCode);
                                      const initial = isMe ? "YOU" : (st?.name?.charAt(0).toUpperCase() || "S");
                                      const colorClass = isMe
                                        ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                                        : AVATAR_COLORS[idx % AVATAR_COLORS.length];
                                      return (
                                        <div
                                          key={st?.id || idx}
                                          title={isMe ? `${st?.name || "Student"} (You)` : (st?.name || "Student")}
                                          className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center font-bold ring-2 shrink-0 shadow-sm transition-transform",
                                            isMe ? "text-[8px] z-10 scale-105" : "text-[10px] ring-white dark:ring-zinc-900",
                                            colorClass
                                          )}
                                        >
                                          {initial}
                                        </div>
                                      );
                                    })}
                                    {studentCount > 5 && (
                                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-zinc-900 shrink-0">
                                        +{studentCount - 5}
                                      </div>
                                    )}
                                  </div>
                                  {isAlreadyJoined ? (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold line-clamp-1 flex items-center gap-1">
                                      <CheckCircle2 size={12} className="shrink-0" />
                                      <span>
                                        You are enrolled in this class
                                        {studentCount > 1
                                          ? ` with ${studentCount - 1} other ${studentCount - 1 === 1 ? "student" : "students"}`
                                          : ""}
                                      </span>
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 font-medium">
                                      {sortedEnrollments
                                        .slice(0, 3)
                                        .map((e) => e.student?.name)
                                        .filter(Boolean)
                                        .join(", ")}
                                      {studentCount > 3 && `, and ${studentCount - 3} others`}
                                    </p>
                                  )}
                                </div>
                              ) : isAlreadyJoined ? (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold py-1 flex items-center gap-1">
                                  <CheckCircle2 size={12} className="shrink-0" />
                                  <span>You are currently enrolled in this class</span>
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic py-1">
                                  No students enrolled yet. Be the first to join!
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-zinc-800/80">
                            {isAlreadyJoined ? (
                              <div className="w-full h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-xs">
                                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Enrolled (Active Member)</span>
                              </div>
                            ) : isPending ? (
                              <div className="w-full h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                                <Clock size={14} />
                                Request Pending Approval
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleJoinClass(cls)}
                                disabled={isCurrentMutating}
                                className="w-full h-10 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-600/10 flex items-center justify-center gap-1.5 group-hover:shadow-pink-600/20 transition-all"
                              >
                                {isCurrentMutating ? (
                                  <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Sending Request...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Request to Join</span>
                                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer info */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 px-6 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <Info size={14} className="text-pink-500 shrink-0" />
                  <span>Your request will be submitted to school administration for review.</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  I&apos;ll decide later
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
