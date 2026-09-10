"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { examService, ExamAttempt, SubjectAttempt } from "@/lib/api/services/examService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";

interface StudentResultsListProps {
  examId: string;
  paperId: string;
}

export default function StudentResultsList({ examId, paperId }: StudentResultsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttempt, setSelectedAttempt] = useState<{
    attempt: ExamAttempt;
    paperAttempt: SubjectAttempt | undefined;
    name: string;
    initials: string;
  } | null>(null);
  const itemsPerPage = 5;

  const { data: allAttempts = [], isLoading } = useQuery({
    queryKey: ["exam-attempts", examId],
    queryFn: () => examService.getExamAttempts(examId),
  });

  // Filter attempts that have submitted this specific paper
  const validAttempts = allAttempts.filter((attempt) => {
    if (attempt.status !== "SUBMITTED" && attempt.status !== "SCORED") return false;
    return attempt.subjectAttempts?.some((sa) => sa.subjectPaperId === paperId);
  });

  const totalPages = Math.ceil(validAttempts.length / itemsPerPage);
  const paginatedAttempts = validAttempts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin text-primary h-6 w-6" />
      </div>
    );
  }

  if (validAttempts.length === 0) {
    return (
      <div className="text-center p-4 text-sm text-gray-500">
        No students have submitted this paper yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Students ({validAttempts.length})</h4>
      </div>

      <div className="space-y-2">
        {paginatedAttempts.map((attempt) => {
          const paperAttempt = attempt.subjectAttempts?.find(sa => sa.subjectPaperId === paperId);
          const name = attempt.student ? `${attempt.student.firstName} ${attempt.student.lastName}` : "Unknown Student";
          const initials = attempt.student ? `${attempt.student.firstName[0]}${attempt.student.lastName[0]}` : "U";
          
          return (
            <div 
              key={attempt.id} 
              onClick={() => setSelectedAttempt({ attempt, paperAttempt, name, initials })}
              className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
            >
              <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700">
                <AvatarImage src={attempt.student?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{name}</p>
                <p className="text-[10px] text-slate-500">
                  {paperAttempt?.score !== undefined ? `${paperAttempt.score} / ${paperAttempt.totalMarks || '-'}` : "Submitted"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft size={14} /> Prev
          </Button>
          <span className="text-[10px] font-medium text-slate-500">{currentPage} of {totalPages}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      )}

      <Dialog open={!!selectedAttempt} onOpenChange={(open) => !open && setSelectedAttempt(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Student Result Details</DialogTitle>
          </DialogHeader>
          
          {selectedAttempt && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={selectedAttempt.attempt.student?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{selectedAttempt.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedAttempt.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Status: {selectedAttempt.attempt.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-none">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Score Obtained</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {selectedAttempt.paperAttempt?.score ?? '-'}
                  </p>
                </Card>
                <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-none">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Marks</p>
                  <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                    {selectedAttempt.paperAttempt?.totalMarks ?? '-'}
                  </p>
                </Card>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-3 rounded-xl flex items-start gap-3">
                <Clock className="text-blue-500 mt-0.5" size={16} />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-0.5">Submission Time</p>
                  <p className="text-xs opacity-80">
                    {selectedAttempt.attempt.submittedAt 
                      ? new Date(selectedAttempt.attempt.submittedAt).toLocaleString() 
                      : "Not submitted"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
