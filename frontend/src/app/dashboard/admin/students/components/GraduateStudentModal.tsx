"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, GraduationCap, Award, Calendar, Sparkles, CheckCircle2, BookOpen } from "lucide-react";
import { studentService } from "@/lib/api/services/studentService";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface GraduateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentCode?: string;
  classNameLabel?: string;
  isAlreadyGraduated?: boolean;
}

export function GraduateStudentModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentAvatar,
  studentCode,
  classNameLabel,
  isAlreadyGraduated = false,
}: GraduateStudentModalProps) {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [graduationDate, setGraduationDate] = useState(new Date().toISOString().split("T")[0]);
  const [honorsTitle, setHonorsTitle] = useState(`Class of ${currentYear} Graduate`);
  const [principalRemark, setPrincipalRemark] = useState("");

  const graduateMutation = useMutation({
    mutationFn: async () => {
      return studentService.exitStudent(studentId, {
        exitType: "GRADUATED",
        exitDate: new Date(graduationDate).toISOString(),
        exitReason: honorsTitle.trim() || `Class of ${currentYear} Graduate`,
        exitNotes: principalRemark.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(`🎉 ${studentName} has been officially graduated as an Alumni!`);
      queryClient.invalidateQueries({ queryKey: ["student-details", studentId] });
      queryClient.invalidateQueries({ queryKey: ["student-history", studentId] });
      queryClient.invalidateQueries({ queryKey: ["school-students"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to graduate student");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!graduationDate) {
      toast.error("Graduation date is required");
      return;
    }
    graduateMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
        <DialogHeader className="mb-4 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <GraduationCap size={26} strokeWidth={2.2} />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                {isAlreadyGraduated ? "Graduation Milestone" : "Graduate Student"}
                <Sparkles size={18} className="text-amber-500 animate-pulse" />
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isAlreadyGraduated
                  ? `View or re-certify graduation credentials for ${studentName}.`
                  : `Formally confer alumni status and graduate ${studentName} from school.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scholar Snapshot Pill */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 flex items-center gap-3.5 mb-6">
          <div className="size-12 rounded-full overflow-hidden border-2 border-amber-400/40 shrink-0 bg-white">
            <img
              src={
                studentAvatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}&backgroundColor=2563eb`
              }
              alt={studentName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {studentName}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {studentCode && <span>ID: {studentCode}</span>}
              {classNameLabel && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <BookOpen size={10} /> {classNameLabel}
                  </span>
                </>
              )}
            </div>
          </div>
          {isAlreadyGraduated && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Alumni
            </span>
          )}
        </div>

        {/* Explanatory Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-500/20 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200 font-medium space-y-1 mb-5">
          <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
            <CheckCircle2 size={13} />
            Official Academic Graduation Effect:
          </div>
          <p>
            Marks this scholar as an official graduate (alumni), releases them from daily active class rosters, and preserves their full terminal results, transcripts, conduct appraisals, and electronic seal records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Graduation Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Calendar size={12} className="text-amber-500" />
                Graduation Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={graduationDate}
                onChange={(e) => setGraduationDate(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Honors / Degree / Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Award size={12} className="text-amber-500" />
                Honors / Graduation Classification Title
              </label>
              <input
                type="text"
                placeholder={`e.g. Class of ${currentYear} • Valedictorian / Distinction`}
                value={honorsTitle}
                onChange={(e) => setHonorsTitle(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Commendation / Remarks */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                Principal & Academic Board Commendation (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Optional commendation remarks for this scholar's graduation milestone..."
                value={principalRemark}
                onChange={(e) => setPrincipalRemark(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={graduateMutation.isPending}
              className="px-6 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25"
            >
              {graduateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <GraduationCap size={16} /> Confirm Graduation
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
