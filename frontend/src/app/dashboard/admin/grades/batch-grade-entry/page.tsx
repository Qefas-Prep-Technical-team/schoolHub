/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';

import type { StudentGrade, SaveStatus as SaveStatusType, BatchGradeEntry } from './components/types';
import Header from '../../Exams&Quizzes/components/Header';
const HeaderAny = Header as any;
import BatchGradeHeader from './components/BatchGradeHeader';
import FilterChips from './components/FilterChips';
import GradeEntryTable from './components/GradeEntryTable';
import SaveStatus from './components/SaveStatus';
import Button from '../components/ui/Button';

const mockBatchData: BatchGradeEntry = {
    className: '10A',
    subject: 'Mathematics',
    assessment: 'Mid-Term Exam',
    maxScore: 100,
    students: [
        {
            id: '1',
            studentName: 'Olivia Rodriguez',
            studentId: 'SH-1023',
            score: null,
            remarks: '',
            hasError: false
        },
        {
            id: '2',
            studentName: 'Benjamin Carter',
            studentId: 'SH-1024',
            score: null,
            remarks: '',
            hasError: false
        },
        {
            id: '3',
            studentName: 'Sophia Hernandez',
            studentId: 'SH-1025',
            score: null,
            remarks: '',
            hasError: true
        },
        {
            id: '4',
            studentName: 'Liam Martinez',
            studentId: 'SH-1026',
            score: null,
            remarks: '',
            hasError: false
        },
        {
            id: '5',
            studentName: 'Ava Gonzalez',
            studentId: 'SH-1027',
            score: null,
            remarks: '',
            hasError: false
        }
    ]
};

const filterOptions = [
    {
        label: 'Class',
        value: '10A',
        options: ['10A', '10B', '10C', '11A', '11B', '12A', '12B']
    },
    {
        label: 'Subject',
        value: 'Mathematics',
        options: ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art', 'Music']
    },
    {
        label: 'Assessment',
        value: 'Mid-Term Exam',
        options: ['Mid-Term Exam', 'Final Exam', 'Quiz 1', 'Quiz 2', 'Assignment 1', 'Project']
    }
];

export default function BatchGradeEntry() {
    const [batchData, setBatchData] = useState<BatchGradeEntry>(mockBatchData);
    const [saveStatus, setSaveStatus] = useState<SaveStatusType>({
        isSaved: true,
        lastSaved: new Date()
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleScoreChange = (studentId: string, score: number | null) => {
        setBatchData(prev => ({
            ...prev,
            students: prev.students.map(student =>
                student.id === studentId
                    ? {
                        ...student,
                        score,
                        hasError: score !== null && (score < 0 || score > prev.maxScore)
                    }
                    : student
            )
        }));
        setSaveStatus({ isSaved: false });
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setBatchData(prev => ({
            ...prev,
            students: prev.students.map(student =>
                student.id === studentId ? { ...student, remarks } : student
            )
        }));
        setSaveStatus({ isSaved: false });
    };

    const handleFilterChange = (filter: any, value: string) => {
        console.log(`Filter changed: ${filter.label} = ${value}`);
        // In a real app, this would fetch new data based on the filter
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveStatus({ isSaved: false, isSaving: true });

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setSaveStatus({
                isSaved: true,
                lastSaved: new Date()
            });

            console.log('Grades saved:', batchData);
        } catch (error) {
            setSaveStatus({
                isSaved: false,
                error: 'Failed to save grades'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        console.log('Exporting grades...');
        // Implement export functionality
    };

    const handleHelp = () => {
        console.log('Opening help...');
        // Implement help functionality
    };

    const handleNotifications = () => {
        console.log('Opening notifications...');
        // Implement notifications functionality
    };

    const hasErrors = batchData.students.some(student => student.hasError);
    const allScoresFilled = batchData.students.every(student => student.score !== null);

    return (
        <main className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 ">
            <HeaderAny
                onExport={handleExport}
                onHelp={handleHelp}
                onNotifications={handleNotifications}
            />


            <main className="px-4 sm:px-6 lg:px-10 flex-1 py-8">
                <div className="layout-content-container flex flex-col max-w-5xl mx-auto flex-1 gap-6">
                    {/* Page Header */}
                    <BatchGradeHeader
                        title="Batch Grade Entry – Mid-Term Exam"
                        description="Enter grades for students in Class 10A for Mathematics"
                    />

                    {/* Filter Chips */}
                    <FilterChips
                        filters={filterOptions}
                        onFilterChange={handleFilterChange}
                    />

                    {/* Grade Entry Table */}
                    <GradeEntryTable
                        students={batchData.students}
                        maxScore={batchData.maxScore}
                        onScoreChange={handleScoreChange}
                        onRemarksChange={handleRemarksChange}
                    />

                    {/* Save Status and Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <SaveStatus
                            status={
                                (saveStatus as any).isSaving ? 'saving' :
                                    (saveStatus as any).error ? 'error' : 'saved'
                            }
                            lastSaved={(saveStatus as any).lastSaved}
                            errorMessage={(saveStatus as any).error}
                        />

                        <Button
                            onClick={handleSaveAll}
                            disabled={isSaving || hasErrors || !allScoresFilled}
                            className="w-full sm:w-auto"
                        >
                            {isSaving ? 'Saving...' : 'Save All Grades'}
                        </Button>
                    </div>

                    {/* Validation Messages */}
                    {hasErrors && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-700 dark:text-red-300 text-sm">
                                Please fix the highlighted errors before saving.
                            </p>
                        </div>
                    )}

                    {!allScoresFilled && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                Please enter scores for all students before saving.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </main>
    );
}