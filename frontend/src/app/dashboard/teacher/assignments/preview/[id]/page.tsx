/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Assignment } from '../../components/types';
import { StudentSubmission, SubmissionsOverviewT } from '../components/types';
import Breadcrumbs from '../components/Breadcrumbs';
import AssignmentHeader from '../components/AssignmentHeader';
import InstructionsCard from '../components/InstructionsCard';
import SubmissionsOverview from '../components/SubmissionsOverview';
import StudentSubmissionsTable from '../components/StudentSubmissionsTable';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { Check } from "lucide-react";
import Pagination from '../../components/Pagination';
import ViewGradeModal from '../components/ViewGradeModal';


// Mock data
const mockAssignment: Assignment = {
    id: '1',
    title: 'Chapter 5: The Cell Cycle Essay',
    subject: 'Biology',
    classes: ['Grade 10A', 'Grade 10B'],
    dueDate: 'Oct 26, 2023',
    status: 'published',
    instructions: `
    <p>Write a 500-750 word essay on the importance of the cell cycle. Your essay should cover the following points:</p>
    <ul>
      <li>The main phases of the cell cycle (Interphase, Mitosis, and Cytokinesis).</li>
      <li>The significance of each phase.</li>
      <li>The role of checkpoints in regulating the cell cycle.</li>
      <li>What happens when cell cycle regulation fails.</li>
    </ul>
    <p>Please refer to Chapter 5 of your textbook and the attached rubric for grading criteria. Ensure your submission is in PDF or DOCX format.</p>
  `,
    attachments: [
        {
            id: '1',
            name: 'worksheet.pdf',
            size: '1.2 MB',
            type: 'pdf',
            url: '/files/worksheet.pdf',
        },
        {
            id: '2',
            name: 'rubric.docx',
            size: '45 KB',
            type: 'docx',
            url: '/files/rubric.docx',
        },
    ],
    teacher: {
        id: '1',
        name: 'Mr. Harrison',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Harrison'
    }
};

const mockSubmissions: StudentSubmission[] = [
    {
        id: '1',
        student: {
            id: '101',
            name: 'Olivia Rhye',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Olivia'
        },
        submissionTime: '2023-10-25T22:15:00',
        status: 'on-time',
        score: 92,
        maxScore: 100,
        graded: true
    },
    {
        id: '2',
        student: {
            id: '102',
            name: 'Phoenix Baker',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Phoenix'
        },
        submissionTime: '2023-10-26T23:59:00',
        status: 'on-time',
        score: null,
        maxScore: 100,
        graded: false
    },
    {
        id: '3',
        student: {
            id: '103',
            name: 'Lana Steiner',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Lana'
        },
        submissionTime: '2023-10-27T08:30:00',
        status: 'late',
        score: 85,
        maxScore: 100,
        graded: true
    },
    {
        id: '4',
        student: {
            id: '104',
            name: 'Ken T.',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Ken'
        },
        submissionTime: null,
        status: 'missing',
        score: null,
        maxScore: 100,
        graded: false
    }
];



const mockSubmissionsOverview: SubmissionsOverviewT = {
    totalStudents: 30,
    submitted: 25,
    graded: 15,
    missing: 5,
    averageScore: 88.5
};

export default function AssignmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [questionsPage, setQuestionsPage] = useState(1);
    const questionsPerPage = 10;
    const [viewGradeSubmission, setViewGradeSubmission] = useState<any>(null);
    const { selectedSchoolId } = useDashboardStore();
    const { user } = useAuthStore();
    const assignmentId = params.id as string;
    const effectiveSchoolId = selectedSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || "";

    const { data: assignmentData, isLoading, isPending, isError, error } = useQuery({
        queryKey: ["assignment-detail", assignmentId],
        queryFn: async () => {
            const response = await apiClient.get(`/assignment/teacher/${assignmentId}`, {
                headers: { 'x-school-id': effectiveSchoolId }
            });
            return response.data.data;
        },
        enabled: !!assignmentId && !!effectiveSchoolId,
    });

    const assignment = assignmentData;
    const submissions = assignmentData?.submissions || [];
    
    const isAuthorized = assignment && user ? (
        assignment.teacherId === user.id ||
        assignment.teacher?.id === user.id ||
        assignment.teacher?.name === user.name ||
        (assignment.subjectId && (user as any)?.subjects?.some((s: any) => s.id === assignment.subjectId)) ||
        (assignment.subject?.name && (user as any)?.subjects?.some((s: any) => s.name === assignment.subject.name))
    ) : false;
    
    const overview: SubmissionsOverviewT = {
        totalStudents: assignmentData?.class?.studentCount || Math.max(submissions.length, 1),
        submitted: submissions.filter((s: any) => s.status === 'SUBMITTED' || s.status === 'GRADED').length,
        graded: submissions.filter((s: any) => s.status === 'GRADED').length,
        missing: (assignmentData?.class?.studentCount || submissions.length) - submissions.filter((s: any) => s.status === 'SUBMITTED' || s.status === 'GRADED').length,
        averageScore: submissions.length > 0 ? submissions.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / submissions.length : 0
    };

    // Event handlers
    const handleEdit = () => {
        router.push(`/assignments/${params.id}/edit`);
    };

    const handleGradeAll = () => {
        router.push(`/assignments/${params.id}/grade`);
    };

    const handleGradeStudent = (submissionId: string) => {
        router.push(`/assignments/${params.id}/grade/${submissionId}`);
    };

    const handleViewGrade = (submissionId: string) => {
        const submission = submissions.find((s: any) => s.id === submissionId);
        if (submission) {
            setViewGradeSubmission(submission);
        }
    };

    const handleGradeSubmissions = () => {
        router.push(`/assignments/${params.id}/grade`);
    };

    const handleExportSubmissions = async () => {
        try {
            // Export logic here
            // console.log('Exporting submissions...');
            // In a real app, you would generate and download a file
        } catch (error) {
            console.error('Error exporting submissions:', error);
        }
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Assignments', href: '/dashboard/teacher/assignments' }
    ];

    if (assignment?.department?.name) {
        breadcrumbItems.push({ label: assignment.department.name, href: '/dashboard/teacher/assignments' });
    }

    if (assignment?.class?.name) {
        breadcrumbItems.push({ label: assignment.class.name, href: '/dashboard/teacher/assignments' });
    }

    if (assignment?.subject?.name || typeof assignment?.subject === 'string') {
        const subjectName = typeof assignment.subject === 'string' ? assignment.subject : assignment.subject.name;
        breadcrumbItems.push({ label: subjectName, href: '/dashboard/teacher/assignments' });
    }

    breadcrumbItems.push({ label: assignment?.title || 'Loading...' });

    if (isLoading || isPending || (!assignmentData && !isError)) {
        return (
            <main className="w-full flex justify-center py-6 animate-pulse">
                <div className="w-[90%] mx-auto">
                    {/* Breadcrumbs Skeleton */}
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8"></div>
                    
                    {/* Header Skeleton */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                        <div className="flex flex-col gap-3 w-1/2">
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-64"></div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-gray-200 dark:bg-gray-800 rounded-xl h-64"></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!assignment || isError) {
        return (
            <main>
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                        error
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {isError ? 'Error Loading Assignment' : 'Assignment Not Found'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {error ? (error as any)?.response?.data?.message || (error as Error).message : "The assignment you're looking for doesn't exist or you don't have access to it."}
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full flex justify-center py-6">
            <div className="w-[90%] mx-auto">
                {/* Breadcrumbs */}
                <Breadcrumbs items={breadcrumbItems} />

                {/* Assignment Header */}
                <AssignmentHeader
                    assignment={assignment as any}
                    onEdit={isAuthorized ? handleEdit : undefined}
                    onGradeAll={isAuthorized ? handleGradeAll : undefined}
                />

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="mb-6 bg-emerald-100/50 dark:bg-emerald-900/20 p-1 rounded-lg">
                        <TabsTrigger value="overview" className="px-6 py-2 rounded-md font-medium text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-emerald-800 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 data-[state=active]:shadow-sm transition-all text-emerald-600 dark:text-emerald-400">
                            Overview & Submissions
                        </TabsTrigger>
                        <TabsTrigger value="questions" className="px-6 py-2 rounded-md font-medium text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-emerald-800 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 data-[state=active]:shadow-sm transition-all text-emerald-600 dark:text-emerald-400">
                            Questions {assignment.questions?.length > 0 && `(${assignment.questions.length})`}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Instructions */}
                            <div className="lg:col-span-2 flex flex-col gap-8">
                                <InstructionsCard assignment={assignment as any} />
                            </div>

                            {/* Right Column: Submissions Overview */}
                            <div className="lg:col-span-1">
                                <SubmissionsOverview
                                    overview={overview}
                                    onGradeSubmissions={isAuthorized ? handleGradeSubmissions : undefined}
                                    onExportSubmissions={isAuthorized ? handleExportSubmissions : undefined}
                                />
                            </div>
                        </div>

                        {/* Student Submissions Table */}
                        <StudentSubmissionsTable
                            submissions={submissions}
                            onGradeStudent={isAuthorized ? handleGradeStudent : undefined}
                            onViewGrade={handleViewGrade} // Anyone can view grade? Maybe limit it too?
                        />
                    </TabsContent>

                    <TabsContent value="questions" className="outline-none">
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Assignment Questions</h2>
                            
                            {!assignment.questions || assignment.questions.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                    No questions have been added to this assignment yet.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {assignment.questions
                                        .slice((questionsPage - 1) * questionsPerPage, questionsPage * questionsPerPage)
                                        .map((q: any, idx: number) => {
                                        const globalIdx = (questionsPage - 1) * questionsPerPage + idx;
                                        return (
                                        <div key={q.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-xs">
                                                        Q{globalIdx + 1}
                                                    </span>
                                                    <span>{q.type.replace('_', ' ')}</span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow-sm">
                                                    {q.marks} {q.marks === 1 ? 'pt' : 'pts'}
                                                </span>
                                            </div>
                                            
                                            <div className="text-gray-900 dark:text-gray-100 font-semibold mb-4 leading-relaxed">
                                                <LaTeXRenderer content={q.question} />
                                            </div>

                                            {q.type === 'MULTIPLE_CHOICE' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                    {['A', 'B', 'C', 'D'].map(opt => (
                                                        <div key={opt} className={`group/opt flex items-center gap-3 text-sm p-3 rounded-xl border transition-all ${q.correctAnswer === opt ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-gray-50/50 border-gray-100 text-gray-600 dark:bg-gray-900/50 dark:border-gray-800'}`}>
                                                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${q.correctAnswer === opt ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                                                                {opt}
                                                            </span>
                                                            <div className="flex-1 line-clamp-1">
                                                                <LaTeXRenderer content={(q as any)[`option${opt}`]} className="text-sm" />
                                                            </div>
                                                            {q.correctAnswer === opt && <Check className="text-emerald-500 h-4 w-4" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )})}
                                    
                                    {assignment.questions.length > questionsPerPage && (
                                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                            <Pagination
                                                currentPage={questionsPage}
                                                totalPages={Math.ceil(assignment.questions.length / questionsPerPage)}
                                                totalItems={assignment.questions.length}
                                                itemsPerPage={questionsPerPage}
                                                onPageChange={setQuestionsPage}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <ViewGradeModal
                isOpen={!!viewGradeSubmission}
                onClose={() => setViewGradeSubmission(null)}
                submission={viewGradeSubmission}
                assignment={assignment}
            />
        </main>
    );
}
