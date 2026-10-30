'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  X, 
  Loader2, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  ShieldAlert, 
  Eye, 
  LayoutGrid, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import QuestionViewer from './QuestionViewer';
import ExamInfo from './ExamInfo';
import Breadcrumbs from './Breadcrumbs';
import ExamSidebar from './ExamSidebar';
import StudentReadingModal from '@/app/Exams&Quizzes/exam/[examId]/components/StudentReadingModal';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { examService } from '@/lib/api/services/examService';
import { SubjectExamQuestion, SubjectPaper } from '@/lib/api/services/examService';
import { useTeacherProfile } from '@/lib/api/hooks/useTeacher';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface ExamPreviewPageProps {
  providedId?: string;
  providedType?: string;
  onClose?: () => void;
}

export default function ExamPreviewPage({
  providedId,
  providedType,
  onClose
}: ExamPreviewPageProps = {}) {
  const searchParams = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(59 * 60 + 59); // 59:59 in seconds
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);

  const type = providedType || searchParams?.get('type') || 'exam';
  const id = providedId || searchParams?.get('id');

  // --- Auth Gate: verify teacher has an active school connection ---
  const { data: profile, isLoading: isLoadingProfile } = useTeacherProfile();
  const hasSchoolAccess = !!(profile?.activeSchoolId || profile?.primarySchoolId);

  const [activePaperIndex, setActivePaperIndex] = useState(0);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string } | null>(null);

  // Fetch the full structure — only when user has a confirmed school connection
  const { data: livePapers, isLoading: isLoadingPapers } = useQuery({
    queryKey: ['previewPapers', id, type],
    queryFn: async () => {
      if (!id) return [];
      
      if (type === 'subject_paper') {
        const paper = await examService.getPaperById('none', id);
        return [paper];
      } else if (type === 'exam' || type === 'quiz' || type === 'ca') {
        const papers = await examService.getExamPapers(id);
        const fullPapers = await Promise.all(
          papers.map(p => examService.getPaperById(id, p.id))
        );
        return fullPapers;
      }
      return [];
    },
    enabled: !!id && !isLoadingProfile && hasSchoolAccess,
    staleTime: 1000 * 60 * 5, // 5 minutes — paper list doesn't change mid-session
    retry: 1,
  });

  const activePaper = livePapers?.[activePaperIndex];
  const hasReadingContent = Boolean(
    activePaper?.readingContent || 
    (activePaper?.images && activePaper.images.length > 0)
  );

  // Map SubjectExamQuestion to Question Viewer format
  const questions = useMemo(() => {
    if (!activePaper?.questions) return [];
    
    return activePaper.questions.sort((a, b) => a.order - b.order).map((q, index) => {
      const options = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean) as string[];
      let correctIndex = undefined;
      
      if (q.correctAnswer) {
        const matchingIndex = options.findIndex(
          (opt, i) => 
            opt === q.correctAnswer || 
            (q.correctAnswer.length === 1 && String.fromCharCode(65 + i) === q.correctAnswer)
        );
        if (matchingIndex !== -1) {
          correctIndex = matchingIndex;
        }
      }

      return {
        id: index + 1,
        text: q.question,
        options,
        correctAnswer: correctIndex,
      };
    });
  }, [activePaper]);

  const examData = {
    title: activePaper?.title || searchParams?.get('title') || 'Assessment Preview',
    class: 'Preview Mode',
    duration: activePaper?.durationMinutes || 60,
    subject: activePaper?.subject?.name || searchParams?.get('subject') || 'General',
    totalQuestions: questions.length,
  };

  // Reset progress when switching papers
  useEffect(() => {
    setCurrentQuestion(1);
    setSelectedAnswers({});
    setAnsweredQuestions(new Set());
    setTimeRemaining((activePaper?.durationMinutes || 60) * 60);
  }, [activePaperIndex, activePaper]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (questionId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
    
    if (!answeredQuestions.has(questionId)) {
      setAnsweredQuestions(prev => new Set(prev).add(questionId));
    }
  };

  const handleNavigateToQuestion = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
    document.getElementById(`question-${questionNumber}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClosePreview = () => {
    setShowCloseDialog(true);
  };

  const confirmClose = async () => {
    setIsClosing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (onClose) {
      onClose();
      setIsClosing(false);
      setShowCloseDialog(false);
    } else {
      window.history.back();
    }
  };

  const handleSubmitExam = () => {
    alert('This is preview simulation mode. No student attempts or grades are submitted.');
  };

  // --- School Connection Blocked State ---
  if (!isLoadingProfile && !hasSchoolAccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md">
          <div className="relative bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 sm:p-8 text-center shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              School Connection Required
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
              You must be connected to a school to access exam previews. Please contact your school administrator to link your account.
            </p>
            <button
              onClick={() => onClose ? onClose() : window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold transition-opacity hover:opacity-90"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Sticky Mobile/Desktop Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-xs shrink-0">
        {/* Left: Back / Close button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClosePreview}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Preview</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>

        {/* Center: Title & Subject & Preview Badge */}
        <div className="flex flex-col items-center min-w-0 px-2 text-center">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Eye className="w-3 h-3" /> Preview
            </span>
            <span className="hidden md:inline-block text-xs font-semibold text-slate-400 truncate max-w-[160px]">
              {examData.subject}
            </span>
          </div>
          <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
            {examData.title}
          </h1>
        </div>

        {/* Right: Timer & Mobile Question Map Sheet Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Passage Read Button */}
          {hasReadingContent && (
            <button
              type="button"
              onClick={() => setShowReadingModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-bold transition-all shadow-xs"
              title="Read Passage"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Passage</span>
            </button>
          )}

          {/* Timer Display */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          {/* Mobile Sheet Trigger for Question Navigation */}
          {questions.length > 0 && (
            <Sheet open={isMobileMapOpen} onOpenChange={setIsMobileMapOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{answeredQuestions.size}/{questions.length}</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 overflow-hidden">
                <SheetHeader className="p-4 border-b border-slate-100 dark:border-slate-800 text-left">
                  <SheetTitle className="text-base font-black text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Question Navigator</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {answeredQuestions.size} of {questions.length} Answered
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
                  <ExamSidebar
                    timeRemaining={formatTime(timeRemaining)}
                    totalQuestions={questions.length}
                    currentQuestion={currentQuestion}
                    answeredQuestions={answeredQuestions}
                    onNavigateToQuestion={(qNum) => {
                      handleNavigateToQuestion(qNum);
                      setIsMobileMapOpen(false);
                    }}
                    onSubmitExam={handleSubmitExam}
                    isPreview={true}
                    hideTimer={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>

      {/* Main Scrollable View */}
      <main className="p-3 sm:p-5 lg:p-6 xl:p-8 flex-1 max-w-7xl mx-auto w-full">
        {/* Desktop Breadcrumbs */}
        <div className="hidden lg:block mb-4">
          <Breadcrumbs title={examData.title} id={id} fromClass={searchParams?.get('fromClass')} />
        </div>

        {/* Multi-Paper Tabs (Horizontal Scrolling) */}
        {livePapers && livePapers.length > 1 && (
          <div className="mb-4 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 pb-2">
            {livePapers.map((paper, idx) => (
              <button
                key={paper.id}
                type="button"
                onClick={() => setActivePaperIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                  activePaperIndex === idx
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {paper.title}
              </button>
            ))}
          </div>
        )}

        {/* Exam Info Card */}
        <div className="mb-4">
          <ExamInfo 
            examData={examData} 
            isLoading={isLoadingPapers} 
            hasReadingContent={hasReadingContent}
            onOpenReadingModal={() => setShowReadingModal(true)}
          />
        </div>

        {/* Mobile Quick Question Scrubber (One-tap question switching on phone screens) */}
        {questions.length > 0 && (
          <div className="lg:hidden mb-4 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Jump
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Q{currentQuestion} of {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {questions.map((q) => {
                const isCurrent = q.id === currentQuestion;
                const isAnswered = answeredQuestions.has(q.id);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleNavigateToQuestion(q.id)}
                    className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 shadow-xs'
                        : isAnswered
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        {isLoadingPapers ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 h-96">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-8" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 h-96" />
          </div>
        ) : !isLoadingPapers && (!livePapers || livePapers.length === 0) ? (
          /* Empty State */
          <div className="mt-8 flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
              Preview Not Available Yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-5">
              You don&apos;t have any subject papers assigned to you in this exam that are available for preview right now.
            </p>
            <button
              type="button"
              onClick={() => onClose ? onClose() : window.history.back()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (activePaper as any)?.status === 'FORBIDDEN' ? (
          <div className="mt-8 text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 max-w-md mx-auto">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Access Restricted</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              {(activePaper as any)._forbiddenMessage || "You are not authorized to preview this paper until the exam ends."}
            </p>
          </div>
        ) : questions.length === 0 ? (
          <div className="mt-8 text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">No Questions Added</h3>
            <p className="text-slate-400 text-xs sm:text-sm">This subject paper does not have any questions created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Question Viewer Column */}
            <div className="lg:col-span-2">
              <QuestionViewer
                questions={questions}
                currentQuestion={currentQuestion}
                selectedAnswers={selectedAnswers}
                onSelectAnswer={handleSelectAnswer}
                isPreview={true}
                onNavigateToQuestion={handleNavigateToQuestion}
                hasReadingContent={hasReadingContent}
                onOpenReadingModal={() => setShowReadingModal(true)}
              />
            </div>

            {/* Desktop Sticky Sidebar & Mobile Bottom Overview */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20">
                <ExamSidebar
                  timeRemaining={formatTime(timeRemaining)}
                  totalQuestions={questions.length}
                  currentQuestion={currentQuestion}
                  answeredQuestions={answeredQuestions}
                  onNavigateToQuestion={handleNavigateToQuestion}
                  onSubmitExam={handleSubmitExam}
                  isPreview={true}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Close Preview Confirmation Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={(open) => !isClosing && setShowCloseDialog(open)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Exit Preview Mode?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to close this exam preview? Any simulated selections will be discarded.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCloseDialog(false)}
              disabled={isClosing}
              className="rounded-xl text-xs sm:text-sm font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmClose}
              disabled={isClosing}
              className="rounded-xl text-xs sm:text-sm font-bold"
            >
              {isClosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exiting...
                </>
              ) : (
                'Exit Preview'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reading Passage & Reference Material Modal */}
      <StudentReadingModal
        isOpen={showReadingModal}
        onClose={() => setShowReadingModal(false)}
        content={activePaper?.readingContent || ''}
        images={activePaper?.images || []}
        imageLabels={activePaper?.imageLabels || []}
        subjectName={examData.subject}
        onZoom={(src, alt) => setLightboxImage({ src, alt })}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={Boolean(lightboxImage?.src)}
        src={lightboxImage?.src || ''}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
