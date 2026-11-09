"use client";

import { useState, useMemo, Fragment } from "react";
import { format } from "date-fns";
import { Users, Eye, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubmissionReviewModal from "./SubmissionReviewModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import ExportResultScopeModal, { ExportStudentOption, ExportScopeMode, ExportFileFormat } from "@/app/dashboard/admin/grades/components/ExportResultScopeModal";
import { executeExportWorkflow } from "@/app/dashboard/admin/grades/components/export/exportWorkflowHandler";
import { computeGradePill, getGradeEvaluation } from "@/utils/gradingSystem";
import { groupByDate } from "@/app/dashboard/teacher/utils/dateSectioning";
import { Download } from "lucide-react";
import { toast } from "react-toastify";


interface Props {
  assignment: any;
  schoolId: string;
  readOnly?: boolean;
}

export default function SubmissionList({ assignment, schoolId, readOnly = false }: Props) {
  const { user } = useAuthStore();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const rawSchoolId = schoolId || user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const effectiveSchoolId = rawSchoolId === "default-tenant-id" || rawSchoolId === "personal" ? "" : rawSchoolId;
  const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId);

  const submissionsList: ExportStudentOption[] = useMemo(() => {
    const maxScoreVal = assignment.maxScore || 100;
    return (assignment.submissions || []).map((sub: any) => ({
      id: sub.id,
      name: sub.student?.name || "Student",
      studentCode: sub.student?.studentCode || sub.student?.email || "N/A",
      className: assignment.class?.name || "Class",
      score: sub.score ?? 0,
      totalMarks: maxScoreVal,
      rawItem: {
        score: sub.score ?? 0,
        maxScore: maxScoreVal,
        student: {
          name: sub.student?.name,
          studentCode: sub.student?.studentCode,
        }
      }
    }));
  }, [assignment]);

  const handleExecuteExport = async (
    mode: ExportScopeMode,
    selectedList: ExportStudentOption[],
    format?: ExportFileFormat,
    isPaying?: boolean
  ) => {
    setIsExporting(true);
    try {
      await executeExportWorkflow({
        selectedFormat: format || 'pdf',
        scopeMode: mode,
        exportItems: selectedList,
        examTitle: assignment.title,
        title: `Assignment Submissions - ${assignment.title}`,
        schoolId: effectiveSchoolId,
        schoolName: schoolProfile?.name || 'School',
        className: assignment.class?.name || 'Class',
        userName: user?.name || 'Administrator',
        userRole: 'ADMIN',
        gradingSystem: schoolProfile?.gradingSystem,
        isPaying: Boolean(isPaying),
        quotaContextId: effectiveSchoolId || 'admin_assignment_submissions',
        onExport: async () => {},
        onSuccess: () => {
          setIsExportModalOpen(false);
          toast.success('Assignment submissions exported successfully.');
        }
      });
    } catch (err) {
      console.error('Assignment submission export error:', err);
      toast.error('Failed to export assignment submissions.');
    } finally {
      setIsExporting(false);
    }
  };


  const submissions = assignment.submissions || [];

  const groupedSubmissions = useMemo(() => {
    return groupByDate(submissions, (sub: any) => sub.submittedAt || sub.createdAt);
  }, [submissions]);

  const classAverageSummary = useMemo(() => {
    const graded = submissions.filter((s: any) => s.status === "GRADED" || (s.score !== null && s.score !== undefined));
    if (graded.length === 0) return null;
    const maxScoreVal = assignment.maxScore || 100;
    const avgScore = graded.reduce((sum: number, s: any) => sum + (s.score ?? 0), 0) / graded.length;
    const avgPct = maxScoreVal > 0 ? Math.round((avgScore / maxScoreVal) * 100) : 0;
    return {
      avgPct,
      pill: computeGradePill(avgPct, schoolProfile?.gradingSystem),
    };
  }, [submissions, assignment.maxScore, schoolProfile?.gradingSystem]);

  if (submissions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Submissions Yet</h3>
        <p className="text-slate-500 max-w-sm">
          Students have not submitted their work yet. Submissions will appear here once they complete the assignment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
          <Users className="w-5 h-5 text-primary" />
          Submissions Tracker
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full ml-1">
            {submissions.length} Total
          </span>
          {classAverageSummary && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${classAverageSummary.pill.bg} ${classAverageSummary.pill.color}`}
              title={`Class Average: ${classAverageSummary.avgPct}% — ${classAverageSummary.pill.remark || classAverageSummary.pill.label}`}
            >
              Avg: {classAverageSummary.avgPct}% ({classAverageSummary.pill.label})
            </span>
          )}
        </h3>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
          disabled={submissions.length === 0}
          className="h-9 px-4 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
        >
          <Download className="w-4 h-4 mr-2 text-slate-400" />
          Export Submissions
        </Button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 w-12 text-center">S/N</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Student</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Date</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Score</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let runningIdx = 0;
              return groupedSubmissions.map((group) => (
                <Fragment key={group.label}>
                  <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-y border-slate-100 dark:border-slate-800">
                    <td colSpan={6} className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                          {group.label}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                          {group.items.length} {group.items.length === 1 ? "submission" : "submissions"}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {group.items.map((sub: any) => {
                    runningIdx += 1;
                    const idx = runningIdx;
                    return (
                      <tr key={sub.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 text-center font-medium text-slate-500 dark:text-slate-400">
                          {idx}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={sub.student?.profileImage || "/logo/favicon.svg"}
                              alt={sub.student?.name || "Student"}
                              className="w-10 h-10 rounded-full bg-slate-100 object-cover"
                            />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{sub.student?.name || "Unknown Student"}</p>
                              <p className="text-xs text-slate-500">{sub.student?.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-300">
                          {sub.submittedAt ? format(new Date(sub.submittedAt), "MMM d, yyyy h:mm a") : "Unknown"}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sub.status === "GRADED"
                              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            }`}>
                            {sub.status === "GRADED" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{sub.score ?? 0} / {assignment.maxScore || 100}</span>
                            {sub.score !== null && sub.score !== undefined && (
                              (() => {
                                const max = assignment.maxScore || 100;
                                const pct = max > 0 ? (sub.score / max) * 100 : 0;
                                const pill = computeGradePill(pct, schoolProfile?.gradingSystem);
                                return (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${pill.bg} ${pill.color}`}>
                                    <span>{pill.label}</span>
                                    {pill.remark && <span className="opacity-75 uppercase tracking-wider text-[9px]">({pill.remark})</span>}
                                  </span>
                                );
                              })()
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          {!readOnly && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-lg text-xs font-semibold"
                              onClick={() => setSelectedSubmission(sub)}
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              Review
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (Visible on phones & small tablets) */}
      <div className="md:hidden space-y-5 -mx-1">
        {groupedSubmissions.map((group) => (
          <div key={group.label} className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {group.label}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {group.items.length} {group.items.length === 1 ? "submission" : "submissions"}
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {group.items.map((sub: any) => (
                <div key={sub.id} className="py-3.5 px-2 flex flex-col gap-2.5">
                  {/* Top row: Avatar, Student Info, Review CTA */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={sub.student?.profileImage || "/logo/favicon.svg"}
                        alt={sub.student?.name || "Student"}
                        className="w-9 h-9 rounded-full bg-slate-100 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{sub.student?.name || "Unknown Student"}</p>
                        <p className="text-[11px] text-slate-400 truncate">{sub.student?.email || "No email"}</p>
                      </div>
                    </div>
                    {!readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-xs font-semibold shrink-0"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-primary" />
                        Review
                      </Button>
                    )}
                  </div>

                  {/* Bottom row: Status badge, Date, Score */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sub.status === "GRADED"
                          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        }`}>
                        {sub.status === "GRADED" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {sub.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {sub.submittedAt ? format(new Date(sub.submittedAt), "MMM d, h:mm a") : "Unknown"}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-1.5">
                      {sub.score !== null && sub.score !== undefined && (
                        (() => {
                          const max = assignment.maxScore || 100;
                          const pct = max > 0 ? (sub.score / max) * 100 : 0;
                          const pill = computeGradePill(pct, schoolProfile?.gradingSystem);
                          return (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${pill.bg} ${pill.color}`}>
                              {pill.label}
                            </span>
                          );
                        })()
                      )}
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {sub.score ?? 0}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold ml-0.5">
                        / {assignment.maxScore || 100}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ExportResultScopeModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExecuteExport}
        isExporting={isExporting}
        students={submissionsList}
        title="Export Assignment Submissions"
        description="Download submissions in PDF, Excel (.xlsx), or CSV (.csv) with verified grading evaluations."
        school={schoolProfile}
        examTitle={assignment.title}
        className={assignment.class?.name}
        role="ADMIN"
      />

      {selectedSubmission && (
        <SubmissionReviewModal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
          assignment={assignment}
          schoolId={effectiveSchoolId}
          gradingSystem={schoolProfile?.gradingSystem}
        />
      )}
    </div>
  );
}
