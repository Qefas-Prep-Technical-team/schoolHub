'use client';


import Link from 'next/link';
import { Attachment } from '../types';

interface AttachmentCardProps {
    attachment: Attachment;
    className?: string;
}

export default function AttachmentCard({ attachment, className = '' }: AttachmentCardProps) {
    const getFileIcon = (type: Attachment['type']) => {
        switch (type) {
            case 'pdf':
                return (
                    <div className="flex items-center justify-center size-10 bg-red-100 dark:bg-red-900/50 rounded-md">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-300">
                            picture_as_pdf
                        </span>
                    </div>
                );
            case 'docx':
                return (
                    <div className="flex items-center justify-center size-10 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-300">
                            description
                        </span>
                    </div>
                );
            case 'image':
                return (
                    <div className="flex items-center justify-center size-10 bg-green-100 dark:bg-green-900/50 rounded-md">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-300">
                            image
                        </span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center size-10 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                            insert_drive_file
                        </span>
                    </div>
                );
        }
    };

    return (
        <Link
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors ${className}`}
        >
            {getFileIcon(attachment.type)}
            <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {attachment.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {attachment.size}
                </p>
            </div>
        </Link>
    );
}