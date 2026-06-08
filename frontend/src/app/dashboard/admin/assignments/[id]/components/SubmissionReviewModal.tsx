"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, FileText, Check, X } from "lucide-react";
import { useGradeSubmission } from "@/lib/api/hooks/useAssignments";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  assignment: any;
  schoolId: string;
}

export default function SubmissionReviewModal({ isOpen, onClose, submission, assignment, schoolId }: Props) {
  const { mutate: gradeSubmission, isPending } = useGradeSubmission(schoolId);
  const [grades, setGrades] = useState<Record<string, { isCorrect: boolean; score: number; teacherComment: string }>>(() => {
    // Initialize state with existing answer grades
    const initial: Record<string, any> = {};
    submission.answers?.forEach((ans: any) => {
      initial[ans.id] = {
        isCorrect: ans.isCorrect,
        score: ans.score || 0,
        teacherComment: ans.teacherComment || "",
      };
    });
    return initial;
  });

  const handleMark = (answerId: string, isCorrect: boolean, maxScore: number) => {
    setGrades((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        isCorrect,
        score: isCorrect ? maxScore : 0,
      },
    }));
  };

  const handleSave = () => {
    const payload = Object.entries(grades).map(([answerId, data]) => ({
      answerId,
      ...data,
    }));

    gradeSubmission(
      { assignmentId: assignment.id, submissionId: submission.id, grades: payload },
      {
        onSuccess: () => {
          toast.success("Submission graded successfully");
          onClose();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to grade submission");
        },
      }
    );
  };

  const totalCurrentScore = Object.values(grades).reduce((sum, g) => sum + (g.score || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 p-0 border-none rounded-2xl">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={submission.student?.profileImage || "/logo/favicon.svg"} 
              alt={submission.student?.name || "Student"} 
              className="w-12 h-12 rounded-full bg-slate-100 object-cover"
            />
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {submission.student?.name}'s Submission
              </DialogTitle>
              <p className="text-sm text-slate-500">
                {submission.student?.email} • Submitted {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-500">Calculated Score</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalCurrentScore} <span className="text-sm text-slate-500 font-medium">/ {assignment.maxScore || 100}</span>
            </span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {assignment.questions?.map((q: any, index: number) => {
            const answer = submission.answers?.find((a: any) => a.questionId === q.id);
            const currentGrade = answer ? grades[answer.id] : null;

            return (
              <div key={q.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 relative">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">Question {index + 1} • {q.marks} Marks</span>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {q.question}
                    </h4>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">Student's Answer</span>
                  {answer ? (
                    <p className="text-slate-800 dark:text-slate-200">{answer.answer}</p>
                  ) : (
                    <p className="text-slate-400 italic">No answer provided.</p>
                  )}
                </div>

                {q.type !== "ESSAY" && q.type !== "SHORT_ANSWER" && (
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Correct Answer</span>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">{q.correctAnswer}</p>
                  </div>
                )}

                {answer && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mr-2">Mark:</span>
                    <Button
                      variant={currentGrade?.isCorrect === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleMark(answer.id, true, q.marks)}
                      className={currentGrade?.isCorrect === true ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}
                    >
                      <Check className="w-4 h-4 mr-1.5" /> Correct
                    </Button>
                    <Button
                      variant={currentGrade?.isCorrect === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleMark(answer.id, false, q.marks)}
                      className={currentGrade?.isCorrect === false ? "bg-red-500 hover:bg-red-600 text-white" : "text-red-600 border-red-200 hover:bg-red-50"}
                    >
                      <X className="w-4 h-4 mr-1.5" /> Incorrect
                    </Button>

                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-500">Score:</span>
                      <input 
                        type="number"
                        min={0}
                        max={q.marks}
                        value={currentGrade?.score || 0}
                        onChange={(e) => {
                          setGrades((prev) => ({
                            ...prev,
                            [answer.id]: {
                              ...prev[answer.id],
                              score: parseFloat(e.target.value) || 0,
                            }
                          }));
                        }}
                        className="w-16 h-8 text-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="font-bold">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save & Publish Grade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
