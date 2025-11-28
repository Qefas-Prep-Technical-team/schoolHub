'use client';

import { useState, useRef } from 'react';
import { CloudUpload } from 'lucide-react';
import Button from './ui/Button';

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
    isProcessing?: boolean;
}

export default function UploadZone({ onFileSelect, isProcessing = false }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        // Check file type and size
        const validTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?)$/i)) {
            alert('Please upload a CSV or Excel file');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB
            alert('File size must be less than 50MB');
            return;
        }

        onFileSelect(file);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-14 transition-colors ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <CloudUpload size={48} className="text-primary" />
                <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    Drag & drop your CSV or Excel file here
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                    Maximum file size: 50MB
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
            />

            <Button
                variant="secondary"
                onClick={handleBrowseClick}
                disabled={isProcessing}
            >
                <span className="truncate">Or Browse Files</span>
            </Button>
        </div>
    );
}