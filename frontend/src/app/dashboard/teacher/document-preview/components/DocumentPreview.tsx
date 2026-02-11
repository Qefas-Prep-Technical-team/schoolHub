'use client';

import { useState } from 'react';
import { Breadcrumb, Document } from './type';
import Breadcrumbs from './Breadcrumbs';
import Header from './Header';
import DocumentViewer from './DocumentViewer';
import ActionsPanel from './ActionsPanel';
import DetailsPanel from './DetailsPanel';


interface DocumentPreviewProps {
    document: Document;
    breadcrumbs?: Breadcrumb[];
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
    document: initialDocument,
    breadcrumbs
}) => {
    const [document, setDocument] = useState<Document>(initialDocument);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    const defaultBreadcrumbs: Breadcrumb[] = breadcrumbs || [
        { label: 'Dashboard', href: '#' },
        { label: 'Documents', href: '#' },
        { label: document.title, href: '#', isCurrent: true }
    ];

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            // Simulate download
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`Downloading: ${document.title}`);
            // In a real app, you would trigger the actual download
            // window.location.href = document.downloadUrl;
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShareToggle = (isShared: boolean) => {
        setDocument(prev => ({ ...prev, isSharedWithParents: isShared }));
        console.log(`Document sharing ${isShared ? 'enabled' : 'disabled'}`);
        // In a real app, you would make an API call to update sharing status
    };

    // Simulate loading completion
    useState(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
                <div className="px-4 py-8 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-col w-full max-w-7xl flex-1">
                        {/* Breadcrumbs & Page Heading */}
                        <div className="mb-6 px-4">
                            <Breadcrumbs items={defaultBreadcrumbs} />
                            <Header title={document.title} />
                        </div>

                        {/* Main Content: Viewer and Actions Panel */}
                        <div className="flex flex-col lg:flex-row gap-8 w-full">
                            {/* Document Viewer */}
                            <main className="flex-1 min-w-0">
                                <DocumentViewer
                                    title={document.title}
                                    previewUrl={document.previewUrl}
                                    fileType={document.fileType}
                                    isLoading={isLoading}
                                />
                            </main>

                            {/* Actions & Details Sidebar */}
                            <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                                <div className="flex flex-col gap-6">
                                    <ActionsPanel
                                        onDownload={handleDownload}
                                        onShareToggle={handleShareToggle}
                                        isSharedWithParents={document.isSharedWithParents}
                                        isDownloading={isDownloading}
                                    />
                                    <DetailsPanel document={document} />
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;