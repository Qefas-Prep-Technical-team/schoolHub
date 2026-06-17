'use client'

import { useParams, useRouter } from 'next/navigation'
import { useParentStore } from '@/lib/api/hooks/useParentStore'
import { useParentAssignmentDetails } from '@/lib/api/hooks/useAssignments'
import { ArrowLeft, BookOpen, Calendar, CheckCircle, FileText, MessageSquare, Award, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function AssignmentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { selectedChildId } = useParentStore()

    const assignmentId = params.id as string

    // Fetch the full details including questions and answers
    const { data: detailedAssignment, isLoading: isDetailsLoading, isFetching: isDetailsFetching } = useParentAssignmentDetails(selectedChildId, assignmentId)

    const isLoading = isDetailsLoading || isDetailsFetching || !selectedChildId

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-8 justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading assignment details...</p>
            </div>
        )
    }

    if (!detailedAssignment) {
        return (
            <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-8">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 w-fit font-medium">
                    <ArrowLeft className="size-4" /> Back to Assignments
                </button>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Assignment Not Found</h2>
                    <p className="text-slate-500 mb-6">We couldn't find the details for this assignment. It may have been removed.</p>
                    <Link href="/dashboard/parent/assignments">
                        <span className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">Return to Overview</span>
                    </Link>
                </div>
            </div>
        )
    }

    const submission = detailedAssignment.submissions?.[0];
    const answers = submission?.answers || [];
    const status = submission?.status?.toLowerCase() || detailedAssignment.status?.toLowerCase() || 'pending';
    const isGraded = status === 'graded';
    
    let scoreNum = 0;
    let percentage = 0;
    if (submission?.score !== null && submission?.score !== undefined) {
        scoreNum = submission.score;
        percentage = detailedAssignment.totalMarks > 0 ? Math.round((scoreNum / detailedAssignment.totalMarks) * 100) : 0;
    }

    return (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 h-full scroll-smooth">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
                {/* Header Navigation */}
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors w-fit font-medium">
                    <ArrowLeft className="size-4" /> Back to Assignments
                </button>

                {/* Main Hero Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                    
                    <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg">
                                    {detailedAssignment.subject?.name || 'Subject'}
                                </span>
                                {isGraded && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg border border-green-200 dark:border-green-800/50">
                                        <CheckCircle className="size-3.5" /> Graded
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                                {detailedAssignment.title}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    <span>Due: {detailedAssignment.dueDate ? new Date(detailedAssignment.dueDate).toLocaleDateString() : 'No due date'}</span>
                                </div>
                                {submission?.submittedAt && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="size-4 text-green-500" />
                                        <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Score Circle */}
                        {isGraded && (
                            <div className="shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center min-w-[160px]">
                                <Award className="size-8 text-yellow-500 mb-2" />
                                <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    {percentage}%
                                </div>
                                <div className="text-sm font-medium text-slate-500 mt-1">
                                    {scoreNum}/{detailedAssignment.totalMarks} Points
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & Instructions */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Teacher Feedback (Only show if graded) */}
                        {isGraded && submission?.feedback && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <MessageSquare className="size-32 text-indigo-500" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-4">
                                        <MessageSquare className="size-5" />
                                        Teacher's Feedback
                                    </h3>
                                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-slate-700/50 shadow-sm">
                                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg italic">
                                            "{submission.feedback}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Question and Answers Section */}
                        {detailedAssignment?.questions?.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                    <HelpCircle className="size-5 text-primary" />
                                    Student's Answers
                                </h3>
                                <div className="space-y-6">
                                    {detailedAssignment.questions.map((question: any, idx: number) => {
                                        const studentAnswer = answers.find((ans: any) => ans.questionId === question.id);
                                        const isCorrect = studentAnswer?.isCorrect;
                                        
                                        return (
                                            <div key={question.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                <div className="flex gap-4">
                                                    <div className="shrink-0 size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-slate-800 dark:text-slate-200 mb-3" dangerouslySetInnerHTML={{ __html: question.question }} />
                                                        
                                                        {/* What the student answered */}
                                                        <div className="mb-2">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Your Child's Answer</span>
                                                            {studentAnswer ? (
                                                                <div className={`px-4 py-3 rounded-xl border ${isCorrect === true ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : isCorrect === false ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                                                                    {studentAnswer.answer || 'No text provided'}
                                                                </div>
                                                            ) : (
                                                                <div className="px-4 py-3 rounded-xl border bg-slate-100 border-slate-200 text-slate-500 italic dark:bg-slate-800/50 dark:border-slate-700">
                                                                    Skipped / No Answer
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Marks */}
                                                        <div className="mt-3 flex items-center gap-2 text-sm font-medium">
                                                            {isCorrect === true && <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="size-4" /> Correct</span>}
                                                            {isCorrect === false && <span className="text-red-600 dark:text-red-400">Incorrect</span>}
                                                            <span className="text-slate-400">({studentAnswer?.score || 0} / {question.marks} marks)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Assignment Details */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                <FileText className="size-5 text-primary" />
                                Instructions & Details
                            </h3>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                {detailedAssignment.instructions ? (
                                    <div dangerouslySetInnerHTML={{ __html: detailedAssignment.instructions }} />
                                ) : (
                                    <p className="text-slate-500">No specific instructions were provided for this assignment.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Context & Resources */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <BookOpen className="size-4 text-slate-500" />
                                Study Context
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Topic/Unit</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">Term Assessment</p>
                                </li>
                                <li>
                                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Max Marks Available</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{detailedAssignment.totalMarks} Points</p>
                                </li>
                                <li>
                                    <p className="text-xs uppercase font-bold text-slate-400 mb-1">Questions</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{detailedAssignment.questions?.length || 0} Questions to answer</p>
                                </li>
                            </ul>
                        </div>

                        {/* Parent Tips Card */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
                            <h3 className="font-bold mb-2">How to help your child?</h3>
                            <p className="text-blue-100 text-sm leading-relaxed mb-4">
                                Review the teacher's feedback together. Focus on the positive remarks first, then discuss how they can improve on the constructive criticism.
                            </p>
                            <Link href="/dashboard/parent/messages">
                                <button className="w-full bg-white/20 hover:bg-white/30 transition-colors text-white font-bold py-2 rounded-xl text-sm backdrop-blur-sm">
                                    Message Teacher
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
