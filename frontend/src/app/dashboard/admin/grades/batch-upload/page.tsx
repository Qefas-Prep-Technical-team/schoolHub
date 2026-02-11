'use client';

import { useState } from 'react';
import { FileUploadState, GradeRecord } from './components/types';
import UploadInstructions from './components/UploadInstructions';
import TemplateDownload from './components/TemplateDownload';
import UploadZone from './components/UploadZone';
import ValidationErrors from './components/ValidationErrors';
import FilePreview from './components/FilePreview';
import Button from '../components/ui/Button';

const mockRecords: GradeRecord[] = [
    {
        studentId: 'S001',
        studentName: 'Alice Johnson',
        subjectCode: 'MATH-101',
        grade: 85,
        comments: 'Good effort.'
    },
    {
        studentId: 'S999',
        studentName: 'Bob Williams',
        subjectCode: 'HIST-202',
        grade: 72,
        comments: '',
        errors: ['Student ID not found']
    },
    {
        studentId: 'S003',
        studentName: 'Charlie Brown',
        subjectCode: 'SCI-105',
        grade: 91,
        comments: 'Excellent work!'
    },
    {
        studentId: 'S004',
        studentName: 'Diana Prince',
        subjectCode: 'ENG-301',
        grade: 105,
        comments: '',
        errors: ['Grade must be between 0-100']
    }
];

const initialUploadState: FileUploadState = {
    file: null,
    isDragging: false,
    isProcessing: false,
    validation: {
        isValid: false,
        totalRows: 150,
        errorCount: 3,
        warnings: 0,
        errors: ['Student ID not found', 'Grade must be between 0-100']
    },
    records: []
};

export default function BatchUploadGrades() {
    const [uploadState, setUploadState] = useState<FileUploadState>(initialUploadState);
    const [showPreview, setShowPreview] = useState(true);

    const handleFileSelect = (file: File) => {
        console.log('File selected:', file.name);

        // Simulate file processing and validation
        setUploadState(prev => ({
            ...prev,
            file,
            records: mockRecords,
            validation: {
                ...prev.validation,
                isValid: false
            }
        }));
        setShowPreview(true);
    };

    const handleDownloadTemplate = () => {
        console.log('Downloading template...');
        // Implement template download logic
        // This would typically generate and download a CSV/Excel file
    };

    const handleCancel = () => {
        setUploadState(initialUploadState);
        setShowPreview(false);
    };

    const handleProcessGrades = () => {
        if (uploadState.validation.errorCount > 0) {
            alert('Please fix all validation errors before processing.');
            return;
        }

        setUploadState(prev => ({ ...prev, isProcessing: true }));

        // Simulate API call
        setTimeout(() => {
            console.log('Grades processed successfully');
            setUploadState(initialUploadState);
            setShowPreview(false);
            alert('Grades uploaded successfully!');
        }, 2000);
    };

    const handleRowHover = (record: GradeRecord) => {
        console.log('Hovered record:', record);
    };

    return (
        <div className="relative flex min-h-screen w-full">


            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">
                    {/* Page Header */}
                    <div className="flex flex-wrap justify-between gap-4 items-start">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                                Batch Upload Grades
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                                Effortlessly upload multiple student grades using a CSV or Excel file.
                            </p>
                        </div>
                    </div>

                    {/* Main Card Container */}
                    <div className="bg-white dark:bg-slate-900/70 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-8">
                        {/* Instructions and Template Download */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1">
                                <UploadInstructions />
                            </div>
                            <TemplateDownload onDownload={handleDownloadTemplate} />
                        </div>

                        {/* Upload Zone */}
                        <UploadZone
                            onFileSelect={handleFileSelect}
                            isProcessing={uploadState.isProcessing}
                        />

                        {/* File Preview & Validation */}
                        {showPreview && uploadState.records.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <ValidationErrors
                                    errorCount={uploadState.validation.errorCount}
                                    totalRows={uploadState.validation.totalRows}
                                />

                                <FilePreview
                                    records={uploadState.records}
                                    onRowHover={handleRowHover}
                                />

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button variant="secondary" onClick={handleCancel}>
                                        <span className="truncate">Cancel</span>
                                    </Button>
                                    <Button
                                        onClick={handleProcessGrades}
                                        disabled={uploadState.validation.errorCount > 0 || uploadState.isProcessing}
                                    >
                                        <span className="truncate">
                                            {uploadState.isProcessing ? 'Processing...' : 'Process Grades'}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}