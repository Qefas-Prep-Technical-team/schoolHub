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
  XCircle,
  ArrowRightLeft,
  ShieldAlert,
  Clock,
  ArrowRight,
  School as SchoolIcon,
  Info,
  Link2,
  TrendingUp,
  Lock,
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

export type StudentClassStatus = "ENROLLED" | "EXPELLED" | "GRADUATED" | "TRANSFERRED" | "PROMOTED" | "NONE";

export interface EnrolledStudentItem {
  id: string;
  name: string;
  studentCode?: string;
  gender?: string;
  status?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  classCode: string;
  level?: string;
  section?: string;
  schoolId?: string;
  status?: string;
  isLocked?: boolean;
  locked?: boolean;
  isArchived?: boolean;
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
  onConnectSchoolClick?: () => void;
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
  onConnectSchoolClick,
}: StudentClassSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "ENROLLED" | "GRADUATED" | "PROMOTED" | "EXPELLED" | "TRANSFERRED">("ALL");
  const [requestedClass, setRequestedClass] = useState<ClassItem | null>(null);
  const [isSuccessView, setIsSuccessView] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [localPendingCodes, setLocalPendingCodes] = useState<Set<string>>(new Set());

  // Current authenticated user & profile
  const { user } = useAuthStore();
  const { data: studentProfile } = useStudentProfile();

  const userRecord = user as Record<string, unknown> | null | undefined;
  const userStatus = typeof userRecord?.status === "string" ? userRecord.status : "";
  const profileStatus = String(studentProfile?.status || userStatus).toUpperCase();
  const isStudentGraduated = Boolean(
    studentProfile?.isAlumni ||
    Boolean(userRecord?.isAlumni) ||
    profileStatus === "GRADUATED" ||
    profileStatus === "ALUMNI" ||
    studentProfile?.graduationStatus?.toUpperCase() === "GRADUATED"
  );

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

  // Helper to determine if a class is locked against new join requests
  const isClassLocked = useMemo(() => {
    return (cls: ClassItem): boolean => {
      if (cls.isLocked || cls.locked || cls.isArchived) return true;
      const s = String(cls.status || "").toUpperCase();
      if (s === "LOCKED" || s === "ARCHIVED" || s === "CLOSED" || s === "REJECTED" || s === "INACTIVE") {
        return true;
      }
      return false;
    };
  }, []);

  // Comprehensive resolver for the student's status with respect to a class
  const getStudentClassStatus = useMemo(() => {
    return (cls: ClassItem): StudentClassStatus => {
      // 0. If user has graduated from this school, all classes in their alma mater show as GRADUATED
      if (isStudentGraduated) {
        return "GRADUATED";
      }

      // 1. Check if the current student is actively enrolled via profile or roster
      const isEnrolledInProfile =
        Boolean(cls.id && enrolledIdentifiers.ids.has(cls.id)) ||
        Boolean(cls.classCode && enrolledIdentifiers.codes.has(cls.classCode));

      const rosterItem = cls.enrollments?.find((e) => {
        const st = e.student;
        if (!st) return false;
        if (currentStudentId && st.id === currentStudentId) return true;
        if (currentStudentCode && st.studentCode && st.studentCode === currentStudentCode) return true;
        return false;
      });

      const rosterStatus = String(rosterItem?.student?.status || "").toUpperCase();

      // If active member in profile or active roster
      if (isEnrolledInProfile || (rosterItem && (!rosterStatus || rosterStatus === "ACTIVE"))) {
        return "ENROLLED";
      }

      // 2. Check student lifecycle history records for this specific class
      const histories = studentProfile?.histories || [];
      for (const h of histories) {
        const meta = h.meta as {
          classId?: string;
          className?: string;
          classCode?: string;
          fromClassId?: string;
          toClassId?: string;
          fromClassName?: string;
          toClassName?: string;
          fromClassCode?: string;
          toClassCode?: string;
        } | null;

        const isFromThisClass =
          Boolean(meta?.fromClassId && cls.id && meta.fromClassId === cls.id) ||
          Boolean(meta?.fromClassCode && cls.classCode && meta.fromClassCode === cls.classCode) ||
          Boolean(meta?.fromClassName && cls.name && meta.fromClassName.toLowerCase() === cls.name.toLowerCase()) ||
          Boolean(h.description && cls.name && h.description.toLowerCase().includes(`from ${cls.name.toLowerCase()}`));

        const isDirectClassMatch =
          Boolean(meta?.classId && cls.id && meta.classId === cls.id) ||
          Boolean(meta?.classCode && cls.classCode && meta.classCode === cls.classCode) ||
          Boolean(meta?.className && cls.name && meta.className.toLowerCase() === cls.name.toLowerCase()) ||
          Boolean(h.description && cls.name && h.description.toLowerCase().includes(cls.name.toLowerCase()));

        // Student was PROMOTED out of this class
        if (h.eventType === "PROMOTED" && isFromThisClass) {
          return "PROMOTED";
        }

        // Student was TRANSFERRED out of this class
        if (h.eventType === "TRANSFERRED" && (isFromThisClass || isDirectClassMatch)) {
          return "TRANSFERRED";
        }

        // Student GRADUATED from this class
        if (h.eventType === "GRADUATED" && (isDirectClassMatch || (isStudentGraduated && meta?.classId === cls.id))) {
          return "GRADUATED";
        }

        // Student was EXPELLED from this class
        if (h.eventType === "EXPELLED" && isDirectClassMatch) {
          return "EXPELLED";
        }
      }

      // 3. Fallback check for explicit statuses on roster item
      if (rosterStatus === "EXPELLED") return "EXPELLED";
      if (rosterStatus === "GRADUATED") return "GRADUATED";
      if (rosterStatus === "TRANSFERRED") return "TRANSFERRED";

      // Class is available to join
      return "NONE";
    };
  }, [
    enrolledIdentifiers,
    currentStudentId,
    currentStudentCode,
    studentProfile,
    isStudentGraduated,
  ]);

  // Helper to determine if a class has already been joined by the student
  const isClassAlreadyJoined = useMemo(() => {
    return (cls: ClassItem): boolean => {
      const status = getStudentClassStatus(cls);
      return status !== "NONE";
    };
  }, [getStudentClassStatus]);

  // Aggregate counts by student status across classes
  const classStatusCounts = useMemo(() => {
    let enrolled = 0;
    let available = 0;
    let graduated = 0;
    let promoted = 0;
    let expelled = 0;
    let transferred = 0;

    classesList.forEach((c) => {
      const status = getStudentClassStatus(c);
      if (status === "ENROLLED") enrolled++;
      else if (status === "GRADUATED") graduated++;
      else if (status === "PROMOTED") promoted++;
      else if (status === "EXPELLED") expelled++;
      else if (status === "TRANSFERRED") transferred++;
      else available++;
    });

    return { enrolled, available, graduated, promoted, expelled, transferred };
  }, [classesList, getStudentClassStatus]);

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

      const status = getStudentClassStatus(c);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AVAILABLE" && status === "NONE") ||
        (statusFilter === "ENROLLED" && status === "ENROLLED") ||
        (statusFilter === "GRADUATED" && status === "GRADUATED") ||
        (statusFilter === "PROMOTED" && status === "PROMOTED") ||
        (statusFilter === "EXPELLED" && status === "EXPELLED") ||
        (statusFilter === "TRANSFERRED" && status === "TRANSFERRED");

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [classesList, searchQuery, selectedLevel, statusFilter, getStudentClassStatus]);

  const handleJoinClass = (cls: ClassItem) => {
    if (isStudentGraduated) {
      toast.warning(`Enrollment Closed: You have graduated from ${schoolName}. Graduated scholars cannot request to join active classrooms.`);
      return;
    }

    if (isClassLocked(cls)) {
      toast.warning(`Classroom Locked: ${cls.name} (${cls.classCode}) is locked by school administration. Enrollment requests cannot be submitted.`);
      return;
    }

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
                      {isStudentGraduated && (
                        <span className="px-3 py-1 rounded-full bg-amber-400/30 border border-amber-300/50 text-amber-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <GraduationCap size={13} className="text-amber-200" />
                          Graduated Scholar (Alumnus)
                        </span>
                      )}
                      {classStatusCounts.enrolled > 0 && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-300" />
                          {classStatusCounts.enrolled} {classStatusCounts.enrolled === 1 ? "Class Enrolled" : "Classes Enrolled"}
                        </span>
                      )}
                      {classStatusCounts.graduated > 0 && (
                        <span className="px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap size={13} className="text-purple-300" />
                          {classStatusCounts.graduated} Graduated
                        </span>
                      )}
                      {classStatusCounts.transferred > 0 && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <ArrowRightLeft size={13} className="text-amber-300" />
                          {classStatusCounts.transferred} Transferred
                        </span>
                      )}
                      {classStatusCounts.expelled > 0 && (
                        <span className="px-3 py-1 rounded-full bg-rose-500/30 border border-rose-400/40 text-rose-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <XCircle size={13} className="text-rose-300" />
                          {classStatusCounts.expelled} Expelled
                        </span>
                      )}
                    </div>
                  </div>
                  <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {isStudentGraduated ? "Alma Mater Classrooms" : "Select Your Classroom"}
                  </DialogTitle>
                  <DialogDescription className="text-pink-100 text-xs sm:text-sm font-medium max-w-xl">
                    {isStudentGraduated
                      ? `You have graduated from ${schoolName}. You can view the classes and academic streams from your alma mater below.`
                      : "Choose from the classes available at your connected school to request enrollment. Review current students, subjects, and teachers before joining."}
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
                    {!isStudentGraduated && classStatusCounts.available > 0 && (
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
                        Available to Join ({classStatusCounts.available})
                      </button>
                    )}
                    {classStatusCounts.enrolled > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("ENROLLED")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1",
                          statusFilter === "ENROLLED"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/40"
                        )}
                      >
                        <CheckCircle2 size={12} />
                        Enrolled ({classStatusCounts.enrolled})
                      </button>
                    )}
                    {classStatusCounts.graduated > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("GRADUATED")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1",
                          statusFilter === "GRADUATED"
                            ? "bg-purple-500 text-white shadow-sm"
                            : "bg-purple-500/25 text-purple-100 hover:bg-purple-500/40"
                        )}
                      >
                        <GraduationCap size={12} />
                        Graduated ({classStatusCounts.graduated})
                      </button>
                    )}
                    {classStatusCounts.promoted > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("PROMOTED")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1",
                          statusFilter === "PROMOTED"
                            ? "bg-indigo-500 text-white shadow-sm"
                            : "bg-indigo-500/25 text-indigo-100 hover:bg-indigo-500/40"
                        )}
                      >
                        <TrendingUp size={12} />
                        Promoted ({classStatusCounts.promoted})
                      </button>
                    )}
                    {classStatusCounts.transferred > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("TRANSFERRED")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1",
                          statusFilter === "TRANSFERRED"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "bg-amber-500/25 text-amber-100 hover:bg-amber-500/40"
                        )}
                      >
                        <ArrowRightLeft size={12} />
                        Transferred ({classStatusCounts.transferred})
                      </button>
                    )}
                    {classStatusCounts.expelled > 0 && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("EXPELLED")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1",
                          statusFilter === "EXPELLED"
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-rose-500/25 text-rose-100 hover:bg-rose-500/40"
                        )}
                      >
                        <XCircle size={12} />
                        Expelled ({classStatusCounts.expelled})
                      </button>
                    )}

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
                ) : !schoolId ? (
                  <div className="py-12 sm:py-16 text-center space-y-3 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                      <SchoolIcon size={24} />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      Not Connected to a School Yet
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                      To view available classrooms and join courses, connect your account to your school using your school code.
                    </p>
                    <Button
                      onClick={() => {
                        onClose();
                        onConnectSchoolClick?.();
                      }}
                      className="rounded-xl h-10 px-4 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer"
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Connect to a School
                    </Button>
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
                      const studentClassStatus = getStudentClassStatus(cls);
                      const isEnrolled = studentClassStatus === "ENROLLED";
                      const isExpelled = studentClassStatus === "EXPELLED";
                      const isGraduated = studentClassStatus === "GRADUATED";
                      const isPromoted = studentClassStatus === "PROMOTED";
                      const isTransferred = studentClassStatus === "TRANSFERRED";
                      const isNone = studentClassStatus === "NONE";
                      const isPending = pendingClassCodes.has(cls.classCode);
                      const isCurrentMutating = joinMutation.isPending && requestedClass?.id === cls.id;
                      const isLocked = isClassLocked(cls);

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
                            isEnrolled && "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800/70 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-sm",
                            isExpelled && "bg-rose-50/25 dark:bg-rose-950/15 border-rose-300 dark:border-rose-800/70 hover:border-rose-400 dark:hover:border-rose-700 shadow-sm",
                            isGraduated && "bg-purple-50/25 dark:bg-purple-950/15 border-purple-300 dark:border-purple-800/70 hover:border-purple-400 dark:hover:border-purple-700 shadow-sm",
                            isPromoted && "bg-indigo-50/25 dark:bg-indigo-950/15 border-indigo-300 dark:border-indigo-800/70 hover:border-indigo-400 dark:hover:border-indigo-700 shadow-sm",
                            isTransferred && "bg-amber-50/25 dark:bg-amber-950/15 border-amber-300 dark:border-amber-800/70 hover:border-amber-400 dark:hover:border-amber-700 shadow-sm",
                            isNone && "bg-white dark:bg-zinc-900/70 border-slate-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-800/60 hover:shadow-lg hover:shadow-pink-500/5"
                          )}
                        >
                          <div className="space-y-3">
                            {/* Class Header & Badges */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={cn(
                                  "inline-block px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-bold tracking-wider uppercase mb-1",
                                  isEnrolled && "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
                                  isExpelled && "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
                                  isGraduated && "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
                                  isPromoted && "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
                                  isTransferred && "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
                                  isNone && "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300"
                                )}>
                                  {cls.classCode}
                                </span>
                                <h4 className={cn(
                                  "text-base sm:text-lg font-black line-clamp-1 transition-colors",
                                  isEnrolled && "text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
                                  isExpelled && "text-slate-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-400",
                                  isGraduated && "text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400",
                                  isPromoted && "text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400",
                                  isTransferred && "text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400",
                                  isNone && "text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400"
                                )}>
                                  {cls.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                {cls.level && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                    {cls.level}
                                  </span>
                                )}
                                {isLocked && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                                    <Lock size={10} className="text-amber-600 dark:text-amber-400" />
                                    Locked
                                  </span>
                                )}
                                {isEnrolled && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                                    <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                                    Enrolled
                                  </span>
                                )}
                                {isGraduated && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                                    <GraduationCap size={12} className="text-purple-600 dark:text-purple-400" />
                                    Graduated
                                  </span>
                                )}
                                {isPromoted && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                                    <TrendingUp size={12} className="text-indigo-600 dark:text-indigo-400" />
                                    Promoted
                                  </span>
                                )}
                                {isTransferred && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                                    <ArrowRightLeft size={12} className="text-amber-600 dark:text-amber-400" />
                                    Transferred
                                  </span>
                                )}
                                {isExpelled && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                                    <XCircle size={12} className="text-rose-600 dark:text-rose-400" />
                                    Expelled
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
                                  isEnrolled && "text-emerald-800 dark:text-emerald-300",
                                  isExpelled && "text-rose-800 dark:text-rose-300",
                                  isGraduated && "text-purple-800 dark:text-purple-300",
                                  isTransferred && "text-amber-800 dark:text-amber-300",
                                  isNone && "text-slate-700 dark:text-zinc-300"
                                )}>
                                  <Users size={13} className={
                                    isEnrolled
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : isExpelled
                                      ? "text-rose-600 dark:text-rose-400"
                                      : isGraduated
                                      ? "text-purple-600 dark:text-purple-400"
                                      : isTransferred
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-pink-600 dark:text-pink-400"
                                  } />
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
                                      let colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                                      if (isMe) {
                                        if (isExpelled) {
                                          colorClass = "bg-rose-600 text-white ring-2 ring-rose-400";
                                        } else if (isGraduated) {
                                          colorClass = "bg-purple-600 text-white ring-2 ring-purple-400";
                                        } else if (isTransferred) {
                                          colorClass = "bg-amber-600 text-white ring-2 ring-amber-400";
                                        } else {
                                          colorClass = "bg-emerald-600 text-white ring-2 ring-emerald-400";
                                        }
                                      }
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
                                  {isEnrolled && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold line-clamp-1 flex items-center gap-1">
                                      <CheckCircle2 size={12} className="shrink-0" />
                                      <span>
                                        You are enrolled in this class
                                        {studentCount > 1
                                          ? ` with ${studentCount - 1} other ${studentCount - 1 === 1 ? "student" : "students"}`
                                          : ""}
                                      </span>
                                    </p>
                                  )}
                                  {isGraduated && (
                                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold line-clamp-1 flex items-center gap-1">
                                      <GraduationCap size={12} className="shrink-0" />
                                      <span>You have graduated from this class (Alumni)</span>
                                    </p>
                                  )}
                                  {isPromoted && (
                                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold line-clamp-1 flex items-center gap-1">
                                      <TrendingUp size={12} className="shrink-0" />
                                      <span>You were promoted from this class to a higher level</span>
                                    </p>
                                  )}
                                  {isTransferred && (
                                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold line-clamp-1 flex items-center gap-1">
                                      <ArrowRightLeft size={12} className="shrink-0" />
                                      <span>You were transferred out of this class</span>
                                    </p>
                                  )}
                                  {isExpelled && (
                                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold line-clamp-1 flex items-center gap-1">
                                      <XCircle size={12} className="shrink-0" />
                                      <span>You have been expelled from this classroom</span>
                                    </p>
                                  )}
                                  {isNone && (
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
                              ) : isEnrolled ? (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold py-1 flex items-center gap-1">
                                  <CheckCircle2 size={12} className="shrink-0" />
                                  <span>You are currently enrolled in this class</span>
                                </p>
                              ) : isGraduated ? (
                                <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold py-1 flex items-center gap-1">
                                  <GraduationCap size={12} className="shrink-0" />
                                  <span>You have graduated from this class (Alumni)</span>
                                </p>
                              ) : isPromoted ? (
                                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold py-1 flex items-center gap-1">
                                  <TrendingUp size={12} className="shrink-0" />
                                  <span>You were promoted from this class to a higher level</span>
                                </p>
                              ) : isTransferred ? (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold py-1 flex items-center gap-1">
                                  <ArrowRightLeft size={12} className="shrink-0" />
                                  <span>You were transferred out of this class</span>
                                </p>
                              ) : isExpelled ? (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold py-1 flex items-center gap-1">
                                  <XCircle size={12} className="shrink-0" />
                                  <span>You have been expelled from this classroom</span>
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
                            {isEnrolled ? (
                              <div className="w-full h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-xs">
                                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Enrolled (Active Member)</span>
                              </div>
                            ) : isGraduated ? (
                              <div className="w-full h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs shadow-xs">
                                <GraduationCap size={15} className="text-purple-600 dark:text-purple-400" />
                                <span>Graduated Cohort (Alumni)</span>
                              </div>
                            ) : isPromoted ? (
                              <div className="w-full h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-xs">
                                <TrendingUp size={15} className="text-indigo-600 dark:text-indigo-400" />
                                <span>Promoted (Completed Level)</span>
                              </div>
                            ) : isTransferred ? (
                              <div className="w-full h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs shadow-xs">
                                <ArrowRightLeft size={15} className="text-amber-600 dark:text-amber-400" />
                                <span>Transferred Out</span>
                              </div>
                            ) : isExpelled ? (
                              <div className="w-full h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-xs">
                                <XCircle size={15} className="text-rose-600 dark:text-rose-400" />
                                <span>Expelled from Class</span>
                              </div>
                            ) : isPending ? (
                              <div className="w-full h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                                <Clock size={14} />
                                Request Pending Approval
                              </div>
                            ) : isLocked ? (
                              <Button
                                type="button"
                                onClick={() => {
                                  toast.warning(`Cannot Request Join: ${cls.name} (${cls.classCode}) is locked. Enrollment requests are not permitted.`);
                                }}
                                className="w-full h-10 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 font-bold text-xs border border-slate-200 dark:border-zinc-700 shadow-none flex items-center justify-center gap-1.5 cursor-not-allowed transition-colors"
                              >
                                <Lock size={14} className="text-amber-500 shrink-0" />
                                <span>Request to Join (Locked)</span>
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleJoinClass(cls)}
                                disabled={isCurrentMutating}
                                className="w-full h-10 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-600/10 flex items-center justify-center gap-1.5 group-hover:shadow-pink-600/20 transition-all cursor-pointer"
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
