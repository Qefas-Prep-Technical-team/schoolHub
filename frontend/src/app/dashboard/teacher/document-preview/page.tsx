'use client';

import { useState } from 'react';

const DocumentPreviewStandalone: React.FC = () => {
    const [isShared, setIsShared] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    const document = {
        title: 'Student Progress Report Q1.pdf',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        uploadedBy: 'You',
        dateAdded: 'Oct 26, 2023',
        isSharedWithParents: isShared
    };

    const breadcrumbs = [
        { label: 'Dashboard', href: '#' },
        { label: 'Documents', href: '#' },
        { label: document.title, isCurrent: true }
    ];

    const handleDownload = async () => {
        setIsDownloading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Downloaded:', document.title);
        setIsDownloading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-4">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.label} className="flex items-center gap-2">
                            {index > 0 && <span className="text-gray-400">/</span>}
                            {crumb.isCurrent ? (
                                <span className="text-gray-700 dark:text-gray-300">{crumb.label}</span>
                            ) : (
                                <a href={crumb.href} className="text-blue-600 hover:text-blue-800">
                                    {crumb.label}
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    {document.title}
                </h1>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Document Viewer */}
                    <div className="flex-1">
                        <div className="h-[600px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="w-32 h-32 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-6xl text-gray-400">
                                        picture_as_pdf
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Document Preview</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Loading document preview...
                                </p>
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-96">
                        <div className="space-y-6">
                            {/* Actions */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold mb-6">Actions</h2>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleDownload}
                                        disabled={isDownloading}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                        {isDownloading ? 'Downloading...' : 'Download'}
                                    </button>

                                    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Share with Parents</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Parents will be notified
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isShared}
                                                onChange={(e) => setIsShared(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold mb-6">Details</h2>
                                <div className="space-y-4">
                                    {[
                                        ['File Type', `${document.fileType} Document`],
                                        ['File Size', document.fileSize],
                                        ['Uploaded By', document.uploadedBy],
                                        ['Date Added', document.dateAdded]
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">{label}</span>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewStandalone;