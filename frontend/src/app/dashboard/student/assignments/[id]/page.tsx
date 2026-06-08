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
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';

function getEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  const cleanUrl = url.trim();

  // YouTube Shorts
  const shortsRegex = /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i;
  const shortsMatch = cleanUrl.match(shortsRegex);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // YouTube standard watch / embed / share URLs
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = cleanUrl.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Vimeo standard / embed URLs
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return cleanUrl;
}

const getFileExtension = (url: string) => {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('.').pop()?.toLowerCase() || '';
  } catch (e) {
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

  const { data: assignment, isLoading, error } = useAssignmentById(assignmentId);
  const { mutateAsync: submitAssignment } = useSubmitAssignment();

  const [isAnswersInitialized, setIsAnswersInitialized] = useState(false);

  // Load existing answers on mount when assignment details loads
  useEffect(() => {
    if (Array.isArray(assignment?.submissions?.[0]?.answers) && !isAnswersInitialized) {
      const initialAnswers: Record<string, string> = {};
      assignment.submissions[0].answers.forEach((ans: any) => {
        initialAnswers[ans.questionId] = ans.answer;
      });
      setQuizAnswers(initialAnswers);
      setIsAnswersInitialized(true);
    } else if (assignment && !Array.isArray(assignment.submissions?.[0]?.answers)) {
      // Mark initialized even if there are no existing submission answers yet
      setIsAnswersInitialized(true);
    }
  }, [assignment, isAnswersInitialized]);

  // Periodic / Debounced Sync of Quiz Answers to database as draft
  useEffect(() => {
    if (!isAnswersInitialized) return;
    
    // Prevent auto-save if already submitted or graded
    const submissionStatus = assignment?.submissions?.[0]?.status;
    if (submissionStatus === 'SUBMITTED' || submissionStatus === 'GRADED' || submissionStatus === 'submitted' || submissionStatus === 'graded') {
      return;
    }

    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount === 0) return;

    // Check if current state is different from saved database answers to prevent unnecessary saves
    const savedAnswers = assignment?.submissions?.[0]?.answers;
    const savedAnswersArray = Array.isArray(savedAnswers) ? savedAnswers : [];
    
    const isDifferent = Object.entries(quizAnswers).some(([qId, ansVal]) => {
      const savedAns = savedAnswersArray.find((sa: any) => sa.questionId === qId);
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
        console.log("Quiz answers auto-saved successfully as draft");
      } catch (err) {
        console.error("Failed to auto-save quiz answers draft", err);
      }
    }, 3000); // Wait 3 seconds of inactivity before autosaving

    return () => clearTimeout(delayDebounceFn);
  }, [quizAnswers, assignmentId, submitAssignment, assignment, isAnswersInitialized]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmission = async (files: File[], text: string) => {
    try {
      // In a real application, you would upload the files and then post their URLs.
      // We simulate the file URL generation based on standard practices or just map the first file for testing.
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
      // Modal handles success state and closing
    } catch (err) {
      toast.error("Failed to submit assignment. Please try again.");
      console.error(err);
      throw err; // Let the modal catch it
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl mb-8"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Assignment not found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">The assignment you are looking for does not exist or you do not have permission to view it.</p>
          <button onClick={() => router.back()} className="text-primary dark:text-pink-400 hover:underline font-medium">Go back</button>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard/student' },
    { label: 'Assignments', href: '/dashboard/student/assignments' },
    { label: assignment.title, href: '#', current: true },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="flex-grow">
        <main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <Header assignment={assignment as Assignment} />

          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            attachmentsCount={assignment.attachmentUrl ? 1 : 0}
            questionsCount={assignment.questions?.length || 0}
            isGraded={assignment.status === 'GRADED' || assignment.status === 'graded' || assignment.submissions?.[0]?.status === 'GRADED' || assignment.submissions?.[0]?.status === 'graded'}
          />

          <div className="mt-8 mb-24">
            {activeTab === 'instructions' && (
              <div className="space-y-6">
                <InstructionsPanel instructions={assignment.instructions} />

                {assignment.videoUrl && (
                  <div className="bg-white dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Video Reference</h4>
                    <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                      <iframe
                        src={getEmbedUrl(assignment.videoUrl)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        loading="lazy"
                      ></iframe>
                    </div>
                  </div>
                )}

                {assignment.referenceUrl && (
                  <div className="bg-white dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">External Reference</h4>
                    <a
                      href={assignment.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Reference Link
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quiz' && (() => {
              const isGraded = assignment.status === 'GRADED' || assignment.status === 'graded' || assignment.submissions?.[0]?.status === 'GRADED' || assignment.submissions?.[0]?.status === 'graded';
              const isLocked = assignment.status === 'SUBMITTED' || assignment.status === 'submitted' || assignment.submissions?.[0]?.status === 'SUBMITTED' || assignment.submissions?.[0]?.status === 'submitted' || isGraded;
              
              return (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Assignment Quiz</h4>
                    {isGraded && <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full">Graded</span>}
                    {isLocked && !isGraded && <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded-full">Locked for Review</span>}
                  </div>
                  {!isLocked && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      Please answer the questions below. Your answers will be submitted when you click the "Submit Assignment" button in the footer.
                    </p>
                  )}

                  <div className="space-y-8 mt-6">
                    {Array.isArray(assignment.questions) && assignment.questions.map((q: any, idx: number) => (
                      <div key={q.id} className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h5 className="font-semibold text-slate-900 dark:text-slate-100 flex gap-2">
                            <span>{idx + 1}.</span>
                            <span className="whitespace-pre-wrap">{q.question}</span>
                          </h5>
                          <span className="shrink-0 text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
                            {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                          </span>
                        </div>

                        {/* MULTIPLE_CHOICE */}
                        {q.type === 'MULTIPLE_CHOICE' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['optionA', 'optionB', 'optionC', 'optionD'].map((optKey) => {
                              const optionVal = q[optKey];
                              if (!optionVal) return null;
                              const optionLetter = optKey.replace('option', ''); // A, B, C, D
                              const isSelected = quizAnswers[q.id] === optionLetter;
                              const isCorrectAnswer = isGraded && q.correctAnswer === optionLetter;
                              
                              let labelClass = 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300';
                              
                              if (isGraded) {
                                if (isCorrectAnswer) {
                                  labelClass = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium shadow-sm';
                                } else if (isSelected && !isCorrectAnswer) {
                                  labelClass = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium opacity-70';
                                } else {
                                  labelClass = 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 opacity-50';
                                }
                              } else if (isSelected) {
                                labelClass = 'border-primary bg-primary/5 dark:border-pink-500 dark:bg-pink-500/5 text-primary dark:text-pink-400 font-medium';
                              }

                              return (
                                <label
                                  key={optKey}
                                  className={`flex items-center gap-3 p-3.5 rounded-lg border ${!isLocked ? 'cursor-pointer' : 'cursor-default'} transition-colors ${labelClass}`}
                                >
                                  <input
                                    type="radio"
                                    name={`question_${q.id}`}
                                    checked={isSelected}
                                    disabled={isLocked}
                                    onChange={() => handleAnswerChange(q.id, optionLetter)}
                                    className="h-4.5 w-4.5 border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-pink-600 dark:focus:ring-pink-500 disabled:opacity-50"
                                  />
                                  <span className="flex-1">{optionVal}</span>
                                  {isGraded && isCorrectAnswer && <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">check_circle</span>}
                                  {isGraded && isSelected && !isCorrectAnswer && <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">cancel</span>}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* TRUE_FALSE */}
                        {q.type === 'TRUE_FALSE' && (
                          <div className="flex gap-4">
                            {['True', 'False'].map((val) => {
                              const isSelected = quizAnswers[q.id] === val;
                              const isCorrectAnswer = isGraded && q.correctAnswer === val;
                              
                              let labelClass = 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300';
                              
                              if (isGraded) {
                                if (isCorrectAnswer) {
                                  labelClass = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium shadow-sm';
                                } else if (isSelected && !isCorrectAnswer) {
                                  labelClass = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium opacity-70';
                                } else {
                                  labelClass = 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 opacity-50';
                                }
                              } else if (isSelected) {
                                labelClass = 'border-primary bg-primary/5 dark:border-pink-500 dark:bg-pink-500/5 text-primary dark:text-pink-400 font-medium';
                              }

                              return (
                                <label
                                  key={val}
                                  className={`flex items-center gap-3 px-6 py-3 rounded-lg border ${!isLocked ? 'cursor-pointer' : 'cursor-default'} transition-colors min-w-[120px] justify-center ${labelClass}`}
                                >
                                  <input
                                    type="radio"
                                    name={`question_${q.id}`}
                                    checked={isSelected}
                                    disabled={isLocked}
                                    onChange={() => handleAnswerChange(q.id, val)}
                                    className="h-4.5 w-4.5 border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-pink-600 dark:focus:ring-pink-500 disabled:opacity-50"
                                  />
                                  <span>{val}</span>
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
                              className="w-full rounded-lg border border-slate-255 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-pink-500/20 disabled:opacity-70 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                            />
                            {isGraded && q.correctAnswer && (
                              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-sm">
                                <p className="font-semibold text-green-800 dark:text-green-300 mb-1">Correct Answer:</p>
                                <p className="text-green-700 dark:text-green-400">{q.correctAnswer}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* FILE_UPLOAD */}
                        {q.type === 'FILE_UPLOAD' && (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                              For file upload questions, please upload your file using the main "File Upload" section in the submission modal. You can add notes or references below if needed.
                            </p>
                            <input
                              type="text"
                              value={quizAnswers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Type reference notes, file name or comment..."
                              disabled={isLocked}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-pink-500/20 disabled:opacity-70 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              );
            })()}

            {activeTab === 'attachments' && (
              <div className="bg-white dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Attachments</h4>
                {assignment.attachmentUrl ? (
                  <div className="flex flex-col gap-4">
                    {/* Render preview based on file type */}
                    {(() => {
                      const fileType = getFileType(assignment.attachmentUrl);
                      if (fileType === 'image') {
                        return (
                          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2 max-w-4xl w-full">
                            <img src={assignment.attachmentUrl} alt="Attachment Preview" className="max-h-[600px] w-auto mx-auto object-contain rounded" />
                          </div>
                        );
                      }
                      if (fileType === 'pdf') {
                        return (
                          <div className="w-full max-w-4xl min-h-[650px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <iframe src={assignment.attachmentUrl} className="w-full min-h-[650px]" title="PDF Preview" />
                          </div>
                        );
                      }
                      if (fileType === 'video') {
                        return (
                          <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <video src={assignment.attachmentUrl} controls className="w-full h-full" />
                          </div>
                        );
                      }
                      if (fileType === 'audio') {
                        return (
                          <div className="w-full max-w-2xl p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <audio src={assignment.attachmentUrl} controls className="w-full" />
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 max-w-4xl w-full">
                          <span className="material-symbols-outlined text-4xl text-slate-400">description</span>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">Attachment File</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Preview is not available for this file type. Please download or open it to view.</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <a
                        href={assignment.attachmentUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary dark:bg-pink-600 hover:bg-primary/95 dark:hover:bg-pink-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        Download Attachment
                      </a>
                      <a
                        href={assignment.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-base">open_in_new</span>
                        Open in New Tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">No attachments provided.</p>
                )}
              </div>
            )}

            {activeTab === 'rubric' && (
              <div className="bg-white dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 italic">No rubric provided.</p>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="bg-white dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 italic">No additional materials provided.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Persistent Action Footer */}
      {assignment.status !== 'GRADED' && (
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