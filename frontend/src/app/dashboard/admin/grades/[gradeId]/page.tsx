"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit2,
  Printer,
  Send,
  Trash2,
  XCircle,
  ChevronRight,
  Loader2,
  Download
} from "lucide-react";
import { useGrade, usePublishGrade, useDeleteGrade } from "@/lib/api/hooks/useGrades";
import { useSchoolSettings, useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useActiveSignature } from "@/lib/api/hooks/useSignature";
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
import { toast } from "sonner";
import { GradeScoreAndDetails } from "./components/GradeScoreAndDetails";
import { GradeSidebar } from "./components/GradeSidebar";
import { generatePDF } from "@/utils/pdfGenerator";
import { getGradeEvaluation } from "@/utils/gradingSystem";
import { useGradeEndorsementSignatures } from "../hooks/useGradeEndorsementSignatures";

export default function GradeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const gradeId = params.gradeId as string;

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: settings } = useSchoolSettings(schoolId);
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const primaryColor = settings?.themeColor || schoolProfile?.brandSettings?.primaryColor || "#2563eb";

  const { data: grade, isLoading, isError } = useGrade(gradeId);
  const publishMutation = usePublishGrade();
  const deleteMutation = useDeleteGrade();

  // Active digital signatures resolved with priority: Principal -> School Owner -> Registrar -> Authorized Admin
  const { primarySignatory, secondarySignatory } = useGradeEndorsementSignatures(
    schoolId,
    schoolProfile,
    grade?.teacher?.name,
    (grade?.teacher as any)?.signatureUrl
  );

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  // Official PDF Export complying strictly with pdf_export_design skill & digital signatures
  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      const evaluation = getGradeEvaluation(percent, schoolProfile?.gradingSystem);
      const studentClass = grade.class?.name
        ? `${grade.class.name}${grade.class.section ? ` (${grade.class.section})` : ""}`
        : ((grade.student as any)?.class?.name || (grade.student?.gradeLevel ? `Class ${grade.student.gradeLevel}` : "General Class"));

      // Digital signatures resolution: teacher & authorized institutional signoff (Principal / Owner / Registrar)
      const teacherSigUrl = secondarySignatory.signatureUrl || (grade.teacher as any)?.signatureUrl;
      const principalSigUrl = primarySignatory.signatureUrl || schoolProfile?.primarySignature;

      await generatePDF({
        title: "Official Assessment Grade Report",
        filename: `${(grade.student?.name || "Student").replace(/\s+/g, "_")}_${grade.subject || "Grade"}_Report.pdf`,
        schoolProfile: {
          ...schoolProfile,
          name: schoolProfile?.name || schoolProfile?.schoolName || "QEFAS ACADEMIC HUB",
          address: schoolProfile?.address || "Institutional Assessment & Evaluation Division",
          phone: schoolProfile?.phone || schoolProfile?.contactPhone,
          email: schoolProfile?.email || schoolProfile?.contactEmail,
          logo: schoolProfile?.logo || schoolProfile?.schoolLogo,
          motto: schoolProfile?.motto,
        },
        metaData: [
          { label: "Candidate Name", value: grade.student?.name || "Student" },
          { label: "Registration No", value: grade.student?.studentCode || "N/A" },
          { label: "Class", value: studentClass },
          { label: "Assessment Type", value: assessmentLabel },
          { label: "Subject", value: grade.subject || "Subject" },
          { label: "Academic Session", value: grade.session?.name || "Current Session" },
          { label: "Academic Term", value: grade.term || "Current Term" },
        ],
        tableHeaders: [["#", "Assessment Component", "Class", "Maximum Marks", "Obtained Score", "Percentage", "Grade", "Status"]],
        tableData: [
          [
            "1",
            grade.subjectPaper?.title || grade.exam?.title || `${grade.subject} Evaluation`,
            studentClass,
            String(maxMarks),
            String(score),
            `${percent}%`,
            evaluation.grade || letterGrade.letter,
            isPassed ? "PASSED" : "FAILED",
          ],
        ],
        signatures: {
          left: {
            label: secondarySignatory.title || "Class Teacher",
            name: secondarySignatory.name || grade.teacher?.name || "Assigned Subject Instructor",
            signatureUrl: teacherSigUrl,
            subLabel: "Instructor Signoff",
          },
          right: {
            label: primarySignatory.title || "Principal / Head of Institution",
            name: primarySignatory.name || schoolProfile?.principalName || "Head of Institution",
            signatureUrl: principalSigUrl,
            subLabel: "Institutional Board Approval",
          },
        },
      });
      toast.success("Assessment grade report generated successfully.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF export. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3.5 sm:p-6 lg:p-8 transition-colors duration-300 pb-20">
      <div className="w-full max-w-[1400px] mx-auto space-y-6">

        {/* -- Navigation & Actions Header ------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/admin/grades")}
              className="size-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shrink-0 cursor-pointer"
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
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 gap-1.5 flex-1 sm:flex-initial cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isExportingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Export PDF</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 gap-1.5 flex-1 sm:flex-initial cursor-pointer"
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
                className="h-9 px-3 rounded-xl border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1.5 flex-1 sm:flex-initial cursor-pointer"
              >
                {publishMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Publish</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/admin/grades/edit/${grade.id}`)}
              className="h-9 px-3 rounded-xl text-white font-bold gap-1.5 flex-1 sm:flex-initial cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <Edit2 size={14} />
              <span>Edit Grade</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-9 px-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              title="Delete Grade"
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </div>

        {/* -- Main Layout Grid Decomposed into Modular Subcomponents --------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GradeScoreAndDetails
              grade={grade}
              assessmentLabel={assessmentLabel}
              isPublished={isPublished}
              score={score}
              maxMarks={maxMarks}
              percent={percent}
              isPassed={isPassed}
              letterGrade={letterGrade}
              primaryColor={primaryColor}
            />
          </div>

          <div>
            <GradeSidebar
              grade={grade}
              initials={initials}
              letterGrade={letterGrade}
            />
          </div>
        </div>

      </div>

      {/* -- Confirm Delete Modal ------------------------------------------- */}
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
