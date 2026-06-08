"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Users, Eye, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubmissionReviewModal from "./SubmissionReviewModal";

interface Props {
  assignment: any;
  schoolId: string;
}

export default function SubmissionList({ assignment, schoolId }: Props) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Student</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Date</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Score</th>
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub: any) => (
              <tr key={sub.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 rounded-lg text-xs font-semibold"
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Review
                  </Button>
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
