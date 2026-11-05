"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, School as SchoolIcon, Link2, Info } from "lucide-react";
import { useClasses, useRequestToJoinClass } from "@/lib/api/hooks/useClasses";
import { useLinkRequests } from "@/lib/api/hooks/useLinks";
import { useStudentProfile } from "@/lib/api/hooks/useStudent";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { ClassItem, RawClassEnrollment, StudentClassStatus } from "./class-selection/types";
import { ClassSelectionHeader } from "./class-selection/ClassSelectionHeader";
import { ClassCardItem } from "./class-selection/ClassCardItem";
import { ClassSelectionSuccessView } from "./class-selection/ClassSelectionSuccessView";

export interface StudentClassSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId?: string;
  schoolName?: string;
  studentName?: string;
  onConnectSchoolClick?: () => void;
}

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
  const [statusFilter, setStatusFilter] = useState<
    | "ALL"
    | "AVAILABLE"
    | "ENROLLED"
    | "GRADUATED"
    | "PROMOTED"
    | "EXPELLED"
    | "TRANSFERRED"
    | "LOCKED"
  >("ALL");
  const [requestedClass, setRequestedClass] = useState<ClassItem | null>(null);
  const [isSuccessView, setIsSuccessView] = useState(false);
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

  const studentLevel = (
    studentProfile?.level ||
    (studentProfile as unknown as { gradeLevel?: string })?.gradeLevel ||
    (userRecord?.level as string) ||
    ""
  ).trim();

  // Fetch current student's personal enrollments list
  const { data: myEnrolledClassesRaw } = useClasses();

  // Fetch live active classes for the connected school
  const { data: rawClasses = [], isLoading: isLoadingClasses } = useClasses(schoolId);
  const classesList: ClassItem[] = useMemo(() => {
    if (!Array.isArray(rawClasses)) return [];
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

    if (studentProfile?.classes && Array.isArray(studentProfile.classes)) {
      studentProfile.classes.forEach((item) => {
        const c = item?.class;
        if (c?.id) ids.add(String(c.id));
        if (c?.name) codes.add(String(c.name));
      });
    }

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
  const getClassLockInfo = useMemo(() => {
    return (cls: ClassItem): { isLocked: boolean; reason: string | null } => {
      // 1. Explicit lock flags on class
      if (cls.isLocked || cls.locked) {
        return { isLocked: true, reason: "Locked by school administration" };
      }
      const s = String(cls.status || "").toUpperCase();
      if (s === "ARCHIVED" || cls.isArchived) {
        return { isLocked: true, reason: "Archived" };
      }
      if (s === "LOCKED" || s === "CLOSED" || s === "REJECTED" || s === "INACTIVE") {
        return { isLocked: true, reason: s };
      }

      // 2. Student has graduated from this school
      if (isStudentGraduated) {
        return { isLocked: true, reason: "Graduated Alumni" };
      }

      // 3. Level mismatch check
      if (cls.level && studentLevel) {
        const cLvl = cls.level.trim().toLowerCase();
        const sLvl = studentLevel.toLowerCase();
        if (cLvl !== sLvl) {
          return {
            isLocked: true,
            reason: `Level Mismatch (${cls.level} vs your ${studentLevel})`,
          };
        }
      }

      return { isLocked: false, reason: null };
    };
  }, [isStudentGraduated, studentLevel]);

  // Comprehensive resolver for the student's status with respect to a class
  const getStudentClassStatus = useMemo(() => {
    return (cls: ClassItem): StudentClassStatus => {
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

      // If user is graduated from school and was part of this class, they graduated from THIS class
      if (isStudentGraduated && (isEnrolledInProfile || rosterItem)) {
        return "GRADUATED";
      }

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

        if (h.eventType === "PROMOTED" && isFromThisClass) return "PROMOTED";
        if (h.eventType === "TRANSFERRED" && (isFromThisClass || isDirectClassMatch)) return "TRANSFERRED";
        if (h.eventType === "GRADUATED" && isDirectClassMatch) return "GRADUATED";
        if (h.eventType === "EXPELLED" && isDirectClassMatch) return "EXPELLED";
      }

      if (rosterStatus === "EXPELLED") return "EXPELLED";
      if (rosterStatus === "GRADUATED") return "GRADUATED";
      if (rosterStatus === "TRANSFERRED") return "TRANSFERRED";

      return "NONE";
    };
  }, [enrolledIdentifiers, currentStudentId, currentStudentCode, studentProfile, isStudentGraduated]);

  // Aggregate counts by student status across classes
  const classStatusCounts = useMemo(() => {
    let enrolled = 0;
    let available = 0;
    let graduated = 0;
    let promoted = 0;
    let expelled = 0;
    let transferred = 0;
    let locked = 0;

    classesList.forEach((c) => {
      const status = getStudentClassStatus(c);
      const lockInfo = getClassLockInfo(c);

      if (status === "ENROLLED") enrolled++;
      else if (status === "GRADUATED") graduated++;
      else if (status === "PROMOTED") promoted++;
      else if (status === "EXPELLED") expelled++;
      else if (status === "TRANSFERRED") transferred++;
      else {
        if (lockInfo.isLocked) locked++;
        else available++;
      }
    });

    return { enrolled, available, graduated, promoted, expelled, transferred, locked };
  }, [classesList, getStudentClassStatus, getClassLockInfo]);

  // Fetch pending link requests for this student
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

  // Extract distinct levels
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
          c.departments.some((d) => d.department?.name.toLowerCase().includes(q))) ||
        (c.subjects &&
          c.subjects.some((s) => s.subject?.name.toLowerCase().includes(q)));

      const matchesLevel = selectedLevel === "ALL" || c.level === selectedLevel;

      const status = getStudentClassStatus(c);
      const lockInfo = getClassLockInfo(c);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "AVAILABLE" && status === "NONE" && !lockInfo.isLocked) ||
        (statusFilter === "LOCKED" && status === "NONE" && lockInfo.isLocked) ||
        (statusFilter === "ENROLLED" && status === "ENROLLED") ||
        (statusFilter === "GRADUATED" && status === "GRADUATED") ||
        (statusFilter === "PROMOTED" && status === "PROMOTED") ||
        (statusFilter === "EXPELLED" && status === "EXPELLED") ||
        (statusFilter === "TRANSFERRED" && status === "TRANSFERRED");

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [classesList, searchQuery, selectedLevel, statusFilter, getStudentClassStatus, getClassLockInfo]);

  const handleJoinClass = (cls: ClassItem) => {
    const lockInfo = getClassLockInfo(cls);
    if (lockInfo.isLocked) {
      toast.warning(
        `Class Locked (${lockInfo.reason || "Restricted"}): Enrollment requests are not permitted for ${cls.name}.`
      );
      return;
    }

    setRequestedClass(cls);

    joinMutation.mutate(
      {
        classCode: cls.classCode,
        note: `Student requested to join class via student portal`,
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

  const handleLockedClick = (cls: ClassItem, reason?: string | null) => {
    toast.warning(
      `Cannot Request Join: ${cls.name} (${cls.classCode}) is locked${reason ? ` due to ${reason}` : ""}. Enrollment requests are not permitted.`
    );
  };

  const handleDismissSuccess = () => {
    setIsSuccessView(false);
    setRequestedClass(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[calc(100vw-1.25rem)] sm:w-[95vw] lg:w-[90vw] xl:max-w-6xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl min-w-0">
        <AnimatePresence mode="wait">
          {isSuccessView && requestedClass ? (
            <ClassSelectionSuccessView
              requestedClass={requestedClass}
              schoolName={schoolName}
              onDismiss={handleDismissSuccess}
            />
          ) : (
            <motion.div
              key="grid-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col max-h-[90vh] sm:max-h-[88vh] w-full min-w-0 overflow-hidden"
            >
              <ClassSelectionHeader
                schoolName={schoolName}
                studentName={studentName}
                isStudentGraduated={isStudentGraduated}
                classStatusCounts={classStatusCounts}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                availableLevels={availableLevels}
                totalClassesCount={classesList.length}
              />

              {/* Class Grid Content */}
              <div className="p-4 sm:p-6 md:p-7 overflow-y-auto flex-1 space-y-4">
                {isLoadingClasses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-52 sm:h-60 rounded-2xl bg-slate-100 dark:bg-zinc-900 animate-pulse border border-slate-200 dark:border-zinc-800"
                      />
                    ))}
                  </div>
                ) : !schoolId ? (
                  <div className="py-10 sm:py-16 text-center space-y-3 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-4 sm:p-6">
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
                  <div className="py-10 sm:py-16 text-center space-y-3 bg-slate-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-4 sm:p-6">
                    <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto">
                      <GraduationCap size={24} />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {classesList.length === 0
                        ? "No Active Classes Available"
                        : "No Matching Classes Found"}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                      {classesList.length === 0
                        ? "Your school hasn't published any active classrooms yet."
                        : "Try adjusting your search query, status, or level filters to see available classrooms."}
                    </p>
                    {(searchQuery || selectedLevel !== "ALL" || statusFilter !== "ALL") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedLevel("ALL");
                          setStatusFilter("ALL");
                        }}
                        className="rounded-xl mt-2 text-xs font-bold cursor-pointer"
                      >
                        Reset Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
                    {filteredClasses.map((cls) => {
                      const studentClassStatus = getStudentClassStatus(cls);
                      const isPending = pendingClassCodes.has(cls.classCode);
                      const isCurrentMutating =
                        joinMutation.isPending && requestedClass?.id === cls.id;
                      const lockInfo = getClassLockInfo(cls);

                      return (
                        <ClassCardItem
                          key={cls.id}
                          cls={cls}
                          studentClassStatus={studentClassStatus}
                          isPending={isPending}
                          isLocked={lockInfo.isLocked}
                          lockReason={lockInfo.reason}
                          isCurrentMutating={isCurrentMutating}
                          currentStudentId={currentStudentId}
                          currentStudentCode={currentStudentCode}
                          onJoinClick={handleJoinClass}
                          onLockedClick={handleLockedClick}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer info */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3 sm:p-4 px-4 sm:px-6 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 shrink-0 w-full min-w-0 max-w-full">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left min-w-0">
                  <Info size={13} className="text-pink-500 shrink-0 hidden sm:inline" />
                  <span className="truncate sm:whitespace-normal">
                    Your request will be submitted to school administration for review.
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white h-8 sm:h-9 cursor-pointer"
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
export default StudentClassSelectionModal;
