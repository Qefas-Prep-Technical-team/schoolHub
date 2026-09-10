'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, ArrowLeft, BookOpen, Clock, ShieldAlert } from 'lucide-react';
import QuestionViewer from './QuestionViewer';
import ExamInfo from './ExamInfo';
import Breadcrumbs from './Breadcrumbs';
import ExamSidebar from './ExamSidebar';
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

  const type = providedType || searchParams?.get('type') || 'exam';
  const id = providedId || searchParams?.get('id');

  // --- Auth Gate: verify teacher has an active school connection ---
  const { data: profile, isLoading: isLoadingProfile } = useTeacherProfile();
  const hasSchoolAccess = !!(profile?.activeSchoolId || profile?.primarySchoolId);

  const [activePaperIndex, setActivePaperIndex] = useState(0);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
        // We must fetch full paper data for each paper to get questions
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

  // Map SubjectExamQuestion to Question Viewer format
  const questions = useMemo(() => {
    if (!activePaper?.questions) return [];
    
    return activePaper.questions.sort((a, b) => a.order - b.order).map((q, index) => {
      const options = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean) as string[];
      let correctIndex = undefined;
      
      if (q.correctAnswer) {
        // Find if correct answer matches exactly, or matches 'A'/'B'/'C'/'D' mapping
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
    // Scroll to question
    document.getElementById(`question-${questionNumber}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClosePreview = () => {
    setShowCloseDialog(true);
  };

  const confirmClose = async () => {
    setIsClosing(true);
    // Add an artificial small delay to show the loading indicator
    await new Promise(resolve => setTimeout(resolve, 800));
    if (onClose) {
      onClose();
      setIsClosing(false);
      setShowCloseDialog(false);
    } else {
      window.history.back();
    }
  };

  const handleSubmitExam = () => {
    if (window.confirm('Submit exam? This is just a preview, so no data will be saved.')) {
      alert('Exam submitted successfully! (Preview mode)');
    }
  };

  // --- School Connection Blocked State ---
  if (!isLoadingProfile && !hasSchoolAccess) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl opacity-60" />
          </div>
          <div className="relative bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800/50 rounded-2xl p-10 text-center shadow-lg">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              School Connection Required
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              You must be connected to a school to access exam previews. Please contact your school administrator to link your account.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <main className="p-4 lg:p-6 xl:p-8">
        <div className="w-full">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Exam Preview: {examData.title}
              </h1>
              <button
                onClick={handleClosePreview}
                className="flex items-center justify-center h-10 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
              >
                <X className="w-4 h-4 mr-2" />
                Close Preview
              </button>
            </div>
            
            <div className="hidden lg:block mb-6">
              <Breadcrumbs title={examData.title} id={id} fromClass={searchParams?.get('fromClass')} />
            </div>
          </div>

          {/* Multi-Paper Tabs */}
          {livePapers && livePapers.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
              {livePapers.map((paper, idx) => (
                <button
                  key={paper.id}
                  onClick={() => setActivePaperIndex(idx)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activePaperIndex === idx
                      ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {paper.title}
                </button>
              ))}
            </div>
          )}

          {/* Exam Info */}
          <div className="mt-6">
            <ExamInfo examData={examData} isLoading={isLoadingPapers} />
          </div>

          {/* Main Content */}
          {isLoadingPapers ? (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
              {/* Skeleton Question Viewer */}
              <div className="lg:col-span-2 rounded-xl border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-900/10 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Skeleton Sidebar */}
              <div className="lg:col-span-1 rounded-xl border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-900/10 p-6 h-[500px]">
                <div className="flex flex-col items-center mb-6">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-px w-full bg-gray-200 dark:bg-gray-700 mb-6"></div>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                  ))}
                </div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 w-full"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
              </div>
            </div>
          ) : !isLoadingPapers && (!livePapers || livePapers.length === 0) ? (
            /* No Authorized Papers Empty State */
            <div className="mt-12 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Decorative background blobs */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-100 dark:bg-amber-900/20 rounded-full blur-3xl opacity-60" />
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-100 dark:bg-orange-900/20 rounded-full blur-2xl opacity-40" />
                </div>

                <div className="relative bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-10 text-center shadow-lg">
                  {/* Icon */}
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-amber-500" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                        <Clock className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Heading */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Preview Not Available Yet
                  </h2>

                  {/* Subtitle */}
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                    You don&apos;t have any subject papers assigned to you in this exam that are available for preview right now.
                  </p>

                  {/* Info box */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">Why am I seeing this?</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                          Teachers can only preview their connected subject papers before the exam ends.
                          Papers for subjects you don&apos;t teach are hidden until the exam&apos;s end date passes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back button */}
                  <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          ) : (activePaper as any)?.status === 'FORBIDDEN' ? (
            <div className="mt-12 text-center p-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex justify-center mb-4 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h3>
              <p className="text-emerald-700 dark:text-emerald-400">
                {(activePaper as any)._forbiddenMessage || "You are not authorized to preview this paper until the exam ends."}
              </p>
            </div>
          ) : questions.length === 0 ? (
            <div className="mt-12 text-center p-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">No Questions Yet</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">This paper has no questions added to it yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Question Viewer */}
              <div className="lg:col-span-2">
                <QuestionViewer
                  questions={questions}
                  currentQuestion={currentQuestion}
                  selectedAnswers={selectedAnswers}
                  onSelectAnswer={handleSelectAnswer}
                  isPreview={true}
                  onNavigateToQuestion={handleNavigateToQuestion}
                />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
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
          )}
        </div>
      </main>

      {/* Close Preview Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={(open) => !isClosing && setShowCloseDialog(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close Preview?</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this preview? All your selected answers will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCloseDialog(false)}
              disabled={isClosing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmClose}
              disabled={isClosing}
            >
              {isClosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                'Close Preview'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
