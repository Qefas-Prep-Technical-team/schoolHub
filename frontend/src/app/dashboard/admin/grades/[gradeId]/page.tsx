"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Edit2, 
  FileText, 
  GraduationCap, 
  Printer, 
  School, 
  Send, 
  ShieldCheck, 
  Star, 
  Tag, 
  Trash2, 
  User, 
  XCircle,
  ArrowUpRight,
  ChevronRight,
  Layers,
  Sparkles,
  Quote,
  Loader2
} from "lucide-react";
import { useGrade, usePublishGrade, useDeleteGrade } from "@/lib/api/hooks/useGrades";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function GradeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const gradeId = params.gradeId as string;

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#2563eb";

  const { data: grade, isLoading, isError } = useGrade(gradeId);
  const publishMutation = usePublishGrade();
  const deleteMutation = useDeleteGrade();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[1400px] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-40 rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-80 rounded-3xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-60 rounded-3xl" />
              <Skeleton className="h-72 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (isError || !grade) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <div className="size-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center">
            <XCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Grade Record Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The requested assessment grade record could not be loaded or may have been deleted.
          </p>
          <Button
            onClick={() => router.push("/dashboard/admin/grades")}
            className="w-full h-11 rounded-xl text-white font-bold"
            style={{ backgroundColor: primaryColor }}
          >
            Back to Grades Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Score Calculations
  const score = grade.score || 0;
  const maxMarks = grade.maxMarks || 100;
  const percent = maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0;
  const isPassed = percent >= 50;
  const isPublished = grade.status === "PUBLISHED" || !!grade.examAttemptId || !!grade.subjectExamAttemptId;

  const getLetterGrade = (pct: number) => {
    if (pct >= 90) return { letter: "A+", label: "Outstanding", color: "#10b981", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" };
    if (pct >= 80) return { letter: "A", label: "Excellent", color: "#10b981", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" };
    if (pct >= 70) return { letter: "B", label: "Very Good", color: "#3b82f6", bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" };
    if (pct >= 60) return { letter: "C", label: "Good", color: "#f59e0b", bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" };
    if (pct >= 50) return { letter: "D", label: "Pass", color: "#f97316", bg: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800" };
    return { letter: "F", label: "Needs Improvement", color: "#ef4444", bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" };
  };

  const letterGrade = getLetterGrade(percent);
  const initials = grade.student?.name?.substring(0, 2).toUpperCase() || "ST";
  const assessmentLabel = (grade.assessmentType && grade.assessmentType !== "NULL" ? grade.assessmentType : grade.category) || "General Assessment";

  // Handlers
  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(grade.id);
      toast.success("Grade published successfully!");
    } catch {
      toast.error("Failed to publish grade.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(grade.id);
      toast.success("Grade deleted successfully.");
      setIsDeleteDialogOpen(false);
      router.push("/dashboard/admin/grades");
    } catch {
      toast.error("Failed to delete grade.");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-6 lg:p-8 transition-colors duration-300 pb-20">
      <div className="w-full max-w-[1400px] mx-auto space-y-6">

        {/* ── Navigation & Actions Header ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/admin/grades")}
              className="size-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shrink-0"
              title="Back to Grades"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Link href="/dashboard/admin/grades" className="hover:text-indigo-600 transition-colors">
                  Grades
                </Link>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="text-slate-900 dark:text-white font-bold truncate">
                  {grade.student?.name || "Student"}
                </span>
                <ChevronRight size={12} className="text-slate-400 hidden sm:inline" />
                <span className="text-slate-500 hidden sm:inline truncate">{grade.subject}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                Assessment Details
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 gap-1.5 flex-1 sm:flex-initial"
            >
              <Printer size={14} />
              <span>Print</span>
            </Button>

            {!isPublished && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="h-9 px-3 rounded-xl border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1.5 flex-1 sm:flex-initial"
              >
                {publishMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Publish</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/admin/grades/edit/${grade.id}`)}
              className="h-9 px-3 rounded-xl text-white font-bold gap-1.5 flex-1 sm:flex-initial"
              style={{ backgroundColor: primaryColor }}
            >
              <Edit2 size={14} />
              <span>Edit Grade</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-9 px-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Delete Grade"
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </div>

        {/* ── Main Layout Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column (2 Cols): Score Hero, Details & Remarks ───────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Score Hero Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: letterGrade.color }}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {assessmentLabel}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1",
                      isPublished 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    )}>
                      <span className={cn("size-1.5 rounded-full", isPublished ? "bg-emerald-500" : "bg-amber-400")} />
                      {isPublished ? "Published" : "Draft Status"}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {grade.subject}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {grade.class?.name ? `Class: ${grade.class.name}${grade.class.section ? `-${grade.class.section}` : ""}` : "General Assessment"}
                  </p>
                </div>

                {/* Big Letter Grade Chip */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div 
                    className="size-16 sm:size-20 rounded-2xl flex flex-col items-center justify-center font-black shadow-md border"
                    style={{ 
                      backgroundColor: `${letterGrade.color}15`, 
                      borderColor: `${letterGrade.color}40`,
                      color: letterGrade.color 
                    }}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">{letterGrade.letter}</span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">{letterGrade.label}</span>
                  </div>
                </div>
              </div>

              {/* Score Metric & Progress Bar */}
              <div className="pt-6 space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Recorded Score
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {score}
                      </span>
                      <span className="text-lg font-bold text-slate-400">
                        / {maxMarks}
                      </span>
                      <span className="ml-3 text-sm font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: `${letterGrade.color}20`, color: letterGrade.color }}>
                        {percent}%
                      </span>
                    </div>
                  </div>

                  <div className={cn(
                    "px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold",
                    isPassed 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                  )}>
                    {isPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>{isPassed ? "Passed Requirements" : "Below Passing Mark"}</span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, percent))}%`,
                        backgroundColor: letterGrade.color 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <span>0 Min</span>
                    <span>Pass: 50%</span>
                    <span>{maxMarks} Max</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Details Grid Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <FileText size={18} style={{ color: primaryColor }} />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Academic & Grading Metadata
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailTile 
                  icon={BookOpen} 
                  label="Subject" 
                  value={grade.subject || "Not Specified"} 
                  color={primaryColor}
                />
                <DetailTile 
                  icon={Tag} 
                  label="Assessment Type" 
                  value={assessmentLabel} 
                  color={primaryColor}
                />
                <DetailTile 
                  icon={Star} 
                  label="Weight Multiplier" 
                  value={grade.weight ? `${grade.weight}x` : "1.0x"} 
                  color={primaryColor}
                />
                <DetailTile 
                  icon={School} 
                  label="Class Cohort" 
                  value={grade.class?.name ? `${grade.class.name}${grade.class.section ? ` (${grade.class.section})` : ""}` : "Not Assigned"} 
                  color={primaryColor}
                />
                <DetailTile 
                  icon={Calendar} 
                  label="Term" 
                  value={grade.term || grade.exam?.term || "Current Term"} 
                  color={primaryColor}
                />
                <DetailTile 
                  icon={Layers} 
                  label="Session" 
                  value={grade.session?.name || grade.exam?.session?.name || "Current Session"} 
                  color={primaryColor}
                />
                {grade.exam?.title && (
                  <DetailTile 
                    icon={FileText} 
                    label="Linked Exam" 
                    value={grade.exam.title} 
                    color={primaryColor}
                  />
                )}
                {grade.subjectPaper?.title && (
                  <DetailTile 
                    icon={Layers} 
                    label="Subject Paper" 
                    value={grade.subjectPaper.title} 
                    color={primaryColor}
                  />
                )}
                <DetailTile 
                  icon={User} 
                  label="Recorded By" 
                  value={grade.teacher?.name || "School Administrator"} 
                  color={primaryColor}
                />
                <DetailTile 
                  icon={Clock} 
                  label="Date Logged" 
                  value={grade.createdAt ? format(new Date(grade.createdAt), "MMM d, yyyy · h:mm a") : "—"} 
                  color={primaryColor}
                />
              </div>
            </div>

            {/* Teacher Remarks Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Quote size={18} style={{ color: primaryColor }} />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Teacher Remarks & Feedback
                </h3>
              </div>

              {grade.remarks ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 relative">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{grade.remarks}"
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                    — Logged by {grade.teacher?.name || "Instructor"}
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs font-semibold">
                  No teacher remarks or narrative comments were added for this assessment.
                </div>
              )}
            </div>

          </div>

          {/* ── Right Column (1 Col): Student Profile & Grade Scale ──────── */}
          <div className="space-y-6">

            {/* Student Profile Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Student Record
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {grade.student?.studentCode || "NO CODE"}
                </span>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="size-20 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
                  {grade.student?.profileImage ? (
                    <img 
                      src={grade.student.profileImage} 
                      alt={grade.student.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-xl font-black text-slate-500">
                      {initials}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {grade.student?.name || "Unknown Student"}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {grade.class?.name || "Class unassigned"}
                    {grade.student?.gradeLevel ? ` · Level ${grade.student.gradeLevel}` : ""}
                  </p>
                </div>

                {grade.studentId && (
                  <Link
                    href={`/dashboard/admin/students/${grade.studentId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 transition-colors"
                  >
                    <span>View Student Profile</span>
                    <ArrowUpRight size={13} />
                  </Link>
                )}
              </div>
            </div>

            {/* Grading System Scale Reference Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Grading Scale Reference
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { grade: "A+", range: "90% - 100%", desc: "Outstanding", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
                  { grade: "A", range: "80% - 89%", desc: "Excellent", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
                  { grade: "B", range: "70% - 79%", desc: "Very Good", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
                  { grade: "C", range: "60% - 69%", desc: "Good", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
                  { grade: "D", range: "50% - 59%", desc: "Pass", color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40" },
                  { grade: "F", range: "< 50%", desc: "Needs Work", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40" },
                ].map((tier) => (
                  <div 
                    key={tier.grade} 
                    className={cn(
                      "flex items-center justify-between p-2 rounded-xl transition-all",
                      letterGrade.letter === tier.grade ? "ring-2 ring-indigo-500/50 font-bold bg-indigo-50/50 dark:bg-indigo-950/30" : ""
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("size-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0", tier.color)}>
                        {tier.grade}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{tier.desc}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">{tier.range}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── Confirm Delete Modal ─────────────────────────────────────────── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Grade Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this grade record for{" "}
              <strong>{grade.student?.name}</strong> in <strong>{grade.subject}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              {deleteMutation.isPending && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailTile({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string; 
}) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
      <div 
        className="size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}
