"use client";

import { useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = paper.questions || [];
  const currentQuestion = questions[activeIndex];

  const handleNext = () => {
    if (activeIndex < questions.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[98vw] max-w-[98vw] w-[98vw] h-[98vh] rounded-[1.5rem] p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
          <DialogHeader className="sr-only">
            <DialogTitle>Paper Preview - {paper.title}</DialogTitle>
          </DialogHeader>
          
          {/* Preview Header */}
          <div className="bg-white dark:bg-slate-900 px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Eye size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white leading-none">Preview Mode</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Viewing as Student: {paper.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(paper.readingContent || (paper.images && paper.images.length > 0)) && (
                <ShcnButton 
                  variant="outline"
                  className="rounded-xl font-black bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 flex items-center gap-2 px-5"
                  onClick={() => setShowReadingModal(true)}
                >
                  <BookOpen size={18} /> Read Passage
                </ShcnButton>
              )}
              <ShcnButton
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </ShcnButton>
            </div>
          </div>

          {/* Main Preview Content */}
          <div className="flex-1 overflow-y-auto min-h-0 p-8 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
              {questions.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      <span className="text-xs font-black text-primary uppercase tracking-widest">
                        Question {activeIndex + 1} of {questions.length}
                      </span>
                    </div>
                  </div>

                  <QuestionCard
                    id={currentQuestion.id}
                    number={activeIndex + 1}
                    totalQuestions={questions.length}
                    type={currentQuestion.type as any}
                    text={currentQuestion.question}
                    images={currentQuestion.images}
                    imageLabels={currentQuestion.imageLabels}
                    options={
                      currentQuestion.type === "TRUE_FALSE"
                        ? [
                            { id: "TRUE", text: "True" },
                            { id: "FALSE", text: "False" }
                          ]
                        : [
                            ...(currentQuestion.optionA ? [{ id: 'A', text: currentQuestion.optionA }] : []),
                            ...(currentQuestion.optionB ? [{ id: 'B', text: currentQuestion.optionB }] : []),
                            ...(currentQuestion.optionC ? [{ id: 'C', text: currentQuestion.optionC }] : []),
                            ...(currentQuestion.optionD ? [{ id: 'D', text: currentQuestion.optionD }] : []),
                          ]
                    }
                    selectedOptionId={answers[currentQuestion.id]}
                    onSelectOption={handleSelectOption}
                    onNext={handleNext}
                    showNextButton={false} // We use our own footer for nav
                  />

                  {/* Navigation Footer */}
                  <div className="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-800">
                    <ShcnButton
                      variant="outline"
                      onClick={handlePrev}
                      disabled={activeIndex === 0}
                      className="rounded-2xl font-bold h-12 px-6 flex items-center gap-2 border-slate-200"
                    >
                      <ChevronLeft size={18} /> Previous
                    </ShcnButton>

                    <div className="flex gap-2">
                       {questions.map((_, i) => (
                         <div 
                           key={i}
                           className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'bg-slate-300'}`}
                         />
                       ))}
                    </div>

                    <ShcnButton
                      onClick={handleNext}
                      disabled={activeIndex === questions.length - 1}
                      className="rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8 flex items-center gap-2"
                    >
                      Next <ChevronRight size={18} />
                    </ShcnButton>
                  </div>
                </>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-20 w-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                    <BookOpen size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Questions Yet</h3>
                    <p className="text-gray-500 mt-2">Add some questions to preview how they will look to students.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reusing StudentReadingModal for preview fidelity */}
        {(paper.readingContent || (paper.images && paper.images.length > 0)) && (
          <StudentReadingModal
            isOpen={showReadingModal}
            onClose={() => setShowReadingModal(false)}
            content={paper.readingContent || ""}
            images={paper.images}
            imageLabels={paper.imageLabels}
            subjectName={paper.subject?.name || "Subject"}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
