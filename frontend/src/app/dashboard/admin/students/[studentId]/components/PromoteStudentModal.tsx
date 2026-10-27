"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/lib/api/services/classService";
import { studentService } from "@/lib/api/services/studentService";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Calendar,
  Building2,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentCode?: string;
  currentClass?: {
    id: string;
    name: string;
    section?: string;
    level?: string;
  } | null;
  schoolId: string;
  primaryColor?: string;
}

interface ClassOption {
  id: string;
  name: string;
  section?: string;
  level?: string;
  department?: { name: string } | string;
  _count?: { students?: number };
}

export function PromoteStudentModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentAvatar,
  studentCode,
  currentClass,
  schoolId,
  primaryColor = "#2563eb",
}: PromoteStudentModalProps) {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [academicSession, setAcademicSession] = useState<string>("");

  // Query classes in the current school
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["school-classes", schoolId],
    queryFn: async () => {
      const res = await classService.getClasses(schoolId);
      return Array.isArray(res) ? (res as ClassOption[]) : [];
    },
    enabled: isOpen && !!schoolId,
    staleTime: 1000 * 60 * 5,
  });

  const availableClasses = (classesData || []).filter(
    (c) => !currentClass || c.id !== currentClass.id
  );

  const targetClass = availableClasses.find((c) => c.id === selectedClassId);

  // Mutation to promote
  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClassId) {
        throw new Error("Please select a target class for promotion");
      }
      return studentService.promoteStudent(studentId, {
        toClassId: selectedClassId,
        fromClassId: currentClass?.id,
        reason: reason.trim() || undefined,
        academicSession: academicSession.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      toast.success(data?.message || `${studentName} was successfully promoted!`);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["student-details", studentId] });
      queryClient.invalidateQueries({ queryKey: ["student-history", studentId] });
      queryClient.invalidateQueries({ queryKey: ["student-schools", studentId] });
      queryClient.invalidateQueries({ queryKey: ["school-students"] });
      queryClient.invalidateQueries({ queryKey: ["school-classes"] });
      onClose();
      // Reset form
      setSelectedClassId("");
      setReason("");
      setAcademicSession("");
    },
    onError: (err: unknown) => {
      const errMsg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            "Failed to promote student";
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error("Please select a destination class.");
      return;
    }
    promoteMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Modal Header */}
        <div
          className="p-6 sm:p-8 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd, ${primaryColor}bb)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 100% 0%, white 0%, transparent 60%)",
            }}
          />
          <div className="relative z-10 flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Promote Student
              </DialogTitle>
              <DialogDescription className="text-white/80 text-xs sm:text-sm mt-1 font-medium">
                Advance {studentName} to the next academic class and record an official promotion event.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Student Snapshot Bar */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {studentAvatar ? (
              <img
                src={studentAvatar}
                alt={studentName}
                className="size-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div
                className="size-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {studentName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {studentName}
              </p>
              <p className="text-[11px] font-bold text-slate-400">
                {studentCode ? `ID: ${studentCode}` : "Active Student"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current Class:
            </span>
            <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200">
              {currentClass ? `${currentClass.name} ${currentClass.section || ""}` : "Not Assigned"}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Target Class Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap size={14} style={{ color: primaryColor }} />
              Destination Class <span className="text-rose-500">*</span>
            </label>
            {isLoadingClasses ? (
              <div className="flex items-center justify-center p-6 border border-dashed rounded-2xl border-slate-200 dark:border-slate-700">
                <Loader2 size={20} className="animate-spin text-slate-400" />
                <span className="ml-2 text-xs font-semibold text-slate-400">
                  Loading available classes...
                </span>
              </div>
            ) : availableClasses.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>
                  No other classes available for promotion. Please create classes first in the Classes section.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                  required
                >
                  <option value="" disabled className="text-slate-400">
                    -- Select Target Class --
                  </option>
                  {availableClasses.map((cls) => (
                    <option
                      key={cls.id}
                      value={cls.id}
                      className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    >
                      {cls.name} {cls.section ? `(${cls.section})` : ""}{" "}
                      {cls.level ? `· ${cls.level}` : ""}
                    </option>
                  ))}
                </select>

                {/* Transition Preview visual */}
                {targetClass && (
                  <div className="mt-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold">
                      <span>{currentClass ? currentClass.name : "Unassigned"}</span>
                      <ArrowRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="font-black text-emerald-700 dark:text-emerald-300">
                        {targetClass.name} {targetClass.section || ""}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-md">
                      Ready to Advance
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Academic Session / Year (Optional) */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar size={14} style={{ color: primaryColor }} />
              Academic Session / Year (Optional)
            </label>
            <input
              type="text"
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              placeholder="e.g. 2026/2027 Session"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400"
              style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
            />
          </div>

          {/* Reason / Notes */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen size={14} style={{ color: primaryColor }} />
              Promotion Remarks / Commendation (Optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Completed academic requirements with stellar overall scores. Advanced to the next level."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 text-sm font-medium resize-none focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400"
              style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
            />
          </div>

          {/* Policy Info Card */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>What happens upon promotion?</span>
            </div>
            <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-5">
              <li>Active class enrollment transitions smoothly to the destination class.</li>
              <li>A formal <strong>PROMOTED</strong> event is stamped into the student's timeline history.</li>
              <li>All previous exam grades, termly reports, and transcripts remain intact.</li>
            </ul>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={promoteMutation.isPending}
              className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-[11px] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={promoteMutation.isPending || !selectedClassId}
              className="px-7 py-3 rounded-2xl text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ backgroundColor: primaryColor }}
            >
              {promoteMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Promoting...</span>
                </>
              ) : (
                <>
                  <TrendingUp size={15} />
                  <span>Confirm Promotion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
