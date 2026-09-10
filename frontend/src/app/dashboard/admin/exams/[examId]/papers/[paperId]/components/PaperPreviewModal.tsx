"use client";

import { useState, Suspense } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button as ShcnButton } from "@/components/ui/button";
import { BookOpen, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import QuestionCard from "@/app/Exams&Quizzes/exam/[examId]/start/components/QuestionCard";
import StudentReadingModal from "@/app/Exams&Quizzes/exam/[examId]/components/StudentReadingModal";
import ExamPreviewPage from "@/app/dashboard/teacher/exams&quizzes/preview/components/ExamPreviewPage";
import { SubjectPaper, SubjectExamQuestion } from "@/lib/api/services/examService";

interface PaperPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: SubjectPaper & { questions?: SubjectExamQuestion[] };
}

export default function PaperPreviewModal({
  isOpen,
  onClose,
  paper
}: PaperPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[98vw] max-w-[98vw] w-[98vw] h-[98vh] rounded-[1.5rem] p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Paper Preview - {paper.title}</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading Preview...</div>}>
            <ExamPreviewPage providedId={paper.id} providedType="subject_paper" onClose={onClose} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
