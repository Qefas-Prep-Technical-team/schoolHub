"use client";

import { X, Loader2, BookOpen } from "lucide-react";
import { useGradeHub } from "@/lib/api/hooks/useGrades";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { examService } from "@/lib/api/services/examService";

interface PaperScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string;
  paperTitle: string;
  type: "paper" | "assignment";
  schoolId: string;
  currentStudentIds?: string[];
}

export function PaperScoresModal({
  isOpen,
  onClose,
  paperId,
  paperTitle,
  type,
  schoolId,
  currentStudentIds = []
}: PaperScoresModalProps) {
  // Fetch paper details to get both manual grades and online exam attempts
  const { data: paperData, isLoading: isLoadingGrades } = useQuery({
    queryKey: ["paper", paperId],
    queryFn: () => examService.getPaperById("none", paperId),
    enabled: type === "paper" && !!paperId,
  });
  
  const paper = paperData as any;
  
  const onlineResults = (paper?.examAttempts || []).map((a: any) => ({
    id: a.id,
    student: a.examAttempt?.student,
    score: a.score,
    maxMarks: a.totalMarks || paper?.totalMarks,
    type: 'ONLINE'
  }));

  const manualResults = (paper?.grades || [])
    .filter((g: any) => !g.examAttemptId && !g.subjectExamAttemptId)
    .map((g: any) => ({
      id: g.id,
      student: g.student,
      score: g.score,
      maxMarks: g.maxMarks,
      type: 'MANUAL',
    }));

  const combinedGrades = [...onlineResults, ...manualResults];
  
  // Fetch assignment submissions
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<any[]>([]);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);

  useEffect(() => {
    if (isOpen && type === "assignment" && paperId && schoolId) {
      setIsLoadingAssignment(true);
      apiClient.get(`/assignment/admin/${paperId}`, { headers: { 'x-school-id': schoolId } })
        .then((res: any) => {
          if (res.data?.data?.submissions) {
            setAssignmentSubmissions(res.data.data.submissions);
          }
        })
        .catch((err: any) => console.error("Failed to fetch assignment details:", err))
        .finally(() => setIsLoadingAssignment(false));
    }
  }, [isOpen, type, paperId, schoolId]);

  const grades = type === "paper" 
    ? combinedGrades
    : assignmentSubmissions;

  const isLoading = type === "paper" ? isLoadingGrades : isLoadingAssignment;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1a1b2e] w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#10b981]" />
            Scores for "{paperTitle}"
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
              <p className="text-sm text-slate-500">Loading scores...</p>
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No scores found for this {type === "paper" ? "paper" : "assignment"}.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16 text-center">#</th>
                    <th className="px-4 py-3 font-medium">Student Name</th>
                    <th className="px-4 py-3 font-medium">Student Code</th>
                    <th className="px-4 py-3 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {grades.map((grade: any, index: number) => {
                    const studentId = grade.student?.id || grade.studentId;
                    const studentName = grade.student?.name || "Unknown";
                    const studentCode = grade.student?.studentCode || "-";
                    const isCurrent = currentStudentIds.includes(studentId);
                    
                    return (
                      <tr key={grade.id} className={`transition-colors ${isCurrent ? "bg-[#10b981]/5 hover:bg-[#10b981]/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-900/20"}`}>
                        <td className="px-4 py-3 text-slate-500 text-center font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {studentName}
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-[#10b981]/10 text-[#10b981] px-1.5 py-0.5 rounded flex-shrink-0">In Result</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {studentCode}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#10b981] text-right">
                          {grade.score ?? "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
