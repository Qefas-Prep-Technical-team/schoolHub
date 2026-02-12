/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import { Attachment } from './types';

interface AttachmentsProps {
    attachments: any;
    onAttachmentsChange: (attachments: Attachment[]) => void;
}

export default function Attachments({
    attachments,
    onAttachmentsChange
}: AttachmentsProps) {
    const [isDragging, setIsDragging] = useState(false);

    const getFileIcon = (type: Attachment['type']) => {
        switch (type) {
            case 'pdf':
                return <span className="material-symbols-outlined text-red-500 mr-3">picture_as_pdf</span>;
            case 'docx':
                return <span className="material-symbols-outlined text-blue-500 mr-3">description</span>;
            case 'image':
                return <span className="material-symbols-outlined text-green-500 mr-3">image</span>;
            default:
                return <span className="material-symbols-outlined text-gray-500 mr-3">insert_drive_file</span>;
        }
    };

    const getFileType = (file: File): Attachment['type'] => {
        if (file.type.includes('pdf')) return 'pdf';
        if (file.type.includes('word') || file.type.includes('document')) return 'docx';
        if (file.type.includes('image')) return 'image';
        return 'other';
    };

    const handleFileUpload = useCallback((files: FileList) => {
        const newAttachments: Attachment[] = Array.from(files).map(file => ({
            id: Date.now().toString() + Math.random(),
            name: file.name,
            size: formatFileSize(file.size),
            type: getFileType(file),
            file
        }));

        onAttachmentsChange([...attachments, ...newAttachments]);
    }, [attachments, onAttachmentsChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files);
        }
    }, [handleFileUpload]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFileUpload(e.target.files);
        }
    };

    const removeAttachment = (id: string) => {
        onAttachmentsChange(attachments.filter((att: any) => att.id !== id));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#E4E4E7] dark:border-[#2D2D2F]">
            <h2 className="text-[#0e121b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-6 pt-5 pb-3 border-b border-[#E4E4E7] dark:border-[#2D2D2F]">
                Attachments
            </h2>

            <div className="p-6 space-y-4">
                {/* File Upload Dropzone */}
                <div className="flex items-center justify-center w-full">
                    <label
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 ${isDragging
                                ? 'border-primary border-solid bg-primary/5'
                                : 'border-[#d1d8e6] dark:border-[#374151] border-dashed'
                            } rounded-lg cursor-pointer bg-[#f6f6f8] dark:bg-[#111721] hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        htmlFor="dropzone-file"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <span className="material-symbols-outlined text-4xl text-[#506795] dark:text-[#A1A1AA]">
                                cloud_upload
                            </span>
                            <p className="mb-2 text-sm text-[#506795] dark:text-[#A1A1AA]">
                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-[#506795] dark:text-[#A1A1AA]">
                                PDF, DOCX, PNG, JPG (MAX. 10MB)
                            </p>
                        </div>
                        <input
                            className="hidden"
                            id="dropzone-file"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={handleFileInput}
                        />
                    </label>
                </div>

                {/* Attachments List */}
                {attachments.length > 0 && (
                    <div className="space-y-3">
                        {attachments.map((attachment: any   ) => (
                            <div
                                key={attachment.id}
                                className="flex items-center p-3 bg-background-light dark:bg-background-dark border border-[#E4E4E7] dark:border-[#2D2D2F] rounded-lg"
                            >
                                {getFileIcon(attachment.type)}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#0e121b] dark:text-white">
                                        {attachment.name}
                                    </p>
                                    <p className="text-xs text-[#506795] dark:text-[#A1A1AA]">
                                        {attachment.size}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeAttachment(attachment.id)}
                                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                    title="Remove file"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}