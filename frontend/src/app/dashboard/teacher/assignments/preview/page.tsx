/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Assignment } from '../components/types';
import { StudentSubmission, SubmissionsOverviewT } from './components/types';
import Breadcrumbs from './components/Breadcrumbs';
import AssignmentHeader from './components/AssignmentHeader';
import InstructionsCard from './components/InstructionsCard';
import SubmissionsOverview from './components/SubmissionsOverview';
import StudentSubmissionsTable from './components/StudentSubmissionsTable';


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
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [overview, setOverview] = useState<SubmissionsOverviewT>(mockSubmissionsOverview);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch assignment data
        const fetchAssignment = async () => {
            setIsLoading(true);
            try {
                // In a real app, you would fetch from an API
                // const response = await fetch(`/api/assignments/${params.id}`);
                // const data = await response.json();

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));

                setAssignment(mockAssignment);
                setSubmissions(mockSubmissions);
                setOverview(mockSubmissionsOverview);
            } catch (error) {
                console.error('Error fetching assignment:', error);
                // Handle error
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssignment();
    }, [params.id]);

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
        router.push(`/assignments/${params.id}/submissions/${submissionId}`);
    };

    const handleGradeSubmissions = () => {
        router.push(`/assignments/${params.id}/grade`);
    };

    const handleExportSubmissions = async () => {
        try {
            // Export logic here
            console.log('Exporting submissions...');
            // In a real app, you would generate and download a file
        } catch (error) {
            console.error('Error exporting submissions:', error);
        }
    };

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Assignments', href: '/assignments' },
        { label: 'Biology', href: '/assignments?subject=biology' },
        { label: assignment?.title || 'Loading...' }
    ];

    if (isLoading) {
        return (
            <main>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </main>
        );
    }

    if (!assignment) {
        return (
            <main>
                <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                        error
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Assignment Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The assignment you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                    </p>
                    <button
                        onClick={() => router.push('/assignments')}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Back to Assignments
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs */}
                <Breadcrumbs items={breadcrumbItems} />

                {/* Assignment Header */}
                <AssignmentHeader
                    assignment={assignment as any}
                    onEdit={handleEdit}
                    onGradeAll={handleGradeAll}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Instructions */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <InstructionsCard assignment={assignment as any} />
                    </div>

                    {/* Right Column: Submissions Overview */}
                    <div className="lg:col-span-1">
                        <SubmissionsOverview
                            overview={overview}
                            onGradeSubmissions={handleGradeSubmissions}
                            onExportSubmissions={handleExportSubmissions}
                        />
                    </div>
                </div>

                {/* Student Submissions Table */}
                <StudentSubmissionsTable
                    submissions={submissions}
                    onGradeStudent={handleGradeStudent}
                    onViewGrade={handleViewGrade}
                />
            </div>
        </main>
    );
}