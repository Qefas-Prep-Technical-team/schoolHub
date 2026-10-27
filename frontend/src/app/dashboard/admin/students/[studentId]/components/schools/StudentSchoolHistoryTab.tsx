"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService, StudentSchoolHistoryRecord } from "@/lib/api/services/studentService";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2,
  GraduationCap,
  Calendar,
  MapPin,
  Mail,
  Plus,
  Award,
  BookOpen,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface StudentSchoolHistoryTabProps {
  studentId: string;
  student: Record<string, unknown>;
  primaryColor?: string;
}

export default function StudentSchoolHistoryTab({
  studentId,
  student,
  primaryColor = "#2563eb",
}: StudentSchoolHistoryTabProps) {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for adding previous school
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [overallGrade, setOverallGrade] = useState("");
  const [exitReason, setExitReason] = useState("");

  // Fetch school history records from backend service
  const { data: schoolsResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-schools", studentId],
    queryFn: () => studentService.getStudentSchools(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });

  const schools: StudentSchoolHistoryRecord[] = schoolsResponse?.schools || [];
  const overallAverage: number | null =
    schoolsResponse?.summary?.overallAverage ??
    schoolsResponse?.overallAverage ??
    null;

  const currentSchool = schools.find((s) => s.isCurrent);
  const previousSchools = schools.filter((s) => !s.isCurrent);

  // Total assessment grades across all schools
  const totalGradedCount = schools.reduce(
    (acc, s) => acc + (s.totalGradesRecorded || s.totalGradesCount || 0),
    0
  );

  // Mutation to add external previous school record
  const addRecordMutation = useMutation({
    mutationFn: async () => {
      if (!schoolName.trim()) {
        throw new Error("School name is required");
      }
      const gradeNum = overallGrade ? parseFloat(overallGrade) : undefined;
      return studentService.addPreviousSchoolRecord(studentId, {
        schoolName: schoolName.trim(),
        schoolAddress: schoolAddress.trim() || undefined,
        enrollmentDate: enrollmentDate || undefined,
        exitDate: exitDate || undefined,
        gradeLevel: gradeLevel.trim() || undefined,
        overallGrade: gradeNum,
        overallAverage: gradeNum,
        exitReason: exitReason.trim() || undefined,
      });
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Previous school record added successfully!");
      queryClient.invalidateQueries({ queryKey: ["student-schools", studentId] });
      queryClient.invalidateQueries({ queryKey: ["student-history", studentId] });
      setIsAddModalOpen(false);
      // Reset form
      setSchoolName("");
      setSchoolAddress("");
      setEnrollmentDate("");
      setExitDate("");
      setGradeLevel("");
      setOverallGrade("");
      setExitReason("");
    },
    onError: (err: unknown) => {
      const errMsg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            "Failed to save school record";
      toast.error(errMsg);
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      toast.error("Please enter the school name.");
      return;
    }
    addRecordMutation.mutate();
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "#94a3b8";
    if (score >= 70) return "#10b981"; // Emerald
    if (score >= 50) return "#2563eb"; // Blue
    if (score >= 40) return "#f59e0b"; // Amber
    return "#ef4444"; // Rose
  };

  // Extract subject averages / top subjects for current school
  const currentSchoolSubjects = currentSchool?.topSubjects?.length
    ? currentSchool.topSubjects.map((s) => ({
        subject: s.subjectName,
        average: s.averageScore,
        count: 1,
      }))
    : currentSchool?.subjectAverages || [];

  return (
    <main className="w-full px-4 sm:px-6 lg:px-12 mt-10 pb-20 space-y-10">
      {/* ── Top Header Strip ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div
              className="size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <Building2 size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              School History & Performance
            </h2>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Track current enrollment, previous institutions attended, and overall academic averages across schools.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus size={16} strokeWidth={3} />
          <span>Add Previous School</span>
        </button>
      </div>

      {/* ── Metric Cards Strip ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Schools */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Total Schools
            </span>
            <div
              className="size-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <Building2 size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {schools.length}
          </p>
          <p className="text-[11px] font-medium text-slate-500">
            {previousSchools.length > 0
              ? `1 Current · ${previousSchools.length} Previous`
              : "Current institution only"}
          </p>
        </div>

        {/* Current Institution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Current Institution
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white truncate" title={currentSchool?.name || "Active"}>
            {currentSchool?.name || "Enrolled"}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Student</span>
          </div>
        </div>

        {/* Overall Platform Average */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Overall Student Average
            </span>
            <div
              className="size-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${getScoreColor(overallAverage)}18`,
                color: getScoreColor(overallAverage),
              }}
            >
              <Award size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {overallAverage !== null ? `${overallAverage}%` : "—"}
            </p>
            {currentSchool?.overallGradeLetter && (
              <span
                className="text-xs font-black px-2 py-0.5 rounded-md text-white shadow-xs"
                style={{ backgroundColor: getScoreColor(overallAverage) }}
              >
                {currentSchool.overallGradeLetter}
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            Across graded subjects & assessments
          </p>
        </div>

        {/* Graded Assessments */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Graded Papers / Exams
            </span>
            <div
              className="size-8 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400"
            >
              <BookOpen size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {totalGradedCount}
          </p>
          <p className="text-[11px] font-medium text-slate-500">
            Recorded assessment records
          </p>
        </div>
      </div>

      {/* ── Loading / Error States ────────────────────────────────────────── */}
      {isLoading && (
        <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-primary mx-auto" style={{ color: primaryColor }} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading school history records...
          </p>
        </div>
      )}

      {isError && (
        <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-center space-y-3">
          <p className="text-sm font-black text-rose-600">Failed to load school history records.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Current School Card ───────────────────────────────────────────── */}
      {!isLoading && currentSchool && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Current Enrolled School
            </h3>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-md relative overflow-hidden space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-start gap-4">
                <div
                  className="size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                  style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                >
                  <Building2 size={28} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {currentSchool.name}
                    </h4>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Current School · Active
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {currentSchool.schoolType ? `${currentSchool.schoolType} Institution` : "Accredited Institution"}
                    {currentSchool.address ? ` · ${currentSchool.address}` : ""}
                  </p>
                </div>
              </div>

              {/* Overall Grade Card for Current School */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-5 shrink-0">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    School Grade Average
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-2xl sm:text-3xl font-black"
                      style={{
                        color: getScoreColor(
                          currentSchool.overallGrade ?? currentSchool.overallAverage
                        ),
                      }}
                    >
                      {(currentSchool.overallGrade ?? currentSchool.overallAverage) !== null
                        ? `${currentSchool.overallGrade ?? currentSchool.overallAverage}%`
                        : "—"}
                    </span>
                    {currentSchool.overallGradeLetter && (
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded text-white"
                        style={{
                          backgroundColor: getScoreColor(
                            currentSchool.overallGrade ?? currentSchool.overallAverage
                          ),
                        }}
                      >
                        {currentSchool.overallGradeLetter}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />

                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Graded Records
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {currentSchool.totalGradesRecorded || currentSchool.totalGradesCount || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* School Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-slate-400" />
                  Classes Attended
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {currentSchool.classesAttended && currentSchool.classesAttended.length > 0 ? (
                    currentSchool.classesAttended.map((cls, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        {cls}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-bold text-slate-500">None assigned</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  Enrollment Period
                </p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {currentSchool.enrolledAt || currentSchool.enrollmentDate
                    ? `${new Date(
                        (currentSchool.enrolledAt || currentSchool.enrollmentDate)!
                      ).toLocaleDateString()} — Present`
                    : "Current Active"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  School Contact
                </p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={currentSchool.email || "—"}>
                  {currentSchool.email || "Official Campus"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400" />
                  Location
                </p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={currentSchool.address || "Main Campus"}>
                  {currentSchool.address || "Main Campus"}
                </p>
              </div>
            </div>

            {/* Subject Averages for this school */}
            {currentSchoolSubjects.length > 0 && (
              <div className="pt-2 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Top Graded Subjects at {currentSchool.name}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {currentSchoolSubjects.map(
                    (sub: { subject: string; average: number; count?: number }, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1"
                      >
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate" title={sub.subject}>
                          {sub.subject}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-black"
                            style={{ color: getScoreColor(sub.average) }}
                          >
                            {sub.average}%
                          </span>
                          {sub.count && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {sub.count} tests
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Previous Schools Section ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Previous Schools Attended ({previousSchools.length})
            </h3>
          </div>
        </div>

        {previousSchools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previousSchools.map((school, index) => {
              const grade = school.overallGrade ?? school.overallAverage ?? null;
              const tenureStart = school.enrolledAt || school.enrollmentDate;
              const tenureEnd = school.exitedAt || school.exitDate;

              return (
                <div
                  key={school.id || index}
                  className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="size-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                        <Building2 size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {school.name}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {school.address || "Prior Institution"}
                        </p>
                      </div>
                    </div>

                    {/* School Grade Average */}
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Overall Grade
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span
                          className="text-lg font-black"
                          style={{ color: getScoreColor(grade) }}
                        >
                          {grade !== null ? `${grade}%` : "—"}
                        </span>
                        {school.overallGradeLetter && (
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: getScoreColor(grade) }}
                          >
                            {school.overallGradeLetter}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Strip */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Tenure Period
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {tenureStart
                          ? `${new Date(tenureStart).toLocaleDateString()} — ${
                              tenureEnd ? new Date(tenureEnd).toLocaleDateString() : "Exit"
                            }`
                          : "Prior to transfer"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Classes / Level
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {school.classesAttended && school.classesAttended.length > 0
                          ? school.classesAttended.join(", ")
                          : school.gradeLevel || "General / Transferred"}
                      </span>
                    </div>
                  </div>

                  {/* Exit Reason / Transfer Notes */}
                  {(school.exitReason || school.notes) && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Transfer / Exit Reason
                      </span>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {school.exitReason || school.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
            <Building2 size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                No Previous Schools Recorded
              </p>
              <p className="text-xs font-medium text-slate-400">
                If this student attended prior schools or transferred from another institution, you can register their previous academic background here.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-[11px] transition-all inline-flex items-center gap-2"
            >
              <Plus size={14} />
              <span>Record Prior School</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Add Previous School Dialog ────────────────────────────────────── */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && setIsAddModalOpen(false)}>
        <DialogContent className="sm:max-w-lg p-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          <div
            className="p-6 sm:p-7 text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd, ${primaryColor}bb)`,
            }}
          >
            <div className="relative z-10 flex items-start gap-4">
              <div className="size-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Building2 size={22} className="text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight text-white">
                  Add Previous School Record
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-1">
                  Document a prior institution attended by this student along with overall grades and tenure.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleAddSubmit} className="p-6 sm:p-7 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                School / Institution Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. King's College Lagos"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Location / City
                </label>
                <input
                  type="text"
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Grade Level / Class Attended
                </label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="e.g. JSS 3 / Grade 9"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Exit / Transfer Date
                </label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Overall Grade (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={overallGrade}
                  onChange={(e) => setOverallGrade(e.target.value)}
                  placeholder="e.g. 78.5"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Exit Reason / Transfer Notes
              </label>
              <textarea
                rows={2}
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                placeholder="e.g. Relocated to new state; completed junior secondary education."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-800 dark:text-slate-100 resize-none focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={addRecordMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-[11px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addRecordMutation.isPending || !schoolName.trim()}
                className="px-6 py-2.5 rounded-xl text-white font-black uppercase tracking-widest text-[11px] shadow-md flex items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {addRecordMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save School Record</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
