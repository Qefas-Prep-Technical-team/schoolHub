'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumbs from './components/Breadcrumbs';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import InstructionsPanel from './components/InstructionsPanel';
import ActionFooter from './components/ActionFooter';
import { Assignment } from './components/types';
import SubmissionModal from './components/SubmissionModal';
import { useAssignmentById, useSubmitAssignment } from '@/lib/api/hooks/useAssignments';
import { toast } from 'react-toastify';
import { 
  ExternalLink, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  marks: number;
  correctAnswer?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
}

interface SavedAnswer {
  questionId: string;
  answer: string;
}

const getFileExtension = (url: string) => {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('.').pop()?.toLowerCase() || '';
  } catch {
    return url.split('.').pop()?.split('?')[0].toLowerCase() || '';
  }
};

const getFileType = (url: string): 'image' | 'pdf' | 'video' | 'audio' | 'other' => {
  const extension = getFileExtension(url);
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
  if (extension === 'pdf') return 'pdf';
  if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
  if (['mp3', 'wav', 'mpeg'].includes(extension)) return 'audio';
  return 'other';
};

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [activeTab, setActiveTab] = useState<'instructions' | 'attachments' | 'rubric' | 'materials' | 'quiz'>('instructions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const QUESTIONS_PER_PAGE = 10;

  const { data: assignment, isLoading, error } = useAssignmentById(assignmentId);
  const { mutateAsync: submitAssignment } = useSubmitAssignment();

  const [isAnswersInitialized, setIsAnswersInitialized] = useState(false);

  // Load existing answers on mount when assignment details loads
  useEffect(() => {
    const subAnswers = assignment?.submissions?.[0]?.answers as SavedAnswer[] | undefined;
    if (Array.isArray(subAnswers) && !isAnswersInitialized) {
      const initialAnswers: Record<string, string> = {};
      subAnswers.forEach((ans) => {
        initialAnswers[ans.questionId] = ans.answer;
      });
      setQuizAnswers(initialAnswers);
      setIsAnswersInitialized(true);
    } else if (assignment && !Array.isArray(subAnswers)) {
      setIsAnswersInitialized(true);
    }
  }, [assignment, isAnswersInitialized]);

  // Periodic / Debounced Sync of Quiz Answers to database as draft
  useEffect(() => {
    if (!isAnswersInitialized) return;
    
    const submissionStatus = assignment?.submissions?.[0]?.status;
    if (submissionStatus === 'SUBMITTED' || submissionStatus === 'GRADED' || submissionStatus === 'submitted' || submissionStatus === 'graded') {
      return;
    }

    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount === 0) return;

    const savedAnswers = assignment?.submissions?.[0]?.answers as SavedAnswer[] | undefined;
    const savedAnswersArray = Array.isArray(savedAnswers) ? savedAnswers : [];
    
    const isDifferent = Object.entries(quizAnswers).some(([qId, ansVal]) => {
      const savedAns = savedAnswersArray.find((sa) => sa.questionId === qId);
      return !savedAns || savedAns.answer !== ansVal;
    }) || savedAnswersArray.length !== answeredCount;

    if (!isDifferent) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        const formattedAnswers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
          questionId,
          answer,
        }));
        
        await submitAssignment({
          id: assignmentId,
          data: {
            answers: formattedAnswers,
            isDraft: true,
          }
        });
      } catch (err) {
        console.error("Failed to auto-save quiz answers draft", err);
      }
    }, 3000);

    return () => clearTimeout(delayDebounceFn);
  }, [quizAnswers, assignmentId, submitAssignment, assignment, isAnswersInitialized]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmission = async (files: File[], _text: string) => {
    try {
      const fileUrl = files.length > 0 ? "https://example.com/mock-upload" : undefined;
      const fileName = files.length > 0 ? files[0].name : undefined;

      const formattedAnswers = Object.entries(quizAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      await submitAssignment({
        id: assignmentId,
        data: {
          fileUrl,
          fileName,
          answers: formattedAnswers,
        }
      });
    } catch (err) {
      toast.error("Failed to submit assignment. Please try again.");
      console.error(err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 animate-in fade-in duration-300">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 animate-pulse" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/2 animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-14 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
          Assignment Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          The requested assignment does not exist or has not been published yet.
        </p>
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  const isGraded = 
    assignment?.status === 'GRADED' || 
    assignment?.status === 'graded' || 
    assignment?.submissions?.[0]?.status === 'GRADED' || 
    assignment?.submissions?.[0]?.status === 'graded';

  const isSubmitted = 
    assignment?.status === 'SUBMITTED' || 
    assignment?.status === 'submitted' || 
    assignment?.submissions?.[0]?.status === 'SUBMITTED' || 
    assignment?.submissions?.[0]?.status === 'submitted' || 
    isGraded;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard/student' },
    { label: 'Assignments', href: '/dashboard/student/assignments' },
    { label: assignment.title, href: '#', current: true },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="flex-grow">
        <main className="w-full max-w-5xl mx-auto flex flex-col px-3.5 py-4 sm:px-6 sm:py-6 lg:p-8">
          
          <div className="hidden sm:block mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <Header assignment={assignment as Assignment} />

          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            attachmentsCount={assignment.attachmentUrl ? 1 : 0}
            questionsCount={assignment.questions?.length || 0}
            isGraded={isGraded}
          />

          <div className="mt-2 mb-20 sm:mb-24 space-y-6">
            
            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <InstructionsPanel instructions={assignment.instructions} />

                {assignment.videoUrl && (
                  <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-xs">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                      Video Reference
                    </h4>
                    <VideoPlayer videoUrl={assignment.videoUrl} title="Video Reference" />
                  </div>
                )}

                {assignment.referenceUrl && (
                  <div className="bg-white dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                      External Reference
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 mb-4">
                      Additional reference link provided by the instructor:
                    </p>
                    <a
                      href={assignment.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-xl text-xs sm:text-sm font-bold text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Reference Link
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (() => {
              const isGraded = assignment.status === 'GRADED' || assignment.status === 'graded' || assignment.submissions?.[0]?.status === 'GRADED' || assignment.submissions?.[0]?.status === 'graded';
              const isLocked = assignment.status === 'SUBMITTED' || assignment.status === 'submitted' || assignment.submissions?.[0]?.status === 'SUBMITTED' || assignment.submissions?.[0]?.status === 'submitted' || isGraded;
              const allQuestions = (assignment.questions || []) as QuizQuestion[];
              const totalQuestions = allQuestions.length;
              const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
              const paginatedQuestions = allQuestions.slice(
                (currentQuestionPage - 1) * QUESTIONS_PER_PAGE,
                currentQuestionPage * QUESTIONS_PER_PAGE
              );

              const answeredCount = Object.keys(quizAnswers).filter(k => (quizAnswers[k] || '').trim() !== '').length;
              const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

              return (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-white dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                          Assignment Quiz
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {answeredCount} of {totalQuestions} answered ({progressPercentage}%)
                        </p>
                      </div>

                      {isGraded ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Graded & Reviewed
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-800">
                          Submitted (Under Review)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          Auto-saving answers as draft
                        </span>
                      )}
                    </div>

                    {/* Completion progress strip */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                      <div 
                        className="bg-pink-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    <div className="space-y-5 sm:space-y-6 mt-5">
                      {paginatedQuestions.map((q, idx) => {
                        const actualIndex = (currentQuestionPage - 1) * QUESTIONS_PER_PAGE + idx + 1;
                        return (
                          <div key={q.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 space-y-3.5 sm:space-y-4 shadow-2xs">
                            <div className="flex items-start justify-between gap-3">
                              <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-start gap-2">
                                <span className="text-pink-600 dark:text-pink-400 font-black">#{actualIndex}.</span>
                                <span className="whitespace-pre-wrap leading-relaxed">{q.question}</span>
                              </h5>
                              <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700">
                                {q.marks} {q.marks === 1 ? 'pt' : 'pts'}
                              </span>
                            </div>

                            {/* MULTIPLE_CHOICE */}
                            {q.type === 'MULTIPLE_CHOICE' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((optKey) => {
                                  const optionVal = q[optKey];
                                  if (!optionVal) return null;
                                  const optionLetter = optKey.replace('option', '');
                                  const isSelected = quizAnswers[q.id] === optionLetter;
                                  const isCorrectAnswer = isGraded && q.correctAnswer === optionLetter;
                                  
                                  let labelClass = 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
                                  
                                  if (isGraded) {
                                    if (isCorrectAnswer) {
                                      labelClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-bold';
                                    } else if (isSelected && !isCorrectAnswer) {
                                      labelClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 font-bold opacity-80';
                                    } else {
                                      labelClass = 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
                                    }
                                  } else if (isSelected) {
                                    labelClass = 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-bold shadow-xs ring-1 ring-pink-500/30';
                                  }

                                  return (
                                    <label
                                      key={optKey}
                                      className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border ${!isLocked ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'} transition-all ${labelClass}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question_${q.id}`}
                                        checked={isSelected}
                                        disabled={isLocked}
                                        onChange={() => handleAnswerChange(q.id, optionLetter)}
                                        className="sr-only"
                                      />
                                      <span className={cn(
                                        "size-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors",
                                        isSelected 
                                          ? "bg-pink-500 text-white" 
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                      )}>
                                        {optionLetter}
                                      </span>
                                      <span className="text-xs sm:text-sm flex-1 break-words font-medium">{optionVal}</span>
                                      {isGraded && isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                                      {isGraded && isSelected && !isCorrectAnswer && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {/* TRUE_FALSE */}
                            {q.type === 'TRUE_FALSE' && (
                              <div className="flex gap-2.5 sm:gap-3 flex-wrap">
                                {['True', 'False'].map((val) => {
                                  const isSelected = quizAnswers[q.id] === val;
                                  const isCorrectAnswer = isGraded && q.correctAnswer === val;
                                  
                                  let labelClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
                                  
                                  if (isGraded) {
                                    if (isCorrectAnswer) {
                                      labelClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold';
                                    } else if (isSelected && !isCorrectAnswer) {
                                      labelClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-bold opacity-80';
                                    }
                                  } else if (isSelected) {
                                    labelClass = 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-bold shadow-xs ring-1 ring-pink-500/30';
                                  }

                                  return (
                                    <label
                                      key={val}
                                      className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl border ${!isLocked ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'} transition-all min-w-[110px] justify-center ${labelClass}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`question_${q.id}`}
                                        checked={isSelected}
                                        disabled={isLocked}
                                        onChange={() => handleAnswerChange(q.id, val)}
                                        className="sr-only"
                                      />
                                      <span className="text-xs sm:text-sm font-bold">{val}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {/* SHORT_ANSWER */}
                            {q.type === 'SHORT_ANSWER' && (
                              <div className="space-y-3">
                                <textarea
                                  value={quizAnswers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  placeholder="Type your answer here..."
                                  rows={3}
                                  disabled={isLocked}
                                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                />
                                {isGraded && q.correctAnswer && (
                                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-xs sm:text-sm">
                                    <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-0.5">Correct Answer Key:</p>
                                    <p className="text-emerald-700 dark:text-emerald-400">{q.correctAnswer}</p>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                          <button
                            onClick={() => setCurrentQuestionPage(p => Math.max(1, p - 1))}
                            disabled={currentQuestionPage === 1}
                            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" /> Previous
                          </button>
                          <span className="text-xs font-bold text-slate-500">
                            Page {currentQuestionPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentQuestionPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentQuestionPage === totalPages}
                            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                          >
                            Next <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs animate-in fade-in duration-300">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Attachments & Resources
                </h4>
                {assignment.attachmentUrl ? (
                  <div className="space-y-4">
                    {(() => {
                      const fileType = getFileType(assignment.attachmentUrl);
                      if (fileType === 'image') {
                        return (
                          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 max-w-3xl w-full">
                            <img src={assignment.attachmentUrl} alt="Attachment Preview" className="max-h-[500px] w-auto mx-auto object-contain rounded-xl" />
                          </div>
                        );
                      }
                      if (fileType === 'pdf') {
                        return (
                          <div className="w-full max-w-4xl min-h-[500px] sm:min-h-[600px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <iframe src={assignment.attachmentUrl} className="w-full min-h-[500px] sm:min-h-[600px]" title="PDF Preview" />
                          </div>
                        );
                      }
                      if (fileType === 'video') {
                        return (
                          <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <video src={assignment.attachmentUrl} controls className="w-full h-full" />
                          </div>
                        );
                      }
                      if (fileType === 'audio') {
                        return (
                          <div className="w-full max-w-2xl p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                            <audio src={assignment.attachmentUrl} controls className="w-full" />
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-w-2xl">
                          <FileText className="h-8 w-8 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Attachment File</p>
                            <p className="text-xs text-slate-500">Preview is not directly embedded. Download or open in a new tab to view.</p>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <a
                        href={assignment.attachmentUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs"
                      >
                        <Download className="w-4 h-4" />
                        Download File
                      </a>
                      <a
                        href={assignment.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-bold rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in New Tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-500 italic">No attachments attached to this assignment.</p>
                )}
              </div>
            )}

            {/* Rubric Tab */}
            {activeTab === 'rubric' && (
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-500 italic">No grading rubric specified for this assignment.</p>
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-500 italic">No additional study materials attached.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Persistent Action Footer - only shown when action is required */}
      {!isGraded && !isSubmitted && (
        <ActionFooter
          assignment={assignment as Assignment}
          onSubmit={() => setIsModalOpen(true)}
        />
      )}

      <SubmissionModal
        assignment={assignment as Assignment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmission}
      />
    </div>
  );
}