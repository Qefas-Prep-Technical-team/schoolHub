import React from 'react';
import Image from 'next/image';
import { X, Check, XCircle } from 'lucide-react';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';

interface ViewGradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    submission: any | null;
    assignment: any;
}

export default function ViewGradeModal({ isOpen, onClose, submission, assignment }: ViewGradeModalProps) {
    if (!isOpen || !submission) return null;

    const getQuestion = (questionId: string) => {
        return assignment?.questions?.find((q: any) => q.id === questionId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 flex-shrink-0">
                            {submission.student?.profileImage || submission.student?.avatarUrl ? (
                                <Image
                                    src={submission.student.profileImage || submission.student.avatarUrl}
                                    alt="Avatar"
                                    fill
                                    className="rounded-full object-cover bg-gray-100"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg uppercase">
                                    {(submission.student?.name || 'S').charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {submission.student?.name || 'Student'}
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span>Score: <span className="font-bold text-gray-900 dark:text-white">{submission.score ?? 0} / {assignment.totalMarks || 100}</span></span>
                                <span>•</span>
                                <span>Submitted: {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950/50">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Submission Details</h3>
                    
                    {!submission.answers || submission.answers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                            No answers found for this submission.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {submission.answers.map((answer: any, idx: number) => {
                                const q = getQuestion(answer.questionId);
                                if (!q) return null;

                                return (
                                    <div key={answer.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="pt-1.5 font-medium text-gray-800 dark:text-gray-200 w-full">
                                                    <LaTeXRenderer content={q.content || q.question} />
                                                    
                                                    {/* Render options if they exist */}
                                                    {(q.optionA || q.optionB || q.optionC || q.optionD) && (
                                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {q.optionA && (
                                                                <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                                                    <span className="font-bold text-gray-400 mt-0.5">A.</span>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                        <LaTeXRenderer content={q.optionA} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {q.optionB && (
                                                                <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                                                    <span className="font-bold text-gray-400 mt-0.5">B.</span>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                        <LaTeXRenderer content={q.optionB} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {q.optionC && (
                                                                <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                                                    <span className="font-bold text-gray-400 mt-0.5">C.</span>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                        <LaTeXRenderer content={q.optionC} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {q.optionD && (
                                                                <div className="flex items-start gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                                                    <span className="font-bold text-gray-400 mt-0.5">D.</span>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                        <LaTeXRenderer content={q.optionD} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Fallback for options array */}
                                                    {q.options && Array.isArray(q.options) && (
                                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {q.options.map((opt: string, i: number) => (
                                                                <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                                                    <span className="font-bold text-gray-400 mt-0.5">{String.fromCharCode(65 + i)}.</span>
                                                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                        <LaTeXRenderer content={opt} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4 shrink-0">
                                                <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                                    {answer.score} / {q.points || q.marks} pts
                                                </span>
                                                {answer.isCorrect ? (
                                                    <Check className="text-emerald-500" size={20} />
                                                ) : (
                                                    <XCircle className="text-red-500" size={20} />
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-11 mt-4">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Student's Answer:</div>
                                            <div className={`p-4 rounded-lg border text-sm ${answer.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-900 dark:bg-emerald-900/10 dark:border-emerald-800/30 dark:text-emerald-300' : 'bg-red-50 border-red-100 text-red-900 dark:bg-red-900/10 dark:border-red-800/30 dark:text-red-300'}`}>
                                                <LaTeXRenderer content={answer.answer || 'No answer provided'} />
                                            </div>

                                            {!answer.isCorrect && q.correctAnswer && (
                                                <div className="mt-4">
                                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Correct Answer:</div>
                                                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm">
                                                        <LaTeXRenderer content={q.correctAnswer} />
                                                    </div>
                                                </div>
                                            )}

                                            {answer.teacherComment && (
                                                <div className="mt-4 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Teacher Feedback</div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{answer.teacherComment}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
