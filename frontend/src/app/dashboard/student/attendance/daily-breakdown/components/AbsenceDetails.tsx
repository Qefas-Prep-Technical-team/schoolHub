"use client"
// src/components/Dashboard/AbsenceDetails.tsx
import React, { useState } from 'react';
import { AbsenceDetails } from './types';
import FileUpload from './FileUpload';
import Button from './ui/Button';

const AbsenceDetailsComponent: React.FC = () => {
    const [details, setDetails] = useState<AbsenceDetails>({
        reason: "Doctor's Appointment"
    });
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
    };

    const handleSubmit = () => {
        console.log('Submitting excuse note:', { details, file });
        // Add API call here
    };

    return (
        <div>
            <h2 className="text-gray-900 dark:text-white text-[22px] font-bold tracking-[-0.015em] pb-3">
                Absence Details
            </h2>
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm flex flex-col gap-6">
                <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        Reason for Absence
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {details.reason}
                    </p>
                </div>

                <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                        Upload Excuse Note
                    </h3>
                    <FileUpload
                        onFileSelect={handleFileSelect}
                        maxSize={10}
                        accept=".png,.jpg,.jpeg,.pdf"
                    />
                </div>

                <Button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto self-end"
                >
                    Submit Excuse Note
                </Button>
            </div>
        </div>
    );
};

export default AbsenceDetailsComponent;