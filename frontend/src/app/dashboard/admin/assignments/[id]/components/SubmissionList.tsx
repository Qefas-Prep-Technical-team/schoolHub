"use client";

import { useState } from "react";
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
import { generatePDF } from "@/utils/pdfGenerator";
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

  const [isExporting, setIsExporting] = useState(false);
  const { data: schoolProfile } = useSchoolProfile(schoolId || user?.schools?.[0]?.schoolId || user?.tenantId || "");

  const handleExport = async (targetFormat: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      if (!submissions || submissions.length === 0) {
        toast.info("No submissions to export.");
        return;
      }
      
      const headers = ["#", "Student Name", "Student Email", "Submitted At", "Status", "Score", "Max Score"];
      const rows = submissions.map((sub: any, index: number) => {
        return [
          (index + 1).toString(),
          sub.student?.name || "Unknown Student",
          sub.student?.email || "No email",
          sub.submittedAt ? format(new Date(sub.submittedAt), "MMM d, yyyy h:mm a") : "Unknown",
          sub.status || "Unknown",
          (sub.score ?? 0).toString(),
          (assignment.maxScore || 100).toString()
        ];
      });

      const dateStr = format(new Date(), "yyyy-MM-dd");
      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || (user as any)?.tenant?.name || "School";
      const sanitizedSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileNameBase = `${sanitizedSchoolName}_assignment_submissions_${dateStr}`;

      if (targetFormat === 'csv') {
        const csvContent = [];
        csvContent.push(`"${schoolName.toUpperCase()}"`);
        if (schoolProfile?.motto) csvContent.push(`"${schoolProfile.motto}"`);
        csvContent.push("");
        csvContent.push(`"Assignment: ${(assignment.title || '').replace(/"/g, '""')}"`);
        csvContent.push(`"Generated on: ${dateStr}"`);
        csvContent.push("");
        
        csvContent.push(headers.join(","));
        rows.forEach((r: any[]) => {
            const safeRow = r.map((item: any) => `"${String(item).replace(/"/g, '""')}"`);
            csvContent.push(safeRow.join(","));
        });

        const csv = csvContent.join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileNameBase}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        await generatePDF({
          title: `Assignment Submissions: ${assignment.title}`,
          filename: `${fileNameBase}.pdf`,
          schoolProfile: schoolProfile,
          metaData: [
            { label: 'Date', value: dateStr },
            { label: 'Total Submissions', value: submissions.length.toString() }
          ],
          tableHeaders: [headers],
          tableData: rows
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to export submissions as ${targetFormat.toUpperCase()}.`);
    } finally {
      setIsExporting(false);
    }
  };


  const submissions = assignment.submissions || [];

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
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Submissions Tracker
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full ml-2">
            {submissions.length} Total
          </span>
        </h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={isExporting}
              className="h-9 px-4 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {isExporting ? (
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2 text-slate-400" />
              )}
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-xl">
            <DropdownMenuItem 
              onClick={() => handleExport('csv')}
              className="rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 py-2.5 px-3"
            >
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExport('pdf')}
              className="rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 py-2.5 px-3 mt-1"
            >
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto">
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
            {submissions.map((sub: any, index: number) => (
              <tr key={sub.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="py-4 text-center font-medium text-slate-500 dark:text-slate-400">
                  {index + 1}
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
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    sub.status === "GRADED" 
                      ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  }`}>
                    {sub.status === "GRADED" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {sub.status}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{sub.score ?? 0} / {assignment.maxScore || 100}</span>
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
            ))}
          </tbody>
        </table>
      </div>

      {selectedSubmission && (
        <SubmissionReviewModal 
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
          assignment={assignment}
          schoolId={schoolId}
        />
      )}
    </div>
  );
}
